# mcp-google-map Requirements

## 1. Introduction

### 1.1 Document Rules
This document MUST follow these authoring rules (LLM-first, normative SRS):
- This document MUST be written and maintained in English.
- Use RFC 2119 keywords exclusively (MUST, MUST NOT, SHOULD, SHOULD NOT, MAY). Do not use "shall".
- In requirements sections, every bullet MUST be a requirement and MUST start with a unique, stable Requirement ID (e.g., **REQ-001**).
- Requirement IDs MUST be stable: never renumber, reuse, or repurpose an ID. Only the dedicated reorganization workflow may renumber and it MUST emit an old→new ID mapping.
- Requirement ID prefixes MUST be consistent; this document uses: PRJ (project function), CTN (project constraint), DES (design/implementation constraint), REQ (observable function), TST (test requirement).
- Each requirement MUST be atomic, single-sentence, and testable; target <= 35 words per requirement; split any compound behavior into separate IDs.
- Write for other LLM Agents and automated parsers (high semantic density; no filler).
- On every change to this document:
  - Keep the first line as a level-1 title beginning with `# `.
  - Do NOT add YAML front matter or in-document revision history; use git history / CHANGELOG.md for change tracking.

### 1.2 Project Scope
`mcp-google-map` (v0.0.0, GPL-3.0) is a Model Context Protocol (MCP) server exposing 18 Google Maps tools (geocoding, Places API (New), Routes, Weather, Air Quality, Time Zone, Elevation, Static Maps) to AI agents over stdio or Streamable HTTP, plus a standalone CLI (`doctor`, `exec`, `batch-geocode`). Boundaries: read-only Google API queries only; no persistence, no caching layer, no user management, no write operations.

Project file/folder structure (evidence: repository tree):

```
mcp-google-map/
├── docs/                        # Usage docs (CONFIGURATION.md, TOOLS.md, GEOSCOUT.md)
├── scripts/                     # Shell helpers: build.sh, setup.sh, start-http.sh, start-mcp.sh, test.sh
├── src/
│   ├── cli.ts                   # yargs entry: doctor, exec, batch-geocode, server start
│   ├── config.ts                # serverConfigs registry, tool annotations, filterTools()
│   ├── index.ts                 # Logger (stderr) + public re-exports
│   ├── core/
│   │   └── BaseMcpServer.ts     # MCP server: stdio + Streamable HTTP, per-session state
│   ├── services/
│   │   ├── NewPlacesService.ts  # Places API (New) client + response transforms
│   │   ├── PlacesSearcher.ts    # Facade: 18 operations incl. composite tools
│   │   ├── RoutesService.ts     # Routes API REST client (fetch)
│   │   └── toolclass.ts         # Legacy GoogleMapsTools client (other Maps APIs)
│   ├── tools/
│   │   └── maps/                # 18 MCP tool modules (NAME/DESCRIPTION/SCHEMA/ACTION)
│   └── utils/
│       ├── apiKeyManager.ts     # ApiKeyManager singleton (key resolution priority)
│       └── requestContext.ts    # AsyncLocalStorage request context (apiKey, sessionId)
├── tests/                       # node:test unit suites + smoke.test.ts (live e2e)
├── package.json
├── tsconfig.json
└── tsup.config.ts
```

Components and libraries (evidence: `package.json` `dependencies`/`devDependencies`, direct imports in `src/`):
- `@modelcontextprotocol/sdk` ^1.32.0 — McpServer, StdioServerTransport, StreamableHTTPServerTransport (`src/core/BaseMcpServer.ts`).
- `@googlemaps/places` ^2.1.0 — PlacesClient for Places API (New) (`src/services/NewPlacesService.ts`).
- `@googlemaps/google-maps-services-js` ^3.4.0 — legacy Client for geocode/reverse-geocode/timezone/elevation (`src/services/toolclass.ts`).
- `express` ^4.21.2 — HTTP server hosting `/mcp` (`src/core/BaseMcpServer.ts`).
- `yargs` ^17.7.2 — CLI command parsing (`src/cli.ts`).
- `zod` ^3.25.0 — tool input schemas (`src/tools/maps/*.ts`, `src/config.ts`).
- `dotenv` ^16.4.7 — `.env` loading (`src/cli.ts`, `src/services/toolclass.ts`).
- Dev toolchain: `typescript` ^5.7.3, `tsup` ^8.4.0 (ESM build), `tsx` ^4.19.2 (test runner).

