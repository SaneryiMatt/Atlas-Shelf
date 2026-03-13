import { randomUUID } from "node:crypto";

import { hasOpenRouterApiKey, openRouterMetadataConfig } from "@/lib/env";
import {
  OpenRouterRequestError,
  requestOpenRouterStructuredOutput,
  type OpenRouterStructuredOutputResult
} from "@/lib/metadata/openrouter";
import {
  rawMetadataModelOutputSchemas,
  metadataStructuredOutputSchemas,
  type MetadataCandidate,
  type MetadataKind,
  type MetadataResponseReason
} from "@/lib/metadata/schemas";

interface SearchMetadataCandidatesInput {
  kind: MetadataKind;
  query: string;
}

interface SearchMetadataCandidatesResult {
  status: "ok" | "disabled" | "error";
  candidates: MetadataCandidate[];
  autoApplyCandidateId: string | null;
  reason: MetadataResponseReason | null;
}

interface CachedMetadataResult {
  expiresAt: number;
  result: SearchMetadataCandidatesResult;
}

type MetadataRequestStructuredOutput = typeof requestOpenRouterStructuredOutput;

interface MetadataSearchDependencies {
  hasOpenRouterApiKey: boolean;
  model: string;
  timeoutMs: number;
  maxTokens: number;
  requestStructuredOutput: MetadataRequestStructuredOutput;
  now: () => number;
  cache: Map<string, CachedMetadataResult>;
}

type MetadataAttemptOutcome =
  | {
      kind: "success";
      model: string;
      durationMs: number;
      finishReason: string | null;
      candidates: MetadataCandidate[];
    }
  | {
      kind: "empty";
      model: string;
      durationMs: number;
      finishReason: string | null;
    }
  | {
      kind: "failure";
      model: string;
      durationMs: number;
      finishReason: string | null;
      reason: MetadataResponseReason;
    };

const metadataCache = new Map<string, CachedMetadataResult>();
const metadataCacheTtlMs = 10 * 60 * 1000;
const metadataFailureCacheTtlMs = 45 * 1000;
const placeholderTextValues = new Set(["none", "null", "n/a", "na", "unknown"]);

const defaultMetadataSearchDependencies: MetadataSearchDependencies = {
  hasOpenRouterApiKey,
  model: openRouterMetadataConfig.model,
  timeoutMs: openRouterMetadataConfig.timeoutMs,
  maxTokens: openRouterMetadataConfig.maxTokens,
  requestStructuredOutput: requestOpenRouterStructuredOutput,
  now: () => Date.now(),
  cache: metadataCache
};

const metadataPrompts: Record<MetadataKind, string> = {
  book: [
    "Return JSON only.",
    "Do not add markdown fences or explanations.",
    "Top-level shape: {\"candidates\":[{\"title\":\"\u7ea2\u697c\u68a6\",\"subtitle\":\"\u4e2d\u56fd\u53e4\u5178\u957f\u7bc7\u5c0f\u8bf4\",\"confidence\":0.96,\"author\":\"\u66f9\u96ea\u82b9\",\"summary\":\"\u4ee5\u8d3e\u5b9d\u7389\u3001\u6797\u9edb\u7389\u3001\u859b\u5b9d\u9497\u7b49\u4eba\u7684\u547d\u8fd0\u4e3a\u4e3b\u7ebf\uff0c\u5c55\u73b0\u8d3e\u53f2\u738b\u859b\u56db\u5927\u5bb6\u65cf\u7531\u76db\u8f6c\u8870\u7684\u8fc7\u7a0b\u3002\",\"tags\":[\"\u53e4\u5178\u6587\u5b66\",\"\u5bb6\u65cf\u5174\u8870\",\"\u7231\u60c5\u60b2\u5267\"]}]}.",
    "Return at most 3 real book candidates.",
    "Use Simplified Chinese for all text.",
    "Keep unknown optional fields as null or []."
  ].join(" "),
  movie: [
    "Return JSON only.",
    "Do not add markdown fences or explanations.",
    "Top-level shape: {\"candidates\":[{\"title\":\"\u9738\u738b\u522b\u59ec\",\"subtitle\":\"Farewell My Concubine\",\"confidence\":0.95,\"director\":\"\u9648\u51ef\u6b4c\",\"releaseYear\":1993,\"platform\":\"\u9662\u7ebf / \u6d41\u5a92\u4f53\",\"note\":\"\u4ee5\u620f\u66f2\u4eba\u751f\u6620\u7167\u65f6\u4ee3\u53d8\u8fc1\uff0c\u805a\u7126\u8eab\u4efd\u3001\u60c5\u611f\u4e0e\u547d\u8fd0\u3002\",\"tags\":[\"\u5267\u60c5\",\"\u65f6\u4ee3\",\"\u534e\u8bed\u7ecf\u5178\"]}]}.",
    "Return at most 3 real screen-title candidates.",
    "The scope includes films, TV dramas, TV series, anime, and documentaries.",
    "Use Simplified Chinese for all text.",
    "Keep unknown optional fields as null or []."
  ].join(" "),
  travel: [
    "Return JSON only.",
    "Do not add markdown fences or explanations.",
    "Top-level shape: {\"candidates\":[{\"title\":\"\u4e1c\u4eac\u5854\",\"subtitle\":\"Tokyo Tower\",\"confidence\":0.93,\"country\":\"\u65e5\u672c\",\"city\":\"\u4e1c\u4eac\",\"description\":\"\u4e1c\u4eac\u5730\u6807\u6027\u89c2\u666f\u5854\uff0c\u53ef\u4fef\u77b0\u57ce\u5e02\u5929\u9645\u7ebf\uff0c\u591c\u666f\u5c24\u5176\u70ed\u95e8\u3002\"}]}.",
    "Return at most 3 real travel place candidates.",
    "The place may be a city, scenic area, street, district, or venue.",
    "Use Simplified Chinese for all text.",
    "Keep unknown optional fields as null."
  ].join(" ")
};

