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
import { type DeletePhotoState, deleteProjectPhotoAction } from "@/modules/photos/actions";

const initialState: DeletePhotoState = {
  status: "idle",
  message: null
};

interface DeleteProjectPhotoDialogProps {
  photoId: string;
}

export function DeleteProjectPhotoDialog({ photoId }: DeleteProjectPhotoDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(deleteProjectPhotoAction, initialState);

  useEffect(() => {
    if (state.status !== "success") {
      return;
    }

    setOpen(false);
    router.refresh();
  }, [router, state.status]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="border-red-500/30 text-red-500 hover:bg-red-500/10 hover:text-red-400">
          <Trash2 className="size-4" />
          删除
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>删除图片</DialogTitle>
          <DialogDescription>删除后会从详情页移除，并尝试同步清理存储中的文件。</DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="photoId" value={photoId} />

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
            <Button type="submit" disabled={isPending} className="bg-red-600 text-white hover:bg-red-700">
              {isPending ? "删除中..." : "确认删除"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