## 2. Project Requirements

### 2.1 Project Functions
- **PRJ-001**: MUST expose 18 Google Maps MCP tools: maps_geocode, maps_reverse_geocode, maps_search_nearby, maps_search_places, maps_place_details, maps_directions, maps_distance_matrix, maps_elevation, maps_timezone, maps_weather, maps_explore_area, maps_plan_route, maps_compare_places, maps_air_quality, maps_static_map, maps_batch_geocode, maps_search_along_route, maps_local_rank_tracker.
- **PRJ-002**: MUST serve tool calls over both stdio transport and Streamable HTTP transport at endpoint path `/mcp`.
- **PRJ-003**: MUST provide a standalone CLI with commands: `doctor`, `exec <tool> [params]`, `batch-geocode`, and default server-start command.
- **PRJ-004**: MUST provide composite tools (explore-area, plan-route, compare-places, search-along-route, local-rank-tracker) that chain geocoding, search, details, and routing calls internally.
- **PRJ-005**: MUST support per-request and per-session Google Maps API keys so concurrent HTTP clients use isolated credentials.
- **PRJ-006**: MUST allow restricting exposed tools via the `GOOGLE_MAPS_ENABLED_TOOLS` comma-separated allowlist environment variable.
- **PRJ-007**: MUST provide CLI batch geocoding of address files or stdin with bounded concurrency and JSON summary output.
- **PRJ-008**: MUST report machine-readable JSON results on stdout and diagnostics on stderr in all CLI modes.

### 2.2 Project Constraints
- **CTN-001**: MUST declare all tools read-only, non-destructive, idempotent, and open-world via MCP tool annotations (evidence: `MAPS_TOOL_ANNOTATIONS`, `src/config.ts`).
- **CTN-002**: MUST require a Google Maps API key from environment `GOOGLE_MAPS_API_KEY`, CLI `--apikey`, or per-request HTTP header before any tool call executes.
- **CTN-003**: MUST reserve stdio-mode stdout exclusively for JSON-RPC frames, dropping non-JSON stdout writes.
- **CTN-004**: MUST default Places API result language to English (`languageCode: "en"`).
- **CTN-005**: MUST run on Node.js; `package.json` declares `engines.node >= 22` while the doctor check passes at Node >= 18.
- **CTN-006**: MUST build and run as ECMAScript Modules only (`"type": "module"`, tsup ESM output).
- **CTN-007**: MUST load `.env` from the current working directory first, then from the package installation directory (`src/cli.ts`).
- **CTN-008**: MUST NOT use any database or file-based persistence; all state is in-memory per process.

## 3. Requirements

### 3.1 Design and Implementation
- **DES-001**: MUST organize code in three layers: tool modules (`src/tools/maps/`), facade (`PlacesSearcher`), and API clients (`GoogleMapsTools`, `NewPlacesService`, `RoutesService`).
- **DES-002**: MUST export each tool module as `{ NAME, DESCRIPTION, SCHEMA, ACTION }` where SCHEMA is a zod object record and ACTION is an async handler.
- **DES-003**: MUST instantiate a new `PlacesSearcher` per tool invocation using `getCurrentApiKey()` from the request context.
- **DES-004**: MUST create a dedicated `McpServer` instance and `StreamableHTTPServerTransport` per HTTP session initialization (`src/core/BaseMcpServer.ts`).
- **DES-005**: MUST implement API key resolution priority: `X-Google-Maps-API-Key` header, then `Authorization: Bearer`, then session key, then default key (`ApiKeyManager.getApiKey`).
- **DES-006**: MUST propagate per-request API keys via `AsyncLocalStorage` (`runWithContext`/`getCurrentApiKey`) with fallback to `process.env.GOOGLE_MAPS_API_KEY`.
- **DES-007**: MUST have facade methods return `{ success: false, error }` objects instead of throwing, except composite methods (`resolveLocation`, `planRoute`, `comparePlaces`, `exploreArea` data errors) which throw.
- **DES-008**: MUST have every tool ACTION return `{ content: [{ type: "text", ... }], isError }`; failures set `isError: true` with the error text.
- **DES-009**: MUST call Routes API via native `fetch` against `https://routes.googleapis.com` with `X-Goog-Api-Key` and `X-Goog-FieldMask` headers (`RoutesService`).
- **DES-010**: MUST restrict Google API responses via explicit field-mask constants per operation (`NewPlacesService.placeFieldMask`, `searchNearbyFieldMask`, `searchTextFieldMask`, `RoutesService.COMPUTE_ROUTES_FIELD_MASK`, `COMPUTE_ROUTE_MATRIX_FIELD_MASK`).
- **DES-011**: MUST map Google API error codes 403/gRPC-7 to an "API key invalid or API not enabled" message and 429/gRPC-8 to a quota-exceeded message.
- **DES-012**: MUST map legacy travel-mode names driving/walking/bicycling/transit to Routes API DRIVE/WALK/BICYCLE/TRANSIT, defaulting unknown modes to DRIVE.
- **DES-013**: MUST prefer place IDs over coordinates when converting resolved locations to Routes waypoints, because Routes snaps coordinates to roads (`toRouteWaypoint`, `src/services/PlacesSearcher.ts`).
- **DES-014**: MUST implement runnability self-checks in a doctor command decoupled from server startup, with injectable tool runner for testing (`runDoctor`, `src/cli.ts`).

