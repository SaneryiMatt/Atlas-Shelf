import { z } from "zod";

export const metadataKindSchema = z.enum(["book", "movie", "travel"]);

export const metadataRouteRequestSchema = z.object({
  kind: metadataKindSchema,
  query: z.string().trim().min(2).max(120)
});

const metadataBaseCandidateSchema = z.object({
  id: z.string().min(1),
  title: z.string().trim().min(1).max(160),
  subtitle: z.string().trim().max(160).nullable(),
  confidence: z.number().min(0).max(1),
  source: z.literal("openrouter")
});

export const bookMetadataCandidateSchema = metadataBaseCandidateSchema.extend({
  kind: z.literal("book"),
  author: z.string().trim().max(120).nullable(),
  summary: z.string().trim().max(280).nullable(),
  tags: z.array(z.string().trim().min(1).max(20)).max(3)
});

export const movieMetadataCandidateSchema = metadataBaseCandidateSchema.extend({
  kind: z.literal("movie"),
  director: z.string().trim().max(120).nullable(),
  releaseYear: z.string().regex(/^\d{4}$/).nullable(),
  platform: z.string().trim().max(120).nullable(),
  note: z.string().trim().max(280).nullable(),
  tags: z.array(z.string().trim().min(1).max(20)).max(3)
});

export const travelMetadataCandidateSchema = metadataBaseCandidateSchema.extend({
  kind: z.literal("travel"),
  country: z.string().trim().max(120).nullable(),
  city: z.string().trim().max(120).nullable(),
  description: z.string().trim().max(280).nullable()
});

export const metadataCandidateSchema = z.discriminatedUnion("kind", [
  bookMetadataCandidateSchema,
  movieMetadataCandidateSchema,
  travelMetadataCandidateSchema
]);

export const metadataResponseReasonSchema = z.enum(["timeout", "length", "parse_failed", "upstream_error"]);

export const metadataRouteResponseSchema = z.object({
  status: z.enum(["ok", "disabled", "error"]).default("ok"),
  candidates: z.array(metadataCandidateSchema).max(3),
  autoApplyCandidateId: z.string().nullable(),
  reason: metadataResponseReasonSchema.nullable().default(null)
});

function normalizeRequiredText(value: unknown) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}

function normalizeNullableText(value: unknown) {
  if (value === null || value === undefined) {
    return null;
  }

  const normalized = String(value).trim();
  return normalized || null;
}

function normalizeConfidenceValue(value: unknown) {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim();

    if (!normalized) {
      return Number.NaN;
    }

    if (normalized.endsWith("%")) {
      return Number(normalized.slice(0, -1)) / 100;
    }

    return Number(normalized);
  }

  return value;
}

function normalizeReleaseYearValue(value: unknown) {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "number") {
    return value;
  }

  const normalized = String(value).trim();

  if (!normalized) {
    return null;
  }

  const matchedYear = normalized.match(/\b(18\d{2}|19\d{2}|20\d{2}|2100)\b/);
  return matchedYear?.[1] ?? normalized;
}

function normalizeTagsValue(value: unknown) {
  if (value === null || value === undefined) {
    return [];
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter(Boolean)
      .slice(0, 3);
  }

  if (typeof value === "string") {
    return value
      .split(/[\u3001\uFF0C,;\/\uFF5C|]/u)
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 3);
  }

  return [];
}

function buildNullableTextSchema(maxLength: number) {
  return z.preprocess(normalizeNullableText, z.string().max(maxLength).nullable());
}

const rawBookCandidateSchema = z.object({
  title: z.preprocess(normalizeRequiredText, z.string().min(1).max(160)),
  subtitle: buildNullableTextSchema(160),
  confidence: z.preprocess(normalizeConfidenceValue, z.number().min(0).max(1)),
  author: buildNullableTextSchema(120),
  summary: buildNullableTextSchema(280),
  tags: z.preprocess(normalizeTagsValue, z.array(z.string().trim().min(1).max(20)).max(3))
});

