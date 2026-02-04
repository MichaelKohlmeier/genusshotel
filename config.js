/**
 * Configuration file for Seminar Booking Form
 * 
 * Update the Apps Script URL here when you deploy a new version
 */

window.SeminarFormConfig = {
    // Google Apps Script web app URL for fetching prices
    appsScriptUrl: 'https://script.google.com/macros/s/AKfycbyoW1gCNEuldH9RDxvueQwA9FyE40P6g4n8fbTQU8-zjVkc_tCNHZY7Rj5VOhytN65A/exec',
    
    // Local fallback file (used if Apps Script fails)
    localPricesUrl: 'prices.json',
    
    // Cache settings
    cacheMaxAge: 300000, // 5 minutes in milliseconds (reduced from 1 hour for faster updates)
    
    // Force refresh on page load (set to true to always fetch fresh prices)
    forceRefresh: true
};