### 3.2 Functions

#### HTTP Server, Sessions, and Tool Registry
- **REQ-001**: MUST register all configured tools on `tools/list` with zod-derived JSON input schemas and their annotations (`BaseMcpServer.createMcpServer`).
- **REQ-002**: MUST create a new session with `randomUUID()` when POST `/mcp` receives an initialize request without a session ID.
- **REQ-003**: MUST respond HTTP 400 with JSON-RPC error code -32000 to POST `/mcp` requests that carry no valid session ID and are not initialize requests.
- **REQ-004**: MUST respond HTTP 400 to GET or DELETE `/mcp` requests whose `mcp-session-id` header is missing or unknown.
- **REQ-005**: MUST delete the stored session context when the session transport emits `onclose`.
- **REQ-006**: MUST overwrite the stored session API key when a later request on that session supplies a header-based key.
- **REQ-007**: MUST serve GET `/mcp` for server-to-client SSE notifications and DELETE `/mcp` for session termination through one shared handler.
- **REQ-008**: MUST bind the HTTP server to `--host` (default `MCP_SERVER_HOST` or `0.0.0.0`) and port `--port` (default `MCP_SERVER_PORT` or 3000).
- **REQ-009**: MUST skip starting a server instance and log remediation guidance when its port environment variable is unset or non-positive.
- **REQ-010**: MUST return the full tool set when `GOOGLE_MAPS_ENABLED_TOOLS` is unset, empty, or `*`.
- **REQ-011**: MUST return the named tool subset when `GOOGLE_MAPS_ENABLED_TOOLS` matches at least one tool name, trimming whitespace and ignoring empty items.
- **REQ-012**: MUST return the full tool set and log an error when `GOOGLE_MAPS_ENABLED_TOOLS` matches zero tools.
- **REQ-013**: MUST attach annotations `readOnlyHint: true`, `destructiveHint: false`, `idempotentHint: true`, `openWorldHint: true` to every registered tool.
- **REQ-014**: MUST suppress stdout string writes not beginning with `{` after any transport connect, preserving JSON-RPC framing in stdio mode.
- **REQ-015**: MUST log all diagnostics to stderr via the `Logger` wrapper (`src/index.ts`).

#### API Key Handling
- **REQ-016**: MUST resolve the request API key from the `X-Google-Maps-API-Key` header with top priority when present.
- **REQ-017**: MUST resolve the request API key from a `Bearer` token in the `Authorization` header when no `X-Google-Maps-API-Key` header is present.
- **REQ-018**: MUST fall back to the session API key, then the default key (`GOOGLE_MAPS_API_KEY`), when no header key is supplied.
- **REQ-019**: MUST abort tool construction with error "Google Maps API Key is required" when the resolved key is empty in any API client constructor.
- **REQ-020**: SHOULD validate API key format as 20-50 characters of `[A-Za-z0-9_-]` via `ApiKeyManager.isValidApiKeyFormat`.

#### Geocoding Tools
- **REQ-021**: MUST return `{ location, formatted_address, place_id }` of the first geocoding result for `maps_geocode`, failing when zero results are returned.
- **REQ-022**: MUST return `{ formatted_address, place_id, address_components }` of the first reverse-geocoding result for `maps_reverse_geocode`, failing when zero results are returned.
- **REQ-023**: MUST geocode 1-50 addresses concurrently for `maps_batch_geocode`, returning per-address success/error entries plus `total`, `succeeded`, `failed` counts.

