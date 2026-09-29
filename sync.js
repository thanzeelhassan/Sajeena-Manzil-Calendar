// sync.js - Synchronize Sajeena Manzil Family Calendar Database
//
// Reads the plain-text files in resources/ and regenerates data.js:
//   resources/Members.txt               -> FAMILY        (who is who: gender, generation, parents, spouse)
//   resources/Birthdays.txt             -> BIRTHDAYS
//   resources/Wedding_anniversaries.txt -> ANNIVERSARIES
//
// Couple names in Wedding_anniversaries.txt can be short ("Sajeena and Kalam");
// they are matched against the married couples in Members.txt, so adding a new
// couple never needs a code change here.
const fs = require('fs');
const path = require('path');

const RESOURCES = path.join(__dirname, 'resources');
const OUTPUT = path.join(__dirname, 'data.js');

let warnings = 0;
function warn(msg) {
    warnings++;
    console.warn(`WARNING: ${msg}`);
}

function readLines(file) {
    return fs.readFileSync(path.join(RESOURCES, file), 'utf8')
        .split(/\r?\n/)
        .map(l => l.trim());
}

function parseMonth(monthName) {
    const months = {
        jan: 0, january: 0,
        feb: 1, february: 1,
        mar: 2, march: 2,
        apr: 3, april: 3,
        may: 4,
        jun: 5, june: 5,
        jul: 6, july: 6,
        aug: 7, august: 7,
        sep: 8, sept: 8, september: 8,
        oct: 9, october: 9,
        nov: 10, november: 10,
        dec: 11, december: 11
    };
    const key = monthName.toLowerCase().replace(/[^a-z]/g, '');
    if (months[key] !== undefined) return months[key];
    throw new Error(`Unknown month: ${monthName}`);
}

