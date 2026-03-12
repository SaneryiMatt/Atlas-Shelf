"use client";

import { useActionState, useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";

import { DeleteProjectDialog } from "@/components/shared/delete-project-dialog";
import { UploadProjectPhotoDialog } from "@/components/shared/upload-project-photo-dialog";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { MovieEditorValues } from "@/lib/types/items";
import { type CreateMovieFormState, deleteMovieAction, updateMovieAction } from "@/modules/movies/actions";
import { movieStatusOptions } from "@/modules/movies/screen-form-schema";

const initialFormState: CreateMovieFormState = {
  status: "idle",
  message: null,
  fieldErrors: {}
};

interface MovieEditFormProps {
  projectId: string;
  initialValues: MovieEditorValues;
  onSuccess: () => void;
}

function MovieEditForm({ projectId, initialValues, onSuccess }: MovieEditFormProps) {
  const [formValues, setFormValues] = useState(initialValues);
  const [state, formAction, isPending] = useActionState(updateMovieAction, initialFormState);

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
          <Label htmlFor="edit-movie-title">标题</Label>
          <Input
            id="edit-movie-title"
            name="title"
            value={formValues.title}
            onChange={(event) => setFormValues((current) => ({ ...current, title: event.target.value }))}
            disabled={isPending}
          />
          {state.fieldErrors.title ? <p className="text-sm text-red-600">{state.fieldErrors.title}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-movie-director">导演</Label>
          <Input
            id="edit-movie-director"
            name="director"
            value={formValues.director}
            onChange={(event) => setFormValues((current) => ({ ...current, director: event.target.value }))}
            disabled={isPending}
          />
          {state.fieldErrors.director ? <p className="text-sm text-red-600">{state.fieldErrors.director}</p> : null}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="edit-movie-releaseYear">上映年份</Label>
          <Input
            id="edit-movie-releaseYear"
            name="releaseYear"
            inputMode="numeric"
            value={formValues.releaseYear}
            onChange={(event) => setFormValues((current) => ({ ...current, releaseYear: event.target.value }))}
            disabled={isPending}
          />
          {state.fieldErrors.releaseYear ? <p className="text-sm text-red-600">{state.fieldErrors.releaseYear}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-movie-platform">平台</Label>
          <Input
            id="edit-movie-platform"
            name="platform"
            value={formValues.platform}
            onChange={(event) => setFormValues((current) => ({ ...current, platform: event.target.value }))}
            disabled={isPending}
          />
          {state.fieldErrors.platform ? <p className="text-sm text-red-600">{state.fieldErrors.platform}</p> : null}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="edit-movie-status">状态</Label>
          <Select
            name="status"
            value={formValues.status}
            onValueChange={(value) => setFormValues((current) => ({ ...current, status: value as MovieEditorValues["status"] }))}
            disabled={isPending}
          >
            <SelectTrigger id="edit-movie-status">
              <SelectValue placeholder="请选择状态" />
            </SelectTrigger>
            <SelectContent>
              {movieStatusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {state.fieldErrors.status ? <p className="text-sm text-red-600">{state.fieldErrors.status}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-movie-rating">评分</Label>
          <Input
            id="edit-movie-rating"
            name="rating"
            type="number"
            min="0"
            max="5"
            step="0.1"
            value={formValues.rating}
            onChange={(event) => setFormValues((current) => ({ ...current, rating: event.target.value }))}
            disabled={isPending}
          />
          {state.fieldErrors.rating ? <p className="text-sm text-red-600">{state.fieldErrors.rating}</p> : null}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-movie-note">简短备注</Label>
        <Textarea
          id="edit-movie-note"
          name="note"
          value={formValues.note}
          onChange={(event) => setFormValues((current) => ({ ...current, note: event.target.value }))}
          disabled={isPending}
        />
        {state.fieldErrors.note ? <p className="text-sm text-red-600">{state.fieldErrors.note}</p> : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-movie-tags">标签</Label>
        <Input
          id="edit-movie-tags"
          name="tags"
          value={formValues.tags}
          onChange={(event) => setFormValues((current) => ({ ...current, tags: event.target.value }))}
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

interface EditMovieDialogProps {
  projectId: string;
  initialValues: MovieEditorValues;
}

function EditMovieDialog({ projectId, initialValues }: EditMovieDialogProps) {
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
        <Button>
          <Pencil className="size-4" />
          编辑
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>编辑影视条目</DialogTitle>
          <DialogDescription>更新标题、导演、平台、评分、备注和标签。</DialogDescription>
        </DialogHeader>

        <MovieEditForm
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

interface MovieDetailActionsProps {
  projectId: string;
  projectTitle: string;
  initialValues: MovieEditorValues;
}

export function MovieDetailActions({ projectId, projectTitle, initialValues }: MovieDetailActionsProps) {
  return (
    <>
      <EditMovieDialog projectId={projectId} initialValues={initialValues} />
      <UploadProjectPhotoDialog projectId={projectId} projectTitle={projectTitle} />
      <DeleteProjectDialog
        projectId={projectId}
        projectTitle={projectTitle}
        itemLabel="影视条目"
        redirectTo="/movies"
        action={deleteMovieAction}
      />
    </>
  );
}