#### Places Tools
- **REQ-024**: MUST search nearby places inside a circle restriction of radius (default 1000 m) with `maxResultCount` capped at 20 for `maps_search_nearby`.
- **REQ-025**: MUST treat the `maps_search_nearby` `keyword` parameter as a single Places API (New) included type, not free text (`NewPlacesService.searchNearby` sets `includedTypes`).
- **REQ-026**: MUST apply `openNow` and `minRating` filters for `maps_search_nearby` client-side after the API response, not server-side (`PlacesSearcher.searchNearby`).
- **REQ-027**: MUST forward `openNow`, `minRating`, `includedType`, `strictTypeFiltering`, and `priceLevels` as server-side Places Text Search filters for `maps_search_places`.
- **REQ-028**: MUST apply location bias for `maps_search_places` as a circle with radius defaulting to 5000 m when unspecified.
- **REQ-029**: MUST clamp `pageSize` for `maps_search_places` into 1-20 and return `nextPageToken` when the API paginates, accepting `pageToken` for subsequent pages.
- **REQ-030**: MUST attach `raw_place` per result and the full `raw_response` when `maps_search_places` runs with `includeRaw: true`.
- **REQ-031**: MUST return place details with contact info, hours, price data, parking, accessibility, dining, serves, atmosphere, payment, review and generative summaries, reviews with attribution URIs, and photo metadata for `maps_place_details`.
- **REQ-032**: MUST resolve at most `maxPhotos` photo URLs via Places photo media (maxWidthPx 800) for `maps_place_details`, silently skipping failed photos, and omit photos when `maxPhotos` is 0.
- **REQ-033**: MUST include `raw_place` and the applied field mask when `maps_place_details` runs with `includeRaw: true`.
- **REQ-034**: MUST derive the legacy place ID from the `places/{id}` resource name, falling back to the `id` field (`extractLegacyPlaceId`).
- **REQ-035**: MUST compute open-now status from `currentOpeningHours.openNow`, then `regularOpeningHours.openNow`, then period arithmetic using `utcOffsetMinutes` when available, else machine local time (`isCurrentlyOpen`).

#### Routing Tools
- **REQ-036**: MUST compute directions for `maps_directions` via Routes `computeRoutes`, returning routes, summary, and total distance/duration in value and text form.
- **REQ-037**: MUST set `routingPreference: "TRAFFIC_AWARE"` only for DRIVE mode in route and matrix requests.
- **REQ-038**: MUST reject `avoid_tolls`/`avoid_highways` with an error unless travel mode is driving (`buildRouteModifiers`).
- **REQ-039**: MUST send `arrivalTime` instead of `departureTime` when both are provided to Routes (`computeRoutes` else-branch).
- **REQ-040**: MUST report a transit-specific regional-coverage error naming Japan and India when a transit route is not found.
- **REQ-041**: MUST rebuild the Routes distance matrix from flat elements into 2D `distances`/`durations` arrays indexed by origin/destination, leaving `ROUTE_NOT_FOUND` cells null.
- **REQ-042**: MUST fail the whole distance-matrix request when every origin/destination pair is `ROUTE_NOT_FOUND` in transit mode, and add a `warning` field for partial transit failures.
- **REQ-043**: MUST echo the input origin/destination strings as `origin_addresses`/`destination_addresses` in distance-matrix results because Routes does not resolve addresses.

#### Environment Tools
- **REQ-044**: MUST return current weather conditions (temperature, feels-like, humidity, wind, conditions, UV, precipitation, visibility, pressure, cloud cover, day/night) by default for `maps_weather`.
- **REQ-045**: MUST clamp daily forecast days to 1-10 (default 5) and hourly forecast hours to 1-240 (default 24) for `maps_weather`.
- **REQ-046**: MUST replace raw errors with an unsupported-location message listing known unsupported countries when the Weather API rejects the location.
- **REQ-047**: MUST include `HEALTH_RECOMMENDATIONS` by default and `POLLUTANT_CONCENTRATION` only when requested for `maps_air_quality`.
- **REQ-048**: MUST return the primary AQI index fields plus all secondary indexes, health recommendations, and pollutant concentrations when present for `maps_air_quality`.
- **REQ-049**: MUST return timezone ID, name, raw offset, DST offset, and ISO local time computed from the requested epoch (default now) for `maps_timezone`, failing on non-OK status.
- **REQ-050**: MUST return elevation plus echoed location per requested point in input order for `maps_elevation`, failing on non-OK status.

