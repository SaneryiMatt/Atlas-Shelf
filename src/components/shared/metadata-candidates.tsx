import { Check, CircleDashed, LoaderCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { MetadataCandidate } from "@/lib/metadata/schemas";
import type { MetadataAutofillStatus } from "@/lib/metadata/use-metadata-autofill";
import { cn } from "@/lib/utils";

interface MetadataCandidatesProps {
  query: string;
  status: MetadataAutofillStatus;
  candidates: MetadataCandidate[];
  appliedCandidateId: string | null;
  hasAttemptedSearch: boolean;
  errorMessage: string | null;
  onApplyCandidate: (candidate: MetadataCandidate) => void;
}

function getCandidateMeta(candidate: MetadataCandidate) {
  if (candidate.kind === "book") {
    return {
      title: candidate.author ?? candidate.subtitle ?? "书籍候选",
      detail: candidate.summary ?? (candidate.tags.length ? candidate.tags.join("、") : "未返回更多元数据")
    };
  }

  if (candidate.kind === "movie") {
    const movieTitle = candidate.subtitle ?? [candidate.director, candidate.releaseYear].filter(Boolean).join(" / ");
    const movieDetail =
      candidate.note ?? [candidate.platform, candidate.tags.length ? candidate.tags.join("、") : null].filter(Boolean).join(" / ");

    return {
      title: movieTitle || "影视候选",
      detail: movieDetail || "未返回更多元数据"
    };
  }

  const travelTitle = candidate.subtitle ?? [candidate.country, candidate.city].filter(Boolean).join(" / ");
  const travelDetail = candidate.description;

  return {
    title: travelTitle || "地点候选",
    detail: travelDetail || "未返回更多元数据"
  };
}

export function MetadataCandidates({
  query,
  status,
  candidates,
  appliedCandidateId,
  hasAttemptedSearch,
  errorMessage,
  onApplyCandidate
}: MetadataCandidatesProps) {
  if (query.trim().length < 2) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-dashed border-border/50 bg-accent/20 p-4">
        <CircleDashed className="mt-0.5 size-4 shrink-0 text-muted-foreground/60" />
        <p className="text-sm leading-relaxed text-muted-foreground">
          输入至少 2 个字符后会自动检索候选，并优先补全未手动编辑的字段。
        </p>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-border/40 bg-accent/30 p-4">
        <div className="relative flex size-5 items-center justify-center">
          <LoaderCircle className="size-4 animate-spin text-foreground/70" />
        </div>
        <span className="text-sm text-foreground/80">正在快速匹配候选内容...</span>
      </div>
    );
  }

  if (status === "disabled" || status === "error") {
    return (
      <div className="rounded-xl border border-border/40 bg-accent/20 p-4 text-sm leading-relaxed text-muted-foreground">
        {errorMessage ?? "自动匹配当前不可用，请继续手动填写。"}
      </div>
    );
  }

  if (hasAttemptedSearch && !candidates.length) {
    return (
      <div className="rounded-xl border border-border/40 bg-accent/20 p-4 text-sm leading-relaxed text-muted-foreground">
        没有找到高可信度候选，你可以继续手动填写当前表单。
      </div>
    );
  }

  if (!candidates.length) {
    return null;
  }

  return (
    <div className="space-y-2.5">
      <p className="text-xs text-muted-foreground/70">
        已找到 {candidates.length} 个候选，点击应用到未手动编辑的字段
      </p>

      <div className="space-y-2">
        {candidates.map((candidate) => {
          const meta = getCandidateMeta(candidate);
          const isApplied = candidate.id === appliedCandidateId;

          return (
            <button
              key={candidate.id}
              type="button"
              onClick={() => onApplyCandidate(candidate)}
              className={cn(
                "group w-full rounded-xl border p-3 text-left transition-all duration-200",
                "hover:border-foreground/20 hover:bg-accent/40",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background",
                isApplied
                  ? "border-foreground/25 bg-accent/50 ring-1 ring-foreground/10"
                  : "border-border/40 bg-background/40"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-medium text-foreground">{candidate.title}</h3>
                    <Badge
                      variant="outline"
                      className={cn(
                        "h-5 border-border/50 px-1.5 text-[10px] font-normal",
                        candidate.confidence >= 0.8 && "border-green-500/30 bg-green-500/10 text-green-400"
                      )}
                    >
                      {Math.round(candidate.confidence * 100)}%
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{meta.title}</p>
                  <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground/70">{meta.detail}</p>
                </div>

                <div
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full transition-all",
                    isApplied
                      ? "bg-foreground text-background"
                      : "border border-border/60 bg-accent/40 text-muted-foreground/50 group-hover:border-foreground/30 group-hover:text-foreground/70"
                  )}
                >
                  <Check className={cn("size-3.5", !isApplied && "opacity-0 group-hover:opacity-100")} />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
