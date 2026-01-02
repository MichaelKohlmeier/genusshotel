/**
 * Configuration file for Seminar Booking Form
 * 
 * Update the Apps Script URL here when you deploy a new version
 */

window.SeminarFormConfig = {
    // Google Apps Script web app URL for fetching prices
    appsScriptUrl: 'https://script.google.com/macros/s/AKfycbxurGVVhs3x8BAEMSYisVwLKLofeFX6FQyYNH0hOqyc_RM9MK8LFWBIYsMbv8mKoKTl/exec',
    
    // Local fallback file (used if Apps Script fails)
    localPricesUrl: 'prices.json',
    
    // Cache settings
    cacheMaxAge: 300000, // 5 minutes in milliseconds (reduced from 1 hour for faster updates)
    
    // Force refresh on page load (set to true to always fetch fresh prices)
    forceRefresh: true
};