#### Static Map Tool
- **REQ-051**: MUST return a PNG image content block (base64) plus a text summary with byte size and dimensions for `maps_static_map`.
- **REQ-052**: MUST default `maps_static_map` size to `600x400` and maptype to `roadmap`, encoding center, markers, and path descriptors as query parameters.
- **REQ-053**: MUST reject static map requests whose assembled URL exceeds 16384 characters with a message advising fewer markers or path points.

#### Composite Tools
- **REQ-054**: MUST resolve each location string at most once for composite tools: coordinate strings pass range validation (lat ±90, lng ±180) and use geocoding only for a display address whose failure is tolerated; other strings try geocoding then Places Text Search (`resolveLocation`).
- **REQ-055**: MUST throw a combined error naming both geocoding and text-search failures when a location string resolves by neither method.
- **REQ-056**: MUST explore an area by searching each type sequentially (default types: restaurant, cafe, tourist_attraction; default radius 1000 m) and enriching the top N (default 3) results with phone and website for `maps_explore_area`.
- **REQ-057**: MUST require at least 2 stops for `maps_plan_route`, throwing otherwise.
- **REQ-058**: MUST enable Routes waypoint optimization for `maps_plan_route` only when `optimize !== false`, stops > 3, and mode is not transit.
- **REQ-059**: MUST reorder `maps_plan_route` output stops according to `optimizedIntermediateWaypointIndex` when optimization applies, keeping first and last stops fixed.
- **REQ-060**: MUST return one leg per ordered stop pair with formatted distance/duration for `maps_plan_route`, substituting `"unknown"` values and an explanatory note when a leg is missing.
- **REQ-061**: MUST report `maps_plan_route` totals as kilometers rounded to one decimal and duration rounded to whole minutes.
- **REQ-062**: MUST compare up to `limit` (default 5) text-search results for `maps_compare_places`, enriching each with details fields including parking, serves, atmosphere, and dining options.
- **REQ-063**: MUST add driving `distance` and `drive_time` per compared place from a distance matrix when `maps_compare_places` receives `userLocation`.
- **REQ-064**: MUST compute routes with default mode walking to obtain the encoded polyline, then run Places Text Search with `searchAlongRouteParameters` for `maps_search_along_route`, capping results at 20 (default 5).
- **REQ-065**: MUST generate a gridSize×gridSize grid (default 3, schema range 3-7) around the center with spacing (default 1000 m, range 100-10000) using 111320 m per latitude degree and cosine-corrected longitude degrees for `maps_local_rank_tracker`.
- **REQ-066**: MUST scan each grid point of `maps_local_rank_tracker` via location-biased Text Search (radius spacing/2, maxResultCount 20) with concurrency 5, recording rank (1-based or null) and top-3 competitor names.
- **REQ-067**: MUST compute `maps_local_rank_tracker` metrics: ARP (mean found rank), ATRP (mean rank counting missing as 21), SoLV (percent of points ranking in top 3), and `found_in` count, each rounded to one decimal.
- **REQ-068**: MUST return a flat single-keyword response for `maps_local_rank_tracker` with one keyword, and a `keywords` array response for two or three keywords.
- **REQ-069**: SHOULD resolve the target business display name for `maps_local_rank_tracker` via place details while tolerating lookup failure with an empty name.

#### CLI
- **REQ-070**: MUST verify Node >= 18, non-zero package version, and API key presence in `doctor` local mode without network calls, printing a JSON report and exiting 0 only when no check fails.
- **REQ-071**: MUST add a skipped `live-api` check in `doctor` when `--live` is absent or no API key is configured, making no billable calls.
- **REQ-072**: MUST probe Geocoding, Places (New), and Routes APIs independently via geocode, search-places, and directions calls in `doctor --live` mode, failing only the probes that error.
- **REQ-073**: MUST execute a named tool with JSON parameters for `exec`, accepting short, snake_case, and `maps_`-prefixed aliases per the `EXEC_TOOLS` mapping.
- **REQ-074**: MUST exit 1 with a JSON error on stderr for `exec` when no API key is configured, when the tool reports `{ success: false }`, when parameters are not valid JSON, or when the tool name is unknown.
- **REQ-075**: MUST write successful `exec` results as pretty-printed JSON to stdout with exit code 0.
- **REQ-076**: MUST read one address per line for `batch-geocode` from `--input` file or stdin when `--input -`, rejecting empty input with exit 1.
- **REQ-077**: MUST bound `batch-geocode` concurrency between 1 and 50 (default 20), print a JSON summary with counts and per-address results, and write progress to stderr only when `--output` is set.
- **REQ-078**: MUST write `batch-geocode` results to `--output` file when given, otherwise stdout, and exit 1 when any address failed.
- **REQ-079**: MUST start the MCP server in stdio mode when `--stdio` is passed, otherwise in HTTP mode, applying `--apikey` to the environment before startup.
- **REQ-080**: MUST log a warning instead of failing when the default server-start command runs in HTTP mode without an API key.

