"use client";

import { useActionState, useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

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

interface DeleteDialogState {
  status: "idle" | "success" | "error";
  message: string | null;
}

interface DeleteProjectDialogProps {
  projectId: string;
  projectTitle: string;
  itemLabel: string;
  redirectTo: string;
  action: (state: DeleteDialogState, formData: FormData) => Promise<DeleteDialogState>;
}

const initialState: DeleteDialogState = {
  status: "idle",
  message: null
};

export function DeleteProjectDialog({
  projectId,
  projectTitle,
  itemLabel,
  redirectTo,
  action
}: DeleteProjectDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.status !== "success") {
      return;
    }

    setOpen(false);
    router.push(redirectTo);
    router.refresh();
  }, [redirectTo, router, state.status]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700">
          <Trash2 className="size-4" />
          删除
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>确认删除{itemLabel}</DialogTitle>
          <DialogDescription>
            这会删除“{projectTitle}”及其关联的标签、笔记和图片记录。该操作不可撤销。
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-5">
          <input type="hidden" name="projectId" value={projectId} />

          <div className="rounded-3xl border border-red-200 bg-red-50 p-5 text-sm leading-6 text-red-700">
            请确认你要删除这条记录。删除后，详情页和列表页都会立即同步。
          </div>

          {state.message ? (
            <div
              className={
                state.status === "error"
                  ? "rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                  : "rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
              }
            >
              {state.message}
            </div>
          ) : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              取消
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {isPending ? "删除中..." : "确认删除"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
