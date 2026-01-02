/**
 * Pricelist Management Module
 * Loads prices from Google Apps Script web app or local JSON fallback
 */

(function() {
    'use strict';

    // Configuration - loaded from config.js or use defaults
    const CONFIG = {
        // Google Apps Script web app URL (loaded from config.js)
        appsScriptUrl: (window.SeminarFormConfig && window.SeminarFormConfig.appsScriptUrl) || '',
        // Local fallback file
        localPricesUrl: (window.SeminarFormConfig && window.SeminarFormConfig.localPricesUrl) || 'prices.json',
        // Cache settings
        cacheKey: 'seminar_prices',
        cacheTimestampKey: 'seminar_prices_timestamp',
        cacheMaxAge: (window.SeminarFormConfig && window.SeminarFormConfig.cacheMaxAge) || 3600000 // 1 hour in milliseconds
    };

    let prices = null;
    let loadPromise = null;

    /**
     * Get nested value from object using dot notation path
     */
    function getNestedValue(obj, path) {
        return path.split('.').reduce(function(current, key) {
            return current && current[key] !== undefined ? current[key] : null;
        }, obj);
    }

    /**
     * Load prices from localStorage cache if valid
     */
    function loadFromCache() {
        try {
            const cached = localStorage.getItem(CONFIG.cacheKey);
            const timestamp = localStorage.getItem(CONFIG.cacheTimestampKey);
            
            if (cached && timestamp) {
                const age = Date.now() - parseInt(timestamp, 10);
                if (age < CONFIG.cacheMaxAge) {
                    return JSON.parse(cached);
                }
            }
        } catch (e) {
            console.warn('Failed to load prices from cache:', e);
        }
        return null;
    }

    /**
     * Save prices to localStorage cache
     */
    function saveToCache(data) {
        try {
            localStorage.setItem(CONFIG.cacheKey, JSON.stringify(data));
            localStorage.setItem(CONFIG.cacheTimestampKey, Date.now().toString());
        } catch (e) {
            console.warn('Failed to save prices to cache:', e);
        }
    }

    /**
     * Load prices from Google Apps Script web app
     */
    function loadFromAppsScript() {
        if (!CONFIG.appsScriptUrl) {
            return Promise.reject(new Error('Apps Script URL not configured'));
        }

        return fetch(CONFIG.appsScriptUrl)
            .then(function(response) {
                if (!response.ok) {
                    throw new Error('Failed to fetch prices from Apps Script');
                }
                return response.json();
            })
            .then(function(data) {
                // Convert flat key-value format to nested structure
                const convertedData = convertFlatToNested(data);
                saveToCache(convertedData);
                return convertedData;
            });
    }

    /**
     * Convert flat key-value format from Apps Script to nested JSON structure
     * Input: {"1tag.base_price": {"74": 0}, "catering.pause.gemischt": {"14": 0}, ...}
     * Output: {1tag: {base_price: 74}, catering: {pause: {gemischt: 14}}, ...}
     */
    function convertFlatToNested(flatData) {
        const nested = {};

        for (const keyPath in flatData) {
            if (flatData.hasOwnProperty(keyPath)) {
                // Extract the price value from the nested object
                // Format from Apps Script: {"74": 0} -> we need 74
                const priceObj = flatData[keyPath];
                let price = 0;
                
                // Handle different possible formats
                if (typeof priceObj === 'number') {
                    price = priceObj;
                } else if (typeof priceObj === 'object' && priceObj !== null) {
                    // Get the first key which should be the price as a string
                    const priceKeys = Object.keys(priceObj);
                    if (priceKeys.length > 0) {
                        price = parseFloat(priceKeys[0]) || 0;
                    }
                }

                // Set nested value using dot notation path
                setNestedValue(nested, keyPath, price);
            }
        }

        return nested;
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

    /**
     * Load prices from local JSON file
     */
    function loadFromLocal() {
        return fetch(CONFIG.localPricesUrl)
            .then(function(response) {
                if (!response.ok) {
                    throw new Error('Failed to fetch local prices file');
                }
                return response.json();
            })
            .then(function(data) {
                saveToCache(data);
                return data;
            });
    }

    /**
     * Load prices with fallback strategy
     */
    function loadPrices() {
        if (loadPromise) {
            return loadPromise;
        }

        loadPromise = new Promise(function(resolve, reject) {
            // Check if force refresh is enabled
            const forceRefresh = (window.SeminarFormConfig && window.SeminarFormConfig.forceRefresh) || false;
            
            // Try cache first (unless force refresh is enabled)
            if (!forceRefresh) {
                const cached = loadFromCache();
                if (cached) {
                    prices = cached;
                    resolve(cached);
                    return;
                }
            }

            // Try Apps Script, fallback to local
            const loadStrategy = CONFIG.appsScriptUrl 
                ? loadFromAppsScript().catch(function() {
                    console.warn('Apps Script failed, falling back to local file');
                    return loadFromLocal();
                })
                : loadFromLocal();

            loadStrategy
                .then(function(data) {
                    prices = data;
                    resolve(data);
                })
                .catch(function(error) {
                    console.error('Failed to load prices:', error);
                    // Use default fallback prices
                    prices = getDefaultPrices();
                    resolve(prices);
                });
        });

        return loadPromise;
    }

    /**
     * Default fallback prices (same as prices.json structure)
     */
    function getDefaultPrices() {
        return {
            "1tag": {
                "base_price": 74.00
            },
            "catering": {
                "pause": {
                    "gemischt": 14.00,
                    "pikant": 12.00,
                    "suess": 8.00
                },
                "mittagessen": {
                    "base": 34.00,
                    "getraenke": 5.00
                },
                "abendessen": {
                    "base": 52.00,
                    "upgrade_steak": 87.00
                }
            },
            "rooms": {
                "per_night": 151.00,
                "naechtigungsabgabe": 2.50
            },
            "equipment": {
                "raumgarantie": 200.00,
                "gruppenraum_per_day": 100.00
            },
            "activities": {
                "yoga": 0,
                "wein": 0,
                "spirituosen": 0,
                "zotter": 0,
                "vulcano": 0,
                "ebike": 0
            }
        };
    }

    /**
     * Get price by key path (e.g., "catering.pause.gemischt")
     */
    function getPrice(keyPath) {
        if (!prices) {
            console.warn('Prices not loaded yet, using default');
            const defaults = getDefaultPrices();
            return getNestedValue(defaults, keyPath) || 0;
        }
        return getNestedValue(prices, keyPath) || 0;
    }

    /**
     * Get all prices object
     */
    function getAllPrices() {
        return prices || getDefaultPrices();
    }

    /**
     * Check if prices are loaded
     */
    function isLoaded() {
        return prices !== null;
    }

    /**
     * Refresh prices (clear cache and reload)
     */
    function refresh() {
        try {
            localStorage.removeItem(CONFIG.cacheKey);
            localStorage.removeItem(CONFIG.cacheTimestampKey);
        } catch (e) {
            console.warn('Failed to clear cache:', e);
        }
        prices = null;
        loadPromise = null;
        return loadPrices();
    }

    // Public API
    window.Pricelist = {
        load: loadPrices,
        getPrice: getPrice,
        getAllPrices: getAllPrices,
        isLoaded: isLoaded,
        refresh: refresh,
        clearCache: function() {
            try {
                localStorage.removeItem(CONFIG.cacheKey);
                localStorage.removeItem(CONFIG.cacheTimestampKey);
                prices = null;
                loadPromise = null;
            } catch (e) {
                console.warn('Failed to clear cache:', e);
            }
        },
        setAppsScriptUrl: function(url) {
            CONFIG.appsScriptUrl = url;
        }
    };

})();

