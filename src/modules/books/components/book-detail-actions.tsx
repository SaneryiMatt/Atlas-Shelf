"use client";

import { useActionState, useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";

import { DeleteProjectDialog } from "@/components/shared/delete-project-dialog";
import { UploadProjectPhotoDialog } from "@/components/shared/upload-project-photo-dialog";
import { projectDetailActionButtonClassName } from "@/components/shared/project-detail-action-button-styles";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, dialogSelectContentClassName, dialogSelectTriggerClassName } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SegmentedRatingInput } from "@/components/shared/segmented-rating-input";
import type { BookEditorValues } from "@/lib/types/items";
import { bookStatusOptions } from "@/modules/books/book-form-schema";
import { deleteBookAction, type CreateBookFormState, updateBookAction } from "@/modules/books/actions";

const initialFormState: CreateBookFormState = {
  status: "idle",
  message: null,
  fieldErrors: {}
};

interface BookEditFormProps {
  projectId: string;
  initialValues: BookEditorValues;
  onSuccess: () => void;
}

function BookEditForm({ projectId, initialValues, onSuccess }: BookEditFormProps) {
  const [formValues, setFormValues] = useState(initialValues);
  const [state, formAction, isPending] = useActionState(updateBookAction, initialFormState);

  useEffect(() => {
    if (state.status !== "success") {
      return;
    }

    onSuccess();
  }, [onSuccess, state.status]);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="projectId" value={projectId} />

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="edit-book-title">标题</Label>
          <Input
            id="edit-book-title"
            name="title"
            value={formValues.title}
            onChange={(event) => setFormValues((current) => ({ ...current, title: event.target.value }))}
            disabled={isPending}
          />
          {state.fieldErrors.title ? <p className="text-sm text-red-600">{state.fieldErrors.title}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-book-author">作者</Label>
          <Input
            id="edit-book-author"
            name="author"
            value={formValues.author}
            onChange={(event) => setFormValues((current) => ({ ...current, author: event.target.value }))}
            disabled={isPending}
          />
          {state.fieldErrors.author ? <p className="text-sm text-red-600">{state.fieldErrors.author}</p> : null}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="edit-book-status">阅读状态</Label>
          <Select
            name="status"
            value={formValues.status}
            onValueChange={(value) => setFormValues((current) => ({ ...current, status: value as BookEditorValues["status"] }))}
            disabled={isPending}
          >
            <SelectTrigger id="edit-book-status" className={dialogSelectTriggerClassName}>
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
          {state.fieldErrors.status ? <p className="text-sm text-red-600">{state.fieldErrors.status}</p> : null}
        </div>

        <div className="space-y-2">
          <Label id="edit-book-rating-label">评分</Label>
          <SegmentedRatingInput
            id="edit-book-rating"
            name="rating"
            value={formValues.rating}
            onChange={(value) => setFormValues((current) => ({ ...current, rating: value }))}
            disabled={isPending}
            ariaLabelledBy="edit-book-rating-label"
          />
          {state.fieldErrors.rating ? <p className="text-sm text-red-600">{state.fieldErrors.rating}</p> : null}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="edit-book-startedAt">开始日期</Label>
          <Input
            id="edit-book-startedAt"
            name="startedAt"
            type="date"
            value={formValues.startedAt}
            onChange={(event) => setFormValues((current) => ({ ...current, startedAt: event.target.value }))}
            disabled={isPending}
          />
          {state.fieldErrors.startedAt ? <p className="text-sm text-red-600">{state.fieldErrors.startedAt}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-book-completedAt">结束日期</Label>
          <Input
            id="edit-book-completedAt"
            name="completedAt"
            type="date"
            value={formValues.completedAt}
            onChange={(event) => setFormValues((current) => ({ ...current, completedAt: event.target.value }))}
            disabled={isPending}
          />
          {state.fieldErrors.completedAt ? <p className="text-sm text-red-600">{state.fieldErrors.completedAt}</p> : null}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-book-summary">简短备注</Label>
        <Textarea
          id="edit-book-summary"
          name="summary"
          value={formValues.summary}
          onChange={(event) => setFormValues((current) => ({ ...current, summary: event.target.value }))}
          disabled={isPending}
        />
        {state.fieldErrors.summary ? <p className="text-sm text-red-600">{state.fieldErrors.summary}</p> : null}
      </div>

      <div className="space-y-2">
        <input type="hidden" name="tags" value={formValues.tags} />
        <Label htmlFor="edit-book-tags-input">标签</Label>
        <Input
          id="edit-book-tags-input"
          value={formValues.tags}
          onChange={(event) => setFormValues((current) => ({ ...current, tags: event.target.value }))}
          autoComplete="off"
          disabled={isPending}
        />
        {state.fieldErrors.tags ? <p className="text-sm text-red-600">{state.fieldErrors.tags}</p> : null}
      </div>

      {state.message ? (
        <div
          className={
            state.status === "success"
              ? "rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
              : "rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          }
        >
          {state.message}
        </div>
      ) : null}

      <DialogFooter>
        <Button type="submit" size="lg" disabled={isPending}>
          {isPending ? "保存中..." : "保存修改"}
        </Button>
      </DialogFooter>
    </form>
  );
}

interface EditBookDialogProps {
  projectId: string;
  initialValues: BookEditorValues;
}

function EditBookDialog({ projectId, initialValues }: EditBookDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);

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
        <Button variant="outline" className={projectDetailActionButtonClassName}>
          <Pencil className="size-4" />
          编辑
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>编辑书籍</DialogTitle>
          <DialogDescription>更新标题、作者、状态、评分、备注和标签。</DialogDescription>
        </DialogHeader>

        <BookEditForm
          key={formKey}
          projectId={projectId}
          initialValues={initialValues}
          onSuccess={() => {
            setOpen(false);
            router.refresh();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

interface BookDetailActionsProps {
  projectId: string;
  projectTitle: string;
  initialValues: BookEditorValues;
}

export function BookDetailActions({ projectId, projectTitle, initialValues }: BookDetailActionsProps) {
  return (
    <>
      <EditBookDialog projectId={projectId} initialValues={initialValues} />
      <UploadProjectPhotoDialog projectId={projectId} projectTitle={projectTitle} />
      <DeleteProjectDialog
        projectId={projectId}
        projectTitle={projectTitle}
        itemLabel="书籍"
        action={deleteBookAction}
      />
    </>
  );
}
