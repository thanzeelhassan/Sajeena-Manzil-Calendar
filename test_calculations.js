// test_calculations.js - Verify date math for Sajeena Manzil Family Calendar

const { BIRTHDAYS, ANNIVERSARIES } = require('./data.js');

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
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function getCalculatedYears(event) {
    if (!event.year) return null;
    const targetDate = getNextCelebrationDate(event.month, event.day);
    return targetDate.getFullYear() - event.year;
}

// Run Tests
console.log("=== RUNNING FAMILY CALENDAR VERIFICATION ===");
console.log(`Current Mock Time: ${systemDate.toString()}`);
console.log(`Current Mock Clean Date: ${clearTime(systemDate).toString()}\n`);

// Test 1: Check countdown to tomorrow's birthday (Faiha - July 19)
const faiha = BIRTHDAYS.find(b => b.name === "Faiha Sameer");
if (faiha) {
    const days = getDaysCount(faiha.month, faiha.day);
    console.log(`Test Faiha (July 19): countdown days = ${days} (Expected: 1)`);
    if (days !== 1) console.error("Error: Faiha countdown mismatch!");
}

// Test 2: Check countdown to Sajeena & Kalam's anniversary (Sep 29th 1992)
const sajeenaKalam = ANNIVERSARIES.find(a => a.couple === "Sajeena Abdul Kalam and Abdul Kalam");
if (sajeenaKalam) {
    const days = getDaysCount(sajeenaKalam.month, sajeenaKalam.day);
    const years = getCalculatedYears(sajeenaKalam);
    console.log(`Test Sajeena & Kalam (Sep 29): countdown days = ${days}, years married = ${years} (Expected 34 in 2026)`);
    if (years !== 34) console.error("Error: Sajeena & Kalam anniversary years calculation mismatch!");
}

// Test 3: Check countdown to Samru & Farsana's upcoming wedding (July 26, 2026)
const samruFarsana = ANNIVERSARIES.find(a => a.couple === "Mohamed Samroud and Farsana");
if (samruFarsana) {
    const days = getDaysCount(samruFarsana.month, samruFarsana.day);
    const years = getCalculatedYears(samruFarsana);
    console.log(`Test Samru & Farsana (July 26 2026): countdown days = ${days}, years calculated = ${years} (Expected: 8 days weight, years: 0)`);
    if (days !== 8 || years !== 0) console.error("Error: Samru & Farsana wedding math mismatch!");
}

// Test 4: Check anniversary of Hassan Koya & Sulaika (June 30 1967) - has already passed this year (June 30, 2026)
const hassanSulaika = ANNIVERSARIES.find(a => a.couple === "Hassan Koya and Sulaika Beeva");
if (hassanSulaika) {
    const days = getDaysCount(hassanSulaika.month, hassanSulaika.day);
    const years = getCalculatedYears(hassanSulaika);
    const nextCel = getNextCelebrationDate(hassanSulaika.month, hassanSulaika.day);
    console.log(`Test Hassan Koya & Sulaika (June 30): next celebration = ${nextCel.toDateString()}, days = ${days}, celebrating anniversary # = ${years} (Expected: June 30 2027, years: 60)`);
}

// Test 5: Check birthday of Isha (Jan 6 2018) - has already passed this year (Jan 6 2026)
const isha = BIRTHDAYS.find(b => b.name === "Isha Nizar");
if (isha) {
    const days = getDaysCount(isha.month, isha.day);
    const age = getCalculatedYears(isha);
    const nextCel = getNextCelebrationDate(isha.month, isha.day);
    console.log(`Test Isha (Jan 6): next celebration = ${nextCel.toDateString()}, days = ${days}, turning age = ${age} (Expected: Jan 6 2027, age: 9)`);
}

console.log("\n=== ALL UNIT TESTS RUN COMPLETE ===");
