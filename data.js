// data.js - Sajeena Manzil Family Calendar Database

const BIRTHDAYS = [
  { name: "Abdul Kalam", month: 5, day: 8 }, // June 8
  { name: "Sajeena Abdul Kalam", month: 5, day: 16 }, // June 16
  { name: "Fathima Abdul Kalam", month: 4, day: 4 }, // May 4
  { name: "Mohammad Samroud", month: 4, day: 8 }, // May 8
  { name: "Hamsa Vellerkodath Bava", month: 9, day: 11 }, // Oct 11
  { name: "Haseena Hassan", month: 10, day: 27 }, // Nov 27
  { name: "Thanzeel Hassan", month: 0, day: 16 }, // Jan 16
  { name: "Mahra Hassan Vellerkodath", month: 7, day: 18 }, // Aug 18
  { name: "Abdul Nizar", month: 1, day: 13 }, // Feb 13
  { name: "Sophia Nizar", month: 3, day: 16 }, // April 16
  { name: "Ahsan Nizar", month: 8, day: 25 }, // Sep 25
  { name: "Fathima", month: 6, day: 2 }, // July 2 (Ahsan's wife)
  { name: "Alia Abdul Nizar", month: 7, day: 14 }, // Aug 14
  { name: "Abid Abdul Nizar", month: 8, day: 12 }, // Sep 12
  { name: "Safeer Hassan Koya", month: 10, day: 20 }, // Nov 20
  { name: "Shani Safeer", month: 2, day: 11 }, // March 11
  { name: "Saad Safeer", month: 7, day: 24 }, // Aug 24
  { name: "Salih Safeer", month: 4, day: 2 }, // May 2
  { name: "Sameer Hassan Koya", month: 3, day: 6 }, // April 6
  { name: "Nishi Sameer", month: 6, day: 27 }, // July 27
  { name: "Fadhil Sameer", month: 3, day: 23 }, // April 23
  { name: "Faiha Sameer", month: 6, day: 19 }, // July 19
  { name: "Faheem Sameer", month: 3, day: 24 }, // April 24
  { name: "Nizar Hassan Koya", month: 8, day: 7 }, // Sep 7
  { name: "Muhsina Nizar", month: 4, day: 14 }, // May 14
  { name: "Ihsan Nizar", month: 11, day: 12 }, // Dec 12
  { name: "Ifa Nizar", month: 9, day: 2 }, // Oct 2
  { name: "Isha Nizar", month: 0, day: 6, year: 2018 }, // Jan 6, 2018
  { name: "Imran Nizar", month: 11, day: 2, year: 2019 } // Dec 2, 2019
];

const ANNIVERSARIES = [
  {
    couple: "Hassan Koya and Sulaika Beeva",
    month: 5,
    day: 30,
    year: 1967,
    generation: 1
  },
  {
    couple: "Sajeena Abdul Kalam and Abdul Kalam",
    month: 8,
    day: 29,
    year: 1992,
    generation: 2
  },
  {
    couple: "Haseena Hassan and Hamsa Vellerkodath Bava",
    month: 11,
    day: 29,
    year: 1996,
    generation: 2
  },
  {
    couple: "Sophia Nizar and Abdul Nizar",
    month: 1,
    day: 14,
    generation: 2
  },
  {
    couple: "Safeer Hassan Koya and Shani Safeer",
    month: 2,
    day: 27,
    generation: 2
  },
  {
    couple: "Sameer Hassan Koya and Nishi Sameer",
    month: 6,
    day: 13,
    generation: 2
  },
  {
    couple: "Nizar Hassan Koya and Muhsina Nizar",
    month: 6,
    day: 3,
    generation: 2
  },
  {
    couple: "Fathima Abdul Kalam and Shaheen",
    month: 6,
    day: 9,
    year: 2023,
    generation: 3
  },
  {
    couple: "Ahsan Nizar and Fathima",
    month: 6,
    day: 29,
    year: 2024,
    generation: 3
  },
  {
    couple: "Mohammad Samroud and Farsana",
    month: 6,
    day: 26,
    year: 2026,
    generation: 3
  }
];

// Helper variables for UI consumption
if (typeof exports !== 'undefined') {
  exports.BIRTHDAYS = BIRTHDAYS;
  exports.ANNIVERSARIES = ANNIVERSARIES;
}
