"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from "react";

import {
  metadataRouteResponseSchema,
  type MetadataCandidate,
  type MetadataKind,
  type MetadataResponseReason
} from "@/lib/metadata/schemas";

export type MetadataFieldSource = "pristine" | "manual" | "metadata";
export type MetadataAutofillStatus = "idle" | "loading" | "ready" | "disabled" | "error";

interface UseMetadataAutofillOptions<TFormValues extends object> {
  kind: MetadataKind;
  query: string;
  trackedFields: readonly (keyof TFormValues)[];
  setFormValues: Dispatch<SetStateAction<TFormValues>>;
  buildPatch: (candidate: MetadataCandidate) => Partial<TFormValues>;
  debounceMs?: number;
}

interface CachedAutofillResult {
  status: MetadataAutofillStatus;
  candidates: MetadataCandidate[];
  autoApplyCandidateId: string | null;
  errorMessage: string | null;
}

function createInitialFieldSources<TFormValues extends object>(
  trackedFields: readonly (keyof TFormValues)[]
) {
  return Object.fromEntries(trackedFields.map((field) => [field, "pristine"])) as Partial<Record<
    keyof TFormValues,
    MetadataFieldSource
  >>;
}

function getErrorMessage(reason: MetadataResponseReason | null, fallbackMessage?: string | null) {
  if (fallbackMessage) {
    return fallbackMessage;
  }

  if (reason === "timeout") {
    return "自动匹配响应超时，请继续手动填写，稍后也可以再试一次。";
  }

  if (reason === "length") {
    return "自动匹配结果被截断，当前未能生成可靠候选，请继续手动填写。";
  }

  if (reason === "parse_failed") {
    return "自动匹配返回格式异常，请继续手动填写。";
  }

  return "自动匹配暂时不可用，请继续手动填写。";
}

