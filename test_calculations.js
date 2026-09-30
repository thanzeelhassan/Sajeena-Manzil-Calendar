// test_calculations.js - Verify date math and data for Sajeena Manzil Family Calendar
// Run with: node test_calculations.js   (exits with code 1 if anything fails)

const { BIRTHDAYS, ANNIVERSARIES, FAMILY } = require('./data.js');

// Mock system date to July 18, 2026
const systemDate = new Date(2026, 6, 18, 14, 21, 44);

function clearTime(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getNextCelebrationDate(month, day) {
    const today = clearTime(systemDate);
    let targetYear = today.getFullYear();
    let targetDate = new Date(targetYear, month, day);

    if (targetDate < today) {
        targetDate.setFullYear(targetYear + 1);
    }
    return targetDate;
}

function getDaysCount(month, day) {
    const todayClean = clearTime(systemDate);
    const targetDate = getNextCelebrationDate(month, day);
    const diffTime = targetDate - todayClean;
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

function getCalculatedYears(event) {
    if (!event.year) return null;
    const targetDate = getNextCelebrationDate(event.month, event.day);
    return targetDate.getFullYear() - event.year;
}

// --- Tiny test harness ---
let passed = 0;
let failed = 0;

function check(label, actual, expected) {
    if (actual === expected) {
        passed++;
        console.log(`  PASS  ${label}: ${actual}`);
    } else {
        failed++;
        console.error(`  FAIL  ${label}: got ${actual}, expected ${expected}`);
    }
}

function find(list, key, value) {
    const item = list.find(x => x[key] === value);
    if (!item) {
        failed++;
        console.error(`  FAIL  record not found: ${key} = "${value}"`);
    }
    return item;
}

console.log("=== RUNNING FAMILY CALENDAR VERIFICATION ===");
console.log(`Mock date: ${clearTime(systemDate).toDateString()}\n`);

// Test 1: Countdown to tomorrow's birthday (Faiha - July 19)
console.log("Faiha Sameer (July 19)");
const faiha = find(BIRTHDAYS, "name", "Faiha Sameer");
if (faiha) check("days until birthday", getDaysCount(faiha.month, faiha.day), 1);

// Test 2: Sajeena & Kalam's anniversary (Sep 29, 1992)
console.log("Sajeena & Kalam (Sep 29, 1992)");
const sajeenaKalam = find(ANNIVERSARIES, "couple", "Sajeena Abdul Kalam and Abdul Kalam");
if (sajeenaKalam) {
    check("days until anniversary", getDaysCount(sajeenaKalam.month, sajeenaKalam.day), 73);
    check("years married", getCalculatedYears(sajeenaKalam), 34);
}

// Test 3: Samru & Farsana's upcoming wedding (July 26, 2026)
console.log("Samru & Farsana (July 26, 2026)");
const samruFarsana = find(ANNIVERSARIES, "couple", "Mohamed Samroud and Farsana");
if (samruFarsana) {
    check("days until wedding", getDaysCount(samruFarsana.month, samruFarsana.day), 8);
    check("years married", getCalculatedYears(samruFarsana), 0);
}

// Test 4: Hassan Koya & Sulaika (June 30, 1967) - already passed this year
console.log("Hassan Koya & Sulaika (June 30, 1967)");
const hassanSulaika = find(ANNIVERSARIES, "couple", "Hassan Koya and Sulaika Beevi");
if (hassanSulaika) {
    check("next celebration", getNextCelebrationDate(hassanSulaika.month, hassanSulaika.day).toDateString(), "Wed Jun 30 2027");
    check("anniversary number", getCalculatedYears(hassanSulaika), 60);
}

// Test 5: Isha (Jan 6, 2018) - already passed this year
console.log("Isha Nizar (Jan 6, 2018)");
const isha = find(BIRTHDAYS, "name", "Isha Nizar");
if (isha) {
    check("next celebration", getNextCelebrationDate(isha.month, isha.day).toDateString(), "Wed Jan 06 2027");
    check("turning age", getCalculatedYears(isha), 9);
}

// Test 6: Data integrity between Members, Birthdays and Anniversaries
console.log("Data integrity");
const memberNames = new Set(FAMILY.map(m => m.name));
const unknownBirthdays = BIRTHDAYS.filter(b => !memberNames.has(b.name)).map(b => b.name);
check("birthdays with no matching family member", unknownBirthdays.join(", ") || "none", "none");
const unresolved = ANNIVERSARIES.filter(a => !a.partners).map(a => a.couple);
check("anniversaries not linked to a couple", unresolved.join(", ") || "none", "none");
const brokenSpouses = FAMILY.filter(m => m.spouse && (!memberNames.has(m.spouse) ||
    FAMILY.find(s => s.name === m.spouse).spouse !== m.name)).map(m => m.name);
check("one-sided spouse links", brokenSpouses.join(", ") || "none", "none");
check("grandchildren of Sajeena & Kalam",
    FAMILY.filter(m => m.parents && m.parents.includes("Sajeena Abdul Kalam")).map(m => m.name).join(", "),
    "Fatima Abdul Kalam, Mohamed Samroud");

// Test 7: WhatsApp reminders (notify.js) use India dates
console.log("WhatsApp reminders");
const { buildMessages, parseISODate, todayInIndia } = require('./notify.js');
const msgsOn = d => buildMessages(parseISODate(d));
check("day before Sajeena & Kalam's anniversary sends a reminder",
    /Reminder: tomorrow, Tue 29 Sep[\s\S]*34th wedding anniversary/.test(msgsOn("2026-09-28").join("\n")), true);
check("anniversary day sends a forwardable greeting",
    msgsOn("2026-09-29")[0].startsWith("💍 *Happy 34th Wedding Anniversary, Sajeena Abdul Kalam & Abdul Kalam!*"), true);
check("no greeting on the day a baby is born", msgsOn("2026-09-27").length, 0);
check("first birthday a year later", /Happy Birthday, Abdullah bin Ahsan[\s\S]*1st birthday/.test(msgsOn("2027-09-27").join("\n")), true);
check("upcoming wedding is a wedding, not an anniversary", /Congratulations, Mohamed Samroud & Farsana/.test(msgsOn("2026-07-26")[0]), true);
check("India date used late evening in the US (Sep 29 11pm LA = Sep 30 India)",
    JSON.stringify(todayInIndia(new Date("2026-09-30T06:00:00Z"))), JSON.stringify({ year: 2026, month: 8, day: 30 }));

// Test 8: calendar feed
console.log("Calendar feed (family.ics)");
const ics = require('fs').readFileSync(require('path').join(__dirname, 'family.ics'), 'utf8');
check("one event per birthday and anniversary", (ics.match(/BEGIN:VEVENT/g) || []).length, BIRTHDAYS.length + ANNIVERSARIES.length);
check("uses CRLF line endings", ics.includes("\r\n") && !/[^\r]\n/.test(ics), true);

console.log(`\n=== ${passed} passed, ${failed} failed ===`);
if (failed) process.exitCode = 1;
