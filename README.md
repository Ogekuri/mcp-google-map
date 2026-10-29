# mcp-google-map (0.3.0)

<p align="center">
  <img src="https://img.shields.io/badge/node-%3E%3D22-339933?style=flat-square&logo=nodedotjs&logoColor=white" alt="Node.js >= 22">
  <img src="https://img.shields.io/badge/typescript-5.7-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript 5.7">
  <img src="https://img.shields.io/badge/license-GPL--3.0-491?style=flat-square" alt="License: GPL-3.0">
  <img src="https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-6A7EC2?style=flat-square&logo=terminal&logoColor=white" alt="Platforms">
</p>

<p align="center">
<strong>Google Maps Platform MCP server — 18 tools for AI agents (stdio + Streamable HTTP)</strong><br>
Server [Model Context Protocol](https://modelcontextprotocol.io) per **Google Maps Platform**, con 18 tool per agenti AI: ricerca Places API (New) con **filtri server-side** (`priceLevels`, `minRating`, `strictTypeFiltering`), paginazione nativa, accesso al **payload raw** delle risposte API, geocoding, indicazioni, matrice delle distanze e altro.

Trasporti supportati: **stdio** (client MCP locali) e **Streamable HTTP**.

> Compatibile con il protocollo di ricerca **GeoScout 6.2** — vedi [docs/GEOSCOUT.md](docs/GEOSCOUT.md).

</p>

<p align="center">
  <a href="#feature-highlights">Feature Highlights</a> |
  <a href="#requisiti">Requirements</a> |
  <a href="#install">Install / Uninstall</a> |
  <a href="#avvio-rapido">Quick Start</a> |
  <a href="#registrazione-in-un-client-mcp">MCP Clients</a> |
  <a href="#documentazione">Docs</a>
</p>
<p align="center">
<br>
🚧 <strong>DRAFT</strong>: 👾 Alpha Development 👾 - Work in Progress 🏗️ 🚧<br>
⚠️ <strong>IMPORTANT NOTICE</strong>: Created itself with <a href="https://github.com/Ogekuri/PI-useReq"><strong>PI-useReq/pi-usereq</strong></a> 🤖✨ ⚠️<br>
<br>
<p>


## Feature Highlights

- **18 Google Maps MCP tools** — geocoding, reverse geocoding, Places API (New) text/nearby search, place details, directions, distance matrix, elevation, timezone, weather, air quality, static maps, batch geocode, plus composite tools (explore-area, plan-route, compare-places, search-along-route, local-rank-tracker). Full catalog: [docs/TOOLS.md](docs/TOOLS.md).
- **Server-side Places filters** — `priceLevels`, `minRating`, `openNow`, `strictTypeFiltering`, and location bias are forwarded to Places API (New), not emulated client-side.
- **Raw API payloads** — searches and details can return the untouched Google response (`includeRaw: true`) with explicit Field Masks.
- **Two transports** — stdio for local MCP clients (pi, Claude Desktop, Cursor, ...) and Streamable HTTP at `/mcp` with per-session API keys.
- **Per-request credentials** — key resolution from `X-Google-Maps-API-Key` or `Authorization: Bearer` headers, session key, or `GOOGLE_MAPS_API_KEY` environment.
- **Standalone CLI** — `doctor` self-checks, `exec <tool>` one-shot calls, `batch-geocode` with bounded concurrency.
- **GeoScout 6.2 compatible** — see [docs/GEOSCOUT.md](docs/GEOSCOUT.md).

## Requisiti

- Node.js **>= 22**
- Una **Google Maps API key** (<https://console.cloud.google.com/apis/credentials>) con i servizi abilitati — vedi sotto

## API Google Cloud richieste

Mappatura verificata sui sorgenti: ogni endpoint usato dal server e il tool che lo richiede.

| # | API da abilitare | Endpoint usato dal server | Tool che la richiedono | Necessaria per | Priorità GeoScout |
|---|---|---|---|---|---|
| 1 | **Places API (New)** | `places.googleapis.com` (`places:searchText`, `places:searchNearby`, `GET places/{id}`, photo media) via `@googlemaps/places` | `maps_search_places`, `maps_search_nearby`, `maps_place_details`, `maps_explore_area`, `maps_compare_places`, `maps_search_along_route`, `maps_local_rank_tracker` | Ricerca/dettaglio locali, filtri `priceLevels`/`minRating`, `priceRange`, orari | **Obbligatoria** |
| 2 | **Geocoding API** | `maps.googleapis.com/maps/api/geocode/json` via `@googlemaps/google-maps-services-js` | `maps_geocode`, `maps_reverse_geocode`, `maps_batch_geocode` (+ fallback interno di risoluzione indirizzi) | Conversione indirizzo ↔ coordinate | Alta |
| 3 | **Routes API** | `routes.googleapis.com` (`computeRoutes`, `computeRouteMatrix`) | `maps_directions`, `maps_distance_matrix`, `maps_plan_route` | Percorsi e matrice distanze | Media |
| 4 | **Time Zone API** | `maps.googleapis.com/maps/api/timezone/json` | `maps_timezone` | Fuso orario / ora locale | Bassa |
| 5 | **Maps Elevation API** *(in console: "Maps Elevation API", servizio `elevation-backend`)* | `maps.googleapis.com/maps/api/elevation/json` | `maps_elevation` | Quota del terreno | Bassa |
| 6 | **Maps Static API** | `maps.googleapis.com/maps/api/staticmap` | `maps_static_map` | Immagine mappa PNG | Bassa |
| 7 | **Weather API** | `weather.googleapis.com/v1` (current, forecast/days, forecast/hours) | `maps_weather` | Meteo corrente/previsioni | Bassa (disponibilità regionale) |
| 8 | **Air Quality API** | `airquality.googleapis.com/v1/currentConditions:lookup` | `maps_air_quality` | Qualità dell'aria | Bassa (disponibilità regionale) |

Abilitazione rapida (progetto GCP corrente):

```bash
PROJECT=iltuoprogetto
gcloud services enable places-backend-new.googleapis.com \
  geocoding-backend.googleapis.com \
  routes.googleapis.com \
  timezone-backend.googleapis.com \
  elevation-backend.googleapis.com \
  static-maps-backend.googleapis.com \
  weather-backend.googleapis.com \
  airquality.googleapis.com --project=$PROJECT
```

### Note

- Per l'uso minimo/GeoScout bastano **Places API (New)** + **Geocoding API**; le altre si abilitano solo se si usano i tool corrispondenti (in alternativa limitare l'esposizione con `GOOGLE_MAPS_ENABLED_TOOLS`).
- **Maps Grounding Lite** e **Geolocation API** **non sono richieste** da questo server: la prima serve all'MCP hosted di Google (`mapstools.googleapis.com`), la seconda non è usata da nessun tool (non c'è `ip_geolocate` in questo fork).
- La vecchia **Places API** (legacy) non è necessaria: il server usa esclusivamente Places API (New).
- Weather API e Air Quality API hanno copertura regionale limitata: fuori copertura il tool restituisce errore dell'API.


