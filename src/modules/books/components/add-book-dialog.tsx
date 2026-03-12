"use client";

import { useActionState, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

import { createBookAction, type CreateBookFormState } from "@/modules/books/actions";
import { bookStatusOptions } from "@/modules/books/book-form-schema";
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

const initialState: CreateBookFormState = {
  status: "idle",
  message: null,
  fieldErrors: {}
};

const initialFormValues = {
  title: "",
  author: "",
  status: "planned",
  rating: "",
  startedAt: "",
  completedAt: "",
  summary: "",
  tags: ""
};

interface AddBookDialogProps {
  disabled?: boolean;
}

interface AddBookFormProps {
  onSuccess: () => void;
}

function AddBookForm({ onSuccess }: AddBookFormProps) {
  const [formValues, setFormValues] = useState(initialFormValues);
  const [state, formAction, isPending] = useActionState(createBookAction, initialState);

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
            placeholder="例如：悉达多"
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
            onChange={(event) => setFormValues((current) => ({ ...current, author: event.target.value }))}
            placeholder="例如：赫尔曼·黑塞"
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
            onValueChange={(value) => setFormValues((current) => ({ ...current, status: value }))}
            disabled={isPending}
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="请选择状态" />
            </SelectTrigger>
            <SelectContent>
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
            step="0.1"
            value={formValues.rating}
            onChange={(event) => setFormValues((current) => ({ ...current, rating: event.target.value }))}
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
            onChange={(event) => setFormValues((current) => ({ ...current, startedAt: event.target.value }))}
            disabled={isPending}
          />
          {state.fieldErrors.startedAt ? <p className="text-sm text-red-600">{state.fieldErrors.startedAt}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="completedAt">结束日期</Label>
          <Input
            id="completedAt"
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
        <Label htmlFor="summary">简短备注</Label>
        <Textarea
          id="summary"
          name="summary"
          value={formValues.summary}
          onChange={(event) => setFormValues((current) => ({ ...current, summary: event.target.value }))}
          placeholder="记录阅读原因、预期感受或当前想法。"
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
          onChange={(event) => setFormValues((current) => ({ ...current, tags: event.target.value }))}
          placeholder="例如：哲学，经典，重读"
          disabled={isPending}
        />
        <p className="text-xs leading-5 text-muted-foreground">使用逗号分隔多个标签，支持中文逗号。</p>
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
  );
}

export function AddBookDialog({ disabled = false }: AddBookDialogProps) {
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
          <Plus className="size-4" />
          新增书本
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>新增书本</DialogTitle>
          <DialogDescription>
            使用服务端 action 提交数据，并通过 Drizzle 写入 `projects`、`book_details`、`project_notes` 和 `project_tags`。
          </DialogDescription>
        </DialogHeader>

        <AddBookForm
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
