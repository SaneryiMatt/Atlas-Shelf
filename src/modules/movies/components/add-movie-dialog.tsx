"use client";

import { useActionState, useEffect, useState } from "react";
import { Clapperboard } from "lucide-react";
import { useRouter } from "next/navigation";

import { MetadataCandidates } from "@/components/shared/metadata-candidates";
import { MetadataSideModal } from "@/components/shared/metadata-side-modal";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { mapMetadataCandidateToMoviePatch } from "@/lib/metadata/mappers";
import { useMetadataAutofill } from "@/lib/metadata/use-metadata-autofill";
import type { MovieEditorValues } from "@/lib/types/items";
import { createMovieAction, type CreateMovieFormState } from "@/modules/movies/actions";
import { movieStatusOptions } from "@/modules/movies/screen-form-schema";

const initialState: CreateMovieFormState = {
  status: "idle",
  message: null,
  fieldErrors: {}
};

const initialFormValues: MovieEditorValues = {
  title: "",
  director: "",
  releaseYear: "",
  platform: "",
  status: "planned",
  rating: "",
  note: "",
  tags: ""
};

const movieMetadataFields = ["title", "director", "releaseYear", "platform", "note", "tags"] as const;

interface AddMovieDialogProps {
  disabled?: boolean;
}

interface AddMovieFormProps {
  open: boolean;
  onSuccess: () => void;
}

function isMetadataSideModalTarget(target: EventTarget | null) {
  return target instanceof Element && target.closest("[data-metadata-side-modal='true']") !== null;
}

