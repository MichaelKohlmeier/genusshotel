# Pricelist Maintenance Guide

This guide explains how hotel managers can update prices for the seminar booking form.

## Overview

Prices are stored in a Google Sheet and automatically loaded by the form. You can update prices directly in the Google Sheet without needing technical knowledge.

## Option 1: Google Sheets with Apps Script (Recommended)

### Initial Setup (One-time, done by developer)

1. **Create Google Sheet**
   - Create a new Google Sheet
   - Name it "Seminar Pricelist" or similar
   - Share it with hotel managers (edit access)

2. **Set up Sheet Structure**
   - Option A (Simple): Two columns
     - Column A: Key path (e.g., `1tag.base_price`, `catering.pause.gemischt`)
     - Column B: Price value (e.g., `74.00`, `14.00`)
   - Option B: Structured layout matching the JSON structure

3. **Deploy Apps Script**
   - Open the sheet
   - Go to Extensions > Apps Script
   - Copy the code from `apps-script-template.js`
   - Paste it into the Apps Script editor
   - Update the sheet name in the script if different from "Sheet1"
   - Save the script
   - Click Deploy > New deployment
   - Type: Web app
   - Execute as: Me
   - Who has access: Anyone (or your domain)
   - Click Deploy
   - Copy the web app URL
   - Send the URL to the developer to add to `pricelist.js`

### Updating Prices (Hotel Managers)

1. Open the Google Sheet
2. Find the price you want to change in Column A (key path)
3. Update the value in Column B
4. Save the sheet
5. Changes are immediately available (may take a few seconds to refresh)

### Example Sheet Layout

| Key Path | Price |
|----------|-------|
| 1tag.base_price | 74.00 |
| catering.pause.gemischt | 14.00 |
| catering.pause.pikant | 12.00 |
| catering.pause.suess | 8.00 |
| catering.mittagessen.base | 34.00 |
| catering.mittagessen.getraenke | 5.00 |
| catering.abendessen.base | 52.00 |
| catering.abendessen.upgrade_steak | 87.00 |
| rooms.per_night | 151.00 |
| rooms.naechtigungsabgabe | 2.50 |
| equipment.raumgarantie | 200.00 |
| equipment.gruppenraum_per_day | 100.00 |
| activities.yoga | 0 |
| activities.wein | 0 |
| activities.spirituosen | 0 |
| activities.zotter | 0 |
| activities.vulcano | 0 |
| activities.ebike | 0 |

## Option 2: Local JSON File (Fallback)

If Google Sheets is not available, prices can be updated in the `prices.json` file:

1. Open `prices.json` in a text editor
2. Find the price you want to change
3. Update the number value
4. Save the file
5. Upload the updated file to the server

**Note:** This requires file access to the server, which may not be available to hotel managers.

## Price Key Reference

### 1-Tages Seminar
- `1tag.base_price` - Base price per person (€74.00)

### Catering - Pausenverpflegung
- `catering.pause.gemischt` - Genusspause pikant & süß gemischt (€14.00)
- `catering.pause.pikant` - Genusspause pikant (€12.00)
- `catering.pause.suess` - Genusspause süß (€8.00)

### Catering - Mittagessen
- `catering.mittagessen.base` - Mittagessen, 3-Gang-Wahl-Menü plus Salatbuffet (€34.00)
- `catering.mittagessen.getraenke` - Alkoholfreies Tischbuffet zum Mittagessen (€5.00)

### Catering - Abendessen
- `catering.abendessen.base` - Abendessen, 4-Gang-Wahl-Menü plus Salat- und Käse vom Buffet (€52.00)
- `catering.abendessen.upgrade_steak` - Abendessen inkl. Dry-Aged-Steak Hauptgang (€87.00)

### Rooms
- `rooms.per_night` - Nächtigung inkl. Genießerfrühstück, Saftbar, etc. (€151.00)
- `rooms.naechtigungsabgabe` - Nächtigungsabgabe per person per night (€2.50)

### Equipment
- `equipment.raumgarantie` - Bestimmten Raum garantieren (€200.00)
- `equipment.gruppenraum_per_day` - Zusätzlicher Gruppenraum pro Tag (€100.00)

### Activities
- `activities.yoga` - Yoga / Pilates (€0.00 - to be updated)
- `activities.wein` - Weinverkostung (€0.00 - to be updated)
- `activities.spirituosen` - Gin/Whiskey/Rum Verkostung (€0.00 - to be updated)
- `activities.zotter` - Führung Zotter Schokoladenmanufaktur (€0.00 - to be updated)
- `activities.vulcano` - Führung Vulcano Schinkenmanufaktur (€0.00 - to be updated)
- `activities.ebike` - E-Bike Tour (€0.00 - to be updated)

## Troubleshooting

### Prices not updating
- Check that the Google Sheet is saved
- Wait a few seconds for the cache to refresh
- Clear browser cache if needed
- Check browser console for errors

### Apps Script not working
- Verify the script is deployed as a web app
- Check that "Execute as" is set to "Me"
- Verify the web app URL is correct in `pricelist.js`
- Check Apps Script execution logs for errors

### Fallback to local file
- If Apps Script fails, the form will automatically use `prices.json`
- This ensures the form always works even if Google Sheets is unavailable

## Support

For technical issues or questions about price structure, contact the development team.

