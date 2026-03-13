import { env, hasOpenRouterApiKey } from "@/lib/env";

interface OpenRouterResponseSchema {
  name: string;
  strict: boolean;
  schema: Record<string, unknown>;
}

interface OpenRouterChatCompletionOptions {
  model: string;
  timeoutMs: number;
  maxTokens?: number;
  systemPrompt: string;
  userPrompt: string;
  responseSchema: OpenRouterResponseSchema;
}

interface OpenRouterUsage {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
}

interface OpenRouterMessageContentPart {
  text?: string;
  type?: string;
}

interface OpenRouterChoiceMessage {
  content?: string | OpenRouterMessageContentPart[];
}

interface OpenRouterChoice {
  finish_reason?: string | null;
  message?: OpenRouterChoiceMessage | null;
}

interface OpenRouterErrorPayload {
  message?: string;
  code?: string | number;
  metadata?: unknown;
}

interface OpenRouterResponse {
  model?: string;
  usage?: OpenRouterUsage;
  choices?: OpenRouterChoice[];
  error?: OpenRouterErrorPayload;
  provider_errors?: unknown;
}

type OpenRouterStructuredResponseMode = "json_schema" | "json_object";
type OpenRouterRequestMode = OpenRouterStructuredResponseMode | "prompt_json";

export type OpenRouterFailureReason = "timeout" | "upstream_error";

export class OpenRouterRequestError extends Error {
  code: OpenRouterFailureReason;
  status: number | null;
  details: string | null;

  constructor(
    code: OpenRouterFailureReason,
    message: string,
    status: number | null = null,
    details: string | null = null
  ) {
    super(message);
    this.name = "OpenRouterRequestError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export interface OpenRouterStructuredOutputResult {
  model: string;
  finishReason: string | null;
  usage: OpenRouterUsage | null;
  rawText: string | null;
  output: unknown | null;
}

function normalizeMessageContent(content: OpenRouterResponse["choices"]) {
  const messageContent = content?.[0]?.message?.content;

  if (typeof messageContent === "string") {
    return messageContent.trim() || null;
  }

  if (Array.isArray(messageContent)) {
    const joinedContent = messageContent
      .map((part) => part.text?.trim())
      .filter(Boolean)
      .join("");

    return joinedContent || null;
  }

  return null;
}

function truncateErrorDetails(details: string | null) {
  if (!details) {
    return null;
  }

  const normalizedDetails = details.trim();

  if (!normalizedDetails) {
    return null;
  }

  return normalizedDetails.length > 400
    ? `${normalizedDetails.slice(0, 397)}...`
    : normalizedDetails;
}

function serializePayloadPreview(value: unknown) {
  try {
    return truncateErrorDetails(JSON.stringify(value));
  } catch {
    return null;
  }
}

function getFirstChoice(data: OpenRouterResponse) {
  return Array.isArray(data.choices) ? (data.choices[0] ?? null) : null;
}

function buildMissingChoicesDetails(data: OpenRouterResponse, rawBody: string) {
  return truncateErrorDetails(
    rawBody ||
      serializePayloadPreview({
        model: data.model ?? null,
        error: data.error ?? null,
        provider_errors: data.provider_errors ?? null,
        choices: data.choices ?? null
      })
  );
}

function getPreferredStructuredResponseMode(model: string): OpenRouterStructuredResponseMode {
  const normalizedModel = model.trim().toLowerCase();

  if (normalizedModel.startsWith("qwen/qwen3.5-flash")) {
    return "json_object";
  }

  return "json_schema";
}

function isAbortLikeError(error: unknown) {
  return error instanceof DOMException && (error.name === "TimeoutError" || error.name === "AbortError");
}

function buildResponseMetaDetails(response: Response) {
  return serializePayloadPreview({
    contentType: response.headers.get("content-type"),
    contentLength: response.headers.get("content-length")
  });
}

function createTimeoutSignal(timeoutMs: number) {
  return timeoutMs > 0 ? AbortSignal.timeout(timeoutMs) : undefined;
}

async function readResponseBody(response: Response, signal?: AbortSignal) {
  try {
    return await response.text();
  } catch (error) {
    if (signal?.aborted || isAbortLikeError(error)) {
      throw new OpenRouterRequestError(
        "timeout",
        "OpenRouter response body timed out",
        response.status,
        buildResponseMetaDetails(response)
      );
    }

    throw new OpenRouterRequestError(
      "upstream_error",
      "OpenRouter response body could not be read",
      response.status,
      buildResponseMetaDetails(response)
    );
  }
}

function extractJsonText(rawText: string) {
  const trimmed = rawText.trim();

  if (!trimmed) {
    return null;
  }

  const fencedMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);

  if (fencedMatch?.[1]) {
    const fencedText = fencedMatch[1].trim();
    return fencedText || null;
  }

  const firstBraceIndex = trimmed.indexOf("{");
  const lastBraceIndex = trimmed.lastIndexOf("}");

  if (firstBraceIndex >= 0 && lastBraceIndex > firstBraceIndex) {
    return trimmed.slice(firstBraceIndex, lastBraceIndex + 1).trim();
  }

  return trimmed;
}

