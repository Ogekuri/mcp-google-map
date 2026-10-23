import { z } from "zod";
import { PlacesSearcher } from "../../services/PlacesSearcher.js";
import { getCurrentApiKey } from "../../utils/requestContext.js";

const NAME = "maps_search_places";
const DESCRIPTION =
  "Search for places using a free-text query like 'sushi restaurants in Tokyo' or 'best coffee shops near Central Park'. More flexible than search_nearby — supports natural language queries, optional location bias, server-side rating and cumulative price-level filters (Places API Text Search priceLevels enum), strict type filtering, and open-now filtering. Returns place details including priceRange (raw Money structure), types, businessStatus, rating, userRatingCount and opening hours. Supports pageSize/pageToken pagination (up to 20 per page) and an optional includeRaw mode that attaches the original Places API payload for API-verified validation.";

const PRICE_LEVELS = [
  "PRICE_LEVEL_FREE",
  "PRICE_LEVEL_INEXPENSIVE",
  "PRICE_LEVEL_MODERATE",
  "PRICE_LEVEL_EXPENSIVE",
  "PRICE_LEVEL_VERY_EXPENSIVE",
] as const;

const SCHEMA = {
  query: z.string().describe("Text search query (e.g., 'Italian restaurants in Manhattan', 'hotels near Taipei 101')"),
  locationBias: z
    .object({
      latitude: z.number().describe("Latitude to bias results toward"),
      longitude: z.number().describe("Longitude to bias results toward"),
      radius: z.number().optional().describe("Bias radius in meters (default: 5000)"),
    })
    .optional()
    .describe("Optional location to bias results toward"),
  openNow: z.boolean().optional().describe("Only return places that are currently open (server-side filter)"),
  minRating: z.number().optional().describe("Minimum rating filter (1.0 - 5.0), applied server-side by the API"),
  includedType: z
    .string()
    .optional()
    .describe(
      "Filter by a single place type (e.g., restaurant, cafe, bakery). Text Search supports exactly one includedType per call"
    ),
  strictTypeFiltering: z
    .boolean()
    .optional()
    .describe(
      "Strict type filtering: if true, only results of the same type as includedType are returned (default: loose interpretation)"
    ),
  priceLevels: z
    .array(z.enum(PRICE_LEVELS))
    .optional()
    .describe(
      'Server-side economic filter. Pass ALL allowed levels cumulatively up to the budget cap, e.g. budget 30 EUR -> ["PRICE_LEVEL_INEXPENSIVE", "PRICE_LEVEL_MODERATE"]. Do not include PRICE_LEVEL_FREE'
    ),
  pageSize: z
    .number()
    .int()
    .min(1)
    .max(20)
    .optional()
    .describe("Number of results per page (1-20). Use nextPageToken from the response to fetch further pages (up to 60 total)"),
  pageToken: z
    .string()
    .optional()
    .describe("nextPageToken returned by a previous maps_search_places call, to retrieve the next page of results"),
  languageCode: z.string().optional().describe("Language code for results (e.g., 'en', 'it', 'ja')"),
  includeRaw: z
    .boolean()
    .optional()
    .describe(
      "Include the original Places API payload: each result gets a raw_place field and the full raw_response is returned (for API-verified validation)"
    ),
};

export type SearchPlacesParams = z.infer<z.ZodObject<typeof SCHEMA>>;

async function ACTION(params: any): Promise<{ content: any[]; isError?: boolean }> {
  try {
    const apiKey = getCurrentApiKey();
    const placesSearcher = new PlacesSearcher(apiKey);
    const result = await placesSearcher.searchText({
      query: params.query,
      locationBias: params.locationBias,
      openNow: params.openNow,
      minRating: params.minRating,
      includedType: params.includedType,
      strictTypeFiltering: params.strictTypeFiltering,
      priceLevels: params.priceLevels,
      pageSize: params.pageSize,
      pageToken: params.pageToken,
      languageCode: params.languageCode,
      includeRaw: params.includeRaw,
    });

    if (!result.success) {
      return {
        content: [{ type: "text", text: result.error || "Failed to search places" }],
        isError: true,
      };
    }

    const payload: Record<string, any> = {
      results: result.data,
    };
    if (result.nextPageToken) payload.nextPageToken = result.nextPageToken;
    if (result.fieldMask) payload.field_mask = result.fieldMask;
    if (params.includeRaw && result.raw_response) payload.raw_response = result.raw_response;

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(payload, null, 2),
        },
      ],
      isError: false,
    };
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
    return {
      isError: true,
      content: [{ type: "text", text: `Error searching places: ${errorMessage}` }],
    };
  }
}

export const SearchPlaces = {
  NAME,
  DESCRIPTION,
  SCHEMA,
  ACTION,
};