### 3.3 Known Limitations (True State)
- **LIM-001**: `maps_search_nearby` may return fewer than 20 results when client-side `openNow`/`minRating` filters discard matches post-query.
- **LIM-002**: `GoogleMapsTools.parseCoordinates` validates only numeric parsing, not geographic ranges; range rejection happens only in composite `resolveLocation` (`src/services/toolclass.ts`).
- **LIM-003**: `doctor` accepts Node >= 18 while `package.json` `engines` requires >= 22; a passing doctor report does not guarantee engine compliance.
- **LIM-004**: `maps_static_map` passes `size` through without enforcing the documented 640x640 maximum; only the 16384-character URL limit is enforced.
- **LIM-005**: Transit routing has regional coverage gaps; the server surfaces Google's regional limitations (notably Japan and India) as errors or warnings rather than fallbacks.
- **LIM-006**: No explicit performance optimizations identified beyond bounded concurrency batching (grid scan concurrency 5 in `scanKeywordGrid`; CLI semaphore clamp 1-50).

## 4. Test Requirements
- **TST-001**: MUST verify REQ-073/REQ-074/REQ-075 by running `npm test` (`tests/cliExec.unit.test.ts`): injected runners assert stdout JSON on success, stderr JSON plus exit code 1 on failure responses, thrown errors, and alias resolution; pass when all assertions hold.
- **TST-002**: MUST verify REQ-070/REQ-071/REQ-072 by running `npm test` (`tests/cliExec.unit.test.ts` doctor cases): local mode makes zero API calls, missing key fails safely, live mode probes three APIs independently; pass when reports match expectations.
- **TST-003**: MUST verify REQ-024-REQ-030 by running `npm test` (`tests/geoscoutFilters.unit.test.ts`): mocked `PlacesClient` assertions confirm forwarded filters, field masks, priceRange preservation, `nextPageToken`, `pageToken`, raw payloads, and legacy array contract.
- **TST-004**: MUST verify REQ-054/REQ-055/REQ-057 by running `npm test` (`tests/locationResolution.unit.test.ts`): mocked clients assert resolved waypoints, geocode→text-search fallback, thrown errors on unresolvable stops, and coordinate handling without API calls.
- **TST-005**: MUST verify REQ-058 by running `npm test` (`tests/planRoute.unit.test.ts`): 2-4 stop scenarios assert optimization is applied or skipped per thresholds and ordering is preserved when disabled.
- **TST-006**: MUST verify REQ-036-REQ-043 by running `npm test` (`tests/routesWaypoints.unit.test.ts`): mocked `fetch` asserts structured waypoint forwarding, two-intermediate optimization minimum, string compatibility, matrix rebuild, and waypoint-aware error labels.
- **TST-007**: MUST verify REQ-005/REQ-006 (session key isolation) by running `npm test` (`tests/apiKeyIsolation.unit.test.ts`): two sessions with distinct header keys retain distinct context keys despite a server default.
- **TST-008**: MUST verify REQ-031/REQ-034 (attribution retention) by running `npm test` (`tests/placeAttribution.unit.test.ts`): mocked details responses keep source and disclosure metadata through the facade.
- **TST-009**: MUST verify REQ-056 defaults by running `npm test` (`tests/exploreArea.unit.test.ts`): default type set contains only valid Places API (New) type names and caller-supplied types are preserved.
- **TST-010**: SHOULD verify end-to-end behavior against live Google APIs by running `npm run test:e2e` (`tests/smoke.test.ts`) with a real API key; pass requires all live tool calls to succeed. This test is excluded from `npm test`.
