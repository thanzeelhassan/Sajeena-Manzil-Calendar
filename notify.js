// notify.js - Send Sajeena Manzil family event reminders to your own WhatsApp
//
// Runs once a day (see .github/workflows/whatsapp-reminders.yml) at about 7 AM India time and sends:
//   - one greeting message per event happening TODAY, ready to forward to the family group
//   - one heads-up message listing everything happening TOMORROW
// "Today" is always the date in India (IST), wherever this runs.
//
// Messages are delivered with CallMeBot's free personal WhatsApp API.
// Needs two environment variables (stored as GitHub secrets):
//   WHATSAPP_PHONE    your number with country code, e.g. +919876543210
//   CALLMEBOT_APIKEY  the key CallMeBot sent you
//
// Local testing (prints the messages, sends nothing):
//   node notify.js --dry-run
//   node notify.js --dry-run --date=2026-09-29

const { BIRTHDAYS, ANNIVERSARIES } = require('./data.js');

const TIME_ZONE = 'Asia/Kolkata';
const SIGN_OFF = '— Sajeena Manzil family ❤️';
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// ---------- Dates (plain calendar dates, no time-of-day) ----------

function parseISODate(str) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(str || '');
    if (!m) throw new Error(`Invalid date "${str}", expected YYYY-MM-DD`);
    return { year: +m[1], month: +m[2] - 1, day: +m[3] };
}

function todayInIndia(now = new Date()) {
    // en-CA formats as YYYY-MM-DD
    return parseISODate(new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE }).format(now));
}

function addDays(date, n) {
    const d = new Date(Date.UTC(date.year, date.month, date.day + n));
    return { year: d.getUTCFullYear(), month: d.getUTCMonth(), day: d.getUTCDate() };
}

function formatDate(date) {
    const weekday = WEEKDAYS[new Date(Date.UTC(date.year, date.month, date.day)).getUTCDay()];
    return `${weekday} ${date.day} ${MONTHS[date.month]}`;
}

function isLeapYear(y) {
    return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}

function occursOn(event, date) {
    // Feb 29 events are celebrated on Feb 28 in non-leap years
    const day = event.month === 1 && event.day === 29 && !isLeapYear(date.year) ? 28 : event.day;
    return event.month === date.month && day === date.day;
}

function ordinal(n) {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

// ---------- Events ----------

function coupleName(a) {
    return a.partners ? a.partners.join(' & ') : a.couple.replace(/\s+and\s+/i, ' & ');
}

function eventsOn(date) {
    const events = [];

    for (const b of BIRTHDAYS) {
        if (!occursOn(b, date)) continue;
        // Not born yet, or this is the day they were born (no birthday to celebrate yet)
        if (b.year && b.year >= date.year) continue;
        events.push({ type: 'birthday', name: b.name, years: b.year ? date.year - b.year : null });
    }

    for (const a of ANNIVERSARIES) {
        if (!occursOn(a, date)) continue;
        if (a.year && a.year > date.year) continue; // wedding hasn't happened yet
        events.push({ type: 'anniversary', name: coupleName(a), years: a.year ? date.year - a.year : null });
    }

    return events;
}

// ---------- Messages ----------

function greeting(e) {
    if (e.type === 'birthday') {
        const wish = e.years
            ? `Wishing you a very happy ${ordinal(e.years)} birthday and a wonderful year ahead. 🥳`
            : 'Wishing you a wonderful birthday and a year full of happiness. 🥳';
        return `🎂 *Happy Birthday, ${e.name}!* 🎉\n${wish}\n\n${SIGN_OFF}`;
    }
    if (e.years === 0) {
        return `💍 *Congratulations, ${e.name}!* 🎉\nWishing you a lifetime of love and happiness on your wedding day. ❤️\n\n${SIGN_OFF}`;
    }
    const title = e.years ? `Happy ${ordinal(e.years)} Wedding Anniversary` : 'Happy Wedding Anniversary';
    return `💍 *${title}, ${e.name}!* ❤️\nWishing you both many more years of love and happiness together. 🥂\n\n${SIGN_OFF}`;
}

function reminderLine(e) {
    if (e.type === 'birthday') {
        return `🎂 ${e.name}'s birthday${e.years ? ` (turning ${e.years})` : ''}`;
    }
    if (e.years === 0) return `💍 ${e.name}'s wedding`;
    return `💍 ${e.name}'s ${e.years ? `${ordinal(e.years)} ` : ''}wedding anniversary`;
}

function buildMessages(today) {
    const tomorrow = addDays(today, 1);
    const messages = eventsOn(today).map(greeting);

    const upcoming = eventsOn(tomorrow);
    if (upcoming.length) {
        messages.push(`⏰ *Reminder: tomorrow, ${formatDate(tomorrow)}*\n${upcoming.map(reminderLine).join('\n')}`);
    }
    return messages;
}

// ---------- Sending ----------

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function sendWhatsApp(phone, apiKey, text) {
    const url = 'https://api.callmebot.com/whatsapp.php' +
        `?phone=${encodeURIComponent(phone)}&text=${encodeURIComponent(text)}&apikey=${encodeURIComponent(apiKey)}`;

    // Retry only on network/server errors, so a slow success never turns into duplicate messages
    for (let attempt = 1; attempt <= 3; attempt++) {
        let res, body;
        try {
            res = await fetch(url);
            body = (await res.text()).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        } catch (err) {
            console.warn(`Attempt ${attempt}: ${err.message}`);
            await sleep(15000);
            continue;
        }
        if (res.status >= 500) {
            console.warn(`Attempt ${attempt}: HTTP ${res.status} ${body.slice(0, 200)}`);
            await sleep(15000);
            continue;
        }
        if (!res.ok || /apikey is invalid|invalid apikey|^error/i.test(body)) {
            throw new Error(`CallMeBot rejected the message (HTTP ${res.status}): ${body.slice(0, 300)}`);
        }
        console.log(`CallMeBot: ${body.slice(0, 120)}`);
        return;
    }
    throw new Error('Could not reach CallMeBot after 3 attempts');
}

async function main() {
    const args = process.argv.slice(2);
    const dryRun = args.includes('--dry-run') || process.env.NOTIFY_DRY_RUN === 'true';
    const dateArg = (args.find(a => a.startsWith('--date=')) || '').slice(7) || process.env.NOTIFY_DATE;

    const today = dateArg ? parseISODate(dateArg) : todayInIndia();
    const messages = buildMessages(today);

    console.log(`Today in India: ${formatDate(today)} ${today.year}. ${messages.length} message(s) to send.`);
    messages.forEach((m, i) => console.log(`\n--- Message ${i + 1} ---\n${m}`));
    if (dryRun || messages.length === 0) return;

    const phone = process.env.WHATSAPP_PHONE;
    const apiKey = process.env.CALLMEBOT_APIKEY;
    if (!phone || !apiKey) {
        throw new Error('WHATSAPP_PHONE and CALLMEBOT_APIKEY must be set (GitHub repo → Settings → Secrets and variables → Actions).');
    }

    for (let i = 0; i < messages.length; i++) {
        if (i > 0) await sleep(8000); // be gentle with the free API
        await sendWhatsApp(phone, apiKey, messages[i]);
        console.log(`Sent message ${i + 1}/${messages.length}`);
    }
}

if (require.main === module) {
    main().catch(err => {
        console.error(`ERROR: ${err.message}`);
        process.exit(1);
    });
}

module.exports = { buildMessages, eventsOn, parseISODate, addDays, todayInIndia };
