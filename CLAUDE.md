# Seminar Form - Project Context for Claude

## Project Overview

A seminar booking inquiry form for **Genusshotel Riegersburg** (Austrian hotel). Guests fill out the form on the hotel's website, and the reception desk receives the inquiry details.

**Repository**: `seminar-form`
**Hosting**: GitHub Pages (static site)
**Backend**: Google Apps Script (prices via GET, form submission via POST)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Browser)                        │
├─────────────────────────────────────────────────────────────────┤
│  index.html          - Form structure & layout                  │
│  script.js           - Form logic, price calculation, UI        │
│  pricelist.js        - Dynamic price loading with caching       │
│  config.js           - Configuration (Apps Script URLs, cache)  │
│  prices.json         - Fallback prices (if Apps Script fails)   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ HTTP GET (prices) / POST (submission)
┌─────────────────────────────────────────────────────────────────┐
│                    GOOGLE APPS SCRIPT                            │
├─────────────────────────────────────────────────────────────────┤
│  doGet()   - Returns prices from Google Sheet                   │
│  doPost()  - Handles form submission, generates Word doc,       │
│              sends email to reception + confirmation to guest   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      GOOGLE SERVICES                             │
├─────────────────────────────────────────────────────────────────┤
│  Google Sheets   - Price management (hotel staff edits here)   │
│  Google Docs     - Word template for seminar inquiries         │
│  Gmail           - Sends emails to rezeption@genusshotel...    │
│  Google Drive    - Temporary document storage during generation │
└─────────────────────────────────────────────────────────────────┘
```

---

## Key Files

| File | Purpose |
|------|---------|
| `index.html` | Form markup with all fields (seminar type, dates, rooms, catering, equipment, activities, contact) |
| `script.js` | Form interactions, show/hide sections, price calculation, form submission handler |
| `pricelist.js` | Three-tier price loading: cache → Apps Script → local JSON → hardcoded fallback |
| `config.js` | Configuration object `window.SeminarFormConfig` with URLs and cache settings |
| `prices.json` | Local fallback prices in nested JSON format |
| `apps-script-template.js` | Template for Google Apps Script backend (prices + submission) |
| `seminarinfos.md` | Package descriptions and pricing documentation |
| `PRICELIST_MAINTENANCE.md` | Guide for hotel staff to update prices |

---

## Form Data Structure

### Seminar Types
- **1-Tages-Seminar**: Single day, no overnight, fixed price per person
- **Mehrtägiges Seminar**: Multi-day with rooms, catering, activities

### Form Fields Collected

```javascript
{
  // Seminar basics
  seminar_type: "1tag" | "mehrtag",
  datum_1tag: "YYYY-MM-DD",           // 1-tag only
  datum_start: "YYYY-MM-DD",          // mehrtag only
  datum_ende: "YYYY-MM-DD",           // mehrtag only
  personenanzahl: 4-100,

  // Rooms (mehrtag only)
  einzelzimmer: number,
  doppelzimmer: number,
  room_setup: "block" | "fisch" | "parlament" | "sesselkreis" | "theater" | "u-form",

  // Equipment
  flipcharts: number,
  magnetwaende: number,
  pinnwand: number,
  moderationskoffer: boolean,
  kugelschreiber_bloecke: number,
  sonstiges: string,

  // Catering (mehrtag only)
  pause_vormittag: "gemischt" | "pikant" | "suess",
  pause_nachmittag: "gemischt" | "pikant" | "suess",
  mittagessen: boolean,
  mittagessen_getraenke: boolean,
  abendessen: "base" | "upgrade_steak",

  // Activities (mehrtag only)
  activity_yoga: boolean,
  activity_wein: boolean,
  activity_spirituosen: boolean,
  activity_zotter: boolean,
  activity_vulcano: boolean,
  activity_ebike: boolean,

  // Contact
  anrede: "frau" | "herr",
  vorname: string,
  nachname: string,
  email: string,
  telefon: string,
  firma: string,
  nachricht: string,

  // Calculated
  total_price: number,
  price_per_person: number
}
```

---

## Price Structure

Prices are loaded dynamically from Google Sheets via Apps Script. Structure:

```javascript
{
  "1tag": {
    "base_price": 74.00  // Per person, includes room + lunch + pauses
  },
  "catering": {
    "pause": { "gemischt": 14.00, "pikant": 12.00, "suess": 8.00 },
    "mittagessen": { "base": 34.00, "getraenke": 5.00 },
    "abendessen": { "base": 52.00, "upgrade_steak": 35.00 }
  },
  "rooms": {
    "per_night": 151.00,           // Per room per night
    "naechtigungsabgabe": 2.50     // Tourism tax per person per night
  },
  "equipment": {
    "raumgarantie": 200.00,        // One-time room guarantee fee
    "gruppenraum_per_day": 100.00  // Group room per day
  },
  "activities": {
    "yoga": 0, "wein": 0, "spirituosen": 0,
    "zotter": 0, "vulcano": 0, "ebike": 0  // Currently free/included
  }
}
```

---

## Room Allocation Logic

| Participants | Room Size | Notes |
|--------------|-----------|-------|
| 4-10 | 40m² | Included in package |
| 11-16 | 80m² | Included in package |
| 16+ | Custom | Requires individual quote |

---

## Google Apps Script API

### Current Endpoint (Prices)
- **URL**: Configured in `config.js` as `appsScriptUrl`
- **Method**: GET
- **Returns**: JSON with price structure

### Form Submission Endpoint (doPost)
- **URL**: Configured in `config.js` as `submissionUrl`
- **Method**: POST
- **Payload**: JSON with all form data
- **Actions**:
  1. Create Word document from Google Doc template
  2. Send email to reception (`goelles.j@gmail.com`) with Word attachment
  3. Send confirmation email to guest
  4. Return success/error JSON response

---

## Form Submission Flow

```
User clicks "Anfrage senden"
        │
        ▼
