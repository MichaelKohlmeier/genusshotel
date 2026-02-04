/**
 * Google Apps Script für Seminar-Preisliste
 *
 * Anleitung:
 * 1. Öffnen Sie Ihr Google Sheet mit der Preisliste
 * 2. Gehen Sie zu Erweiterungen > Apps Script
 * 3. Ersetzen Sie den Standard-Code mit diesem Script
 * 4. Speichern Sie das Script
 * 5. Bereitstellen > Neue Bereitstellung > Typ: Web-App
 * 6. Ausführen als: Ich
 * 7. Zugriff: Jeder
 * 8. Klicken Sie auf Bereitstellen und kopieren Sie die Web-App-URL
 * 9. Fügen Sie die URL in config.js ein
 *
 * Erwartetes Sheet-Format:
 * Spalte A: category (z.B. "catering", "rooms", "equipment", "activities")
 * Spalte B: key (z.B. "pause_gemischt", "single_per_night")
 * Spalte C: label (Beschreibung für Menschen)
 * Spalte D: price (Preis als Zahl)
 * Spalte E: unit (optional - z.B. "pro Person", "pauschal")
 */

function doGet(e) {
  try {
    var data = getPricelistFromSheet();

    return ContentService.createTextOutput(JSON.stringify(data))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function getPricelistFromSheet() {
  // Sheet-Name anpassen falls notwendig
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet1");

  if (!sheet) {
    throw new Error("Sheet 'Sheet1' nicht gefunden");
  }

  var rawData = sheet.getDataRange().getValues();

  // Erste Zeile (Header) überspringen
  rawData.shift();

  var pricing = {};

  rawData.forEach(function(row) {
    // Spalten-Mapping:
    // A [0] = category (z.B. "catering")
    // B [1] = key (z.B. "pause_gemischt")
    // C [2] = label (Beschreibung)
    // D [3] = price (Preis)
    // E [4] = unit (Einheit, optional)

    var category = row[0];
    var key = row[1];
    var price = row[3];

    // Leere Zeilen überspringen
    if (!category || !key) return;

    // Kategorie-Objekt erstellen falls nicht vorhanden
    if (!pricing[category]) {
      pricing[category] = {};
    }

    // Preis zuweisen (als Zahl)
    pricing[category][key] = (typeof price === 'number') ? price : Number(price) || 0;
  });

  return pricing;
}

/**
 * Test-Funktion zum Debuggen
 * Ausführen über: Ausführen > Funktion ausführen > testPricelist
 */
function testPricelist() {
  var data = getPricelistFromSheet();
  Logger.log(JSON.stringify(data, null, 2));
}
