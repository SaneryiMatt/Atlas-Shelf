"use client";

import { useActionState, useEffect, useState } from "react";
import { Clapperboard } from "lucide-react";
import { useRouter } from "next/navigation";

import { createMovieAction, type CreateMovieFormState } from "@/modules/movies/actions";
import { movieStatusOptions } from "@/modules/movies/screen-form-schema";
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

const initialState: CreateMovieFormState = {
  status: "idle",
  message: null,
  fieldErrors: {}
};

const initialFormValues = {
  title: "",
  director: "",
  releaseYear: "",
  platform: "",
  status: "planned",
  rating: "",
  note: "",
  tags: ""
};

interface AddMovieDialogProps {
  disabled?: boolean;
}

interface AddMovieFormProps {
  onSuccess: () => void;
}

function AddMovieForm({ onSuccess }: AddMovieFormProps) {
  const [formValues, setFormValues] = useState(initialFormValues);
  const [state, formAction, isPending] = useActionState(createMovieAction, initialState);

  useEffect(() => {
    if (state.status !== "success") {
      return;
    }

    setFormValues(initialFormValues);
    onSuccess();
  }, [onSuccess, state.status]);

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title">标题</Label>
          <Input
            id="title"
            name="title"
            value={formValues.title}
            onChange={(event) => setFormValues((current) => ({ ...current, title: event.target.value }))}
            placeholder="例如：花样年华"
            disabled={isPending}
          />
          {state.fieldErrors.title ? <p className="text-sm text-red-600">{state.fieldErrors.title}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="director">导演</Label>
          <Input
            id="director"
            name="director"
            value={formValues.director}
            onChange={(event) => setFormValues((current) => ({ ...current, director: event.target.value }))}
            placeholder="例如：王家卫"
            disabled={isPending}
          />
          {state.fieldErrors.director ? <p className="text-sm text-red-600">{state.fieldErrors.director}</p> : null}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="releaseYear">上映年份</Label>
          <Input
            id="releaseYear"
            name="releaseYear"
            inputMode="numeric"
            value={formValues.releaseYear}
            onChange={(event) => setFormValues((current) => ({ ...current, releaseYear: event.target.value }))}
            placeholder="例如：2000"
            disabled={isPending}
          />
          {state.fieldErrors.releaseYear ? <p className="text-sm text-red-600">{state.fieldErrors.releaseYear}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="platform">平台</Label>
          <Input
            id="platform"
            name="platform"
            value={formValues.platform}
            onChange={(event) => setFormValues((current) => ({ ...current, platform: event.target.value }))}
            placeholder="例如：Netflix"
            disabled={isPending}
          />
          {state.fieldErrors.platform ? <p className="text-sm text-red-600">{state.fieldErrors.platform}</p> : null}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="status">状态</Label>
          <Select
            name="status"
            value={formValues.status}
            onValueChange={(value) => setFormValues((current) => ({ ...current, status: value }))}
            disabled={isPending}
          >
            <SelectTrigger id="status">
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
          <Label htmlFor="rating">评分</Label>
          <Input
            id="rating"
            name="rating"
            type="number"
            min="0"
            max="5"
            step="0.1"
            value={formValues.rating}
            onChange={(event) => setFormValues((current) => ({ ...current, rating: event.target.value }))}
            placeholder="0 - 5"
            disabled={isPending}
          />
          {state.fieldErrors.rating ? <p className="text-sm text-red-600">{state.fieldErrors.rating}</p> : null}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="note">简短备注</Label>
        <Textarea
          id="note"
          name="note"
          value={formValues.note}
          onChange={(event) => setFormValues((current) => ({ ...current, note: event.target.value }))}
          placeholder="记录为什么想看、观影感受或保留这部片子的原因。"
          disabled={isPending}
        />
        {state.fieldErrors.note ? <p className="text-sm text-red-600">{state.fieldErrors.note}</p> : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">标签</Label>
        <Input
          id="tags"
          name="tags"
          value={formValues.tags}
          onChange={(event) => setFormValues((current) => ({ ...current, tags: event.target.value }))}
          placeholder="例如：爱情，经典，重看"
          disabled={isPending}
        />
        <p className="text-xs leading-5 text-muted-foreground">使用逗号分隔多个标签，支持中文逗号。</p>
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
          {isPending ? "保存中..." : "保存影视条目"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function AddMovieDialog({ disabled = false }: AddMovieDialogProps) {
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
        <Button className="gap-2" disabled={disabled}>
          <Clapperboard className="size-4" />
          新增电影
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>新增电影</DialogTitle>
          <DialogDescription>
            提交后会通过服务端 action 校验表单，并将数据写入 `projects`、`screen_details`、`project_notes` 和 `project_tags`。
          </DialogDescription>
        </DialogHeader>

        <AddMovieForm
          key={formKey}
          onSuccess={() => {
            setOpen(false);
            router.refresh();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
