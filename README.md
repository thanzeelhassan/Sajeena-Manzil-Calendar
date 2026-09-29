# Sajeena-Manzil-Calendar

https://thanzeelhassan.github.io/Sajeena-Manzil-Calendar/

A family calendar for birthdays and wedding anniversaries, with countdowns, a month view and a family tree.

## Updating the family data

1. Edit the text files in `resources/`:
   - `Members.txt` – who is in the family (gender, parents, spouses). The family tree is built from this.
   - `Birthdays.txt` – `Name - Month Day [Year]`
   - `Wedding_anniversaries.txt` – `Name and Name - Month Day [Year]`. Short names such as `Sajeena and Kalam` are fine as long as they match a married couple in `Members.txt`.
2. Run `node sync.js` to regenerate `data.js` and the calendar feed `family.ics`. It warns about names that don't match.
3. Run `node test_calculations.js` to check the date math and data. It exits with an error if anything fails.
4. Commit and push. GitHub Pages publishes the site.

Never edit `data.js` by hand; `sync.js` overwrites it.

## Calendar feed

`family.ics` is published with the site. Anyone can subscribe using the buttons at the bottom of the page, and their phone will remind them of every birthday and anniversary:

- Google Calendar: https://calendar.google.com/calendar/r?cid=webcal%3A%2F%2Fthanzeelhassan.github.io%2FSajeena-Manzil-Calendar%2Ffamily.ics
- iPhone / Outlook: webcal://thanzeelhassan.github.io/Sajeena-Manzil-Calendar/family.ics

Subscribed calendars refresh on their own (Google can take up to a day).

## WhatsApp reminders

A GitHub Action (`.github/workflows/whatsapp-reminders.yml`) runs `notify.js` every day at about 7:00 AM India time and sends to your own WhatsApp:

- a greeting for each event **today**, ready to forward to the family group
- a heads-up listing everything happening **tomorrow**

Messages go through [CallMeBot](https://www.callmebot.com/blog/free-api-whatsapp-messages/)'s free personal WhatsApp API.

One-time setup:

1. Save **+34 611 021 695** in your phone contacts, then send it the WhatsApp message `I allow callmebot to send me messages`. It replies with your API key.
2. In GitHub, open the repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret** and add:
   - `WHATSAPP_PHONE`: your WhatsApp number with country code, e.g. `+919876543210`
   - `CALLMEBOT_APIKEY`: the key from step 1
3. Test it: **Actions** → **WhatsApp reminders** → **Run workflow**. Put `2026-09-29` in the date box to get a sample anniversary greeting straight away.

Preview messages locally without sending: `node notify.js --dry-run --date=2026-09-28`