function buildUserPrompt(kind: MetadataKind, query: string) {
  if (kind === "book") {
    return `Book title query: ${query}. Return JSON only.`;
  }

  if (kind === "movie") {
    return `Screen title query: ${query}. Return JSON only.`;
  }

  return `Travel place query: ${query}. Return JSON only.`;
}

function isPlaceholderText(value: string | null | undefined) {
  const normalizedValue = value?.trim().toLowerCase() ?? "";

  if (!normalizedValue) {
    return true;
  }

  return placeholderTextValues.has(normalizedValue) || /^[?\uFF1F]+$/u.test(normalizedValue);
}

function normalizeText(value: string | null | undefined) {
  const normalizedValue = value?.trim() ?? "";

  if (!normalizedValue || isPlaceholderText(normalizedValue)) {
    return null;
  }

  return normalizedValue;
}

function normalizeTags(tags: string[]) {
  return Array.from(
    new Set(
      tags
        .map((tag) => normalizeText(tag))
        .filter((tag): tag is string => Boolean(tag))
    )
  ).slice(0, 3);
}

function normalizeComparableText(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\s\p{P}\p{S}]+/gu, "");
}

function getCandidateRelevanceScore(candidate: MetadataCandidate, normalizedQuery: string) {
  if (!normalizedQuery) {
    return 0;
  }

  const normalizedTitle = normalizeComparableText(candidate.title);
  const normalizedSubtitle = normalizeComparableText(candidate.subtitle);

  if (!normalizedTitle) {
    return 0;
  }

  if (normalizedTitle === normalizedQuery) {
    return 4;
  }

  if (normalizedTitle.startsWith(normalizedQuery) || normalizedTitle.endsWith(normalizedQuery)) {
    return 3;
  }

  if (normalizedTitle.includes(normalizedQuery) || normalizedQuery.includes(normalizedTitle)) {
    return 2;
  }

  if (
    normalizedSubtitle &&
    (normalizedSubtitle === normalizedQuery ||
      normalizedSubtitle.includes(normalizedQuery) ||
      normalizedQuery.includes(normalizedSubtitle))
  ) {
    return 1;
  }

  return 0;
}