script.js: submitForm()
        │
        ├─ Validate required fields
        ├─ Collect all form data (collectFormData())
        ├─ Show loading overlay
        │
        ▼
POST to Google Apps Script (submissionUrl)
        │
        ▼
Apps Script: doPost()
        │
        ├─ Parse JSON data
        ├─ Copy Google Doc template
        ├─ Replace {{placeholders}} with form data
        ├─ Export as .docx
        ├─ Send to reception (with attachment)
        ├─ Send confirmation to guest
        ├─ Delete temporary doc
        │
        ▼
Return JSON response
        │
        ▼
script.js: showSuccessMessage() or showErrorMessage()
```

---

## Development Notes

### Testing Prices
- Press `Ctrl+Shift+R` on the form to force refresh prices (clears cache)
- Check browser console for price loading logs

### Cache Settings
- Default cache TTL: 5 minutes (300,000ms)
- Set `forceRefresh: true` in config.js to always fetch fresh prices

### Form Sections Visibility
- 1-Tages-Seminar: Shows basic fields, single date, equipment
- Mehrtägiges Seminar: Shows all sections (rooms, catering, activities)

---

## Deployment

1. **Frontend**: Push to GitHub, served via GitHub Pages
2. **Apps Script**:
   - Open Google Apps Script project
   - Deploy as Web App
   - Set "Execute as: Me" and "Who has access: Anyone"
   - Copy deployment URL to `config.js`

---

## Setup Instructions

### 1. Create Google Doc Template

Create a Google Doc with these placeholders:
```
SEMINAR ANFRAGE

Kontakt:
{{anrede}} {{vorname}} {{nachname}}
Firma: {{firma}}
Email: {{email}}
Telefon: {{telefon}}

Seminar Details:
Typ: {{seminar_type}}
Datum: {{datum}}
Teilnehmer: {{personenanzahl}} Personen

Nachricht:
{{nachricht}}

Geschätzter Preis: {{preis}}
```

### 2. Deploy Google Apps Script

1. Copy contents of `apps-script-template.js` to Google Apps Script
2. Update `TEMPLATE_DOC_ID` with your Google Doc template ID
3. Update `RECIPIENT_EMAIL` if different from `goelles.j@gmail.com`
4. Deploy > New deployment > Web app
5. Execute as: Me, Who has access: Anyone
6. Copy deployment URL

### 3. Update config.js

Update `submissionUrl` with the deployment URL from step 2.

---

## Completed Features

- [x] Form submission handler in script.js
- [x] Word document generation via Google Docs API
- [x] Email to reception with Word attachment
- [x] Confirmation email to guest
- [x] Loading overlay during submission
- [x] Success message after submission
- [x] Error handling with user-friendly messages

## Remaining Setup

- [ ] Create Google Doc template with placeholders
- [ ] Deploy updated Apps Script
- [ ] Update config.js with deployment URL
- [ ] Test end-to-end flow

## Future Improvements

- Activity Pricing: Currently all €0.00, may need real prices later
- PDF option: Generate PDF instead of/in addition to Word
- Booking system integration: Connect to hotel management system