export function useMetadataAutofill<TFormValues extends object>({
  kind,
  query,
  trackedFields,
  setFormValues,
  buildPatch,
  debounceMs = 300
}: UseMetadataAutofillOptions<TFormValues>) {
  const initialSources = useMemo(() => createInitialFieldSources(trackedFields), [trackedFields]);
  const [fieldSources, setFieldSources] = useState(initialSources);
  const [status, setStatus] = useState<MetadataAutofillStatus>("idle");
  const [candidates, setCandidates] = useState<MetadataCandidate[]>([]);
  const [appliedCandidateId, setAppliedCandidateId] = useState<string | null>(null);
  const [hasAttemptedSearch, setHasAttemptedSearch] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const cacheRef = useRef(new Map<string, CachedAutofillResult>());
  const requestIdRef = useRef(0);
  const fieldSourcesRef = useRef(fieldSources);

  useEffect(() => {
    fieldSourcesRef.current = fieldSources;
  }, [fieldSources]);

  const applyCandidate = useCallback(
    (candidate: MetadataCandidate) => {
      const patch = buildPatch(candidate);
      const nextSources = { ...fieldSourcesRef.current };

      setFormValues((currentValues) => {
        const nextValues = { ...currentValues };
        const mutableValues = nextValues as TFormValues & Record<keyof TFormValues, unknown>;

        for (const field of trackedFields) {
          const patchValue = patch[field];

          if (patchValue === undefined || fieldSourcesRef.current[field] === "manual") {
            continue;
          }

          mutableValues[field] = patchValue as TFormValues[keyof TFormValues];
          nextSources[field] = "metadata";
        }

        return nextValues;
      });

      fieldSourcesRef.current = nextSources;
      setFieldSources(nextSources);
      setAppliedCandidateId(candidate.id);
    },
    [buildPatch, setFormValues, trackedFields]
  );

  const markFieldAsManual = useCallback((field: keyof TFormValues) => {
    setFieldSources((currentSources) => {
      const nextSources = { ...currentSources, [field]: "manual" as const };
      fieldSourcesRef.current = nextSources;
      return nextSources;
    });
  }, []);

  const resetAutofillState = useCallback(() => {
    abortControllerRef.current?.abort();
    requestIdRef.current += 1;
    fieldSourcesRef.current = initialSources;
    cacheRef.current.clear();
    setFieldSources(initialSources);
    setStatus("idle");
    setCandidates([]);
    setAppliedCandidateId(null);
    setHasAttemptedSearch(false);
    setErrorMessage(null);
  }, [initialSources]);

  useEffect(() => {
    const normalizedQuery = query.trim();

    if (normalizedQuery.length < 2) {
      abortControllerRef.current?.abort();
      requestIdRef.current += 1;
      setStatus("idle");
      setCandidates([]);
      setAppliedCandidateId(null);
      setHasAttemptedSearch(false);
      setErrorMessage(null);
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      const cacheKey = `${kind}:${normalizedQuery.toLowerCase()}`;
      const cachedResult = cacheRef.current.get(cacheKey);

      if (cachedResult) {
        setStatus(cachedResult.status);
        setCandidates(cachedResult.candidates);
        setAppliedCandidateId(cachedResult.autoApplyCandidateId);
        setHasAttemptedSearch(true);
        setErrorMessage(cachedResult.errorMessage);

        const cachedAutoApplyCandidate = cachedResult.autoApplyCandidateId
          ? cachedResult.candidates.find((candidate) => candidate.id === cachedResult.autoApplyCandidateId)
          : null;

        if (cachedAutoApplyCandidate) {
          applyCandidate(cachedAutoApplyCandidate);
        }

        return;
      }

      abortControllerRef.current?.abort();

      const controller = new AbortController();
      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;
      abortControllerRef.current = controller;

      setStatus("loading");
      setErrorMessage(null);

      try {
        const response = await fetch("/api/metadata/candidates", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            kind,
            query: normalizedQuery
          }),
          signal: controller.signal
        });

        const rawPayload = (await response.json()) as unknown;
        const parsedPayload = metadataRouteResponseSchema.safeParse(rawPayload);

        if (requestId !== requestIdRef.current) {
          return;
        }

        if (!response.ok || !parsedPayload.success) {
          setStatus("error");
          setCandidates([]);
          setAppliedCandidateId(null);
          setHasAttemptedSearch(true);
          setErrorMessage("自动匹配暂时不可用，请继续手动填写。");
          return;
        }

        const resolvedStatus = parsedPayload.data.status === "disabled" ? "disabled" : parsedPayload.data.status === "error" ? "error" : "ready";
        const resolvedErrorMessage =
          parsedPayload.data.status === "disabled"
            ? "未配置 OpenRouter，已切换为手动填写。"
            : parsedPayload.data.status === "error"
              ? getErrorMessage(parsedPayload.data.reason)
              : null;

        setHasAttemptedSearch(true);
        setStatus(resolvedStatus);
        setCandidates(parsedPayload.data.candidates);
        setErrorMessage(resolvedErrorMessage);

        if (resolvedStatus === "ready" || resolvedStatus === "disabled") {
          cacheRef.current.set(cacheKey, {
            status: resolvedStatus,
            candidates: parsedPayload.data.candidates,
            autoApplyCandidateId: parsedPayload.data.autoApplyCandidateId,
            errorMessage: resolvedErrorMessage
          });
        }

        if (resolvedStatus !== "ready" || !parsedPayload.data.candidates.length) {
          setAppliedCandidateId(null);
          return;
        }

        const autoApplyCandidate = parsedPayload.data.autoApplyCandidateId
          ? parsedPayload.data.candidates.find((candidate) => candidate.id === parsedPayload.data.autoApplyCandidateId)
          : null;

        if (autoApplyCandidate) {
          applyCandidate(autoApplyCandidate);
          return;
        }

        setAppliedCandidateId(null);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        if (requestId !== requestIdRef.current) {
          return;
        }

        setStatus("error");
        setCandidates([]);
        setAppliedCandidateId(null);
        setHasAttemptedSearch(true);
        setErrorMessage("自动匹配暂时不可用，请继续手动填写。");
      }
    }, debounceMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [applyCandidate, debounceMs, kind, query]);

  return {
    status,
    candidates,
    appliedCandidateId,
    hasAttemptedSearch,
    errorMessage,
    fieldSources,
    applyCandidate,
    markFieldAsManual,
    resetAutofillState
  };
}
