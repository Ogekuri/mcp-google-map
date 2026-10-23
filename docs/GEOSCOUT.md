# Compatibilità GeoScout 6.2

Questo server implementa tutti i requisiti strutturali del protocollo di ricerca **GeoScout 6.2** per Places API (New). Riferimento: spec GeoScout §2 (verifica API), §4 (filtro economico), §5 (Grade), §9 (ricerca progressiva), §10 (FieldMask), §11 (integrità risposta), Parte II (DEBUG).

## Mappatura requisiti → funzionalità

| Requisito GeoScout | Implementazione |
| --- | --- |
| §2 `API_VERIFICATA` | Il server esegue chiamate reali a Places API (New) via SDK ufficiale `@googlemaps/places`; con `includeRaw` il chiamante ottiene il payload autentico per certificare la provenienza |
| §4.2 filtro cumulativo `priceLevels` | `maps_search_places { priceLevels: ["PRICE_LEVEL_INEXPENSIVE", "PRICE_LEVEL_MODERATE"] }` — inviato **server-side** come array di enum |
| §4.3 priorità fascia numerica | Il campo `price_range` espone `startPrice`/`endPrice` (`currencyCode`, `units`, `nanos`) **verbatim**: il confronto numerico `IMPORTO = Number(units) + nanos/1e9` spetta all'agente, il dato grezzo non viene alterato |
| §4.4 Money non appiattito | Nessuna conversione in numeri semplici; i valori interpretati vivono in campi separati dal raw |
| §5.1 `minRating` | Parametro API server-side (4.5 per Grade A/B, 4.0 per C–E) |
| §6 categorie | `primary_type` (valore originale, es. `italian_restaurant`) + `types` completi, mai normalizzati |
| §7 orari | FieldMask include `regularOpeningHours.periods` e `currentOpeningHours.periods` (+ descrizioni giorni) |
| §9.1 parametri ricerca | `query` (`textQuery`), `includedType` **singolare**, `strictTypeFiltering`, `minRating`, `priceLevels`, `locationBias`, `pageSize` |
| §9 paginazione | `pageSize` (1–20) + `pageToken`/`nextPageToken`, fino a 60 risultati; **limite SDK verificato**: il proto di `@googlemaps/places` (fino a 3.1.0) non serializza `page_size`/`page_token` → `pageSize` viene tradotto in `maxResultCount`, niente `nextPageToken`; usare più query per Grade |
| §9 Place Details | `maps_place_details` (`GET places/{id}`) per la verifica individuale dei candidati |
| §10 FieldMask obbligatoria | Text Search: `places.id, displayName, formattedAddress, location, primaryType, types, businessStatus, googleMapsUri, priceLevel, priceRange, rating, userRatingCount, regularOpeningHours.periods, regularOpeningHours.weekdayDescriptions, currentOpeningHours.openNow, currentOpeningHours.periods, currentOpeningHours.weekdayDescriptions, nextPageToken`. Details: include inoltre contatti, sito, recensioni, foto, priceRange, businessStatus |
| §11.2 niente ricostruzione raw | `includeRaw: true` → ogni risultato porta `raw_place` (payload originale dell'API) e la risposta include `raw_response` completo; i campi interpretati (`price_range`, `total_ratings`, …) sono distinti dal raw |
| §11.4 conflitti Place ID | Place Details con `includeRaw` per riverificare e confrontare i payload |
| Parte II / D3 registro chiamate | La `field_mask` realmente inviata è restituita in output (`field_mask`), quindi dichiarabile nel DEBUG senza ricostruzioni |
| D5 validazioni separate | Schema di output: raw (`raw_place`) e interpretato (`price_level`, `rating`, …) coesistono senza sovrascritture |

## Flusso di ricerca consigliato (GeoScout)

1. Definisci `BUDGET_MAX` e convertilo in `priceLevels` cumulativo (§4.1: 10–29 € → INEXPENSIVE; 30–49 € → +MODERATE; 50–69 € → +EXPENSIVE; ≥70 € → +VERY_EXPENSIVE; escludi FREE).
2. Per ogni Grade (A→E), chiama:

```json
{
  "query": "trattoria Torino centro",
  "includedType": "restaurant",
  "strictTypeFiltering": true,
  "minRating": 4.5,
  "priceLevels": ["PRICE_LEVEL_INEXPENSIVE", "PRICE_LEVEL_MODERATE"],
  "locationBias": { "latitude": 45.07, "longitude": 7.68, "radius": 3000 },
  "pageSize": 20,
  "languageCode": "it",
  "includeRaw": true
}
```

3. Se `nextPageToken` è presente e servono più candidati, ripeti con `pageToken`.
4. Validazione numerica su `price_range.endPrice` (EUR) contro `BUDGET_MAX`; solo in assenza di `priceRange` usa l'equivalenza `priceLevel` (§4.3).
5. Verifica orari sui `periods` (regular per la settimana, current per date nell'orizzonte).
6. Per conflitti o approfondimenti: `maps_place_details { "placeId": "...", "includeRaw": true }`.

## Casi limite garantiti

- `priceRange` restituito **così com'è**: un candidato con `endPrice.units = "70"` resta 70 € — mai riscritto per rientrare nel budget.
- `userRatingCount` e `rating` provengono solo dal payload Places API; il server non li stima né li fonde con altre fonti.
- Se `includeRaw` è omesso, il server restituisce solo i campi interpretati: in quel caso l'agente **non** può dichiarare `raw_response` nel DEBUG (D2/D4).
