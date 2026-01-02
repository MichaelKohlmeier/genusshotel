/**
 * Google Apps Script Template
 * 
 * Instructions:
 * 1. Open your Google Sheet with the pricelist
 * 2. Go to Extensions > Apps Script
 * 3. Replace the default code with this script
 * 4. Update the sheet name if different from "Sheet1"
 * 5. Save the script
 * 6. Deploy > New deployment > Type: Web app
 * 7. Execute as: Me
 * 8. Who has access: Anyone (or specific domain)
 * 9. Click Deploy and copy the web app URL
 * 10. Add the URL to pricelist.js CONFIG.appsScriptUrl
 */

function doGet() {
  try {
    // Get the active spreadsheet (or specify by ID)
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sheet1');
    
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({
        error: 'Sheet not found'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Get all data from the sheet
    const data = sheet.getDataRange().getValues();
    
    // Convert sheet data to JSON structure
    // Expected sheet structure:
    // Row 1: Headers (Category, Subcategory, Item, Price)
    // Row 2+: Data rows
    const prices = convertSheetToJSON(data);
    
    // Return JSON response
    return ContentService.createTextOutput(JSON.stringify(prices))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Convert sheet data to JSON structure matching prices.json format
 * 
 * Sheet format option 1 (Recommended - Simple):
 * Column A: Key path (e.g., "1tag.base_price")
 * Column B: Value (e.g., 74.00)
 * 
 * Sheet format option 2 (Structured):
 * Multiple sheets or structured layout matching JSON hierarchy
 */
function convertSheetToJSON(data) {
  // If first row is headers, skip it
  const startRow = data[0][0].toLowerCase().includes('key') ? 1 : 0;
  
  const prices = {
    "1tag": { "base_price": 74.00 },
    "catering": {
      "pause": { "gemischt": 14.00, "pikant": 12.00, "suess": 8.00 },
      "mittagessen": { "base": 34.00, "getraenke": 5.00 },
      "abendessen": { "base": 52.00, "upgrade_steak": 87.00 }
    },
    "rooms": { "per_night": 151.00, "naechtigungsabgabe": 2.50 },
    "equipment": { "raumgarantie": 200.00, "gruppenraum_per_day": 100.00 },
    "activities": { "yoga": 0, "wein": 0, "spirituosen": 0, "zotter": 0, "vulcano": 0, "ebike": 0 }
  };
  
  // Parse sheet data if using key-value format
  for (let i = startRow; i < data.length; i++) {
    const row = data[i];
    if (row.length >= 2 && row[0] && row[1] !== '') {
      const keyPath = String(row[0]).trim();
      const value = parseFloat(row[1]) || 0;
      
      // Set nested value
      setNestedValue(prices, keyPath, value);
    }
  }
  
  return prices;
}

/**
 * Set nested value in object using dot notation path
 */
function setNestedValue(obj, path, value) {
  const keys = path.split('.');
  let current = obj;
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!current[key] || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }
  
  current[keys[keys.length - 1]] = value;
}

