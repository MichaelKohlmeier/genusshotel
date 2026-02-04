# Preislisten-Wartung

## Google Sheet Struktur

Das Google Sheet muss folgende Spalten haben:

| Spalte | Name | Beschreibung | Beispiel |
|--------|------|--------------|----------|
| A | category | Kategorie | `catering`, `rooms`, `equipment`, `activities` |
| B | key | Schlüssel | `pause_gemischt`, `single_per_night` |
| C | label | Beschreibung | `Genusspause pikant & süß gemischt` |
| D | price | Preis (Zahl) | `14` |
| E | unit | Einheit (optional) | `pro Person`, `pauschal` |

## Kategorien und Schlüssel

### 1tag (1-Tages-Seminar)
| Schlüssel | Beschreibung | Preis |
|-----------|--------------|-------|
| `base_price` | Basis-Pauschale | € 77,00 pro Person |

### catering (Verpflegung)
| Schlüssel | Beschreibung | Preis |
|-----------|--------------|-------|
| `saftbar` | Saftbar, Mineralwasser, Kaffee/Tee, Obstkorb | € 26,00 pro Person/Tag |
| `pause_gemischt` | Genusspause pikant & süß gemischt | € 14,00 pro Person |
| `pause_pikant` | Genusspause pikant | € 12,00 pro Person |
| `pause_suess` | Genusspause süß | € 8,00 pro Person |
| `mittagessen_base` | Mittagessen 3-Gang-Wahl-Menü plus Salatbuffet | € 34,00 pro Person |
| `mittagessen_getraenke` | Alkoholfreie Getränke zum Mittagessen | € 5,00 pro Person |
| `abendessen_base` | Abendessen 4-Gang-Wahl-Menü plus Salat- und Käse vom Buffet | € 52,00 pro Person |
| `abendessen_steak` | Abendessen mit DRY AGED Starzenberger Steak | € 45,00 pro Person |

### rooms (Zimmer)
| Schlüssel | Beschreibung | Preis |
|-----------|--------------|-------|
| `single_per_night` | Einzelzimmer | € 125,00 pro Nacht |
| `double_per_person` | Doppelzimmer | € 95,00 pro Person/Nacht |
| `naechtigungsabgabe` | Nächtigungsabgabe | € 2,50 pro Person/Nacht |

### equipment (Ausstattung)
| Schlüssel | Beschreibung | Preis |
|-----------|--------------|-------|
| `raumgarantie` | Raumgarantie | € 200,00 pauschal |
| `gruppenraum` | Gruppenraum | € 100,00 pro Tag |
| `flipchart` | Flipchart | € 10,00 pro Stück/Tag |
| `pinnwand` | Pinnwand | € 10,00 pro Stück/Tag |
| `displayboard` | Displayboard & Hybrid-Technologie | € 85,00 pro Tag |
| `funkmikrofon` | Funkmikrofon | € 30,00 pro Tag |
| `presenter` | Presenter | € 9,00 pro Tag |
| `laptop` | Laptop | € 30,00 pro Tag |

### activities (Aktivitäten)
| Schlüssel | Beschreibung | Preis | Berechnung |
|-----------|--------------|-------|------------|
| `yoga` | Yoga / Pilates | € 220,00 | pauschal |
| `ebike` | E-Bikes | € 35,00 | pro Person |
| `wein` | Weinverkostung | € 35,00 | pro Person |
| `spirituosen` | D/G house of whiskey, gin & rum | € 14,70 | pro Person |
| `goelles` | Manufaktur Gölles | € 14,50 | pro Person |
| `zotter` | Zotter Schokoladenmanufaktur | € 21,90 | pro Person |
| `vulcano` | Vulcano Schinkenwelt | € 18,00 | pro Person |
| `riegersburg` | Burg Riegersburg | € 8,50 | pro Person |

## Mehrwertsteuer (Österreich)

Die Preise werden als **Brutto** eingegeben. Die MwSt-Berechnung erfolgt automatisch:

| Kategorie | MwSt-Satz |
|-----------|-----------|
| Zimmer (rooms) | 10% |
| Verpflegung (catering) | 10% |
| Ausstattung (equipment) | 20% |
| Aktivitäten (activities) | 20% |
| Nächtigungsabgabe | keine MwSt (lokale Abgabe) |

## Google Apps Script einrichten

1. Öffnen Sie das Google Sheet
2. Gehen Sie zu **Erweiterungen > Apps Script**
3. Kopieren Sie den Code aus `apps-script-template.js`
4. Speichern Sie das Script (Ctrl+S)
5. Klicken Sie auf **Bereitstellen > Neue Bereitstellung**
6. Wählen Sie **Typ: Web-App**
7. **Ausführen als:** Ich
8. **Zugriff:** Jeder
9. Klicken Sie auf **Bereitstellen**
10. Kopieren Sie die URL und fügen Sie sie in `config.js` ein

## Preise aktualisieren (für Hotel-Mitarbeiter)

1. Öffnen Sie das Google Sheet
2. Finden Sie die Zeile mit dem gewünschten Preis
3. Ändern Sie den Wert in Spalte D (price)
4. Speichern Sie das Sheet
5. Änderungen sind sofort verfügbar (evtl. Browser-Cache leeren)

## Lokale Fallback-Datei

Falls das Google Sheet nicht erreichbar ist, wird `prices.json` verwendet.
Diese Datei sollte bei Preisänderungen ebenfalls aktualisiert werden.

## Cache leeren

Preise werden im Browser gecacht. Um neue Preise zu laden:
- **Ctrl+Shift+R** (Windows) oder **Cmd+Shift+R** (Mac)
- Oder: Browser-Cache manuell leeren

## Fehlerbehebung

### Preise werden nicht aktualisiert
- Google Sheet gespeichert?
- Einige Sekunden warten
- Browser-Cache leeren (Ctrl+Shift+R)
- Browser-Konsole auf Fehler prüfen (F12)

### Apps Script funktioniert nicht
- Script als Web-App bereitgestellt?
- "Ausführen als" auf "Ich" gesetzt?
- URL in `config.js` korrekt?
- Apps Script Ausführungsprotokoll prüfen
