# Files Structure
```
.
└── src
    ├── cli.ts
    ├── config.ts
    ├── core
    │   └── BaseMcpServer.ts
    ├── index.ts
    ├── services
    │   ├── NewPlacesService.ts
    │   ├── PlacesSearcher.ts
    │   ├── RoutesService.ts
    │   └── toolclass.ts
    ├── tools
    │   └── maps
    │       ├── airQuality.ts
    │       ├── batchGeocode.ts
    │       ├── comparePlaces.ts
    │       ├── directions.ts
    │       ├── distanceMatrix.ts
    │       ├── elevation.ts
    │       ├── exploreArea.ts
    │       ├── geocode.ts
    │       ├── localRankTracker.ts
    │       ├── placeDetails.ts
    │       ├── planRoute.ts
    │       ├── reverseGeocode.ts
    │       ├── searchAlongRoute.ts
    │       ├── searchNearby.ts
    │       ├── searchPlaces.ts
    │       ├── staticMap.ts
    │       ├── timezone.ts
    │       └── weather.ts
    └── utils
        ├── apiKeyManager.ts
        ├── autoUpdate.ts
        └── requestContext.ts
```

# cli.ts | TypeScript | 707L | 14 symbols | 13 imports | 17 comments
> Path: `src/cli.ts`

## Imports
```
import { config as dotenvConfig } from "dotenv";
import { resolve } from "path";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import serverConfigs, { filterTools } from "./config.js";
import { BaseMcpServer } from "./core/BaseMcpServer.js";
import { Logger } from "./index.js";
import { PlacesSearcher } from "./services/PlacesSearcher.js";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { createInterface } from "readline";
import { checkForUpdates } from "./utils/autoUpdate.js";
```

## Definitions

### fn `export async function startServer(port?: number, apiKey?: string, host?: string): Promise<void>` (L26-79)

- type `type ExecFailureResponse = {` (L104)
### iface `interface ExecOutput` (L109-111)

### iface `interface ExecStreams` (L113-116)

- type `type ExecToolRunner = (toolName: string, params: any, apiKey: string) => Promise<unknown>;` (L118)
- type `export type DoctorCheck = {` (L120)
- type `export type DoctorReport = {` (L126)
- type `type DoctorToolRunner = (toolName: string, params: any, apiKey: string) => Promise<unknown>;` (L133)
### fn `function isExecFailureResponse(result: unknown): result is ExecFailureResponse` (L135-142)

### fn `function getExecFailureMessage(toolName: string, result: ExecFailureResponse): string` (L144-152)

### fn `export async function execTool(toolName: string, params: any, apiKey: string): Promise<any>` (L154-288)

### fn `export async function runExecCommand(` (L298-303)

### fn `export async function runDoctor(` (L327-412)

### fn `const semaphore = async (tasks: (() => Promise<void>)[], limit: number) =>` (L586-598)