function sortCandidates(candidates: MetadataCandidate[], query: string) {
  const normalizedQuery = normalizeComparableText(query);
  const rankedCandidates = candidates
    .filter((candidate) => !isPlaceholderText(candidate.title))
    .map((candidate) => ({
      candidate,
      relevanceScore: getCandidateRelevanceScore(candidate, normalizedQuery)
    }));

  const hasStrongMatch = rankedCandidates.some(({ relevanceScore }) => relevanceScore >= 2);
  const filteredCandidates = hasStrongMatch
    ? rankedCandidates.filter(({ relevanceScore }) => relevanceScore > 0)
    : rankedCandidates;

  return filteredCandidates
    .sort((left, right) => {
      if (right.relevanceScore !== left.relevanceScore) {
        return right.relevanceScore - left.relevanceScore;
      }

      if (right.candidate.confidence !== left.candidate.confidence) {
        return right.candidate.confidence - left.candidate.confidence;
      }

      return left.candidate.title.localeCompare(right.candidate.title, "zh-Hans-CN");
    })
    .map(({ candidate }) => candidate)
    .slice(0, 3);
}

function getAutoApplyCandidateId(candidates: MetadataCandidate[]) {
  const candidate = candidates[0];
  return candidate && candidate.confidence >= 0.75 ? candidate.id : null;
}

function getCacheKey(kind: MetadataKind, query: string) {
  return `${kind}:${query.trim().toLowerCase()}`;
}

function getCachedResult(
  cache: Map<string, CachedMetadataResult>,
  now: () => number,
  kind: MetadataKind,
  query: string
) {
  const cacheKey = getCacheKey(kind, query);
  const cached = cache.get(cacheKey);

  if (!cached) {
    return null;
  }

  if (cached.expiresAt <= now()) {
    cache.delete(cacheKey);
    return null;
  }

  return cached.result;
}

function setCachedResult(
  cache: Map<string, CachedMetadataResult>,
  now: () => number,
  kind: MetadataKind,
  query: string,
  result: SearchMetadataCandidatesResult,
  ttlMs: number = metadataCacheTtlMs
) {
  cache.set(getCacheKey(kind, query), {
    expiresAt: now() + ttlMs,
    result
  });
}

function shouldCacheErrorResult(reason: MetadataResponseReason) {
  return reason === "timeout" || reason === "upstream_error";
}

function formatMetadataDebugPreview(value: unknown) {
  try {
    const serialized = typeof value === "string" ? value : JSON.stringify(value);

    if (!serialized) {
      return null;
    }

    return serialized.length > 500 ? `${serialized.slice(0, 497)}...` : serialized;
  } catch {
    return null;
  }
}

function normalizeRawCandidatePayload(rawOutput: unknown) {
  if (Array.isArray(rawOutput)) {
    return { candidates: rawOutput };
  }

  if (!rawOutput || typeof rawOutput !== "object") {
    return rawOutput;
  }

  const record = rawOutput as Record<string, unknown>;

  if (Array.isArray(record.candidates)) {
    return { candidates: record.candidates };
  }

  if (Array.isArray(record.items)) {
    return { candidates: record.items };
  }

  if (Array.isArray(record.results)) {
    return { candidates: record.results };
  }

  return rawOutput;
}

function logMetadataSchemaFailure({
  kind,
  query,
  model,
  issues,
  rawOutput
}: {
  kind: MetadataKind;
  query: string;
  model: string | null;
  issues: unknown;
  rawOutput: unknown;
}) {
  if (process.env.NODE_ENV === "production") {
    return;
  }

  console.warn("[metadata-search:parse] schema mismatch", {
    kind,
    query,
    model,
    issues,
    rawOutputPreview: formatMetadataDebugPreview(rawOutput)
  });
}

