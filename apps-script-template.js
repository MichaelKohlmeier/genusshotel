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

// ============================================================
// FORM SUBMISSION HANDLING
// ============================================================

/**
 * Configuration for form submission
 * UPDATE THESE VALUES before deploying!
 */
var CONFIG = {
  // Google Doc template ID (get from URL: docs.google.com/document/d/THIS_IS_THE_ID/edit)
  TEMPLATE_DOC_ID: '1A_rGXvcHl_mSioXXz2lTWL_EBlf25bfXjUth9FwcfIw',

  // Email recipient for seminar inquiries
  RECIPIENT_EMAIL: 'goelles.j@gmail.com',

  // Email subject prefix
  EMAIL_SUBJECT_PREFIX: 'Neue Seminaranfrage'
};

/**
 * Handle POST requests (form submissions)
 */
function doPost(e) {
  try {
    // Parse the incoming JSON data
    var data = JSON.parse(e.postData.contents);

    // Generate the Word document
    var docBlob = generateDocument(data);

    // Send email to reception with attachment
    sendReceptionEmail(data, docBlob);

    // Send confirmation email to guest
    sendConfirmationEmail(data);

    // Return success response
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Anfrage erfolgreich gesendet'
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('Error in doPost: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Generate Word document from template
 */
function generateDocument(data) {
  // Copy the template document
  var templateFile = DriveApp.getFileById(CONFIG.TEMPLATE_DOC_ID);
  var copyFile = templateFile.makeCopy('Seminaranfrage_' + data.nachname + '_' + new Date().toISOString().split('T')[0]);
  var copyDoc = DocumentApp.openById(copyFile.getId());
  var body = copyDoc.getBody();

  // Replace placeholders with form data
  body.replaceText('{{anrede}}', data.anrede || '');
  body.replaceText('{{vorname}}', data.vorname || '');
  body.replaceText('{{nachname}}', data.nachname || '');
  body.replaceText('{{firma}}', data.firma || '');
  body.replaceText('{{email}}', data.email || '');
  body.replaceText('{{telefon}}', data.telefon || '');

  body.replaceText('{{seminar_typ}}', data.seminar_typ || '');
  body.replaceText('{{datum}}', data.datum || '');
  body.replaceText('{{personenanzahl}}', data.personenanzahl || '0');

  body.replaceText('{{zimmer_einzel}}', data.zimmer_einzel || '0');
  body.replaceText('{{zimmer_doppel}}', data.zimmer_doppel || '0');
  body.replaceText('{{sitzordnung}}', formatSitzordnung(data.sitzordnung) || '');

  body.replaceText('{{verpflegung}}', formatVerpflegung(data.verpflegung) || '');

  // Equipment
  var equipmentText = formatEquipment(data);
  body.replaceText('{{ausstattung}}', equipmentText);

  // Activities
  var aktivitaetenText = data.aktivitaeten && data.aktivitaeten.length > 0
    ? data.aktivitaeten.join(', ')
    : 'Keine';
  body.replaceText('{{aktivitaeten}}', aktivitaetenText);

  body.replaceText('{{nachricht}}', data.nachricht || '');
  body.replaceText('{{preis_brutto}}', data.preis_brutto || '0.00');
  body.replaceText('{{preis_netto}}', data.preis_netto || '0.00');
  body.replaceText('{{preis_pro_person}}', data.preis_pro_person || '0.00');

  // Save and close
  copyDoc.saveAndClose();

  // Export as Word document using URL fetch (the only way to get .docx from Apps Script)
  var docId = copyFile.getId();
  var url = 'https://docs.google.com/document/d/' + docId + '/export?format=docx';
  var token = ScriptApp.getOAuthToken();
  var response = UrlFetchApp.fetch(url, {
    headers: {
      'Authorization': 'Bearer ' + token
    }
  });

  var docBlob = response.getBlob()
    .setName('Seminaranfrage_' + data.nachname + '_' + new Date().toISOString().split('T')[0] + '.docx');

  // Delete the temporary Google Doc
  DriveApp.getFileById(docId).setTrashed(true);

  return docBlob;
}

/**
 * Format Sitzordnung for display
 */
function formatSitzordnung(value) {
  var mapping = {
    'block': 'Block',
    'fisch': 'Fischgräte',
    'parlament': 'Parlament',
    'sesselkreis': 'Sesselkreis',
    'theater': 'Theater',
    'u-form': 'U-Form'
  };
  return mapping[value] || value || '';
}

/**
 * Format Verpflegung package for display
 */
function formatVerpflegung(value) {
  var mapping = {
    'genuss': 'GENUSS Paket',
    'hochgenuss': 'HOCHGENUSS Paket'
  };
  return mapping[value] || value || '';
}

/**
 * Format equipment list for display
 */
function formatEquipment(data) {
  var items = [];

  if (parseInt(data.equipment_flipcharts) > 0) {
    items.push(data.equipment_flipcharts + 'x Flipchart');
  }
  if (parseInt(data.equipment_pinnwand) > 0) {
    items.push(data.equipment_pinnwand + 'x Pinnwand');
  }
  if (parseInt(data.equipment_displayboard) > 0) {
    items.push(data.equipment_displayboard + 'x Displayboard');
  }
  if (parseInt(data.equipment_funkmikrofon) > 0) {
    items.push(data.equipment_funkmikrofon + 'x Funkmikrofon');
  }
  if (parseInt(data.equipment_presenter) > 0) {
    items.push(data.equipment_presenter + 'x Presenter');
  }
  if (parseInt(data.equipment_laptop) > 0) {
    items.push(data.equipment_laptop + 'x Laptop');
  }
  if (data.equipment_sonstiges && data.equipment_sonstiges.trim()) {
    items.push('Sonstiges: ' + data.equipment_sonstiges);
  }

  return items.length > 0 ? items.join(', ') : 'Keine zusätzliche Ausstattung';
}

/**
 * Send email to reception with Word document attachment
 */
function sendReceptionEmail(data, docBlob) {
  var subject = CONFIG.EMAIL_SUBJECT_PREFIX + ' von ' + data.vorname + ' ' + data.nachname;

  var htmlBody = '<h2>Neue Seminaranfrage</h2>' +
    '<p><strong>Von:</strong> ' + data.anrede + ' ' + data.vorname + ' ' + data.nachname + '</p>' +
    '<p><strong>Firma:</strong> ' + (data.firma || '-') + '</p>' +
    '<p><strong>E-Mail:</strong> <a href="mailto:' + data.email + '">' + data.email + '</a></p>' +
    '<p><strong>Telefon:</strong> ' + (data.telefon || '-') + '</p>' +
    '<hr>' +
    '<p><strong>Seminar-Typ:</strong> ' + data.seminar_typ + '</p>' +
    '<p><strong>Datum:</strong> ' + data.datum + '</p>' +
    '<p><strong>Personenanzahl:</strong> ' + data.personenanzahl + '</p>' +
    '<p><strong>Geschätzter Preis:</strong> € ' + data.preis_brutto + ' (brutto)</p>' +
    '<hr>' +
    '<p>Die vollständigen Details finden Sie im angehängten Word-Dokument.</p>';

  MailApp.sendEmail({
    to: CONFIG.RECIPIENT_EMAIL,
    subject: subject,
    htmlBody: htmlBody,
    attachments: [docBlob]
  });
}

/**
 * Send confirmation email to guest
 */
function sendConfirmationEmail(data) {
  var subject = 'Ihre Seminaranfrage beim Genusshotel Riegersburg';

  var htmlBody = '<p>Sehr geehrte/r ' + data.anrede + ' ' + data.nachname + ',</p>' +
    '<p>vielen Dank für Ihre Seminaranfrage!</p>' +
    '<p>Wir haben Ihre Anfrage erhalten und werden uns in Kürze bei Ihnen melden.</p>' +
    '<h3>Zusammenfassung Ihrer Anfrage:</h3>' +
    '<ul>' +
    '<li><strong>Seminar-Typ:</strong> ' + data.seminar_typ + '</li>' +
    '<li><strong>Datum:</strong> ' + data.datum + '</li>' +
    '<li><strong>Personenanzahl:</strong> ' + data.personenanzahl + '</li>' +
    '<li><strong>Geschätzter Preis:</strong> € ' + data.preis_brutto + ' (brutto)</li>' +
    '</ul>' +
    '<p>Bei Fragen stehen wir Ihnen gerne zur Verfügung:</p>' +
    '<p>Telefon: +43 3153 20020<br>' +
    'E-Mail: <a href="mailto:rezeption@genusshotel-riegersburg.at">rezeption@genusshotel-riegersburg.at</a></p>' +
    '<p>Mit freundlichen Grüßen,<br>' +
    'Ihr Team vom Genusshotel Riegersburg</p>';

  MailApp.sendEmail({
    to: data.email,
    subject: subject,
    htmlBody: htmlBody
  });
}

/**
 * Test function for form submission
 * Run this to test the document generation and email sending
 */
function testFormSubmission() {
  var testData = {
    anrede: 'Herr',
    vorname: 'Max',
    nachname: 'Mustermann',
    email: 'test@example.com',
    telefon: '+43 123 456789',
    firma: 'Test GmbH',
    seminar_typ: 'Mehrtägiges Seminar',
    datum: '2026-03-01 bis 2026-03-03',
    personenanzahl: '10',
    zimmer_einzel: '2',
    zimmer_doppel: '4',
    sitzordnung: 'u-form',
    verpflegung: 'hochgenuss',
    equipment_flipcharts: '2',
    equipment_pinnwand: '1',
    equipment_displayboard: '0',
    equipment_funkmikrofon: '1',
    equipment_presenter: '1',
    equipment_laptop: '0',
    equipment_sonstiges: '',
    aktivitaeten: ['Yoga', 'Weinverkostung'],
    nachricht: 'Dies ist eine Testanfrage.',
    preis_brutto: '3500.00',
    preis_netto: '3150.00',
    preis_pro_person: '350.00'
  };

  // Generate document (but don't send emails in test)
  var docBlob = generateDocument(testData);
  Logger.log('Document generated: ' + docBlob.getName());

  // Uncomment to test emails:
  // sendReceptionEmail(testData, docBlob);
  // sendConfirmationEmail(testData);
}
