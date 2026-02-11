/**
 * Configuration file for Seminar Booking Form
 * 
 * Update the Apps Script URL here when you deploy a new version
 */

window.SeminarFormConfig = {
    // Google Apps Script web app URL for fetching prices
    appsScriptUrl: 'https://script.google.com/macros/s/AKfycbyVeUkg3m7jP3Gfx-Spuw0bAyi9bRhYeuytgzCX0RI55zIj9-Zg41Nkw5vCghVL3WVe/exec',

    // Google Apps Script web app URL for form submission
    // TODO: Update this URL after deploying the Apps Script with doPost()
    submissionUrl: 'https://script.google.com/macros/s/AKfycbyVeUkg3m7jP3Gfx-Spuw0bAyi9bRhYeuytgzCX0RI55zIj9-Zg41Nkw5vCghVL3WVe/exec',

    // Local fallback file (used if Apps Script fails)
    localPricesUrl: 'prices.json',

    // Cache settings
    cacheMaxAge: 300000, // 5 minutes in milliseconds (reduced from 1 hour for faster updates)

    // Force refresh on page load (set to true to always fetch fresh prices)
    forceRefresh: true
};