## Install

**Prerequisites**: Node.js **>= 22** and a Google Maps API key (see [Requisiti](#requisiti)).

### From npm

```bash
npm install -g mcp-google-map
mcp-google-map doctor               # self-check (no API calls)
npx -y mcp-google-map --stdio       # one-shot stdio server, no global install
```

### From source (this repository) — cross-platform, no bash required

```bash
git clone https://github.com/Ogekuri/mcp-google-map.git
cd mcp-google-map
npm install
npm run build                       # tsup -> dist/ (ESM)
node dist/cli.js --stdio            # MCP server over stdio
node dist/cli.js --host 127.0.0.1 --port 3000   # Streamable HTTP at /mcp
```

On Linux/macOS the bash helpers in `scripts/` automate the same steps (`scripts/setup.sh`, `scripts/build.sh`, `scripts/start-mcp.sh`, `scripts/start-http.sh`, `scripts/test.sh`); on Windows use the `npm`/`node` commands above.

MCP client registration over stdio works cross-platform with plain `node`:

```json
{
  "mcpServers": {
    "mcp-google-map": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-google-map/dist/cli.js", "--stdio"],
      "env": { "GOOGLE_MAPS_API_KEY": "AIza..." }
    }
  }
}
```

## Uninstall

```bash
npm uninstall -g mcp-google-map    # npm-based install
rm -rf mcp-google-map              # from-source clone; also remove any MCP client registration
```

## Avvio rapido

```bash
scripts/setup.sh        # installa le dipendenze e crea .env
$EDITOR .env            # inserisci GOOGLE_MAPS_API_KEY
scripts/build.sh        # compila in dist/

scripts/start-mcp.sh    # server MCP su stdio (per pi, Claude Desktop, Cursor, ...)
scripts/start-http.sh   # server MCP su http://127.0.0.1:3000/mcp
scripts/test.sh         # test unitari (nessuna API key richiesta)
```

## Registrazione in un client MCP

**stdio:**

```json
{
  "mcpServers": {
    "mcp-google-map": {
      "command": "/percorso/assoluto/a/mcp-google-map/scripts/start-mcp.sh",
      "env": { "GOOGLE_MAPS_API_KEY": "AIza..." }
    }
  }
}
```

**HTTP** (dopo `scripts/start-http.sh`):

```json
{
  "mcpServers": {
    "mcp-google-map": {
      "url": "http://127.0.0.1:3000/mcp"
    }
  }
}
```

### pi CLI

pi legge i server MCP da `~/.pi/agent/mcp.json` (utente) o `.pi/mcp.json` (progetto, richiede trust). Voce stdio per questo server:

```json
{
  "mcpServers": {
    "maps": {
      "command": "node",
      "args": ["/percorso/assoluto/a/mcp-google-map/dist/cli.js", "--stdio"],
      "env": { "GOOGLE_MAPS_API_KEY": "${GOOGLE_MAPS_API_KEY}" }
    }
  }
}
```

- Da terminale: `pi mcp add maps -- node /percorso/assoluto/a/mcp-google-map/dist/cli.js --stdio` (aggiungere `--env GOOGLE_MAPS_API_KEY=...` per la chiave).
- `${GOOGLE_MAPS_API_KEY}` espande la variabile d'ambiente al volo: la chiave non resta cablata nel file di configurazione.
- Dopo una modifica di `mcp.json` esterna alla sessione, eseguire `/reload` in pi; `/mcp` ispeziona stato, tool ed errori di connessione.
- I tool appaiono con il prefisso `mcp__<server>__`: `mcp__maps__maps_geocode`, `mcp__maps__maps_search_places`, ...

### OpenClaw

OpenClaw gestisce i server MCP in `~/.openclaw/openclaw.json` tramite CLI (verificato su OpenClaw 2026.4.21):

```bash
openclaw mcp set maps '{"command":"node","args":["/percorso/assoluto/a/mcp-google-map/dist/cli.js","--stdio"],"env":{"GOOGLE_MAPS_API_KEY":"AIza..."},"description":"Google Maps: Places API (New), geocoding, routes, weather"}'
```

- Senza installazione locale: usare `"command":"npx","args":["-y","mcp-google-map","--stdio"]` (esegue il pacchetto npm pubblicato).
- Dopo la modifica ricaricare il gateway o riavviare la sessione agente perché il nuovo server venga collegato.
- Ispezione e rimozione: `openclaw mcp list`, `openclaw mcp show maps`, `openclaw mcp unset maps`.
- L'agente OpenClaw può installare e configurare il server in autonomia (shell + `openclaw mcp set`); la creazione della API key su Google Cloud Console resta un'operazione umana.

### Prerequisiti di configurazione

1. **Una sola API key**: crea `GOOGLE_MAPS_API_KEY` su <https://console.cloud.google.com/apis/credentials> e abilita i servizi elencati nella tabella [API Google Cloud richieste](#api-google-cloud-richieste).
2. **Minimo operativo**: Places API (New) + Geocoding API; abilitare gli altri servizi solo per i tool corrispondenti.
3. **Limitare l'esposizione**: `GOOGLE_MAPS_ENABLED_TOOLS=maps_geocode,maps_search_places,maps_place_details` riduce i tool registrati (e il contesto per l'LLM).
4. **Verifica post-installazione**: `mcp-google-map doctor` (nessuna chiamata di rete), poi `mcp-google-map doctor --live --apikey "AIza..."` (probe reali su Geocoding, Places, Routes).

## Struttura del progetto

```
mcp-google-map/
├── src/            # sorgenti del server MCP
│   ├── cli.ts      # entry point (stdio/HTTP, comandi exec e doctor)
│   ├── config.ts   # registrazione dei tool esposti
│   ├── core/       # BaseMcpServer: MCP SDK, stdio + Streamable HTTP
│   ├── services/   # Places API (New), Geocoding, Routes, clima
│   └── tools/      # definizione dei 18 tool MCP
├── scripts/        # script bash di supporto (setup/build/start/test)
├── docs/           # documentazione del progetto
└── tests/          # test unitari (mock) + smoke/e2e (API key reale)
```

## Documentazione

- [docs/TOOLS.md](docs/TOOLS.md) — catalogo dei tool e parametri
- [docs/CONFIGURATION.md](docs/CONFIGURATION.md) — variabili d'ambiente, trasporti, API key
- [docs/GEOSCOUT.md](docs/GEOSCOUT.md) — compatibilità GeoScout 6.2 (filtri economici, FieldMask, payload raw)

## Sviluppo

```bash
npm run dev        # build incrementale in watch
npm run typecheck  # tsc --noEmit
scripts/test.sh    # unit test
```

## Licenza

GPL-3.0 — vedi [LICENSE](LICENSE).