function mapRawOutputToCandidates(
  kind: MetadataKind,
  query: string,
  rawOutput: unknown,
  model: string | null = null
): MetadataCandidate[] | null {
  const normalizedRawOutput = normalizeRawCandidatePayload(rawOutput);

  if (kind === "book") {
    const parsed = rawMetadataModelOutputSchemas.book.safeParse(normalizedRawOutput);

    if (!parsed.success) {
      logMetadataSchemaFailure({
        kind,
        query,
        model,
        issues: parsed.error.issues.slice(0, 5),
        rawOutput: normalizedRawOutput
      });
      return null;
    }

    return sortCandidates(
      parsed.data.candidates.flatMap((candidate) => {
        const title = normalizeText(candidate.title);

        if (!title) {
          return [];
        }

        return [
          {
            id: randomUUID(),
            kind: "book" as const,
            title,
            subtitle: normalizeText(candidate.subtitle),
            confidence: candidate.confidence,
            source: "openrouter" as const,
            author: normalizeText(candidate.author),
            summary: normalizeText(candidate.summary),
            tags: normalizeTags(candidate.tags)
          }
        ];
      }),
      query
    );
  }

  if (kind === "movie") {
    const parsed = rawMetadataModelOutputSchemas.movie.safeParse(normalizedRawOutput);

    if (!parsed.success) {
      logMetadataSchemaFailure({
        kind,
        query,
        model,
        issues: parsed.error.issues.slice(0, 5),
        rawOutput: normalizedRawOutput
      });
      return null;
    }

    return sortCandidates(
      parsed.data.candidates.flatMap((candidate) => {
        const title = normalizeText(candidate.title);

        if (!title) {
          return [];
        }

        return [
          {
            id: randomUUID(),
            kind: "movie" as const,
            title,
            subtitle: normalizeText(candidate.subtitle),
            confidence: candidate.confidence,
            source: "openrouter" as const,
            director: normalizeText(candidate.director),
            releaseYear:
              candidate.releaseYear === null || candidate.releaseYear === undefined
                ? null
                : String(candidate.releaseYear),
            platform: normalizeText(candidate.platform),
            note: normalizeText(candidate.note),
            tags: normalizeTags(candidate.tags)
          }
        ];
      }),
      query
    );
  }

  const parsed = rawMetadataModelOutputSchemas.travel.safeParse(normalizedRawOutput);

  if (!parsed.success) {
    logMetadataSchemaFailure({
      kind,
      query,
      model,
      issues: parsed.error.issues.slice(0, 5),
      rawOutput: normalizedRawOutput
    });
    return null;
  }

  return sortCandidates(
    parsed.data.candidates.flatMap((candidate) => {
      const title = normalizeText(candidate.title);

      if (!title) {
        return [];
      }

      return [
        {
          id: randomUUID(),
          kind: "travel" as const,
          title,
          subtitle: normalizeText(candidate.subtitle),
          confidence: candidate.confidence,
          source: "openrouter" as const,
          country: normalizeText(candidate.country),
          city: normalizeText(candidate.city),
          description: normalizeText(candidate.description)
        }
      ];
    }),
    query
  );
}

function toFailureReason(error: unknown): MetadataResponseReason {
  if (error instanceof OpenRouterRequestError) {
    return error.code;
  }

  return "upstream_error";
}

async function runMetadataAttempt({
  kind,
  query,
  model,
  timeoutMs,
  maxTokens,
  requestStructuredOutput,
  now
}: {
  kind: MetadataKind;
  query: string;
  model: string;
  timeoutMs: number;
  maxTokens: number;
  requestStructuredOutput: MetadataRequestStructuredOutput;
  now: () => number;
}): Promise<MetadataAttemptOutcome> {
  const startedAt = now();

  try {
    const response = await requestStructuredOutput({
      model,
      timeoutMs,
      maxTokens,
      systemPrompt: metadataPrompts[kind],
      userPrompt: buildUserPrompt(kind, query),
      responseSchema: metadataStructuredOutputSchemas[kind]
    });

    const durationMs = now() - startedAt;

    if (!response) {
      return {
        kind: "failure",
        model,
        durationMs,
        finishReason: null,
        reason: "upstream_error"
      };
    }

    return resolveAttemptOutcome(kind, query, response, durationMs);
  } catch (error) {
    if (process.env.NODE_ENV !== "production" && error instanceof OpenRouterRequestError) {
      console.warn("[metadata-search:openrouter]", {
        model,
        status: error.status,
        message: error.message,
        details: error.details
      });
    }

    return {
      kind: "failure",
      model,
      durationMs: now() - startedAt,
      finishReason: null,
      reason: toFailureReason(error)
    };
  }
}

function resolveAttemptOutcome(
  kind: MetadataKind,
  query: string,
  response: OpenRouterStructuredOutputResult,
  durationMs: number
): MetadataAttemptOutcome {
  if (response.finishReason === "length") {
    return {
      kind: "failure",
      model: response.model,
      durationMs,
      finishReason: response.finishReason,
      reason: "length"
    };
  }

  if (response.output === null) {
    return {
      kind: "failure",
      model: response.model,
      durationMs,
      finishReason: response.finishReason,
      reason: response.rawText ? "parse_failed" : "upstream_error"
    };
  }

  const candidates = mapRawOutputToCandidates(kind, query, response.output, response.model);

  if (!candidates) {
    return {
      kind: "failure",
      model: response.model,
      durationMs,
      finishReason: response.finishReason,
      reason: "parse_failed"
    };
  }

  if (!candidates.length) {
    return {
      kind: "empty",
      model: response.model,
      durationMs,
      finishReason: response.finishReason
    };
  }

  return {
    kind: "success",
    model: response.model,
    durationMs,
    finishReason: response.finishReason,
    candidates
  };
}