## Symbol Index
|Symbol|Kind|Vis|Lines|Sig|
|---|---|---|---|---|
|`startServer`|fn||26-79|export async function startServer(port?: number, apiKey?:...|
|`ExecFailureResponse`|type||104||
|`ExecOutput`|iface||109-111|interface ExecOutput|
|`ExecStreams`|iface||113-116|interface ExecStreams|
|`ExecToolRunner`|type||118||
|`DoctorCheck`|type||120||
|`DoctorReport`|type||126||
|`DoctorToolRunner`|type||133||
|`isExecFailureResponse`|fn||135-142|function isExecFailureResponse(result: unknown): result i...|
|`getExecFailureMessage`|fn||144-152|function getExecFailureMessage(toolName: string, result: ...|
|`execTool`|fn||154-288|export async function execTool(toolName: string, params: ...|
|`runExecCommand`|fn||298-303|export async function runExecCommand(|
|`runDoctor`|fn||327-412|export async function runDoctor(|
|`semaphore`|fn||586-598|const semaphore = async (tasks: (() => Promise<void>)[], ...|


---

# config.ts | TypeScript | 194L | 2 symbols | 20 imports | 2 comments
> Path: `src/config.ts`

## Imports
```
import { Logger } from "./index.js";
import { ToolConfig } from "./core/BaseMcpServer.js";
import { SearchNearby, SearchNearbyParams } from "./tools/maps/searchNearby.js";
import { PlaceDetails, PlaceDetailsParams } from "./tools/maps/placeDetails.js";
import { Geocode, GeocodeParams } from "./tools/maps/geocode.js";
import { ReverseGeocode, ReverseGeocodeParams } from "./tools/maps/reverseGeocode.js";
import { DistanceMatrix, DistanceMatrixParams } from "./tools/maps/distanceMatrix.js";
import { Directions, DirectionsParams } from "./tools/maps/directions.js";
import { Elevation, ElevationParams } from "./tools/maps/elevation.js";
import { SearchPlaces, SearchPlacesParams } from "./tools/maps/searchPlaces.js";
import { Timezone, TimezoneParams } from "./tools/maps/timezone.js";
import { Weather, WeatherParams } from "./tools/maps/weather.js";
import { ExploreArea, ExploreAreaParams } from "./tools/maps/exploreArea.js";
import { PlanRoute, PlanRouteParams } from "./tools/maps/planRoute.js";
import { ComparePlaces, ComparePlacesParams } from "./tools/maps/comparePlaces.js";
import { AirQuality, AirQualityParams } from "./tools/maps/airQuality.js";
import { StaticMap, StaticMapParams } from "./tools/maps/staticMap.js";
import { BatchGeocode, BatchGeocodeParams } from "./tools/maps/batchGeocode.js";
import { SearchAlongRoute, SearchAlongRouteParams } from "./tools/maps/searchAlongRoute.js";
import { LocalRankTracker, LocalRankTrackerParams } from "./tools/maps/localRankTracker.js";
```

## Definitions

### iface `interface ServerInstanceConfig` (L32-36)

### fn `export function filterTools(tools: ToolConfig[]): ToolConfig[]` (L173-192)

## Symbol Index
|Symbol|Kind|Vis|Lines|Sig|
|---|---|---|---|---|
|`ServerInstanceConfig`|iface||32-36|interface ServerInstanceConfig|
|`filterTools`|fn||173-192|export function filterTools(tools: ToolConfig[]): ToolCon...|


---

# BaseMcpServer.ts | TypeScript | 225L | 4 symbols | 12 imports | 23 comments
> Path: `src/core/BaseMcpServer.ts`

## Imports
```
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import { isInitializeRequest, ToolAnnotations } from "@modelcontextprotocol/sdk/types.js";
import express, { Request, Response } from "express";
import { Server } from "http";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { Logger } from "../index.js";
import { ApiKeyManager } from "../utils/apiKeyManager.js";
import { runWithContext } from "../utils/requestContext.js";
```

## Definitions

### iface `export interface ToolConfig` (L17-23)

### iface `export interface SessionContext` (L25-28)

### class `export class BaseMcpServer` (L30-226)
- fn `const handleSessionRequest = async (req: Request, res: Response) =>` (L149-169)

## Symbol Index
|Symbol|Kind|Vis|Lines|Sig|
|---|---|---|---|---|
|`ToolConfig`|iface||17-23|export interface ToolConfig|
|`SessionContext`|iface||25-28|export interface SessionContext|
|`BaseMcpServer`|class||30-226|export class BaseMcpServer|
|`BaseMcpServer.handleSessionRequest`|fn||149-169|const handleSessionRequest = async (req: Request, res: Re...|


---

# index.ts | TypeScript | 11L | 0 symbols | 0 imports | 0 comments
> Path: `src/index.ts`


---

# NewPlacesService.ts | TypeScript | 660L | 3 symbols | 2 imports | 30 comments
> Path: `src/services/NewPlacesService.ts`

## Imports
```
import { PlacesClient } from "@googlemaps/places";
import { Logger } from "../index.js";
```

## Definitions

### class `export class NewPlacesService` (L4-303)

### fn `const toDayNumber = (value: any): number | undefined =>` (L561-572)

### fn `const toMinutes = (time: any): number | undefined =>` (L574-587)

## Symbol Index
|Symbol|Kind|Vis|Lines|Sig|
|---|---|---|---|---|
|`NewPlacesService`|class||4-303|export class NewPlacesService|
|`toDayNumber`|fn||561-572|const toDayNumber = (value: any): number | undefined =>|
|`toMinutes`|fn||574-587|const toMinutes = (time: any): number | undefined =>|


---

# PlacesSearcher.ts | TypeScript | 996L | 15 symbols | 3 imports | 33 comments
> Path: `src/services/PlacesSearcher.ts`

## Imports
```
import { GoogleMapsTools } from "./toolclass.js";
import { NewPlacesService } from "./NewPlacesService.js";
import {
```

## Definitions

### iface `interface SearchResponse` (L12-20)

### iface `interface PlaceDetailsResponse` (L22-27)

### iface `interface GeocodeResponse` (L29-37)

### iface `interface ReverseGeocodeResponse` (L39-47)

### iface `interface DistanceMatrixResponse` (L49-58)

### iface `interface DirectionsResponse` (L60-69)

### iface `interface TimezoneResponse` (L71-81)

### iface `interface WeatherResponse` (L83-87)

### iface `interface StaticMapResponse` (L89-97)

### iface `interface AirQualityResponse` (L99-103)

### iface `interface ElevationResponse` (L105-112)

### iface `interface ResolvedLocation` (L114-120)

### fn `function parseCoordinateInput(input: string): { lat: number; lng: number } | null` (L125-139)

### fn `function toRouteWaypoint(loc: ResolvedLocation): RouteWaypoint` (L145-150)

### class `export class PlacesSearcher` (L152-451)

## Symbol Index
|Symbol|Kind|Vis|Lines|Sig|
|---|---|---|---|---|
|`SearchResponse`|iface||12-20|interface SearchResponse|
|`PlaceDetailsResponse`|iface||22-27|interface PlaceDetailsResponse|
|`GeocodeResponse`|iface||29-37|interface GeocodeResponse|
|`ReverseGeocodeResponse`|iface||39-47|interface ReverseGeocodeResponse|
|`DistanceMatrixResponse`|iface||49-58|interface DistanceMatrixResponse|
|`DirectionsResponse`|iface||60-69|interface DirectionsResponse|
|`TimezoneResponse`|iface||71-81|interface TimezoneResponse|
|`WeatherResponse`|iface||83-87|interface WeatherResponse|
|`StaticMapResponse`|iface||89-97|interface StaticMapResponse|
|`AirQualityResponse`|iface||99-103|interface AirQualityResponse|
|`ElevationResponse`|iface||105-112|interface ElevationResponse|
|`ResolvedLocation`|iface||114-120|interface ResolvedLocation|
|`parseCoordinateInput`|fn||125-139|function parseCoordinateInput(input: string): { lat: numb...|
|`toRouteWaypoint`|fn||145-150|function toRouteWaypoint(loc: ResolvedLocation): RouteWay...|
|`PlacesSearcher`|class||152-451|export class PlacesSearcher|


---

# RoutesService.ts | TypeScript | 385L | 9 symbols | 1 imports | 20 comments
> Path: `src/services/RoutesService.ts`

## Imports
```
import { Logger } from "../index.js";
```

## Definitions

### fn `export function parseDuration(duration: string | undefined): number` (L39-43)

### fn `export function formatDistance(meters: number): string` (L48-53)

### fn `export function formatDuration(seconds: number): string` (L58-68)

- type `export type RouteWaypoint = { latLng: { latitude: number; longitude: number } } | { placeId: string };` (L72)
- type `export type WaypointInput = string | RouteWaypoint;` (L73)
### fn `function describeWaypoint(waypoint: WaypointInput): string` (L78-86)

### fn `function toWaypoint(location: WaypointInput): any` (L95-111)

### fn `function buildRouteModifiers(params: { avoidTolls?: boolean; avoidHighways?: boolean }, travelMode: string): any` (L113-132)

### class `export class RoutesService` (L140-385)

## Symbol Index
|Symbol|Kind|Vis|Lines|Sig|
|---|---|---|---|---|
|`parseDuration`|fn||39-43|export function parseDuration(duration: string | undefine...|
|`formatDistance`|fn||48-53|export function formatDistance(meters: number): string|
|`formatDuration`|fn||58-68|export function formatDuration(seconds: number): string|
|`RouteWaypoint`|type||72||
|`WaypointInput`|type||73||
|`describeWaypoint`|fn||78-86|function describeWaypoint(waypoint: WaypointInput): string|
|`toWaypoint`|fn||95-111|function toWaypoint(location: WaypointInput): any|
|`buildRouteModifiers`|fn||113-132|function buildRouteModifiers(params: { avoidTolls?: boole...|
|`RoutesService`|class||140-385|export class RoutesService|


---

# toolclass.ts | TypeScript | 531L | 3 symbols | 4 imports | 12 comments
> Path: `src/services/toolclass.ts`

## Imports
```
import { Client, Language } from "@googlemaps/google-maps-services-js";
import dotenv from "dotenv";
import { Logger } from "../index.js";
import { RoutesService } from "./RoutesService.js";
```

## Definitions

### iface `interface GeocodeResult` (L8-13)

### fn `function extractErrorMessage(error: any): string` (L18-50)

### class `export class GoogleMapsTools` (L52-351)

## Symbol Index
|Symbol|Kind|Vis|Lines|Sig|
|---|---|---|---|---|
|`GeocodeResult`|iface||8-13|interface GeocodeResult|
|`extractErrorMessage`|fn||18-50|function extractErrorMessage(error: any): string|
|`GoogleMapsTools`|class||52-351|export class GoogleMapsTools|


---

# airQuality.ts | TypeScript | 60L | 2 symbols | 3 imports | 0 comments
> Path: `src/tools/maps/airQuality.ts`

## Imports
```
import { z } from "zod";
import { PlacesSearcher } from "../../services/PlacesSearcher.js";
import { getCurrentApiKey } from "../../utils/requestContext.js";
```

## Definitions

- type `export type AirQualityParams = z.infer<z.ZodObject<typeof SCHEMA>>;` (L22)
### fn `async function ACTION(params: any): Promise<{ content: any[]; isError?: boolean }>` (L24-53)

## Symbol Index
|Symbol|Kind|Vis|Lines|Sig|
|---|---|---|---|---|
|`AirQualityParams`|type||22||
|`ACTION`|fn||24-53|async function ACTION(params: any): Promise<{ content: an...|


---

# batchGeocode.ts | TypeScript | 58L | 2 symbols | 3 imports | 0 comments
> Path: `src/tools/maps/batchGeocode.ts`

## Imports
```
import { z } from "zod";
import { PlacesSearcher } from "../../services/PlacesSearcher.js";
import { getCurrentApiKey } from "../../utils/requestContext.js";
```

## Definitions

- type `export type BatchGeocodeParams = z.infer<z.ZodObject<typeof SCHEMA>>;` (L13)
### fn `async function ACTION(params: any): Promise<{ content: any[]; isError?: boolean }>` (L15-51)

## Symbol Index
|Symbol|Kind|Vis|Lines|Sig|
|---|---|---|---|---|
|`BatchGeocodeParams`|type||13||
|`ACTION`|fn||15-51|async function ACTION(params: any): Promise<{ content: an...|


---

# comparePlaces.ts | TypeScript | 41L | 2 symbols | 3 imports | 0 comments
> Path: `src/tools/maps/comparePlaces.ts`

## Imports
```
import { z } from "zod";
import { PlacesSearcher } from "../../services/PlacesSearcher.js";
import { getCurrentApiKey } from "../../utils/requestContext.js";
```

## Definitions

- type `export type ComparePlacesParams = z.infer<z.ZodObject<typeof SCHEMA>>;` (L21)
### fn `async function ACTION(params: any): Promise<{ content: any[]; isError?: boolean }>` (L23-39)

## Symbol Index
|Symbol|Kind|Vis|Lines|Sig|
|---|---|---|---|---|
|`ComparePlacesParams`|type||21||
|`ACTION`|fn||23-39|async function ACTION(params: any): Promise<{ content: an...|


---

# directions.ts | TypeScript | 75L | 2 symbols | 3 imports | 1 comments
> Path: `src/tools/maps/directions.ts`

## Imports
```
import { z } from "zod";
import { PlacesSearcher } from "../../services/PlacesSearcher.js";
import { getCurrentApiKey } from "../../utils/requestContext.js";
```

## Definitions

- type `export type DirectionsParams = z.infer<z.ZodObject<typeof SCHEMA>>;` (L28)
### fn `async function ACTION(params: any): Promise<{ content: any[]; isError?: boolean }>` (L30-68)

## Symbol Index
|Symbol|Kind|Vis|Lines|Sig|
|---|---|---|---|---|
|`DirectionsParams`|type||28||
|`ACTION`|fn||30-68|async function ACTION(params: any): Promise<{ content: an...|


---

# distanceMatrix.ts | TypeScript | 78L | 2 symbols | 3 imports | 1 comments
> Path: `src/tools/maps/distanceMatrix.ts`

## Imports
```
import { z } from "zod";
import { PlacesSearcher } from "../../services/PlacesSearcher.js";
import { getCurrentApiKey } from "../../utils/requestContext.js";
```

## Definitions

- type `export type DistanceMatrixParams = z.infer<z.ZodObject<typeof SCHEMA>>;` (L32)
### fn `async function ACTION(params: any): Promise<{ content: any[]; isError?: boolean }>` (L34-71)

## Symbol Index
|Symbol|Kind|Vis|Lines|Sig|
|---|---|---|---|---|
|`DistanceMatrixParams`|type||32||
|`ACTION`|fn||34-71|async function ACTION(params: any): Promise<{ content: an...|


---

# elevation.ts | TypeScript | 59L | 2 symbols | 3 imports | 1 comments
> Path: `src/tools/maps/elevation.ts`

## Imports
```
import { z } from "zod";
import { PlacesSearcher } from "../../services/PlacesSearcher.js";
import { getCurrentApiKey } from "../../utils/requestContext.js";
```

## Definitions

- type `export type ElevationParams = z.infer<z.ZodObject<typeof SCHEMA>>;` (L20)
### fn `async function ACTION(params: any): Promise<{ content: any[]; isError?: boolean }>` (L22-52)

## Symbol Index
|Symbol|Kind|Vis|Lines|Sig|
|---|---|---|---|---|
|`ElevationParams`|type||20||
|`ACTION`|fn||22-52|async function ACTION(params: any): Promise<{ content: an...|


---

# exploreArea.ts | TypeScript | 41L | 2 symbols | 3 imports | 0 comments
> Path: `src/tools/maps/exploreArea.ts`

## Imports
```
import { z } from "zod";
import { PlacesSearcher } from "../../services/PlacesSearcher.js";
import { getCurrentApiKey } from "../../utils/requestContext.js";
```

## Definitions

- type `export type ExploreAreaParams = z.infer<z.ZodObject<typeof SCHEMA>>;` (L21)
### fn `async function ACTION(params: any): Promise<{ content: any[]; isError?: boolean }>` (L23-39)

## Symbol Index
|Symbol|Kind|Vis|Lines|Sig|
|---|---|---|---|---|
|`ExploreAreaParams`|type||21||
|`ACTION`|fn||23-39|async function ACTION(params: any): Promise<{ content: an...|


---

# geocode.ts | TypeScript | 52L | 2 symbols | 3 imports | 1 comments
> Path: `src/tools/maps/geocode.ts`

## Imports
```
import { z } from "zod";
import { PlacesSearcher } from "../../services/PlacesSearcher.js";
import { getCurrentApiKey } from "../../utils/requestContext.js";
```

## Definitions

- type `export type GeocodeParams = z.infer<z.ZodObject<typeof SCHEMA>>;` (L13)
### fn `async function ACTION(params: any): Promise<{ content: any[]; isError?: boolean }>` (L15-45)

## Symbol Index
|Symbol|Kind|Vis|Lines|Sig|
|---|---|---|---|---|
|`GeocodeParams`|type||13||
|`ACTION`|fn||15-45|async function ACTION(params: any): Promise<{ content: an...|


---

# localRankTracker.ts | TypeScript | 91L | 2 symbols | 3 imports | 1 comments
> Path: `src/tools/maps/localRankTracker.ts`

## Imports
```
import { z } from "zod";
import { PlacesSearcher } from "../../services/PlacesSearcher.js";
import { getCurrentApiKey } from "../../utils/requestContext.js";
```

## Definitions

- type `export type LocalRankTrackerParams = z.infer<z.ZodObject<typeof SCHEMA>>;` (L44)
### fn `async function ACTION(params: any): Promise<{ content: any[]; isError?: boolean }>` (L46-84)

## Symbol Index
|Symbol|Kind|Vis|Lines|Sig|
|---|---|---|---|---|
|`LocalRankTrackerParams`|type||44||
|`ACTION`|fn||46-84|async function ACTION(params: any): Promise<{ content: an...|


---

# placeDetails.ts | TypeScript | 67L | 2 symbols | 3 imports | 0 comments
> Path: `src/tools/maps/placeDetails.ts`

## Imports
```
import { z } from "zod";
import { PlacesSearcher } from "../../services/PlacesSearcher.js";
import { getCurrentApiKey } from "../../utils/requestContext.js";
```

## Definitions

- type `export type PlaceDetailsParams = z.infer<z.ZodObject<typeof SCHEMA>>;` (L26)
### fn `async function ACTION(params: any): Promise<{ content: any[]; isError?: boolean }>` (L28-60)

## Symbol Index
|Symbol|Kind|Vis|Lines|Sig|
|---|---|---|---|---|
|`PlaceDetailsParams`|type||26||
|`ACTION`|fn||28-60|async function ACTION(params: any): Promise<{ content: an...|


---

# planRoute.ts | TypeScript | 52L | 2 symbols | 3 imports | 0 comments
> Path: `src/tools/maps/planRoute.ts`

## Imports
```
import { z } from "zod";
import { PlacesSearcher } from "../../services/PlacesSearcher.js";
import { getCurrentApiKey } from "../../utils/requestContext.js";
```

## Definitions

- type `export type PlanRouteParams = z.infer<z.ZodObject<typeof SCHEMA>>;` (L32)
### fn `async function ACTION(params: any): Promise<{ content: any[]; isError?: boolean }>` (L34-50)

## Symbol Index
|Symbol|Kind|Vis|Lines|Sig|
|---|---|---|---|---|
|`PlanRouteParams`|type||32||
|`ACTION`|fn||34-50|async function ACTION(params: any): Promise<{ content: an...|


---

# reverseGeocode.ts | TypeScript | 53L | 2 symbols | 3 imports | 1 comments
> Path: `src/tools/maps/reverseGeocode.ts`

## Imports
```
import { z } from "zod";
import { PlacesSearcher } from "../../services/PlacesSearcher.js";
import { getCurrentApiKey } from "../../utils/requestContext.js";
```

## Definitions

- type `export type ReverseGeocodeParams = z.infer<z.ZodObject<typeof SCHEMA>>;` (L14)
### fn `async function ACTION(params: any): Promise<{ content: any[]; isError?: boolean }>` (L16-46)

## Symbol Index
|Symbol|Kind|Vis|Lines|Sig|
|---|---|---|---|---|
|`ReverseGeocodeParams`|type||14||
|`ACTION`|fn||16-46|async function ACTION(params: any): Promise<{ content: an...|


---

# searchAlongRoute.ts | TypeScript | 53L | 2 symbols | 3 imports | 0 comments
> Path: `src/tools/maps/searchAlongRoute.ts`

## Imports
```
import { z } from "zod";
import { PlacesSearcher } from "../../services/PlacesSearcher.js";
import { getCurrentApiKey } from "../../utils/requestContext.js";
```

## Definitions

- type `export type SearchAlongRouteParams = z.infer<z.ZodObject<typeof SCHEMA>>;` (L20)
### fn `async function ACTION(params: any): Promise<{ content: any[]; isError?: boolean }>` (L22-46)

## Symbol Index
|Symbol|Kind|Vis|Lines|Sig|
|---|---|---|---|---|
|`SearchAlongRouteParams`|type||20||
|`ACTION`|fn||22-46|async function ACTION(params: any): Promise<{ content: an...|


---

# searchNearby.ts | TypeScript | 64L | 2 symbols | 3 imports | 1 comments
> Path: `src/tools/maps/searchNearby.ts`

## Imports
```
import { z } from "zod";
import { PlacesSearcher } from "../../services/PlacesSearcher.js";
import { getCurrentApiKey } from "../../utils/requestContext.js";
```

## Definitions

- type `export type SearchNearbyParams = z.infer<z.ZodObject<typeof SCHEMA>>;` (L25)
### fn `async function ACTION(params: SearchNearbyParams): Promise<{ content: any[]; isError?: boolean }>` (L27-57)

## Symbol Index
|Symbol|Kind|Vis|Lines|Sig|
|---|---|---|---|---|
|`SearchNearbyParams`|type||25||
|`ACTION`|fn||27-57|async function ACTION(params: SearchNearbyParams): Promis...|


---

# searchPlaces.ts | TypeScript | 124L | 2 symbols | 3 imports | 0 comments
> Path: `src/tools/maps/searchPlaces.ts`

## Imports
```
import { z } from "zod";
import { PlacesSearcher } from "../../services/PlacesSearcher.js";
import { getCurrentApiKey } from "../../utils/requestContext.js";
```

## Definitions

- type `export type SearchPlacesParams = z.infer<z.ZodObject<typeof SCHEMA>>;` (L67)
### fn `async function ACTION(params: any): Promise<{ content: any[]; isError?: boolean }>` (L69-117)

## Symbol Index
|Symbol|Kind|Vis|Lines|Sig|
|---|---|---|---|---|
|`SearchPlacesParams`|type||67||
|`ACTION`|fn||69-117|async function ACTION(params: any): Promise<{ content: an...|


---

# staticMap.ts | TypeScript | 74L | 2 symbols | 3 imports | 0 comments
> Path: `src/tools/maps/staticMap.ts`

## Imports
```
import { z } from "zod";
import { PlacesSearcher } from "../../services/PlacesSearcher.js";
import { getCurrentApiKey } from "../../utils/requestContext.js";
```

## Definitions

- type `export type StaticMapParams = z.infer<z.ZodObject<typeof SCHEMA>>;` (L31)
### fn `async function ACTION(params: any): Promise<{ content: any[]; isError?: boolean }>` (L33-67)

## Symbol Index
|Symbol|Kind|Vis|Lines|Sig|
|---|---|---|---|---|
|`StaticMapParams`|type||31||
|`ACTION`|fn||33-67|async function ACTION(params: any): Promise<{ content: an...|


---

# timezone.ts | TypeScript | 51L | 2 symbols | 3 imports | 0 comments
> Path: `src/tools/maps/timezone.ts`

## Imports
```
import { z } from "zod";
import { PlacesSearcher } from "../../services/PlacesSearcher.js";
import { getCurrentApiKey } from "../../utils/requestContext.js";
```

## Definitions

- type `export type TimezoneParams = z.infer<z.ZodObject<typeof SCHEMA>>;` (L18)
### fn `async function ACTION(params: any): Promise<{ content: any[]; isError?: boolean }>` (L20-44)

## Symbol Index
|Symbol|Kind|Vis|Lines|Sig|
|---|---|---|---|---|
|`TimezoneParams`|type||18||
|`ACTION`|fn||20-44|async function ACTION(params: any): Promise<{ content: an...|


---

# weather.ts | TypeScript | 62L | 2 symbols | 3 imports | 0 comments
> Path: `src/tools/maps/weather.ts`

## Imports
```
import { z } from "zod";
import { PlacesSearcher } from "../../services/PlacesSearcher.js";
import { getCurrentApiKey } from "../../utils/requestContext.js";
```

## Definitions

- type `export type WeatherParams = z.infer<z.ZodObject<typeof SCHEMA>>;` (L23)
### fn `async function ACTION(params: any): Promise<{ content: any[]; isError?: boolean }>` (L25-55)

## Symbol Index
|Symbol|Kind|Vis|Lines|Sig|
|---|---|---|---|---|
|`WeatherParams`|type||23||
|`ACTION`|fn||25-55|async function ACTION(params: any): Promise<{ content: an...|


---

# apiKeyManager.ts | TypeScript | 72L | 1 symbols | 1 imports | 11 comments
> Path: `src/utils/apiKeyManager.ts`

## Imports
```
import { Request } from "express";
```

## Definitions

### class `export class ApiKeyManager` (L3-72)

## Symbol Index
|Symbol|Kind|Vis|Lines|Sig|
|---|---|---|---|---|
|`ApiKeyManager`|class||3-72|export class ApiKeyManager|


---

# autoUpdate.ts | TypeScript | 192L | 7 symbols | 1 imports | 22 comments
> Path: `src/utils/autoUpdate.ts`

## Imports
```
import { Logger } from "../index.js";
```

## Definitions

### iface `export interface AutoUpdateLogger` (L33-38)
- @brief Minimal logger contract consumed by the update check.
- @details Structural subset of `Logger` (`src/index.ts`); injectable so tests
capture diagnostics without touching stderr.
- @param args {unknown[]} Diagnostic fragments joined for stderr output.
- @param args {unknown[]} Error diagnostic fragments for stderr output.

### iface `export interface AutoUpdateCheckerDeps` (L46-61)
- @brief Dependency injection surface of `checkForUpdates`.
- @details Every field is optional; omitted fields resolve to production
defaults (`process.env`, global `fetch`, `Logger`). Injection exists to keep
unit tests deterministic and network-free (TST-011).

### iface `export interface AutoUpdateResult` (L64-69)

### fn `export function isAutoUpdateDisabled(` (L81-86)
- @brief Evaluates the disable flag for the automatic update check.
- @details Reads `AUTO_UPDATE_DISABLED_ENV` from the given environment map and
matches values `1`, `true`, `yes` case-insensitively after trimming; any
other value (including unset, empty, `0`, `false`) keeps the check enabled.
- @param env {Record<string, string | undefined>} Environment map to inspect. Defaults to `process.env`.
- @return {boolean} True when the update check is disabled; false when enabled.
- @note Complexity: O(1). Pure; no side effects.
- @satisfies REQ-083

### fn `export function isNewerVersion(candidate: string, current: string): boolean` (L100-123)
- @brief Compares two dotted numeric version strings.
- @details Splits both inputs on `.` into integer segments, right-pads the
shorter sequence with zeroes, and returns on the first differing segment.
Any non-integer segment (e.g. prerelease suffix `3-beta.1`) forces False, so
unparseable or prerelease candidates never trigger an update notice.
- @param candidate {string} Version reported as available (latest).
- @param current {string} Version currently running.
- @return {boolean} True only when `candidate` is strictly newer than `current`.
- @note Complexity: O(k) where k is the number of dotted segments. Pure; no side effects.
- @satisfies REQ-084

### fn `const toSegments = (version: string): number[] =>` (L101-113)

### fn `export async function checkForUpdates(` (L142-143)
- @brief Runs the automatic update check against the npm registry.
- @details Resolution order: disabled-flag short-circuit (REQ-083, zero
network calls) → running-version guard (missing `currentVersion` aborts with
an stderr diagnostic, zero network calls) → single `GET {registry}/{package}/latest`
with `timeoutMs` deadline → `response.ok` and `payload.version` validation →
`isNewerVersion` gate → stderr upgrade notice (REQ-084). Every failure path
(disabled, missing version, non-OK status, malformed payload, network error)
returns null, logs to stderr only, and never throws (REQ-085).
- @param deps {AutoUpdateCheckerDeps} Optional dependency overrides; production defaults when omitted.
- @return {Promise<AutoUpdateResult | null>} `{ currentVersion, latestVersion }` when a strictly newer version is published; null otherwise.
- @warning Must be invoked fire-and-forget (`void checkForUpdates(...)`) so server startup is never awaited on it (REQ-085).
- @note Complexity: O(k) in version segments plus one HTTP round-trip bounded by `timeoutMs`.
- @see isAutoUpdateDisabled
- @see isNewerVersion
- @satisfies REQ-082, REQ-083, REQ-084, REQ-085

## Symbol Index
|Symbol|Kind|Vis|Lines|Sig|
|---|---|---|---|---|
|`AutoUpdateLogger`|iface||33-38|export interface AutoUpdateLogger|
|`AutoUpdateCheckerDeps`|iface||46-61|export interface AutoUpdateCheckerDeps|
|`AutoUpdateResult`|iface||64-69|export interface AutoUpdateResult|
|`isAutoUpdateDisabled`|fn||81-86|export function isAutoUpdateDisabled(|
|`isNewerVersion`|fn||100-123|export function isNewerVersion(candidate: string, current...|
|`toSegments`|fn||101-113|const toSegments = (version: string): number[] =>|
|`checkForUpdates`|fn||142-143|export async function checkForUpdates(|


---

# requestContext.ts | TypeScript | 24L | 3 symbols | 1 imports | 3 comments
> Path: `src/utils/requestContext.ts`

## Imports
```
import { AsyncLocalStorage } from "node:async_hooks";
```

## Definitions

### iface `interface RequestContext` (L3-6)

### fn `export function getCurrentApiKey(): string | undefined` (L14-17)

### fn `export function runWithContext<T>(context: RequestContext, fn: () => T | Promise<T>): T | Promise<T>` (L22-24)

## Symbol Index
|Symbol|Kind|Vis|Lines|Sig|
|---|---|---|---|---|
|`RequestContext`|iface||3-6|interface RequestContext|
|`getCurrentApiKey`|fn||14-17|export function getCurrentApiKey(): string | undefined|
|`runWithContext`|fn||22-24|export function runWithContext<T>(context: RequestContext...|

