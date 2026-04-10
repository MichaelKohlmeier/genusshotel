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
     * Format a Date object to German locale string like "Mo, 06.04.2026"
     */
    function formatDateGerman(date) {
        const days = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
        const dayName = days[date.getDay()];
        const dd = String(date.getDate()).padStart(2, '0');
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const yyyy = date.getFullYear();
        return dayName + ', ' + dd + '.' + mm + '.' + yyyy;
    }

    /**
     * Get day label based on index and total days
     */
    function getDayLabel(index, totalDays) {
        if (index === 0) return 'Anreisetag';
        if (index === totalDays - 1) return 'Abreisetag';
        return 'Seminartag ' + index;
    }

    /**
     * Generate per-day Verpflegung selection UI
     */
    function generateVerpflegungDays() {
        const container = document.getElementById('verpflegung-days-container');
        if (!container) return;

        const is1Tag = seminarTyp1Tag && seminarTyp1Tag.checked;
        if (is1Tag) {
            container.innerHTML = '';
            return;
        }

        if (!seminarStartInput || !seminarEndeInput || !seminarStartInput.value || !seminarEndeInput.value) {
            container.innerHTML = '<p class="en-format-small" style="color: #666;">Bitte wählen Sie zuerst ein Datum aus.</p>';
            return;
        }

        const startDate = new Date(seminarStartInput.value);
        const endDate = new Date(seminarEndeInput.value);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || endDate < startDate) {
            container.innerHTML = '<p class="en-format-small" style="color: #666;">Bitte wählen Sie ein gültiges Datum aus.</p>';
            return;
        }

        const tage = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

        // Save current selections before regenerating
        var previousSelections = {};
        var existingRadios = container.querySelectorAll('input[type="radio"]:checked');
        existingRadios.forEach(function(radio) {
            previousSelections[radio.name] = radio.value;
        });

        var html = '';
        for (var i = 0; i < tage; i++) {
            var currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);
            var label = getDayLabel(i, tage);
            var dateStr = formatDateGerman(currentDate);
            var isDeparture = (i === tage - 1 && tage > 1);
            var radioName = 'verpflegung_day_' + i;
            // On departure day, hochgenuss is not available — fall back to genuss
            var prevValue = previousSelections[radioName] || 'genuss';
            if (isDeparture && prevValue === 'hochgenuss') prevValue = 'genuss';

            html += '<div class="verpflegung-day">';
            html += '<div class="verpflegung-day-header">';
            html += '<span class="day-label">' + label + '</span>';
            html += '<span class="day-date">' + dateStr + '</span>';
            if (isDeparture) {
                html += '<span class="day-note">ohne Abendessen</span>';
            }
            html += '</div>';
            html += '<div class="verpflegung-day-options">';

            html += '<label class="verpflegung-day-option">';
            html += '<input type="radio" name="' + radioName + '" value="saftbar" data-price-key="catering.saftbar"' + (prevValue === 'saftbar' ? ' checked' : '') + '>';
            html += '<span class="option-label">Nur Saftbar</span>';
            html += '</label>';

            html += '<label class="verpflegung-day-option">';
            html += '<input type="radio" name="' + radioName + '" value="genuss" data-price-key="catering.genuss_package"' + (prevValue === 'genuss' ? ' checked' : '') + '>';
            html += '<span class="option-label">GENUSS</span>';
            html += '</label>';

            if (!isDeparture) {
                html += '<label class="verpflegung-day-option">';
                html += '<input type="radio" name="' + radioName + '" value="hochgenuss" data-price-key="catering.hochgenuss_package"' + (prevValue === 'hochgenuss' ? ' checked' : '') + '>';
                html += '<span class="option-label">HOCHGENUSS</span>';
                html += '</label>';
            }

            html += '</div>';
            html += '</div>';
        }

        container.innerHTML = html;

        // Attach change listeners to new radio buttons
        var newRadios = container.querySelectorAll('input[type="radio"]');
        newRadios.forEach(function(radio) {
            radio.addEventListener('change', updatePriceDisplay);
        });
    }

    /**
     * Set all Verpflegung days to a specific package
     */
    function setAllVerpflegungDays(packageValue) {
        var container = document.getElementById('verpflegung-days-container');
        if (!container) return;
        var radios = container.querySelectorAll('input[type="radio"][value="' + packageValue + '"]');
        radios.forEach(function(radio) {
            radio.checked = true;
        });
        updatePriceDisplay();
    }

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
        const vorabendanreiseChecked = document.getElementById('vorabendanreise')?.checked || false;
        const seminarNaechte = Math.max(0, tage - 1); // Seminar nights (Tage - 1)

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

        // 1-Tages-Seminar: Per-person price + daily flat rate (10% VAT) + equipment
        if (is1Tag) {
            const basePrice = window.Pricelist.getPrice('1tag.base_price');
            const dailyRoomFee = window.Pricelist.getPrice('1tag.daily_room_fee') || 150;
            const seminarpaketTotal = (basePrice * personenanzahl) + dailyRoomFee;
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

        // Mehrtägiges Seminar: Calculate based on per-day package selections
        let cateringTotal = 0; // 10% VAT

        // Sum up per-day verpflegung selections
        for (var dayIdx = 0; dayIdx < tage; dayIdx++) {
            var dayRadio = document.querySelector('input[name="verpflegung_day_' + dayIdx + '"]:checked');
            if (dayRadio && dayRadio.dataset.priceKey) {
                cateringTotal += window.Pricelist.getPrice(dayRadio.dataset.priceKey) * personenanzahl;
            }
        }

        brutto10 += cateringTotal;
        breakdown.verpflegung = cateringTotal;

        // Room costs (10% VAT)
        const zimmerEinzel = parseInt(document.getElementById('zimmer_einzel')?.value) || 0;
        const zimmerDoppel = parseInt(document.getElementById('zimmer_doppel')?.value) || 0;
        const vorabendEinzel = (vorabendanreiseChecked && !is1Tag) ? (parseInt(document.getElementById('vorabend_einzel')?.value) || 0) : 0;
        const vorabendDoppel = (vorabendanreiseChecked && !is1Tag) ? (parseInt(document.getElementById('vorabend_doppel')?.value) || 0) : 0;

        const singlePrice = window.Pricelist.getPrice('rooms.single_per_night');
        const doublePrice = window.Pricelist.getPrice('rooms.double_per_person');

        let roomTotal = 0;
        // Seminar nights
        roomTotal += singlePrice * zimmerEinzel * seminarNaechte;
        roomTotal += doublePrice * zimmerDoppel * 2 * seminarNaechte;
        // Vorabend night (only vorabend-specific rooms)
        roomTotal += singlePrice * vorabendEinzel;
        roomTotal += doublePrice * vorabendDoppel * 2;

        brutto10 += roomTotal;
        breakdown.naechtigungen = roomTotal;

        // Nächtigungsabgabe (no VAT - it's a local tax)
        const naechtigungsabgabeRate = window.Pricelist.getPrice('rooms.naechtigungsabgabe');
        const totalPersonsSeminar = zimmerEinzel + (zimmerDoppel * 2);
        const totalPersonsVorabend = vorabendEinzel + (vorabendDoppel * 2);
        naechtigungsabgabeTotal = naechtigungsabgabeRate * totalPersonsSeminar * seminarNaechte;
        naechtigungsabgabeTotal += naechtigungsabgabeRate * totalPersonsVorabend;
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
            // Always show the section
            priceSummarySection.style.display = 'block';

            // Only show price if a date is set
            if (!isDateSet()) {
                priceSummaryContent.innerHTML = '<p style="color: #666;">Bitte wählen Sie ein Datum aus, um den Preis zu berechnen.</p>';
                return;
            }

            // Show message if personenanzahl is 0
            if (personenanzahl === 0) {
                priceSummaryContent.innerHTML = '<p style="color: #666;">Bitte wählen Sie die Personenanzahl aus.</p>';
                return;
            }

            if (priceData.brutto > 0) {

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
                priceSummaryContent.innerHTML = '<p style="color: #666;">Preis wird berechnet...</p>';
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

        // Regenerate per-day verpflegung and update price
        generateVerpflegungDays();
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

        // "Set all days" buttons for Verpflegung
        var setAllButtons = document.querySelectorAll('.btn-set-all');
        setAllButtons.forEach(function(btn) {
            btn.addEventListener('click', function() {
                setAllVerpflegungDays(btn.dataset.package);
            });
        });

        // Generate initial per-day Verpflegung UI
        generateVerpflegungDays();

        // Price calculation on any checkbox change
        const allCheckboxes = document.querySelectorAll('input[type="checkbox"]');
        allCheckboxes.forEach(function(checkbox) {
            checkbox.addEventListener('change', updatePriceDisplay);
        });

        // Price calculation on radio button change (activities, etc.)
        const allRadios = document.querySelectorAll('input[type="radio"][name^="aktivitaet_"]');
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
                generateVerpflegungDays();
                updatePriceDisplay();
            });
        }
        if (seminarEndeInput) {
            seminarEndeInput.addEventListener('change', function() {
                generateVerpflegungDays();
                updatePriceDisplay();
            });
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

        // Vorabendanreise checkbox: show/hide sub-fields and sync max values
        const vorabendanreiseCheckbox = document.getElementById('vorabendanreise');
        const vorabendZimmerFields = document.getElementById('vorabend-zimmer-fields');
        const vorabendEinzel = document.getElementById('vorabend_einzel');
        const vorabendDoppel = document.getElementById('vorabend_doppel');

        function updateVorabendZimmerMax() {
            if (vorabendEinzel) vorabendEinzel.max = parseInt(document.getElementById('zimmer_einzel')?.value) || 0;
            if (vorabendDoppel) vorabendDoppel.max = parseInt(document.getElementById('zimmer_doppel')?.value) || 0;
        }

        if (vorabendanreiseCheckbox) {
            vorabendanreiseCheckbox.addEventListener('change', function() {
                if (vorabendZimmerFields) {
                    vorabendZimmerFields.style.display = this.checked ? 'block' : 'none';
                }
                if (!this.checked) {
                    if (vorabendEinzel) vorabendEinzel.value = 0;
                    if (vorabendDoppel) vorabendDoppel.value = 0;
                }
                updateVorabendZimmerMax();
                updatePriceDisplay();
            });
        }

        // Keep vorabend max values in sync when main room inputs change
        if (zimmerEinzel) zimmerEinzel.addEventListener('input', updateVorabendZimmerMax);
        if (zimmerDoppel) zimmerDoppel.addEventListener('input', updateVorabendZimmerMax);

        // Vorabend room inputs trigger price recalculation
        if (vorabendEinzel) vorabendEinzel.addEventListener('input', updatePriceDisplay);
        if (vorabendDoppel) vorabendDoppel.addEventListener('input', updatePriceDisplay);

        // Initial price calculation
        updatePriceDisplay();

        // Initialize slider display
        if (personenanzahlDisplay && personenanzahlSlider) {
            personenanzahlDisplay.textContent = personenanzahlSlider.value;
        }

        // Form submission handler
        const form = document.querySelector('form');
        if (form) {
            form.addEventListener('submit', handleFormSubmit);
        }
    }

    /**
     * Collect per-day verpflegung selections as a formatted string
     */
    function collectVerpflegungPerDay() {
        const is1Tag = seminarTyp1Tag && seminarTyp1Tag.checked;
        if (is1Tag) return '';

        const tage = calculateDaysFromDates();
        var parts = [];
        var packageNames = { saftbar: 'Nur Saftbar', genuss: 'GENUSS', hochgenuss: 'HOCHGENUSS' };

        for (var i = 0; i < tage; i++) {
            var radio = document.querySelector('input[name="verpflegung_day_' + i + '"]:checked');
            if (radio) {
                var startDate = new Date(seminarStartInput.value);
                startDate.setDate(startDate.getDate() + i);
                var label = getDayLabel(i, tage);
                var dateStr = formatDateGerman(startDate);
                var isDeparture = (i === tage - 1 && tage > 1);
                var pkgName = packageNames[radio.value] || radio.value;
                if (isDeparture && radio.value !== 'saftbar') {
                    pkgName += ' (ohne Abendessen)';
                }
                parts.push(label + ' (' + dateStr + '): ' + pkgName);
            }
        }
        return parts.join('; ');
    }

    /**
     * Collect all form data into a structured object
     */
    function collectFormData() {
        const is1Tag = seminarTyp1Tag && seminarTyp1Tag.checked;
        const priceData = calculateTotalPrice();

        const data = {
            // Seminar type
            seminar_typ: is1Tag ? '1-Tages-Seminar' : 'Mehrtägiges Seminar',

            // Dates
            datum: is1Tag
                ? (seminarDatumInput?.value || '')
                : ((seminarStartInput?.value || '') + ' bis ' + (seminarEndeInput?.value || '')),

            // Participants
            personenanzahl: personenanzahlInput?.value || '0',

            // Rooms (only for multi-day)
            zimmer_einzel: document.getElementById('zimmer_einzel')?.value || '0',
            zimmer_doppel: document.getElementById('zimmer_doppel')?.value || '0',
            vorabendanreise: document.getElementById('vorabendanreise')?.checked ? 'Ja' : 'Nein',
            vorabend_einzel: document.getElementById('vorabend_einzel')?.value || '0',
            vorabend_doppel: document.getElementById('vorabend_doppel')?.value || '0',

            // Room setup
            sitzordnung: document.querySelector('input[name="room_setup"]:checked')?.value || '',

            // Verpflegung per day
            verpflegung: collectVerpflegungPerDay(),

            // Equipment
            equipment_flipcharts: document.querySelector('input[name="equipment_flipcharts"]')?.value || '0',
            equipment_pinnwand: document.querySelector('input[name="equipment_pinnwand"]')?.value || '0',
            equipment_displayboard: document.querySelector('input[name="equipment_displayboard"]')?.value || '0',
            equipment_funkmikrofon: document.querySelector('input[name="equipment_funkmikrofon"]')?.value || '0',
            equipment_presenter: document.querySelector('input[name="equipment_presenter"]')?.value || '0',
            equipment_laptop: document.querySelector('input[name="equipment_laptop"]')?.value || '0',
            equipment_sonstiges: document.querySelector('textarea[name="equipment_sonstiges"]')?.value || '',

            // Activities
            aktivitaeten: [],

            // Contact info
            anrede: document.querySelector('input[name="anrede"]:checked')?.value === 'frau' ? 'Frau' : 'Herr',
            vorname: document.getElementById('vorname')?.value || '',
            nachname: document.getElementById('nachname')?.value || '',
            email: document.getElementById('email')?.value || '',
            telefon: document.getElementById('telefon')?.value || '',
            firma: document.getElementById('firma')?.value || '',
            nachricht: document.getElementById('nachricht')?.value || '',

            // Price
            preis_brutto: priceData.brutto.toFixed(2),
            preis_netto: priceData.netto.toFixed(2),
            preis_pro_person: priceData.brutto > 0 && personenanzahlInput?.value > 0
                ? (priceData.brutto / parseInt(personenanzahlInput.value)).toFixed(2)
                : '0.00'
        };

        // Collect selected activities
        const activityCheckboxes = document.querySelectorAll('input[name^="aktivitaet_"]:checked');
        activityCheckboxes.forEach(function(checkbox) {
            const label = document.querySelector('label[for="' + checkbox.id + '"]');
            if (label) {
                // Get just the activity name without the price
                const text = label.textContent.trim().split('(')[0].trim();
                data.aktivitaeten.push(text);
            }
        });

        return data;
    }

    /**
     * Show loading overlay
     */
    function showLoadingOverlay() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.style.display = 'flex';
        }
    }

    /**
     * Hide loading overlay
     */
    function hideLoadingOverlay() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }

    /**
     * Show success message
     */
    function showSuccessMessage() {
        const modal = document.getElementById('success-modal');
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    /**
     * Show error message
     */
    function showErrorMessage(message) {
        const modal = document.getElementById('error-modal');
        const errorText = document.getElementById('error-message-text');
        if (modal) {
            if (errorText) {
                errorText.textContent = message || 'Ein unbekannter Fehler ist aufgetreten.';
            }
            modal.style.display = 'flex';
        } else {
            alert('Fehler: ' + (message || 'Ein unbekannter Fehler ist aufgetreten.'));
        }
    }

    /**
     * Close modal
     */
    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // Expose closeModal globally for onclick handlers
    window.closeModal = closeModal;

    /**
     * Handle form submission
     */
    function handleFormSubmit(e) {
        e.preventDefault();

        // Basic validation
        const vorname = document.getElementById('vorname')?.value;
        const nachname = document.getElementById('nachname')?.value;
        const email = document.getElementById('email')?.value;

        if (!vorname || !nachname || !email) {
            showErrorMessage('Bitte füllen Sie alle Pflichtfelder aus (Vorname, Nachname, E-Mail).');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showErrorMessage('Bitte geben Sie eine gültige E-Mail-Adresse ein.');
            return;
        }

        // Collect form data
        const formData = collectFormData();

        // Show loading
        showLoadingOverlay();

        // Get submission URL from config
        const submissionUrl = window.SeminarFormConfig?.submissionUrl;
        if (!submissionUrl) {
            hideLoadingOverlay();
            showErrorMessage('Konfigurationsfehler: Keine Submission-URL definiert.');
            return;
        }

        // Debug: Log form data and URL
        console.log('Submitting to:', submissionUrl);
        console.log('Form data:', JSON.stringify(formData, null, 2));

        // Submit to Google Apps Script
        fetch(submissionUrl, {
            method: 'POST',
            mode: 'no-cors', // Required for Apps Script cross-origin
            headers: {
                'Content-Type': 'text/plain', // Apps Script works better with text/plain
            },
            body: JSON.stringify(formData)
        })
        .then(function(response) {
            console.log('Response received:', response);
            // With no-cors, we can't read the response, so assume success
            hideLoadingOverlay();
            showSuccessMessage();
        })
        .catch(function(error) {
            console.error('Submission error:', error);
            hideLoadingOverlay();
            showErrorMessage('Fehler beim Senden der Anfrage. Bitte versuchen Sie es erneut.');
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();

