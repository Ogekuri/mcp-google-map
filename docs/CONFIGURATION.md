# Configurazione

## Google Maps API key

Ottieni una chiave da <https://console.cloud.google.com/apis/credentials> e abilita sulla chiave i servizi che usi:

| Servizio console (nome API) | Tool che lo richiedono | Note |
| --- | --- | --- |
| **Places API (New)** (`places-backend-new`) | `maps_search_places`, `maps_search_nearby`, `maps_place_details`, `maps_explore_area`, `maps_compare_places`, `maps_search_along_route`, `maps_local_rank_tracker` | Obbligatoria per GeoScout; unica API di ricerca locali usata dal server |
| **Geocoding API** (`geocoding-backend`) | `maps_geocode`, `maps_reverse_geocode`, `maps_batch_geocode` | Anche fallback interno di risoluzione indirizzi |
| **Routes API** (`routes`) | `maps_directions`, `maps_distance_matrix`, `maps_plan_route` | |
| **Time Zone API** (`timezone-backend`) | `maps_timezone` | |
| **Maps Elevation API** (`elevation-backend`) | `maps_elevation` | In console appare come "Maps Elevation API" |
| **Maps Static API** (`static-maps-backend`) | `maps_static_map` | Immagine PNG | |
| **Weather API** (`weather-backend`) | `maps_weather` | Copertura regionale limitata |
| **Air Quality API** (`airquality`) | `maps_air_quality` | Copertura regionale limitata |

Non richieste da questo server: **Maps Grounding Lite** (solo MCP hosted Google) e **Geolocation API** (nessun tool la usa). L'elenco completo con priorità è in [README.md](../README.md#api-google-cloud-richieste).

La chiave può essere fornita in tre modi (priorità decrescente):

1. flag CLI `--apikey "AIza..."`
2. header HTTP `X-Goog-Api-Key` (o `x-api-key`) sul trasporto HTTP — **per richiesta**, utile in multi-sessione
3. variabile d'ambiente `GOOGLE_MAPS_API_KEY` (o riga in `.env`)

## Variabili d'ambiente

Definite in `.env` (copia da `.env.example`):

| Variabile | Default | Descrizione |
| --- | --- | --- |
| `GOOGLE_MAPS_API_KEY` | — | **Obbligatoria.** Chiave Google Maps |
| `MCP_SERVER_PORT` | `3000` | Porta del trasporto HTTP |
| `MCP_SERVER_HOST` | `0.0.0.0` | Interfaccia di bind HTTP (usare `127.0.0.1` per esposizione solo locale) |
| `GOOGLE_MAPS_ENABLED_TOOLS` | `*` | Allowlist separata da virgole dei tool esposti (riduce il contesto per l'LLM). Esempio: `maps_search_places,maps_place_details,maps_geocode` |

## Trasporti

### stdio (predefinito per client locali)

```bash
scripts/start-mcp.sh            # node dist/cli.js --stdio
```

stdout è riservato ai messaggi JSON-RPC; tutti i log del server vanno su stderr.

### Streamable HTTP

```bash
scripts/start-http.sh                       # http://127.0.0.1:3000/mcp
MCP_SERVER_PORT=8123 scripts/start-http.sh  # porta personalizzata
scripts/start-http.sh --port 8123 --host 0.0.0.0
```

Ogni sessione MCP (`mcp-session-id`) può ricevere una API key propria via header `X-Goog-Api-Key`: le chiamate dei tool usano la chiave della sessione, non quella globale.

## Registrazione nei client MCP

### pi CLI

Voce stdio per `~/.pi/agent/mcp.json` (utente) o `.pi/mcp.json` (progetto, richiede trust):

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

- `${VAR}` espande variabili d'ambiente: la chiave non resta cablata nel file di configurazione.
- `pi mcp add maps -- node /percorso/assoluto/a/mcp-google-map/dist/cli.js --stdio` registra da terminale; `/reload` in sessione dopo modifiche esterne; `/mcp` ispeziona la connessione.

### OpenClaw

```bash
openclaw mcp set maps '{"command":"node","args":["/percorso/assoluto/a/mcp-google-map/dist/cli.js","--stdio"],"env":{"GOOGLE_MAPS_API_KEY":"AIza..."},"description":"Google Maps MCP"}'
```

- Alternativa senza installazione: `"command":"npx","args":["-y","mcp-google-map","--stdio"]`.
- Ricaricare il gateway o riavviare la sessione agente dopo la modifica; `openclaw mcp list` / `openclaw mcp show maps` per verificare.

### Prerequisiti chiave e API Google

- **Una sola chiave** `GOOGLE_MAPS_API_KEY` (priorità di risoluzione in [Google Maps API key](#google-maps-api-key)); servizi da abilitare e sottoinsieme minimo (Places API (New) + Geocoding API): tabella in [README.md](../README.md#api-google-cloud-richieste).
- Limitare i tool esposti con [`GOOGLE_MAPS_ENABLED_TOOLS`](#variabili-dambiente).
- Verifica post-installazione: `node dist/cli.js doctor` e `node dist/cli.js doctor --live --apikey "AIza..."`.

## Comandi CLI

```bash
node dist/cli.js --stdio                                # server stdio
node dist/cli.js --port 3000 --host 127.0.0.1           # server HTTP
node dist/cli.js exec search-places --query "pizzeria Torino"   # chiama un tool da terminale
node dist/cli.js doctor --live --apikey "AIza..."       # diagnostica ambiente + chiamate reali
```

## Diagnostica

```bash
node dist/cli.js doctor
```

Verifica versione Node, presenza della API key e (con `--live`) effettua chiamate reali ai servizi Google.
