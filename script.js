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
    const dateSingleSection = document.getElementById('date_single_section');
    const dateRangeSection = document.getElementById('date_range_section');
    const seminarDatumInput = document.getElementById('seminar_datum');
    const seminarStartInput = document.getElementById('seminar_start');
    const seminarEndeInput = document.getElementById('seminar_ende');
    const roomFieldsSection = document.getElementById('room_fields_section');
    const roomAllocationDisplay = document.getElementById('room-allocation-display');
    const personenanzahlInput = document.getElementById('personenanzahl');
    const personenanzahlSlider = document.getElementById('personenanzahl_slider');
    const personenanzahlDisplay = document.getElementById('personenanzahl_display');
    const roomSuggestionSpan = document.getElementById('room-suggestion');
    const cateringAbendessenBase = document.getElementById('catering_abendessen_base');
    const cateringAbendessenUpgrade = document.getElementById('catering_abendessen_upgrade');
    const equipmentGruppenraum = document.getElementById('equipment_gruppenraum');

    // Tab Elements
    const tabBtnVerpflegung = document.getElementById('tab-btn-verpflegung');
    const tabBtnRahmenprogramm = document.getElementById('tab-btn-rahmenprogramm');

    /**
     * Switch to a specific tab
     */
    function switchTab(tabId) {
        // Remove active class from all buttons and contents
        document.querySelectorAll('.tab-button').forEach(function(btn) {
            btn.classList.remove('active');
        });
        document.querySelectorAll('.tab-content').forEach(function(content) {
            content.classList.remove('active');
        });

        // Add active class to selected button and content
        const selectedButton = document.querySelector('.tab-button[data-tab="' + tabId + '"]');
        const selectedContent = document.getElementById(tabId);

        if (selectedButton) {
            selectedButton.classList.add('active');
        }
        if (selectedContent) {
            selectedContent.classList.add('active');
        }
    }

    /**
     * Initialize tab navigation
     */
    function initTabs() {
        const tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(function(button) {
            button.addEventListener('click', function() {
                const tabId = this.getAttribute('data-tab');
                switchTab(tabId);
            });
        });
    }

    /**
     * Calculate and display room allocation based on participant count
     */
    function updateRoomAllocation() {
        // Only update if room allocation display is visible (Mehrtägiges Seminar)
        if (roomAllocationDisplay && roomAllocationDisplay.style.display === 'none') {
            return;
        }

        const personenanzahl = parseInt(personenanzahlInput?.value) || 0;
        let roomText = '';

        if (personenanzahl === 0) {
            roomText = 'Bitte Zimmer auswählen';
        } else if (personenanzahl >= 1 && personenanzahl <= 12) {
            roomText = '45m² Raum (inkludiert)';
        } else if (personenanzahl >= 13 && personenanzahl <= 20) {
            roomText = '80m² Raum (inkludiert)';
        } else if (personenanzahl >= 21 && personenanzahl <= 35) {
            roomText = '125m² Raum (inkludiert)';
        } else if (personenanzahl > 35) {
            roomText = '165m² Raum (inkludiert)';
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
     * Calculate number of days from start and end dates (inclusive)
     * Returns 1 if dates are invalid or missing
     */
    function calculateDaysFromDates() {
        const is1Tag = seminarTyp1Tag && seminarTyp1Tag.checked;
        
        // For 1-Tages-Seminar, always return 1 day
        if (is1Tag) {
            return 1;
        }
        
        // For Mehrtägiges Seminar, calculate from date range
        if (!seminarStartInput || !seminarEndeInput) {
            return 1;
        }
        
        const startDateStr = seminarStartInput.value;
        const endDateStr = seminarEndeInput.value;
        
        // If either date is missing, return 1 as default
        if (!startDateStr || !endDateStr) {
            return 1;
        }
        
        const startDate = new Date(startDateStr);
        const endDate = new Date(endDateStr);
        
        // Validate dates
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return 1;
        }
        
        // If end date is before start date, return 1
        if (endDate < startDate) {
            return 1;
        }
        
        // Calculate difference in days (inclusive, so add 1)
        const timeDiff = endDate.getTime() - startDate.getTime();
        const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24)) + 1;
        
        // Return at least 1 day
        return Math.max(1, daysDiff);
    }

    /**
     * Calculate total price based on selected items using dynamic pricelist
     * Returns object with brutto, netto, breakdown by VAT rate, and category breakdown
     * Austria: 10% for accommodation/catering, 20% for equipment/activities
     */
    function calculateTotalPrice() {
        if (!window.Pricelist || !window.Pricelist.isLoaded()) {
            return { brutto: 0, netto: 0, vat10: 0, vat20: 0, naechtigungsabgabe: 0, breakdown: {} };
        }

        const is1Tag = seminarTyp1Tag && seminarTyp1Tag.checked;
        const personenanzahl = parseInt(personenanzahlInput?.value) || 0;
        const tage = calculateDaysFromDates();
        const naechte = Math.max(0, tage - 1); // Nächte = Tage - 1

        // Track costs by VAT rate (all prices are BRUTTO including VAT)
        let brutto10 = 0; // 10% VAT: accommodation, catering
        let brutto20 = 0; // 20% VAT: equipment, activities
        let naechtigungsabgabeTotal = 0; // No VAT on this tax

        // Category breakdown for transparency
        let breakdown = {
            seminarpaket: 0,
            naechtigungen: 0,
            verpflegung: 0,
            ausstattung: 0,
            rahmenprogramme: 0,
            naechtigungsabgabe: 0
        };

        // Calculate additional equipment (20% VAT, applies to both 1-Tag and Mehrtag)
        const equipmentFlipcharts = parseInt(document.querySelector('input[name="equipment_flipcharts"]')?.value) || 0;
        const equipmentPinnwand = parseInt(document.querySelector('input[name="equipment_pinnwand"]')?.value) || 0;
        const equipmentDisplayboard = parseInt(document.querySelector('input[name="equipment_displayboard"]')?.value) || 0;
        const equipmentFunkmikrofon = parseInt(document.querySelector('input[name="equipment_funkmikrofon"]')?.value) || 0;
        const equipmentPresenter = parseInt(document.querySelector('input[name="equipment_presenter"]')?.value) || 0;
        const equipmentLaptop = parseInt(document.querySelector('input[name="equipment_laptop"]')?.value) || 0;

        // Equipment prices are per piece/day, not per person (20% VAT)
        let equipmentTotal = 0;
        equipmentTotal += equipmentFlipcharts * window.Pricelist.getPrice('equipment.flipchart') * tage;
        equipmentTotal += equipmentPinnwand * window.Pricelist.getPrice('equipment.pinnwand') * tage;
        equipmentTotal += equipmentDisplayboard * window.Pricelist.getPrice('equipment.displayboard') * tage;
        equipmentTotal += equipmentFunkmikrofon * window.Pricelist.getPrice('equipment.funkmikrofon') * tage;
        equipmentTotal += equipmentPresenter * window.Pricelist.getPrice('equipment.presenter') * tage;
        equipmentTotal += equipmentLaptop * window.Pricelist.getPrice('equipment.laptop') * tage;
        brutto20 += equipmentTotal;
        breakdown.ausstattung += equipmentTotal;

        // 1-Tages-Seminar: Fixed price (10% VAT) + equipment
        if (is1Tag) {
            const basePrice = window.Pricelist.getPrice('1tag.base_price');
            const seminarpaketTotal = basePrice * personenanzahl;
            brutto10 = seminarpaketTotal;
            breakdown.seminarpaket = seminarpaketTotal;

            const brutto = brutto10 + brutto20;
            const netto10 = brutto10 / 1.10;
            const netto20 = brutto20 / 1.20;
            const netto = netto10 + netto20;

            return {
                brutto: brutto,
                netto: netto,
                vat10: brutto10 - netto10,
                vat20: brutto20 - netto20,
                naechtigungsabgabe: 0,
                breakdown: breakdown
            };
        }

        // Mehrtägiges Seminar: Calculate based on selections
        let cateringTotal = 0; // 10% VAT

        // Get catering radio buttons (vormittag, nachmittag)
        const cateringVormittag = document.querySelector('input[name="catering_vormittag"]:checked');
        if (cateringVormittag && cateringVormittag.dataset.priceKey) {
            cateringTotal += window.Pricelist.getPrice(cateringVormittag.dataset.priceKey) * personenanzahl;
        }

        const cateringNachmittag = document.querySelector('input[name="catering_nachmittag"]:checked');
        if (cateringNachmittag && cateringNachmittag.dataset.priceKey) {
            cateringTotal += window.Pricelist.getPrice(cateringNachmittag.dataset.priceKey) * personenanzahl;
        }

        // Get all catering checkboxes (mittagessen only - abendessen is now radio buttons)
        const cateringCheckboxes = document.querySelectorAll('input[type="checkbox"][name^="catering_"]:checked');
        cateringCheckboxes.forEach(function(checkbox) {
            if (checkbox.dataset.priceKey) {
                cateringTotal += window.Pricelist.getPrice(checkbox.dataset.priceKey) * personenanzahl;
            }
        });

        // Get Abendessen radio button (either base or upgrade, mutually exclusive)
        const abendessenSelected = document.querySelector('input[name="catering_abendessen"]:checked');
        if (abendessenSelected && abendessenSelected.dataset.priceKey) {
            cateringTotal += window.Pricelist.getPrice(abendessenSelected.dataset.priceKey) * personenanzahl;
        }

        brutto10 += cateringTotal;
        breakdown.verpflegung = cateringTotal;

        // Room costs (10% VAT)
        const zimmerEinzel = parseInt(document.getElementById('zimmer_einzel')?.value) || 0;
        const zimmerDoppel = parseInt(document.getElementById('zimmer_doppel')?.value) || 0;
        let roomTotal = 0;

        if (zimmerEinzel > 0) {
            const singlePrice = window.Pricelist.getPrice('rooms.single_per_night');
            roomTotal += singlePrice * zimmerEinzel * naechte;
        }
        if (zimmerDoppel > 0) {
            // Double room price is per person
            const doublePrice = window.Pricelist.getPrice('rooms.double_per_person');
            roomTotal += doublePrice * zimmerDoppel * 2 * naechte; // *2 for 2 persons per double room
        }
        brutto10 += roomTotal;
        breakdown.naechtigungen = roomTotal;

        // Nächtigungsabgabe (no VAT - it's a local tax)
        const totalPersonsStaying = zimmerEinzel + (zimmerDoppel * 2);
        const naechtigungsabgabeRate = window.Pricelist.getPrice('rooms.naechtigungsabgabe');
        naechtigungsabgabeTotal = naechtigungsabgabeRate * totalPersonsStaying * naechte;
        breakdown.naechtigungsabgabe = naechtigungsabgabeTotal;

        // Equipment options (20% VAT)
        const raumgarantie = document.getElementById('equipment_raumgarantie');
        if (raumgarantie?.checked && raumgarantie.dataset.priceKey) {
            const price = window.Pricelist.getPrice(raumgarantie.dataset.priceKey);
            brutto20 += price;
            breakdown.ausstattung += price;
        }

        if (equipmentGruppenraum?.checked && equipmentGruppenraum.dataset.priceKey) {
            const price = window.Pricelist.getPrice(equipmentGruppenraum.dataset.priceKey);
            const total = price * tage;
            brutto20 += total;
            breakdown.ausstattung += total;
        }

        // Activities (20% VAT) - some are per person, some are flat rate
        let activitiesTotal = 0;
        const aktivitaetCheckboxes = document.querySelectorAll('input[type="checkbox"][name^="aktivitaet_"]:checked');
        aktivitaetCheckboxes.forEach(function(checkbox) {
            if (checkbox.dataset.priceKey) {
                const price = window.Pricelist.getPrice(checkbox.dataset.priceKey);
                // Yoga is flat rate, others are per person
                if (checkbox.dataset.priceKey === 'activities.yoga') {
                    activitiesTotal += price; // Flat rate
                } else {
                    activitiesTotal += price * personenanzahl; // Per person
                }
            }
        });
        brutto20 += activitiesTotal;
        breakdown.rahmenprogramme = activitiesTotal;

        // Calculate totals
        const brutto = brutto10 + brutto20 + naechtigungsabgabeTotal;
        const netto10 = brutto10 / 1.10;
        const netto20 = brutto20 / 1.20;
        const netto = netto10 + netto20 + naechtigungsabgabeTotal; // Nächtigungsabgabe has no VAT

        return {
            brutto: brutto,
            netto: netto,
            vat10: brutto10 - netto10,
            vat20: brutto20 - netto20,
            naechtigungsabgabe: naechtigungsabgabeTotal,
            breakdown: breakdown
        };
    }

    /**
     * Check if a date is set based on seminar type
     */
    function isDateSet() {
        const is1Tag = seminarTyp1Tag && seminarTyp1Tag.checked;

        if (is1Tag) {
            return seminarDatumInput && seminarDatumInput.value !== '';
        } else {
            return seminarStartInput && seminarStartInput.value !== '' &&
                   seminarEndeInput && seminarEndeInput.value !== '';
        }
    }

    /**
     * Update Personenanzahl based on room selection (Einzelzimmer + Doppelzimmer*2)
     */
    function updatePersonenanzahlFromRooms() {
        const zimmerEinzel = parseInt(document.getElementById('zimmer_einzel')?.value) || 0;
        const zimmerDoppel = parseInt(document.getElementById('zimmer_doppel')?.value) || 0;

        const totalPersons = zimmerEinzel + (zimmerDoppel * 2);

        if (personenanzahlInput) {
            personenanzahlInput.value = totalPersons;
        }
        if (personenanzahlSlider) {
            personenanzahlSlider.value = totalPersons;
        }
        if (personenanzahlDisplay) {
            personenanzahlDisplay.textContent = totalPersons;
        }

        updateRoomAllocation();
        updatePriceDisplay();
    }

    /**
     * Display price summary
     */
    function updatePriceDisplay() {
        const priceData = calculateTotalPrice();
        const personenanzahl = parseInt(personenanzahlInput?.value) || 0;
        const is1Tag = seminarTyp1Tag && seminarTyp1Tag.checked;

        // Update 1-Tages package price display
        const packagePriceEl = document.getElementById('package_1tag_price');
        if (packagePriceEl && is1Tag) {
            const basePrice = window.Pricelist && window.Pricelist.isLoaded()
                ? window.Pricelist.getPrice('1tag.base_price')
                : 77.00;
            packagePriceEl.textContent = '€' + (basePrice * personenanzahl).toFixed(2);
        }

        // Update price summary section
        const priceSummarySection = document.getElementById('price-summary-section');
        const priceSummaryContent = document.getElementById('price-summary-content');

        if (priceSummarySection && priceSummaryContent) {
            // Only show price if a date is set
            if (!isDateSet()) {
                priceSummaryContent.innerHTML = '<p style="color: #666;">Bitte wählen Sie ein Datum aus, um den Preis zu berechnen.</p>';
                return;
            }

            if (priceData.brutto > 0) {
                priceSummarySection.style.display = 'block';

                let html = '<div style="margin-bottom: 0.5em;">';
                html += '<strong>Gesamtpreis (brutto):</strong> <span style="font-size: 1.5em; font-weight: 700; color: #bdadad;">€ ' + priceData.brutto.toFixed(2) + '</span>';
                html += '</div>';
                html += '<div style="margin-bottom: 0.5em; font-size: 0.9em; color: #666;">';
                html += '<strong>Gesamtpreis (netto):</strong> € ' + priceData.netto.toFixed(2);
                html += '</div>';

                if (personenanzahl > 1) {
                    const perPersonBrutto = priceData.brutto / personenanzahl;
                    const perPersonNetto = priceData.netto / personenanzahl;
                    html += '<div style="margin-top: 0.5em; font-size: 0.9em; color: #666;">';
                    html += 'Preis pro Person (brutto): € ' + perPersonBrutto.toFixed(2);
                    html += '</div>';
                    html += '<div style="font-size: 0.9em; color: #666;">';
                    html += 'Preis pro Person (netto): € ' + perPersonNetto.toFixed(2);
                    html += '</div>';
                }

                // Price breakdown table
                html += '<div style="margin-top: 1.5em; padding-top: 1em; border-top: 1px solid #ddd;">';
                html += '<strong style="font-size: 0.9em;">Preisaufstellung:</strong>';
                html += '<table style="width: 100%; margin-top: 0.5em; font-size: 0.85em; border-collapse: collapse;">';

                const breakdown = priceData.breakdown;

                // 1-Tag: Show Seminarpaket
                if (is1Tag && breakdown.seminarpaket > 0) {
                    html += '<tr><td style="padding: 0.3em 0;">Seminarpaket</td><td style="padding: 0.3em 0; text-align: right;">€ ' + breakdown.seminarpaket.toFixed(2) + '</td></tr>';
                }

                // Mehrtag categories
                if (!is1Tag) {
                    if (breakdown.naechtigungen > 0) {
                        html += '<tr><td style="padding: 0.3em 0;">Nächtigungen</td><td style="padding: 0.3em 0; text-align: right;">€ ' + breakdown.naechtigungen.toFixed(2) + '</td></tr>';
                    }
                    if (breakdown.verpflegung > 0) {
                        html += '<tr><td style="padding: 0.3em 0;">Verpflegung</td><td style="padding: 0.3em 0; text-align: right;">€ ' + breakdown.verpflegung.toFixed(2) + '</td></tr>';
                    }
                }

                // Equipment (both 1-Tag and Mehrtag)
                if (breakdown.ausstattung > 0) {
                    html += '<tr><td style="padding: 0.3em 0;">Zusatzausstattung</td><td style="padding: 0.3em 0; text-align: right;">€ ' + breakdown.ausstattung.toFixed(2) + '</td></tr>';
                }

                // Activities (Mehrtag only)
                if (!is1Tag && breakdown.rahmenprogramme > 0) {
                    html += '<tr><td style="padding: 0.3em 0;">Rahmenprogramme</td><td style="padding: 0.3em 0; text-align: right;">€ ' + breakdown.rahmenprogramme.toFixed(2) + '</td></tr>';
                }

                // Nächtigungsabgabe (Mehrtag only)
                if (!is1Tag && breakdown.naechtigungsabgabe > 0) {
                    html += '<tr><td style="padding: 0.3em 0;">Nächtigungsabgabe</td><td style="padding: 0.3em 0; text-align: right;">€ ' + breakdown.naechtigungsabgabe.toFixed(2) + '</td></tr>';
                }

                // Total row
                html += '<tr style="border-top: 1px solid #ccc; font-weight: 700;">';
                html += '<td style="padding: 0.5em 0;">Gesamt</td>';
                html += '<td style="padding: 0.5em 0; text-align: right;">€ ' + priceData.brutto.toFixed(2) + '</td>';
                html += '</tr>';

                html += '</table>';
                html += '</div>';

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
     * Handle seminar type selection - show/hide sections and tabs
     */
    function handleSeminarTypeChange() {
        const is1Tag = seminarTyp1Tag && seminarTyp1Tag.checked;
        const isMehrtag = seminarTypMehrtag && seminarTypMehrtag.checked;

        // Show/hide 1-Tages package display
        if (package1Tag) {
            package1Tag.style.display = is1Tag ? 'block' : 'none';
        }

        // Show/hide date inputs based on seminar type
        if (dateSingleSection) {
            dateSingleSection.style.display = is1Tag ? 'block' : 'none';
            if (seminarDatumInput) {
                seminarDatumInput.required = is1Tag;
            }
        }

        if (dateRangeSection) {
            dateRangeSection.style.display = isMehrtag ? 'block' : 'none';
            if (seminarStartInput) {
                seminarStartInput.required = isMehrtag;
            }
            if (seminarEndeInput) {
                seminarEndeInput.required = isMehrtag;
            }
        }

        // Show/hide room fields (only for Mehrtägiges)
        if (roomFieldsSection) {
            roomFieldsSection.style.display = isMehrtag ? 'block' : 'none';
        }

        // Show/hide room allocation display (only for Mehrtägiges)
        if (roomAllocationDisplay) {
            roomAllocationDisplay.style.display = isMehrtag ? 'block' : 'none';
        }

        // Show/hide tab buttons for Verpflegung and Rahmenprogramm (only for Mehrtägiges)
        if (tabBtnVerpflegung) {
            tabBtnVerpflegung.style.display = isMehrtag ? 'inline-block' : 'none';
        }
        if (tabBtnRahmenprogramm) {
            tabBtnRahmenprogramm.style.display = isMehrtag ? 'inline-block' : 'none';
        }

        // If switching to 1-Tag and currently on a hidden tab, switch to first tab
        if (is1Tag) {
            const activeTab = document.querySelector('.tab-content.active');
            if (activeTab && (activeTab.id === 'tab-verpflegung' || activeTab.id === 'tab-rahmenprogramm')) {
                switchTab('tab-seminar');
            }
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
        // Initialize tab navigation
        initTabs();

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

        // Date inputs for price calculation
        if (seminarDatumInput) {
            seminarDatumInput.addEventListener('change', updatePriceDisplay);
        }
        if (seminarStartInput) {
            seminarStartInput.addEventListener('change', function() {
                // Set minimum date for end date to be same as start date
                if (seminarEndeInput && seminarStartInput.value) {
                    seminarEndeInput.min = seminarStartInput.value;
                }
                updatePriceDisplay();
            });
        }
        if (seminarEndeInput) {
            seminarEndeInput.addEventListener('change', updatePriceDisplay);
        }

        // Room inputs for price calculation and Personenanzahl update
        const zimmerEinzel = document.getElementById('zimmer_einzel');
        const zimmerDoppel = document.getElementById('zimmer_doppel');
        if (zimmerEinzel) {
            zimmerEinzel.addEventListener('input', updatePersonenanzahlFromRooms);
            zimmerEinzel.addEventListener('change', updatePersonenanzahlFromRooms);
        }
        if (zimmerDoppel) {
            zimmerDoppel.addEventListener('input', updatePersonenanzahlFromRooms);
            zimmerDoppel.addEventListener('change', updatePersonenanzahlFromRooms);
        }

        // Equipment inputs for price calculation
        const equipmentInputs = document.querySelectorAll('input[name^="equipment_"][type="number"]');
        equipmentInputs.forEach(function(input) {
            input.addEventListener('input', updatePriceDisplay);
            input.addEventListener('change', updatePriceDisplay);
        });

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