const rawMovieCandidateSchema = z.object({
  title: z.preprocess(normalizeRequiredText, z.string().min(1).max(160)),
  subtitle: buildNullableTextSchema(160),
  confidence: z.preprocess(normalizeConfidenceValue, z.number().min(0).max(1)),
  director: buildNullableTextSchema(120),
  releaseYear: z.preprocess(
    normalizeReleaseYearValue,
    z.union([z.string().regex(/^\d{4}$/), z.number().int().min(1888).max(2100)]).nullable()
  ),
  platform: buildNullableTextSchema(120),
  note: buildNullableTextSchema(280),
  tags: z.preprocess(normalizeTagsValue, z.array(z.string().trim().min(1).max(20)).max(3))
});

const rawTravelCandidateSchema = z.object({
  title: z.preprocess(normalizeRequiredText, z.string().min(1).max(160)),
  subtitle: buildNullableTextSchema(160),
  confidence: z.preprocess(normalizeConfidenceValue, z.number().min(0).max(1)),
  country: buildNullableTextSchema(120),
  city: buildNullableTextSchema(120),
  description: buildNullableTextSchema(280)
});

export const rawMetadataModelOutputSchemas = {
  book: z.object({
    candidates: z.array(rawBookCandidateSchema).max(3).default([])
  }),
  movie: z.object({
    candidates: z.array(rawMovieCandidateSchema).max(3).default([])
  }),
  travel: z.object({
    candidates: z.array(rawTravelCandidateSchema).max(3).default([])
  })
} as const;

export const metadataStructuredOutputSchemas = {
  book: {
    name: "book_metadata_candidates",
    strict: true,
    schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        candidates: {
          type: "array",
          maxItems: 3,
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              title: { type: "string" },
              subtitle: { type: ["string", "null"] },
              confidence: { type: "number", minimum: 0, maximum: 1 },
              author: { type: ["string", "null"] },
              summary: { type: ["string", "null"] },
              tags: {
                type: "array",
                maxItems: 3,
                items: { type: "string" }
              }
            },
            required: ["title", "subtitle", "confidence", "author", "summary", "tags"]
          }
        }
      },
      required: ["candidates"]
    }
  },
  movie: {
    name: "movie_metadata_candidates",
    strict: true,
    schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        candidates: {
          type: "array",
          maxItems: 3,
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              title: { type: "string" },
              subtitle: { type: ["string", "null"] },
              confidence: { type: "number", minimum: 0, maximum: 1 },
              director: { type: ["string", "null"] },
              releaseYear: { type: ["string", "number", "null"] },
              platform: { type: ["string", "null"] },
              note: { type: ["string", "null"] },
              tags: {
                type: "array",
                maxItems: 3,
                items: { type: "string" }
              }
            },
            required: ["title", "subtitle", "confidence", "director", "releaseYear", "platform", "note", "tags"]
          }
        }
      },
      required: ["candidates"]
    }
  },
  travel: {
    name: "travel_metadata_candidates",
    strict: true,
    schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        candidates: {
          type: "array",
          maxItems: 3,
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              title: { type: "string" },
              subtitle: { type: ["string", "null"] },
              confidence: { type: "number", minimum: 0, maximum: 1 },
              country: { type: ["string", "null"] },
              city: { type: ["string", "null"] },
              description: { type: ["string", "null"] }
            },
            required: ["title", "subtitle", "confidence", "country", "city", "description"]
          }
        }
      },
      required: ["candidates"]
    }
  }
} as const;

export type MetadataKind = z.infer<typeof metadataKindSchema>;
export type MetadataCandidate = z.infer<typeof metadataCandidateSchema>;
export type MetadataResponseReason = z.infer<typeof metadataResponseReasonSchema>;
export type MetadataRouteRequest = z.infer<typeof metadataRouteRequestSchema>;
export type MetadataRouteResponse = z.infer<typeof metadataRouteResponseSchema>;
export type BookMetadataCandidate = z.infer<typeof bookMetadataCandidateSchema>;
export type MovieMetadataCandidate = z.infer<typeof movieMetadataCandidateSchema>;
export type TravelMetadataCandidate = z.infer<typeof travelMetadataCandidateSchema>;
