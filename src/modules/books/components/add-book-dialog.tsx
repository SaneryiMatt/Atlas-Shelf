"use client";

import { useActionState, useEffect, useState } from "react";
import { Plus } from "lucide-react";
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
import { mapMetadataCandidateToBookPatch } from "@/lib/metadata/mappers";
import { useMetadataAutofill } from "@/lib/metadata/use-metadata-autofill";
import type { BookEditorValues } from "@/lib/types/items";
import { createBookAction, type CreateBookFormState } from "@/modules/books/actions";
import { bookStatusOptions } from "@/modules/books/book-form-schema";

const initialState: CreateBookFormState = {
  status: "idle",
  message: null,
  fieldErrors: {}
};

const initialFormValues: BookEditorValues = {
  title: "",
  author: "",
  status: "planned",
  rating: "",
  startedAt: "",
  completedAt: "",
  summary: "",
  tags: ""
};

const bookMetadataFields = ["title", "author", "summary", "tags"] as const;

interface AddBookDialogProps {
  disabled?: boolean;
}

interface AddBookFormProps {
  open: boolean;
  onSuccess: () => void;
}

function isMetadataSideModalTarget(target: EventTarget | null) {
  return target instanceof Element && target.closest("[data-metadata-side-modal='true']") !== null;
}

function AddBookForm({ open, onSuccess }: AddBookFormProps) {
  const [formValues, setFormValues] = useState(initialFormValues);
  const [state, formAction, isPending] = useActionState(createBookAction, initialState);
  const {
    status: metadataStatus,
    candidates: metadataCandidates,
    appliedCandidateId,
    hasAttemptedSearch,
    errorMessage,
    applyCandidate,
    markFieldAsManual,
    resetAutofillState
  } = useMetadataAutofill<BookEditorValues>({
    kind: "book",
    query: formValues.title,
    trackedFields: bookMetadataFields,
    setFormValues,
    buildPatch: mapMetadataCandidateToBookPatch
  });

  useEffect(() => {
    if (state.status !== "success") {
      return;
    }

    setFormValues(initialFormValues);
    resetAutofillState();
    onSuccess();
  }, [onSuccess, resetAutofillState, state.status]);

  function handleFieldChange<Key extends keyof BookEditorValues>(field: Key, value: BookEditorValues[Key]) {
    setFormValues((current) => ({
      ...current,
      [field]: value
    }));
    markFieldAsManual(field);
  }

  return (
    <>
      <form action={formAction} className="mx-auto w-full max-w-2xl space-y-5 rounded-xl border border-border/70 bg-card/60 p-5 backdrop-blur">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="title">标题</Label>
            <Input
              id="title"
              name="title"
              value={formValues.title}
              onChange={(event) => handleFieldChange("title", event.target.value)}
              placeholder="例如：《创造行为》"
              disabled={isPending}
            />
            {state.fieldErrors.title ? <p className="text-sm text-red-600">{state.fieldErrors.title}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="author">作者</Label>
            <Input
              id="author"
              name="author"
              value={formValues.author}
              onChange={(event) => handleFieldChange("author", event.target.value)}
              placeholder="例如：里克·鲁宾"
              disabled={isPending}
            />
            {state.fieldErrors.author ? <p className="text-sm text-red-600">{state.fieldErrors.author}</p> : null}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="status">状态</Label>
            <Select
              name="status"
              value={formValues.status}
              onValueChange={(value) => handleFieldChange("status", value as BookEditorValues["status"])}
              disabled={isPending}
            >
              <SelectTrigger id="status" className="border-border/70 bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <SelectValue placeholder="请选择状态" />
              </SelectTrigger>
              <SelectContent className="border-border/70 bg-background/80 backdrop-blur">
                {bookStatusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {state.fieldErrors.status ? <p className="text-sm text-red-600">{state.fieldErrors.status}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="rating">评分</Label>
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
            />
            {state.fieldErrors.rating ? <p className="text-sm text-red-600">{state.fieldErrors.rating}</p> : null}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="startedAt">开始日期</Label>
            <Input
              id="startedAt"
              name="startedAt"
              type="date"
              value={formValues.startedAt}
              onChange={(event) => handleFieldChange("startedAt", event.target.value)}
              disabled={isPending}
            />
            {state.fieldErrors.startedAt ? <p className="text-sm text-red-600">{state.fieldErrors.startedAt}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="completedAt">完成日期</Label>
            <Input
              id="completedAt"
              name="completedAt"
              type="date"
              value={formValues.completedAt}
              onChange={(event) => handleFieldChange("completedAt", event.target.value)}
              disabled={isPending}
            />
            {state.fieldErrors.completedAt ? <p className="text-sm text-red-600">{state.fieldErrors.completedAt}</p> : null}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="summary">简短备注</Label>
          <Textarea
            id="summary"
            name="summary"
            value={formValues.summary}
            onChange={(event) => handleFieldChange("summary", event.target.value)}
            placeholder="记录阅读原因、当前想法或摘要。"
            disabled={isPending}
          />
          {state.fieldErrors.summary ? <p className="text-sm text-red-600">{state.fieldErrors.summary}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="tags">标签</Label>
          <Input
            id="tags"
            name="tags"
            value={formValues.tags}
            onChange={(event) => handleFieldChange("tags", event.target.value)}
            placeholder="例如：创作, 艺术, 非虚构"
            disabled={isPending}
          />
          <p className="text-xs leading-5 text-muted-foreground">使用逗号分隔多个标签，支持中英文逗号。</p>
          {state.fieldErrors.tags ? <p className="text-sm text-red-600">{state.fieldErrors.tags}</p> : null}
        </div>

        {state.message ? (
          <div
            className={
              state.status === "success"
                ? "rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-400"
                : "rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400"
            }
          >
            {state.message}
          </div>
        ) : null}

        <DialogFooter>
          <Button type="submit" size="lg" disabled={isPending}>
            {isPending ? "保存中..." : "保存书籍"}
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

export function AddBookDialog({ disabled = false }: AddBookDialogProps) {
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
          <Plus className="size-4" />
          新增书籍
        </Button>
      </DialogTrigger>
      <DialogContent
        className="max-h-[90vh] max-w-3xl overflow-y-auto"
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
        <DialogHeader>
          <DialogTitle>新增书籍</DialogTitle>
        </DialogHeader>

        <AddBookForm
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