// "Sep 29th, 1992" -> { month: 8, day: 29, year: 1992 }
function parseDate(dateStr, line) {
    const parts = dateStr
        .replace(/(\d+)(st|nd|rd|th)\b/gi, '$1')
        .replace(/,/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .split(' ');
    if (parts.length < 2) throw new Error(`Invalid date in line: "${line}"`);

    const month = parseMonth(parts[0]);
    const day = parseInt(parts[1], 10);
    if (isNaN(day) || day < 1 || day > 31) throw new Error(`Invalid day in line: "${line}"`);

    const result = { month, day };
    if (parts.length >= 3) {
        const year = parseInt(parts[2], 10);
        if (!isNaN(year)) result.year = year;
    }
    return result;
}

// ---------- Members.txt -> FAMILY ----------

function parseMembers() {
    const members = new Map(); // name -> member (insertion order = display order)
    const personRe = /([A-Za-z][A-Za-z.' ]*?)\s*\((Male|Female)\)/g;

    let generation = 0;
    let section = 'people'; // people | spouses | children | marriages
    let parents = null;
    let rootCouple = [];

    function cleanName(raw) {
        return raw.replace(/^(from|and|husband|wife)\s+/i, '').replace(/\s+/g, ' ').trim();
    }

    function upsert(name, gender, gen) {
        let m = members.get(name);
        if (!m) {
            m = { name, gender, generation: gen };
            members.set(name, m);
        }
        if (!m.gender) m.gender = gender;
        return m;
    }

    for (const line of readLines('Members.txt')) {
        if (!line) continue;

        const genMatch = line.match(/^(\d+)\s*(st|nd|rd|th)\s+gen/i);
        if (genMatch) {
            generation = parseInt(genMatch[1], 10);
            section = 'people';
            parents = null;
            continue;
        }
        if (/^spouses\s*:/i.test(line)) { section = 'spouses'; continue; }
        if (/^marriages\s*:/i.test(line)) { section = 'marriages'; parents = null; continue; }

        const people = [...line.matchAll(personRe)].map(m => ({
            name: cleanName(m[1]),
            gender: m[2].toLowerCase()
        }));
        if (people.length === 0) continue; // "Married : ..." lines etc.

        // "From <father> - <date> - <mother> - <date> :" starts a list of their children
        if (/^from\b/i.test(line)) {
            parents = people.map(p => upsert(p.name, p.gender, generation - 1).name);
            section = 'children';
            continue;
        }

        if (generation === 1) {
            for (const p of people) {
                upsert(p.name, p.gender, 1);
                if (!rootCouple.includes(p.name)) rootCouple.push(p.name);
            }
            if (rootCouple.length === 2) {
                members.get(rootCouple[0]).spouse = rootCouple[1];
                members.get(rootCouple[1]).spouse = rootCouple[0];
            }
            continue;
        }

        if (people.length >= 2) {
            // A married couple. Whoever is not already known married into the family.
            const [a, b] = people;
            const aKnown = members.has(a.name);
            const bKnown = members.has(b.name);
            const ma = upsert(a.name, a.gender, generation);
            const mb = upsert(b.name, b.gender, generation);
            if (!aKnown && bKnown) ma.marriedIn = true;
            if (!bKnown && aKnown) mb.marriedIn = true;
            if (!aKnown && !bKnown) warn(`Couple "${a.name}" & "${b.name}" in Members.txt: neither was listed as a child first.`);
            ma.spouse = mb.name;
            mb.spouse = ma.name;
            continue;
        }

        // A single person: a child of the current parents (or of the grandparents in 2nd gen)
        const p = people[0];
        const m = upsert(p.name, p.gender, generation);
        const childOf = section === 'children' ? parents : (generation === 2 ? rootCouple : null);
        if (childOf && childOf.length) m.parents = [...childOf];
    }

    return [...members.values()];
}

// ---------- Birthdays.txt -> BIRTHDAYS ----------

function parseBirthdays() {
    const birthdays = [];
    for (const line of readLines('Birthdays.txt')) {
        if (!line || /^birthdays\s*:/i.test(line)) continue;

        const idx = line.indexOf('-');
        if (idx === -1) continue;

        const name = line.slice(0, idx).replace(/\s+/g, ' ').trim();
        birthdays.push({ name, ...parseDate(line.slice(idx + 1), line) });
    }
    return birthdays;
}

// ---------- Wedding_anniversaries.txt -> ANNIVERSARIES ----------

// Every word of the short name must start a word of the full name ("Sophi" -> "Sophia Nizar").
function nameMatches(shortName, fullName) {
    const fullWords = fullName.toLowerCase().split(/\s+/);
    return shortName.toLowerCase().split(/\s+/).every(w => fullWords.some(fw => fw.startsWith(w)));
}

function resolveCouple(raw, family) {
    const parts = raw.split(/\s+and\s+/i).map(s => s.trim());
    if (parts.length !== 2) {
        warn(`Couple "${raw}" should be written as "<name> and <name>".`);
        return { couple: raw };
    }

    const byName = new Map(family.map(m => [m.name, m]));
    const [x, y] = parts;

    // Exact full names win
    if (byName.has(x) && byName.has(y)) return { couple: `${x} and ${y}`, partners: [x, y] };

    // Otherwise match against the married couples in Members.txt
    const couples = family.filter(m => m.spouse && m.name < m.spouse).map(m => [m.name, m.spouse]);
    const found = [];
    for (const [a, b] of couples) {
        if (nameMatches(x, a) && nameMatches(y, b)) found.push([a, b]);
        else if (nameMatches(x, b) && nameMatches(y, a)) found.push([b, a]);
    }

    if (found.length === 1) {
        const [a, b] = found[0];
        return { couple: `${a} and ${b}`, partners: [a, b] };
    }
    if (found.length > 1) {
        warn(`Couple "${raw}" is ambiguous (${found.map(f => f.join(' & ')).join(' / ')}). Use full names.`);
    } else {
        warn(`Couple "${raw}" doesn't match any married couple in Members.txt. Check the spelling or use full names.`);
    }
    return { couple: raw };
}

function parseAnniversaries(family) {
    const anniversaries = [];
    let generation = 1;

    for (const line of readLines('Wedding_anniversaries.txt')) {
        if (!line || /^wedding anniversaries\s*:/i.test(line)) continue;

        const genMatch = line.match(/^(\d+)\s*(st|nd|rd|th)\s+gen/i);
        if (genMatch) {
            generation = parseInt(genMatch[1], 10);
            continue;
        }

        const idx = line.indexOf('-');
        if (idx === -1) continue;

        const { couple, partners } = resolveCouple(line.slice(0, idx).trim(), family);
        const item = { couple, ...parseDate(line.slice(idx + 1), line), generation };
        if (partners) item.partners = partners;
        anniversaries.push(item);
    }
    return anniversaries;
}

// ---------- Cross-checks ----------

function validate(family, birthdays) {
    const names = new Set(family.map(m => m.name));
    for (const b of birthdays) {
        if (!names.has(b.name)) warn(`Birthday for "${b.name}" but no such person in Members.txt (spelling?).`);
    }
}

function main() {
    try {
        const family = parseMembers();
        const birthdays = parseBirthdays();
        const anniversaries = parseAnniversaries(family);
        validate(family, birthdays);

        const fileContent = `// data.js - Sajeena Manzil Family Calendar Database
// AUTO-GENERATED BY sync.js - DO NOT EDIT MANUALLY
// Edit the files in resources/ and run: node sync.js

const BIRTHDAYS = ${JSON.stringify(birthdays, null, 2)};

const ANNIVERSARIES = ${JSON.stringify(anniversaries, null, 2)};

const FAMILY = ${JSON.stringify(family, null, 2)};

// Helper variables for UI consumption
if (typeof exports !== 'undefined') {
  exports.BIRTHDAYS = BIRTHDAYS;
  exports.ANNIVERSARIES = ANNIVERSARIES;
  exports.FAMILY = FAMILY;
}
`;

        fs.writeFileSync(OUTPUT, fileContent, 'utf8');
        console.log(`Synchronized ${birthdays.length} birthdays, ${anniversaries.length} anniversaries and ${family.length} family members to data.js` +
            (warnings ? ` with ${warnings} warning(s).` : '.'));
    } catch (err) {
        console.error('Error during synchronization:', err.message || err);
        process.exit(1);
    }
}

main();
