# Sajeena-Manzil-Calendar

https://thanzeelhassan.github.io/Sajeena-Manzil-Calendar/

A family calendar for birthdays and wedding anniversaries, with countdowns, a month view and a family tree.

## Updating the family data

1. Edit the text files in `resources/`:
   - `Members.txt` – who is in the family (gender, parents, spouses). The family tree is built from this.
   - `Birthdays.txt` – `Name - Month Day [Year]`
   - `Wedding_anniversaries.txt` – `Name and Name - Month Day [Year]`. Short names such as `Sajeena and Kalam` are fine as long as they match a married couple in `Members.txt`.
2. Run `node sync.js` to regenerate `data.js`. It warns about names that don't match.
3. Run `node test_calculations.js` to check the date math and data. It exits with an error if anything fails.
4. Commit and push. GitHub Pages publishes the site.

Never edit `data.js` by hand; `sync.js` overwrites it.