function parseJsonText(rawText: string) {
  const jsonText = extractJsonText(rawText);

  if (!jsonText) {
    return null;
  }

  const attempts = Array.from(
    new Set([
      jsonText,
      jsonText.replace(/^\uFEFF/, "").trim(),
      jsonText.replace(/,\s*([}\]])/g, "$1"),
      jsonText.replace(/^\uFEFF/, "").replace(/,\s*([}\]])/g, "$1").trim()
    ])
  );

  for (const attempt of attempts) {
    if (!attempt) {
      continue;
    }

    try {
      return JSON.parse(attempt) as unknown;
    } catch {
      continue;
    }
  }

  return null;
}

async function executeOpenRouterRequest({
  model,
  timeoutMs,
  maxTokens,
  systemPrompt,
  userPrompt,
  responseSchema,
  mode
}: OpenRouterChatCompletionOptions & {
  mode: OpenRouterRequestMode;
}): Promise<OpenRouterStructuredOutputResult> {
  const signal = createTimeoutSignal(timeoutMs);

  let response: Response;

  try {
    response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "X-Title": "Atlas Shelf"
      },
      body: JSON.stringify({
        model,
        temperature: 0.3,
        ...(typeof maxTokens === "number" ? { max_tokens: maxTokens } : {}),
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        ...(mode === "prompt_json"
          ? {}
          : {
              response_format:
                mode === "json_object"
                  ? { type: "json_object" }
                  : {
                      type: "json_schema",
                      json_schema: responseSchema
                    }
            })
      }),
      ...(signal ? { signal } : {}),
      cache: "no-store"
    });
  } catch (error) {
    if (signal?.aborted || isAbortLikeError(error)) {
      throw new OpenRouterRequestError("timeout", "OpenRouter request timed out");
    }

    throw new OpenRouterRequestError("upstream_error", "OpenRouter request failed");
  }

  const responseBody = await readResponseBody(response, signal);

  if (!response.ok) {
    const errorDetails = truncateErrorDetails(responseBody || null);
    const statusMessage = errorDetails
      ? `OpenRouter request failed with status ${response.status}: ${errorDetails}`
      : `OpenRouter request failed with status ${response.status}`;

    throw new OpenRouterRequestError(
      "upstream_error",
      statusMessage,
      response.status,
      errorDetails
    );
  }

  if (!responseBody.trim()) {
    throw new OpenRouterRequestError(
      "upstream_error",
      "OpenRouter returned an empty response body",
      response.status,
      buildResponseMetaDetails(response)
    );
  }

  let data: OpenRouterResponse;

  try {
    data = JSON.parse(responseBody) as OpenRouterResponse;
  } catch {
    throw new OpenRouterRequestError(
      "upstream_error",
      "OpenRouter returned invalid JSON",
      response.status,
      truncateErrorDetails(responseBody)
    );
  }

  if (data.error) {
    const errorDetails = truncateErrorDetails(
      responseBody ||
        serializePayloadPreview({
          error: data.error,
          provider_errors: data.provider_errors ?? null
        })
    );
    const upstreamMessage = typeof data.error.message === "string" ? data.error.message.trim() : "";

    throw new OpenRouterRequestError(
      "upstream_error",
      upstreamMessage ? `OpenRouter returned an error payload: ${upstreamMessage}` : "OpenRouter returned an error payload",
      response.status,
      errorDetails
    );
  }

  const firstChoice = getFirstChoice(data);
  const rawText = normalizeMessageContent(data.choices);

  if (!firstChoice || !rawText) {
    const missingChoicesDetails = buildMissingChoicesDetails(data, responseBody);

    if (process.env.NODE_ENV !== "production") {
      console.warn("[openrouter] empty message content", {
        requestedModel: model,
        responseModel: data.model ?? model,
        mode,
        finishReason: firstChoice?.finish_reason ?? null,
        message: firstChoice?.message ?? null,
        choice: firstChoice,
        data
      });
    }

    throw new OpenRouterRequestError(
      "upstream_error",
      "OpenRouter returned no message content",
      response.status,
      missingChoicesDetails
    );
  }

  return {
    model: data.model ?? model,
    finishReason: firstChoice.finish_reason ?? null,
    usage: data.usage ?? null,
    rawText,
    output: parseJsonText(rawText)
  };
}

export async function requestOpenRouterStructuredOutput({
  model,
  timeoutMs,
  maxTokens,
  systemPrompt,
  userPrompt,
  responseSchema
}: OpenRouterChatCompletionOptions): Promise<OpenRouterStructuredOutputResult | null> {
  if (!hasOpenRouterApiKey || !env.OPENROUTER_API_KEY) {
    return null;
  }

  const preferredMode = getPreferredStructuredResponseMode(model);

  try {
    return await executeOpenRouterRequest({
      model,
      timeoutMs,
      maxTokens,
      systemPrompt,
      userPrompt,
      responseSchema,
      mode: preferredMode
    });
  } catch (error) {
    if (preferredMode !== "json_schema" || !shouldRetryWithoutResponseFormat(error)) {
      throw error;
    }

    if (process.env.NODE_ENV !== "production" && error instanceof OpenRouterRequestError) {
      console.warn("[openrouter] retrying without response_format", {
        model,
        status: error.status,
        message: error.message,
        details: error.details
      });
    }
  }

  return executeOpenRouterRequest({
    model,
    timeoutMs,
    maxTokens,
    systemPrompt,
    userPrompt,
    responseSchema,
    mode: "prompt_json"
  });
}