function logMetadataSearch({
  kind,
  query,
  cacheHit,
  attempt,
  finalResult,
  totalDurationMs
}: {
  kind: MetadataKind;
  query: string;
  cacheHit: boolean;
  attempt: MetadataAttemptOutcome | null;
  finalResult: SearchMetadataCandidatesResult;
  totalDurationMs: number;
}) {
  if (process.env.NODE_ENV === "production") {
    return;
  }

  console.info("[metadata-search]", {
    kind,
    query,
    cacheHit,
    totalDurationMs,
    status: finalResult.status,
    reason: finalResult.reason,
    attempt
  });
}

function createOkResult(candidates: MetadataCandidate[]): SearchMetadataCandidatesResult {
  return {
    status: "ok",
    candidates,
    autoApplyCandidateId: getAutoApplyCandidateId(candidates),
    reason: null
  };
}

export function createMetadataSearchService(overrides: Partial<MetadataSearchDependencies> = {}) {
  const dependencies: MetadataSearchDependencies = {
    ...defaultMetadataSearchDependencies,
    ...overrides
  };

  return async function searchMetadataCandidates({
    kind,
    query
  }: SearchMetadataCandidatesInput): Promise<SearchMetadataCandidatesResult> {
    const normalizedQuery = query.trim();
    const startedAt = dependencies.now();

    if (normalizedQuery.length < 2) {
      return createOkResult([]);
    }

    if (!dependencies.hasOpenRouterApiKey) {
      const disabledResult: SearchMetadataCandidatesResult = {
        status: "disabled",
        candidates: [],
        autoApplyCandidateId: null,
        reason: null
      };

      setCachedResult(dependencies.cache, dependencies.now, kind, normalizedQuery, disabledResult);
      return disabledResult;
    }

    const cachedResult = getCachedResult(dependencies.cache, dependencies.now, kind, normalizedQuery);

    if (cachedResult) {
      logMetadataSearch({
        kind,
        query: normalizedQuery,
        cacheHit: true,
        attempt: null,
        finalResult: cachedResult,
        totalDurationMs: dependencies.now() - startedAt
      });
      return cachedResult;
    }

    const attempt = await runMetadataAttempt({
      kind,
      query: normalizedQuery,
      model: dependencies.model,
      timeoutMs: dependencies.timeoutMs,
      maxTokens: dependencies.maxTokens,
      requestStructuredOutput: dependencies.requestStructuredOutput,
      now: dependencies.now
    });

    if (attempt.kind === "success") {
      const result = createOkResult(attempt.candidates);
      setCachedResult(dependencies.cache, dependencies.now, kind, normalizedQuery, result);
      logMetadataSearch({
        kind,
        query: normalizedQuery,
        cacheHit: false,
        attempt,
        finalResult: result,
        totalDurationMs: dependencies.now() - startedAt
      });
      return result;
    }

    if (attempt.kind === "empty") {
      const result = createOkResult([]);
      setCachedResult(dependencies.cache, dependencies.now, kind, normalizedQuery, result);
      logMetadataSearch({
        kind,
        query: normalizedQuery,
        cacheHit: false,
        attempt,
        finalResult: result,
        totalDurationMs: dependencies.now() - startedAt
      });
      return result;
    }

    const errorResult: SearchMetadataCandidatesResult = {
      status: "error",
      candidates: [],
      autoApplyCandidateId: null,
      reason: attempt.reason
    };

    if (shouldCacheErrorResult(attempt.reason)) {
      setCachedResult(
        dependencies.cache,
        dependencies.now,
        kind,
        normalizedQuery,
        errorResult,
        metadataFailureCacheTtlMs
      );
    }

    logMetadataSearch({
      kind,
      query: normalizedQuery,
      cacheHit: false,
      attempt,
      finalResult: errorResult,
      totalDurationMs: dependencies.now() - startedAt
    });

    return errorResult;
  };
}

export const searchMetadataCandidates = createMetadataSearchService();
