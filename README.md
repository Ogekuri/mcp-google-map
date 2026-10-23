# mcp-google-map (0.0.0)

<p align="center">
  <img src="https://img.shields.io/badge/python-3.11%2B-3776AB?style=flat-square&logo=python&logoColor=white" alt="Python 3.11+">
  <img src="https://img.shields.io/badge/license-GPL--3.0-491?style=flat-square" alt="License: GPL-3.0">
  <img src="https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-6A7EC2?style=flat-square&logo=terminal&logoColor=white" alt="Platforms">
  <img src="https://img.shields.io/badge/docs-live-b31b1b" alt="Docs">
<img src="https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/astral-sh/uv/main/assets/badge/v0.json" alt="uv">
</p>

TODO: correct and complete the project descriptions

<p align="center">
<strong>mcp-google-map is a ...</strong><br>
Server [Model Context Protocol](https://modelcontextprotocol.io) per **Google Maps Platform**, con 18 tool per agenti AI: ricerca Places API (New) con **filtri server-side** (`priceLevels`, `minRating`, `strictTypeFiltering`), paginazione nativa, accesso al **payload raw** delle risposte API, geocoding, indicazioni, matrice delle distanze e altro.

Trasporti supportati: **stdio** (client MCP locali) e **Streamable HTTP**.

> Compatibile con il protocollo di ricerca **GeoScout 6.2** — vedi [docs/GEOSCOUT.md](docs/GEOSCOUT.md).

</p>

<p align="center">
  <a href="#quick-start">Quick Start</a> |
  <a href="#requirements">Requirements</a> |
  <a href="#feature-highlights">Feature Highlights</a> |
  <a href="#install-uninstall">Install/Uninstall</a>
</p>
<p align="center">
<br>
🚧 <strong>DRAFT</strong>: 👾 Alpha Development 👾 - Work in Progress 🏗️ 🚧<br>
⚠️ <strong>IMPORTANT NOTICE</strong>: Created itself with <a href="https://github.com/Ogekuri/PI-useReq"><strong>PI-useReq/pi-usereq</strong></a> 🤖✨ ⚠️<br>
<br>
<p>


TODO: correct e complete the document according the above menu, change the menu if needed



## Requisiti

- Node.js **>= 22**
- Una **Google Maps API key** con i servizi necessari abilitati (minimo per la ricerca locali: **Places API (New)**)
  — <https://console.cloud.google.com/apis/library>

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
