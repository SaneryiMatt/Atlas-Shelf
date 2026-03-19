"use client";

import { useActionState, useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";

import { DeleteProjectDialog } from "@/components/shared/delete-project-dialog";
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
import type { ApplicationEditorValues } from "@/lib/types/items";
import {
  deleteApplicationAction,
  type CreateApplicationFormState,
  updateApplicationAction
} from "@/modules/applications/actions";
import {
  applicationResultOptions,
  applicationStageOptions
} from "@/modules/applications/application-form-schema";

const initialFormState: CreateApplicationFormState = {
  status: "idle",
  message: null,
  fieldErrors: {}
};

interface ApplicationEditFormProps {
  projectId: string;
  initialValues: ApplicationEditorValues;
  onSuccess: () => void;
}

function ApplicationEditForm({ projectId, initialValues, onSuccess }: ApplicationEditFormProps) {
  const [formValues, setFormValues] = useState(initialValues);
  const [state, formAction, isPending] = useActionState(updateApplicationAction, initialFormState);

  useEffect(() => {
    if (state.status !== "success") {
      return;
    }

    onSuccess();
  }, [onSuccess, state.status]);

  function setField<Key extends keyof ApplicationEditorValues>(field: Key, value: ApplicationEditorValues[Key]) {
    setFormValues((current) => ({
      ...current,
      [field]: value
    }));
  }

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="projectId" value={projectId} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="edit-company">公司</Label>
          <Input id="edit-company" name="company" value={formValues.company} onChange={(event) => setField("company", event.target.value)} disabled={isPending} />
          {state.fieldErrors.company ? <p className="text-sm text-red-600">{state.fieldErrors.company}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-role">岗位</Label>
          <Input id="edit-role" name="role" value={formValues.role} onChange={(event) => setField("role", event.target.value)} disabled={isPending} />
          {state.fieldErrors.role ? <p className="text-sm text-red-600">{state.fieldErrors.role}</p> : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="edit-source">来源</Label>
          <Input id="edit-source" name="source" value={formValues.source} onChange={(event) => setField("source", event.target.value)} disabled={isPending} />
          {state.fieldErrors.source ? <p className="text-sm text-red-600">{state.fieldErrors.source}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-appliedAt">投递时间</Label>
          <Input id="edit-appliedAt" name="appliedAt" type="date" value={formValues.appliedAt} onChange={(event) => setField("appliedAt", event.target.value)} disabled={isPending} />
          {state.fieldErrors.appliedAt ? <p className="text-sm text-red-600">{state.fieldErrors.appliedAt}</p> : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="edit-stage">当前进度</Label>
          <Select name="stage" value={formValues.stage} onValueChange={(value) => setField("stage", value)} disabled={isPending}>
            <SelectTrigger id="edit-stage" className={dialogSelectTriggerClassName}>
              <SelectValue placeholder="请选择进度" />
            </SelectTrigger>
            <SelectContent className={dialogSelectContentClassName}>
              {applicationStageOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {state.fieldErrors.stage ? <p className="text-sm text-red-600">{state.fieldErrors.stage}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-result">最终结果</Label>
          <Select name="result" value={formValues.result} onValueChange={(value) => setField("result", value)} disabled={isPending}>
            <SelectTrigger id="edit-result" className={dialogSelectTriggerClassName}>
              <SelectValue placeholder="请选择结果" />
            </SelectTrigger>
            <SelectContent className={dialogSelectContentClassName}>
              {applicationResultOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {state.fieldErrors.result ? <p className="text-sm text-red-600">{state.fieldErrors.result}</p> : null}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-interviewAt">下一场面试时间</Label>
        <Input id="edit-interviewAt" name="interviewAt" type="datetime-local" value={formValues.interviewAt} onChange={(event) => setField("interviewAt", event.target.value)} disabled={isPending} />
        {state.fieldErrors.interviewAt ? <p className="text-sm text-red-600">{state.fieldErrors.interviewAt}</p> : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-notes">备注</Label>
        <Textarea id="edit-notes" name="notes" value={formValues.notes} onChange={(event) => setField("notes", event.target.value)} disabled={isPending} className="min-h-[96px]" />
        {state.fieldErrors.notes ? <p className="text-sm text-red-600">{state.fieldErrors.notes}</p> : null}
      </div>

      {state.message ? (
        <div className={state.status === "success" ? "rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700" : "rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"}>
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

interface EditApplicationDialogProps {
  projectId: string;
  initialValues: ApplicationEditorValues;
}

function EditApplicationDialog({ projectId, initialValues }: EditApplicationDialogProps) {
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
          <DialogTitle>编辑投递记录</DialogTitle>
          <DialogDescription>更新公司、岗位、进度和面试安排。</DialogDescription>
        </DialogHeader>

        <ApplicationEditForm
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

interface ApplicationDetailActionsProps {
  projectId: string;
  projectTitle: string;
  initialValues: ApplicationEditorValues;
}

export function ApplicationDetailActions({ projectId, projectTitle, initialValues }: ApplicationDetailActionsProps) {
  return (
    <>
      <EditApplicationDialog projectId={projectId} initialValues={initialValues} />
      <DeleteProjectDialog
        projectId={projectId}
        projectTitle={projectTitle}
        itemLabel="投递记录"
        action={deleteApplicationAction}
      />
    </>
  );
}
