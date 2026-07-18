// data.js - Sajeena Manzil Family Calendar Database

const BIRTHDAYS = [
  { name: "Kalam muthappa", month: 5, day: 8 }, // June 8
  { name: "Itha", month: 5, day: 16 }, // June 16
  { name: "Fathi", month: 4, day: 4 }, // May 4
  { name: "Samru", month: 4, day: 8 }, // May 8
  { name: "Hamsa", month: 9, day: 11 }, // Oct 11
  { name: "Haseena", month: 10, day: 27 }, // Nov 27
  { name: "Thanzi", month: 0, day: 16 }, // Jan 16
  { name: "Mahra", month: 7, day: 18 }, // Aug 18
  { name: "Nizar", month: 1, day: 13 }, // Feb 13 (Sophi's husband)
  { name: "Sophy", month: 3, day: 16 }, // April 16
  { name: "Ahsan", month: 8, day: 25 }, // Sep 25
  { name: "Fathima", month: 6, day: 2 }, // July 2
  { name: "Alia", month: 7, day: 14 }, // Aug 14
  { name: "Abid", month: 8, day: 12 }, // Sep 12
  { name: "Safeer", month: 10, day: 20 }, // Nov 20
  { name: "Shani", month: 2, day: 11 }, // March 11
  { name: "Saad", month: 7, day: 24 }, // Aug 24
  { name: "Salih", month: 4, day: 2 }, // May 2
  { name: "Sameer", month: 3, day: 6 }, // April 6
  { name: "Nishi", month: 6, day: 27 }, // July 27
  { name: "Fadhil", month: 3, day: 23 }, // April 23
  { name: "Faiha", month: 6, day: 19 }, // July 19
  { name: "Faheem", month: 3, day: 24 }, // April 24
  { name: "Nizar", month: 8, day: 7 }, // Sep 7 (Muhsina's husband)
  { name: "Muhsina", month: 4, day: 14 }, // May 14
  { name: "Ihsan", month: 11, day: 12 }, // Dec 12
  { name: "Ifa", month: 9, day: 2 }, // Oct 2
  { name: "Isha", month: 0, day: 6, year: 2018 }, // Jan 6, 2018
  { name: "Imran", month: 11, day: 2, year: 2019 } // Dec 2, 2019
];

const ANNIVERSARIES = [
  {
    couple: "Hassan Koya and Sulaika",
    month: 5,
    day: 30,
    year: 1967,
    note: "50th wedding anniversary in 2017",
    generation: 1
  },
  {
    couple: "Sajeena and Kalam",
    month: 8,
    day: 29,
    year: 1992,
    note: "25th anniversary in 2017",
    generation: 2
  },
  {
    couple: "Haseena and Hamsa",
    month: 11,
    day: 29,
    year: 1996,
    generation: 2
  },
  {
    couple: "Sophi and Nizar",
    month: 1,
    day: 14,
    generation: 2
  },
  {
    couple: "Safeer and Shani",
    month: 2,
    day: 27,
    generation: 2
  },
  {
    couple: "Sameer and Nishi",
    month: 6,
    day: 13,
    generation: 2
  },
  {
    couple: "Nizar and Muhsina",
    month: 6,
    day: 3,
    generation: 2
  },
  {
    couple: "Fathima and Shaheen",
    month: 6,
    day: 1, // Defaulting to July 1st as day isn't specified
    dayUnknown: true,
    generation: 3
  },
  {
    couple: "Ahsan and Fathima",
    month: 6,
    day: 29,
    generation: 3
  },
  {
    couple: "Samru and Farsana",
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
