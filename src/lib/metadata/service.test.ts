import assert from "node:assert/strict";

import { OpenRouterRequestError } from "./openrouter.ts";
import { createMetadataSearchService } from "./service.ts";

function createBookOutput(confidence = 0.91) {
  return {
    candidates: [
      {
        title: "红楼梦",
        subtitle: null,
        confidence,
        author: "曹雪芹",
        summary: "贾宝玉与林黛玉的故事",
        tags: ["古典"]
      }
    ]
  };
}

async function testShortQueriesBypassUpstreamRequests() {
  let callCount = 0;
  const search = createMetadataSearchService({
    hasOpenRouterApiKey: true,
    model: "fast-model",
    timeoutMs: 50,
    maxTokens: 128,
    cache: new Map(),
    now: () => 0,
    requestStructuredOutput: async () => {
      callCount += 1;
      return null;
    }
  });

  const result = await search({ kind: "book", query: "红" });

  assert.deepEqual(result, {
    status: "ok",
    candidates: [],
    autoApplyCandidateId: null,
    reason: null
  });
  assert.equal(callCount, 0);
}

async function testMissingApiKeyReturnsDisabled() {
  let callCount = 0;
  const search = createMetadataSearchService({
    hasOpenRouterApiKey: false,
    model: "fast-model",
    timeoutMs: 50,
    maxTokens: 128,
    cache: new Map(),
    now: () => 0,
    requestStructuredOutput: async () => {
      callCount += 1;
      return null;
    }
  });

  const result = await search({ kind: "book", query: "红楼梦" });

  assert.equal(result.status, "disabled");
  assert.equal(result.reason, null);
  assert.equal(callCount, 0);
}

async function testHighConfidenceMatchesAutoApplyAndReceiveConfig() {
  let receivedOptions: { model: string; timeoutMs: number; maxTokens?: number } | null = null;
  const search = createMetadataSearchService({
    hasOpenRouterApiKey: true,
    model: "fast-model",
    timeoutMs: 50,
    maxTokens: 128,
    cache: new Map(),
    now: () => 100,
    requestStructuredOutput: async (options) => {
      receivedOptions = {
        model: options.model,
        timeoutMs: options.timeoutMs,
        maxTokens: options.maxTokens
      };

      return {
        model: options.model,
        finishReason: "stop",
        usage: null,
        rawText: JSON.stringify(createBookOutput()),
        output: createBookOutput()
      };
    }
  });

  const result = await search({ kind: "book", query: "红楼梦" });

  assert.deepEqual(receivedOptions, {
    model: "fast-model",
    timeoutMs: 50,
    maxTokens: 128
  });
  assert.equal(result.status, "ok");
  assert.equal(result.candidates.length, 1);
  assert.equal(result.autoApplyCandidateId, result.candidates[0]?.id ?? null);
}

async function testTimeoutFailuresAreCachedBriefly() {
  let callCount = 0;
  let currentNow = 0;
  const search = createMetadataSearchService({
    hasOpenRouterApiKey: true,
    model: "fast-model",
    timeoutMs: 50,
    maxTokens: 128,
    cache: new Map(),
    now: () => currentNow,
    requestStructuredOutput: async () => {
      callCount += 1;
      throw new OpenRouterRequestError("timeout", "OpenRouter request timed out");
    }
  });

  const firstResult = await search({ kind: "book", query: "红楼梦" });
  const secondResult = await search({ kind: "book", query: "红楼梦" });

  assert.equal(firstResult.status, "error");
  assert.equal(firstResult.reason, "timeout");
  assert.equal(secondResult.status, "error");
  assert.equal(secondResult.reason, "timeout");
  assert.equal(callCount, 1);

  currentNow = 44000;
  await search({ kind: "book", query: "红楼梦" });
  assert.equal(callCount, 1);

  currentNow = 46000;
  await search({ kind: "book", query: "红楼梦" });
  assert.equal(callCount, 2);
}

const tests: Array<[string, () => Promise<void>]> = [
  ["short queries bypass upstream requests", testShortQueriesBypassUpstreamRequests],
  ["missing API key returns disabled", testMissingApiKeyReturnsDisabled],
  ["high-confidence matches auto-apply and receive config", testHighConfidenceMatchesAutoApplyAndReceiveConfig],
  ["timeout failures are cached briefly", testTimeoutFailuresAreCachedBriefly]
];

(async () => {
  for (const [name, run] of tests) {
    await run();
    console.log(`ok - ${name}`);
  }

  console.log(`passed ${tests.length} metadata tests`);
})().catch((error) => {
  console.error("metadata tests failed");
  console.error(error);
  process.exit(1);
});