function AddMovieForm({ open, onSuccess }: AddMovieFormProps) {
  const [formValues, setFormValues] = useState(initialFormValues);
  const [state, formAction, isPending] = useActionState(createMovieAction, initialState);
  const {
    status: metadataStatus,
    candidates: metadataCandidates,
    appliedCandidateId,
    hasAttemptedSearch,
    errorMessage,
    applyCandidate,
    markFieldAsManual,
    resetAutofillState
  } = useMetadataAutofill<MovieEditorValues>({
    kind: "movie",
    query: formValues.title,
    trackedFields: movieMetadataFields,
    setFormValues,
    buildPatch: mapMetadataCandidateToMoviePatch
  });

  useEffect(() => {
    if (state.status !== "success") {
      return;
    }

    setFormValues(initialFormValues);
    resetAutofillState();
    onSuccess();
  }, [onSuccess, resetAutofillState, state.status]);

  function handleFieldChange<Key extends keyof MovieEditorValues>(field: Key, value: MovieEditorValues[Key]) {
    setFormValues((current) => ({
      ...current,
      [field]: value
    }));
    markFieldAsManual(field);
  }

  return (
    <>
      <form action={formAction} className="mx-auto w-full max-w-none space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium text-foreground/90">标题</Label>
            <Input
              id="title"
              name="title"
              value={formValues.title}
              onChange={(event) => handleFieldChange("title", event.target.value)}
              placeholder="例如：《完美的日子》"
              disabled={isPending}
              className="h-10 border-border/50 bg-background/50 transition-colors focus:border-foreground/30 focus:bg-background/80"
            />
            {state.fieldErrors.title ? <p className="text-xs text-red-400">{state.fieldErrors.title}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="director" className="text-sm font-medium text-foreground/90">
              导演/作者
            </Label>
            <Input
              id="director"
              name="director"
              value={formValues.director}
              onChange={(event) => handleFieldChange("director", event.target.value)}
              placeholder="例如：维姆·文德斯"
              disabled={isPending}
              className="h-10 border-border/50 bg-background/50 transition-colors focus:border-foreground/30 focus:bg-background/80"
            />
            {state.fieldErrors.director ? <p className="text-xs text-red-400">{state.fieldErrors.director}</p> : null}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="releaseYear" className="text-sm font-medium text-foreground/90">
              上映年份
            </Label>
            <Input
              id="releaseYear"
              name="releaseYear"
              inputMode="numeric"
              value={formValues.releaseYear}
              onChange={(event) => handleFieldChange("releaseYear", event.target.value)}
              placeholder="例如：2024"
              disabled={isPending}
              className="h-10 border-border/50 bg-background/50 transition-colors focus:border-foreground/30 focus:bg-background/80"
            />
            {state.fieldErrors.releaseYear ? <p className="text-xs text-red-400">{state.fieldErrors.releaseYear}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="platform" className="text-sm font-medium text-foreground/90">
              平台
            </Label>
            <Input
              id="platform"
              name="platform"
              value={formValues.platform}
              onChange={(event) => handleFieldChange("platform", event.target.value)}
              placeholder="例如：流媒体 / 影院"
              disabled={isPending}
              className="h-10 border-border/50 bg-background/50 transition-colors focus:border-foreground/30 focus:bg-background/80"
            />
            {state.fieldErrors.platform ? <p className="text-xs text-red-400">{state.fieldErrors.platform}</p> : null}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="status" className="text-sm font-medium text-foreground/90">
              状态
            </Label>
            <Select
              name="status"
              value={formValues.status}
              onValueChange={(value) => handleFieldChange("status", value as MovieEditorValues["status"])}
              disabled={isPending}
            >
              <SelectTrigger
                id="status"
                className="h-10 border-border/50 bg-background/50 transition-colors focus:border-foreground/30 focus:bg-background/80"
              >
                <SelectValue placeholder="请选择状态" />
              </SelectTrigger>
              <SelectContent className="border-border/50 bg-card/95 backdrop-blur-xl">
                {movieStatusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {state.fieldErrors.status ? <p className="text-xs text-red-400">{state.fieldErrors.status}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="rating" className="text-sm font-medium text-foreground/90">
              评分
            </Label>
            <Input
              id="rating"
              name="rating"
              type="number"
              min="0"
              max="5"
              step="0.5"
              value={formValues.rating}
              onChange={(event) => handleFieldChange("rating", event.target.value)}
              placeholder="0 - 5"
              disabled={isPending}
              className="h-10 border-border/50 bg-background/50 transition-colors focus:border-foreground/30 focus:bg-background/80"
            />
            {state.fieldErrors.rating ? <p className="text-xs text-red-400">{state.fieldErrors.rating}</p> : null}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="note" className="text-sm font-medium text-foreground/90">
            简短备注
          </Label>
          <Textarea
            id="note"
            name="note"
            value={formValues.note}
            onChange={(event) => handleFieldChange("note", event.target.value)}
            placeholder="记录想看原因、观后感或你想保留的信息。"
            disabled={isPending}
            className="min-h-[88px] resize-none border-border/50 bg-background/50 transition-colors focus:border-foreground/30 focus:bg-background/80"
          />
          {state.fieldErrors.note ? <p className="text-xs text-red-400">{state.fieldErrors.note}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="tags" className="text-sm font-medium text-foreground/90">
            标签
          </Label>
          <Input
            id="tags"
            name="tags"
            value={formValues.tags}
            onChange={(event) => handleFieldChange("tags", event.target.value)}
            placeholder="例如：剧情, 生活流, 年度片单"
            disabled={isPending}
            className="h-10 border-border/50 bg-background/50 transition-colors focus:border-foreground/30 focus:bg-background/80"
          />
          <p className="text-xs text-muted-foreground/70">使用逗号分隔多个标签，支持中英文逗号。</p>
          {state.fieldErrors.tags ? <p className="text-xs text-red-400">{state.fieldErrors.tags}</p> : null}
        </div>

        {state.message ? (
          <div
            className={
              state.status === "success"
                ? "rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-400"
                : "rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400"
            }
          >
            {state.message}
          </div>
        ) : null}

        <DialogFooter className="border-t border-border/30 pt-4">
          <Button type="submit" size="lg" disabled={isPending} className="min-w-[120px]">
            {isPending ? "保存中..." : "保存影视条目"}
          </Button>
        </DialogFooter>
      </form>

      <MetadataSideModal open={open} title="自动检索">
        <MetadataCandidates
          query={formValues.title}
          status={metadataStatus}
          candidates={metadataCandidates}
          appliedCandidateId={appliedCandidateId}
          hasAttemptedSearch={hasAttemptedSearch}
          errorMessage={errorMessage}
          onApplyCandidate={applyCandidate}
        />
      </MetadataSideModal>
    </>
  );
}

export function AddMovieDialog({ disabled = false }: AddMovieDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);

        if (nextOpen) {
          setFormKey((current) => current + 1);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button className="gap-2" disabled={disabled}>
          <Clapperboard className="size-4" />
          新增影视
        </Button>
      </DialogTrigger>

      <DialogContent
        className="max-h-[90vh] w-[min(92vw,640px)] overflow-y-auto rounded-2xl p-6 sm:p-7"
        onInteractOutside={(event) => {
          if (isMetadataSideModalTarget(event.target)) {
            event.preventDefault();
          }
        }}
        onFocusOutside={(event) => {
          if (isMetadataSideModalTarget(event.target)) {
            event.preventDefault();
          }
        }}
      >
        <DialogHeader className="mb-1">
          <DialogTitle>新增影视</DialogTitle>
        </DialogHeader>

        <AddMovieForm
          key={formKey}
          open={open}
          onSuccess={() => {
            setOpen(false);
            router.refresh();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
