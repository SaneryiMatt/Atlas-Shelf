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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, dialogSelectContentClassName, dialogSelectTriggerClassName } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { discreteRatingOptions } from "@/lib/module-list";
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
      <form action={formAction} className="mx-auto w-full max-w-none space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium text-foreground/90">
              标题
            </Label>
            <Input
              id="title"
              name="title"
              value={formValues.title}
              onChange={(event) => handleFieldChange("title", event.target.value)}
              placeholder="例如：《创造行为》"
              disabled={isPending}
              className="h-10 border-border/50 bg-background/50 transition-colors focus:border-foreground/30 focus:bg-background/80"
            />
            {state.fieldErrors.title ? <p className="text-xs text-red-400">{state.fieldErrors.title}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="author" className="text-sm font-medium text-foreground/90">
              作者
            </Label>
            <Input
              id="author"
              name="author"
              value={formValues.author}
              onChange={(event) => handleFieldChange("author", event.target.value)}
              placeholder="例如：里克·鲁宾"
              disabled={isPending}
              className="h-10 border-border/50 bg-background/50 transition-colors focus:border-foreground/30 focus:bg-background/80"
            />
            {state.fieldErrors.author ? <p className="text-xs text-red-400">{state.fieldErrors.author}</p> : null}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="status" className="text-sm font-medium text-foreground/90">
              阅读状态
            </Label>
            <Select
              name="status"
              value={formValues.status}
              onValueChange={(value) => handleFieldChange("status", value as BookEditorValues["status"])}
              disabled={isPending}
            >
              <SelectTrigger id="status" className={dialogSelectTriggerClassName}>
                <SelectValue placeholder="请选择阅读状态" />
              </SelectTrigger>
              <SelectContent className={dialogSelectContentClassName}>
                {bookStatusOptions.map((option) => (
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
            <Select
              name="rating"
              value={formValues.rating || undefined}
              onValueChange={(value) => handleFieldChange("rating", value)}
              disabled={isPending}
            >
              <SelectTrigger id="rating" className={dialogSelectTriggerClassName}>
                <SelectValue placeholder="请选择评分" />
              </SelectTrigger>
              <SelectContent className={dialogSelectContentClassName}>
                {discreteRatingOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {state.fieldErrors.rating ? <p className="text-xs text-red-400">{state.fieldErrors.rating}</p> : null}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="startedAt" className="text-sm font-medium text-foreground/90">
              开始日期
            </Label>
            <Input
              id="startedAt"
              name="startedAt"
              type="date"
              value={formValues.startedAt}
              onChange={(event) => handleFieldChange("startedAt", event.target.value)}
              disabled={isPending}
              className="h-10 border-border/50 bg-background/50 transition-colors focus:border-foreground/30 focus:bg-background/80"
            />
            {state.fieldErrors.startedAt ? <p className="text-xs text-red-400">{state.fieldErrors.startedAt}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="completedAt" className="text-sm font-medium text-foreground/90">
              完成日期
            </Label>
            <Input
              id="completedAt"
              name="completedAt"
              type="date"
              value={formValues.completedAt}
              onChange={(event) => handleFieldChange("completedAt", event.target.value)}
              disabled={isPending}
              className="h-10 border-border/50 bg-background/50 transition-colors focus:border-foreground/30 focus:bg-background/80"
            />
            {state.fieldErrors.completedAt ? <p className="text-xs text-red-400">{state.fieldErrors.completedAt}</p> : null}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="summary" className="text-sm font-medium text-foreground/90">
            简短备注
          </Label>
          <Textarea
            id="summary"
            name="summary"
            value={formValues.summary}
            onChange={(event) => handleFieldChange("summary", event.target.value)}
            placeholder="记录阅读原因、当前想法或摘要。"
            disabled={isPending}
            className="min-h-[88px] resize-none border-border/50 bg-background/50 transition-colors focus:border-foreground/30 focus:bg-background/80"
          />
          {state.fieldErrors.summary ? <p className="text-xs text-red-400">{state.fieldErrors.summary}</p> : null}
        </div>

        <div className="space-y-2">
          <input type="hidden" name="tags" value={formValues.tags} />
          <Label htmlFor="add-book-tags-input" className="text-sm font-medium text-foreground/90">
            标签
          </Label>
          <Input
            id="add-book-tags-input"
            value={formValues.tags}
            onChange={(event) => handleFieldChange("tags", event.target.value)}
            autoComplete="off"
            placeholder="例如：创作, 艺术, 非虚构"
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
