"use client";

import { useActionState, useEffect, useState } from "react";
import { ImagePlus } from "lucide-react";
import { useRouter } from "next/navigation";

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
import { type UploadPhotoFormState, uploadProjectPhotoAction } from "@/modules/photos/actions";

const initialFormState: UploadPhotoFormState = {
  status: "idle",
  message: null,
  fieldErrors: {}
};

interface PhotoUploadFormProps {
  projectId: string;
  onSuccess: () => void;
}

function PhotoUploadForm({ projectId, onSuccess }: PhotoUploadFormProps) {
  const [state, formAction, isPending] = useActionState(uploadProjectPhotoAction, initialFormState);

  useEffect(() => {
    if (state.status !== "success") {
      return;
    }

    onSuccess();
  }, [onSuccess, state.status]);

  return (
    <form action={formAction} encType="multipart/form-data" className="space-y-5">
      <input type="hidden" name="projectId" value={projectId} />

      <div className="space-y-2">
        <Label htmlFor="upload-photo-file">图片文件</Label>
        <Input
          id="upload-photo-file"
          name="file"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          disabled={isPending}
        />
        <p className="text-xs text-muted-foreground">支持 JPG、PNG、WebP、GIF，单张不超过 10 MB。</p>
        {state.fieldErrors.file ? <p className="text-sm text-red-600">{state.fieldErrors.file}</p> : null}
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
          {isPending ? "上传中..." : "上传图片"}
        </Button>
      </DialogFooter>
    </form>
  );
}

interface UploadProjectPhotoDialogProps {
  projectId: string;
  projectTitle: string;
}

export function UploadProjectPhotoDialog({ projectId, projectTitle }: UploadProjectPhotoDialogProps) {
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
          <ImagePlus className="size-4" />
          上传图片
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>上传图片</DialogTitle>
          <DialogDescription>为“{projectTitle}”选择一张图片，上传后会直接显示在详情页。</DialogDescription>
        </DialogHeader>

        <PhotoUploadForm
          key={formKey}
          projectId={projectId}
          onSuccess={() => {
            setOpen(false);
            router.refresh();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
