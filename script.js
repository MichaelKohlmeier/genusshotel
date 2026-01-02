/**
 * Seminar Booking Form Logic
 * Handles room allocation, price calculation, and form interactions
 */

(function() {
    'use strict';

    // DOM Elements
    const seminarTyp1Tag = document.getElementById('seminar_1tag');
    const seminarTypMehrtag = document.getElementById('seminar_mehrtag');
    const package1Tag = document.getElementById('package_1tag');
    const tageFieldSection = document.getElementById('tage_field_section');
    const roomFieldsSection = document.getElementById('room_fields_section');
    const cateringSection = document.getElementById('catering_section');
    const equipmentActivitiesSection = document.getElementById('equipment_activities_section');
    const roomAllocationDisplay = document.getElementById('room-allocation-display');
    const personenanzahlInput = document.getElementById('personenanzahl');
    const personenanzahlSlider = document.getElementById('personenanzahl_slider');
    const personenanzahlDisplay = document.getElementById('personenanzahl_display');
    const tageInput = document.getElementById('tage');
    const roomSuggestionSpan = document.getElementById('room-suggestion');
    const cateringAbendessenBase = document.getElementById('catering_abendessen_base');
    const cateringAbendessenUpgrade = document.getElementById('catering_abendessen_upgrade');
    const equipmentGruppenraum = document.getElementById('equipment_gruppenraum');

    /**
     * Calculate and display room allocation based on participant count
     */
    function updateRoomAllocation() {
        // Only update if room allocation display is visible (Mehrtägiges Seminar)
        if (roomAllocationDisplay && roomAllocationDisplay.style.display === 'none') {
            return;
        }

        const personenanzahl = parseInt(personenanzahlInput?.value) || 4;
        let roomText = '';

        if (personenanzahl >= 1 && personenanzahl <= 10) {
            roomText = '40m² Raum (inkludiert)';
        } else if (personenanzahl >= 11 && personenanzahl <= 16) {
            roomText = '80m² Raum (inkludiert)';
        } else if (personenanzahl > 16) {
            roomText = 'Anfrage erforderlich (mehr als 16 Personen)';
        }

        if (roomSuggestionSpan) {
            roomSuggestionSpan.textContent = roomText;
        }
    }

    /**
     * Handle Mittagessen upgrade logic
     * If upgrade is checked, replace base price with upgrade price
     */
    function handleMittagessenUpgrade() {
        // Note: Currently no upgrade for Mittagessen, but keeping structure for future
        // The Getränke is an add-on, not a replacement
    }

    /**
     * Handle Abendessen selection (now using radio buttons)
     * Logic is handled in calculateTotalPrice - only one option can be selected
     */

    /**
     * Calculate total price based on selected items using dynamic pricelist
     */
    function calculateTotalPrice() {
        if (!window.Pricelist || !window.Pricelist.isLoaded()) {
            return 0;
        }

        const is1Tag = seminarTyp1Tag && seminarTyp1Tag.checked;
        const personenanzahl = parseInt(personenanzahlInput?.value) || 4;

        // 1-Tages-Seminar: Fixed price
        if (is1Tag) {
            const basePrice = window.Pricelist.getPrice('1tag.base_price');
            return basePrice * personenanzahl;
        }

        // Mehrtägiges Seminar: Calculate based on selections
        let total = 0;
        const tage = parseInt(tageInput?.value) || 1;

        // Get catering radio buttons (vormittag, nachmittag)
        const cateringVormittag = document.querySelector('input[name="catering_vormittag"]:checked');
        if (cateringVormittag && cateringVormittag.dataset.priceKey) {
            const price = window.Pricelist.getPrice(cateringVormittag.dataset.priceKey);
            total += price;
        }

        const cateringNachmittag = document.querySelector('input[name="catering_nachmittag"]:checked');
        if (cateringNachmittag && cateringNachmittag.dataset.priceKey) {
            const price = window.Pricelist.getPrice(cateringNachmittag.dataset.priceKey);
            total += price;
        }

        // Get all catering checkboxes (mittagessen only - abendessen is now radio buttons)
        const cateringCheckboxes = document.querySelectorAll('input[type="checkbox"][name^="catering_"]:checked');
        cateringCheckboxes.forEach(function(checkbox) {
            if (checkbox.dataset.priceKey) {
                const price = window.Pricelist.getPrice(checkbox.dataset.priceKey);
                total += price;
            }
        });
        
        // Get Abendessen radio button (either base or upgrade, mutually exclusive)
        const abendessenSelected = document.querySelector('input[name="catering_abendessen"]:checked');
        if (abendessenSelected && abendessenSelected.dataset.priceKey) {
            const price = window.Pricelist.getPrice(abendessenSelected.dataset.priceKey);
            total += price;
        }

        // Room costs
        const zimmerEinzel = parseInt(document.getElementById('zimmer_einzel')?.value) || 0;
        const zimmerDoppel = parseInt(document.getElementById('zimmer_doppel')?.value) || 0;
        const totalRooms = zimmerEinzel + zimmerDoppel;
        if (totalRooms > 0) {
            const roomPrice = window.Pricelist.getPrice('rooms.per_night');
            const naechtigungsabgabe = window.Pricelist.getPrice('rooms.naechtigungsabgabe');
            total += roomPrice * totalRooms * tage;
            total += naechtigungsabgabe * totalRooms * tage;
        }

        // Equipment
        const raumgarantie = document.getElementById('equipment_raumgarantie');
        if (raumgarantie?.checked && raumgarantie.dataset.priceKey) {
            total += window.Pricelist.getPrice(raumgarantie.dataset.priceKey);
        }

        if (equipmentGruppenraum?.checked && equipmentGruppenraum.dataset.priceKey) {
            const price = window.Pricelist.getPrice(equipmentGruppenraum.dataset.priceKey);
            total += price * tage;
        }

        // Activities
        const aktivitaetCheckboxes = document.querySelectorAll('input[type="checkbox"][name^="aktivitaet_"]:checked');
        aktivitaetCheckboxes.forEach(function(checkbox) {
            if (checkbox.dataset.priceKey) {
                const price = window.Pricelist.getPrice(checkbox.dataset.priceKey);
                total += price;
            }
        });

        // Multiply by number of persons
        return total * personenanzahl;
    }

    /**
     * Display price summary
     */
    function updatePriceDisplay() {
        const total = calculateTotalPrice();
        const personenanzahl = parseInt(personenanzahlInput?.value) || 4;
        const is1Tag = seminarTyp1Tag && seminarTyp1Tag.checked;
        
        // Update 1-Tages package price display
        const packagePriceEl = document.getElementById('package_1tag_price');
        if (packagePriceEl && is1Tag) {
            const basePrice = window.Pricelist && window.Pricelist.isLoaded() 
                ? window.Pricelist.getPrice('1tag.base_price') 
                : 74.00;
            packagePriceEl.textContent = '€' + (basePrice * personenanzahl).toFixed(2);
        }

        // Update price summary section
        const priceSummarySection = document.getElementById('price-summary-section');
        const priceSummaryContent = document.getElementById('price-summary-content');
        
        if (priceSummarySection && priceSummaryContent) {
            if (total > 0) {
                priceSummarySection.style.display = 'block';
                
                let html = '<div style="margin-bottom: 0.5em;">';
                html += '<strong>Gesamtpreis:</strong> <span style="font-size: 1.5em; font-weight: 700; color: #bdadad;">€' + total.toFixed(2) + '</span>';
                html += '</div>';
                
                if (personenanzahl > 1) {
                    const perPerson = total / personenanzahl;
                    html += '<div style="margin-top: 0.5em; font-size: 0.9em; color: #666;">';
                    html += 'Preis pro Person: €' + perPerson.toFixed(2);
                    html += '</div>';
                }
                
                priceSummaryContent.innerHTML = html;
            } else {
                priceSummarySection.style.display = 'none';
            }
        }
    }

    /**
     * Sync slider for personenanzahl
     */
    function syncPersonenanzahl() {
        if (personenanzahlSlider && personenanzahlInput) {
            const value = personenanzahlSlider.value;
            personenanzahlInput.value = value;
            if (personenanzahlDisplay) {
                personenanzahlDisplay.textContent = value;
            }
            updateRoomAllocation();
            updatePriceDisplay(); // Update price when person count changes
        }
    }

    /**
     * Handle seminar type selection - show/hide sections
     */
    function handleSeminarTypeChange() {
        const is1Tag = seminarTyp1Tag && seminarTyp1Tag.checked;
        const isMehrtag = seminarTypMehrtag && seminarTypMehrtag.checked;

        // Show/hide 1-Tages package display
        if (package1Tag) {
            package1Tag.style.display = is1Tag ? 'block' : 'none';
        }

        // Show/hide Tage field (only for Mehrtägiges)
        if (tageFieldSection) {
            tageFieldSection.style.display = isMehrtag ? 'block' : 'none';
            if (tageInput) {
                tageInput.required = isMehrtag;
            }
        }

        // Show/hide room fields (only for Mehrtägiges)
        if (roomFieldsSection) {
            roomFieldsSection.style.display = isMehrtag ? 'block' : 'none';
        }

        // Show/hide catering section (only for Mehrtägiges)
        if (cateringSection) {
            cateringSection.style.display = isMehrtag ? 'block' : 'none';
        }

        // Show/hide equipment & activities (only for Mehrtägiges)
        if (equipmentActivitiesSection) {
            equipmentActivitiesSection.style.display = isMehrtag ? 'block' : 'none';
        }

        // Show/hide room allocation display (only for Mehrtägiges)
        if (roomAllocationDisplay) {
            roomAllocationDisplay.style.display = isMehrtag ? 'block' : 'none';
        }

        // Show/hide price summary (always show, but content differs)
        const priceSummarySection = document.getElementById('price-summary-section');
        if (priceSummarySection) {
            priceSummarySection.style.display = 'block';
        }

        // Update price calculation
        updatePriceDisplay();
    }

    /**
     * Initialize event listeners
     */
    function init() {
        // Wait for pricelist to load before initializing
        if (window.Pricelist) {
            window.Pricelist.load().then(function() {
                initializeForm();
            }).catch(function(error) {
                console.error('Failed to load pricelist:', error);
                // Initialize anyway with default prices
                initializeForm();
            });
        } else {
            // Pricelist not available, initialize with defaults
            console.warn('Pricelist module not loaded');
            initializeForm();
        }
        
        // Add keyboard shortcut to refresh prices: Ctrl+Shift+R or Cmd+Shift+R
        document.addEventListener('keydown', function(e) {
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'R') {
                e.preventDefault();
                if (window.Pricelist) {
                    console.log('Refreshing prices...');
                    window.Pricelist.clearCache();
                    window.Pricelist.refresh().then(function() {
                        updatePriceDisplay();
                        alert('Preise wurden aktualisiert!');
                    });
                }
            }
        });
    }

    /**
     * Initialize form after pricelist is loaded
     */
    function initializeForm() {
        // Seminar type change handlers
        if (seminarTyp1Tag) {
            seminarTyp1Tag.addEventListener('change', handleSeminarTypeChange);
        }
        if (seminarTypMehrtag) {
            seminarTypMehrtag.addEventListener('change', handleSeminarTypeChange);
        }
        handleSeminarTypeChange(); // Initial state

        // Slider sync
        if (personenanzahlSlider) {
            personenanzahlSlider.addEventListener('input', syncPersonenanzahl);
            personenanzahlSlider.addEventListener('change', syncPersonenanzahl);
            updateRoomAllocation(); // Initial calculation
        }

        // Abendessen radio button handler
        const abendessenRadios = document.querySelectorAll('input[name="catering_abendessen"]');
        abendessenRadios.forEach(function(radio) {
            radio.addEventListener('change', updatePriceDisplay);
        });

        // Price calculation on any checkbox change
        const allCheckboxes = document.querySelectorAll('input[type="checkbox"]');
        allCheckboxes.forEach(function(checkbox) {
            checkbox.addEventListener('change', updatePriceDisplay);
        });

        // Price calculation on radio button change
        const allRadios = document.querySelectorAll('input[type="radio"][name^="catering_"]');
        allRadios.forEach(function(radio) {
            radio.addEventListener('change', updatePriceDisplay);
        });

        // Tage input for Gruppenraum calculation
        if (tageInput) {
            tageInput.addEventListener('input', updatePriceDisplay);
            tageInput.addEventListener('change', updatePriceDisplay);
        }

        // Room inputs for price calculation
        const zimmerEinzel = document.getElementById('zimmer_einzel');
        const zimmerDoppel = document.getElementById('zimmer_doppel');
        if (zimmerEinzel) {
            zimmerEinzel.addEventListener('input', updatePriceDisplay);
            zimmerEinzel.addEventListener('change', updatePriceDisplay);
        }
        if (zimmerDoppel) {
            zimmerDoppel.addEventListener('input', updatePriceDisplay);
            zimmerDoppel.addEventListener('change', updatePriceDisplay);
        }

        // Initial price calculation
        updatePriceDisplay();
        
        // Initialize slider display
        if (personenanzahlDisplay && personenanzahlSlider) {
            personenanzahlDisplay.textContent = personenanzahlSlider.value;
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();

