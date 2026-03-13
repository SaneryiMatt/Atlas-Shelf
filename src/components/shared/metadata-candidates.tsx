import { LoaderCircle, Sparkles } from "lucide-react";

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
      <div className="rounded-xl border border-dashed border-border bg-background/60 p-4 text-sm leading-6 text-muted-foreground">
        输入至少 2 个字符后会自动检索候选，并优先补全未手动编辑的字段。
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="rounded-xl border border-border bg-background/70 p-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <LoaderCircle className="size-4 animate-spin" />
          <span>正在快速匹配候选内容...</span>
        </div>
      </div>
    );
  }

  if (status === "disabled" || status === "error") {
    return (
      <div className="rounded-xl border border-border bg-background/70 p-4 text-sm leading-6 text-muted-foreground">
        {errorMessage ?? "自动匹配当前不可用，请继续手动填写。"}
      </div>
    );
  }

  if (hasAttemptedSearch && !candidates.length) {
    return (
      <div className="rounded-xl border border-border bg-background/70 p-4 text-sm leading-6 text-muted-foreground">
        没有找到高可信度候选，你可以继续手动填写当前表单。
      </div>
    );
  }

  if (!candidates.length) {
    return null;
  }

  return (
    <div className="space-y-3 rounded-xl border border-border bg-background/70 p-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Sparkles className="size-4" />
        <span>已找到最多 3 个候选，可一键应用到未手动编辑的字段。</span>
      </div>

      <div className="space-y-3">
        {candidates.map((candidate) => {
          const meta = getCandidateMeta(candidate);
          const isApplied = candidate.id === appliedCandidateId;

          return (
            <div
              key={candidate.id}
              className={cn(
                "rounded-lg border p-4 transition-colors",
                isApplied ? "border-foreground/20 bg-accent/40" : "border-border bg-background/80"
              )}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-medium text-foreground">{candidate.title}</h3>
                    <Badge variant="outline">{Math.round(candidate.confidence * 100)}%</Badge>
                    {isApplied ? <Badge variant="warm">已应用</Badge> : null}
                  </div>
                  <p className="text-sm text-muted-foreground">{meta.title}</p>
                  <p className="text-sm leading-6 text-muted-foreground">{meta.detail}</p>
                </div>

                <Button
                  type="button"
                  size="sm"
                  variant={isApplied ? "secondary" : "outline"}
                  onClick={() => onApplyCandidate(candidate)}
                >
                  {isApplied ? "已应用" : "应用此候选"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
