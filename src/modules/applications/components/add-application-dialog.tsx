"use client";

import { useActionState, useEffect, useState } from "react";
import { Briefcase, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

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
import type { ApplicationEditorValues } from "@/lib/types/items";
import { createApplicationAction, type CreateApplicationFormState } from "@/modules/applications/actions";
import {
  applicationResultOptions,
  applicationStageOptions
} from "@/modules/applications/application-form-schema";

const initialState: CreateApplicationFormState = {
  status: "idle",
  message: null,
  fieldErrors: {}
};

const initialFormValues: ApplicationEditorValues = {
  company: "",
  role: "",
  source: "",
  stage: "applied",
  result: "pending",
  appliedAt: "",
  interviewAt: "",
  notes: ""
};

interface AddApplicationDialogProps {
  disabled?: boolean;
}

interface AddApplicationFormProps {
  onSuccess: () => void;
}

function AddApplicationForm({ onSuccess }: AddApplicationFormProps) {
  const [formValues, setFormValues] = useState(initialFormValues);
  const [state, formAction, isPending] = useActionState(createApplicationAction, initialState);

  useEffect(() => {
    if (state.status !== "success") {
      return;
    }

    setFormValues(initialFormValues);
    onSuccess();
  }, [onSuccess, state.status]);

  function setField<Key extends keyof ApplicationEditorValues>(field: Key, value: ApplicationEditorValues[Key]) {
    setFormValues((current) => ({
      ...current,
      [field]: value
    }));
  }

  return (
    <form action={formAction} className="mx-auto w-full max-w-none space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="company">公司</Label>
          <Input id="company" name="company" value={formValues.company} onChange={(event) => setField("company", event.target.value)} disabled={isPending} />
          {state.fieldErrors.company ? <p className="text-xs text-red-500">{state.fieldErrors.company}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">岗位</Label>
          <Input id="role" name="role" value={formValues.role} onChange={(event) => setField("role", event.target.value)} disabled={isPending} />
          {state.fieldErrors.role ? <p className="text-xs text-red-500">{state.fieldErrors.role}</p> : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="source">来源</Label>
          <Input id="source" name="source" value={formValues.source} onChange={(event) => setField("source", event.target.value)} placeholder="Boss 直聘、官网、内推等" disabled={isPending} />
          {state.fieldErrors.source ? <p className="text-xs text-red-500">{state.fieldErrors.source}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="appliedAt">投递时间</Label>
          <Input id="appliedAt" name="appliedAt" type="date" value={formValues.appliedAt} onChange={(event) => setField("appliedAt", event.target.value)} disabled={isPending} />
          {state.fieldErrors.appliedAt ? <p className="text-xs text-red-500">{state.fieldErrors.appliedAt}</p> : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="stage">当前进度</Label>
          <Select name="stage" value={formValues.stage} onValueChange={(value) => setField("stage", value)} disabled={isPending}>
            <SelectTrigger id="stage" className={dialogSelectTriggerClassName}>
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
          {state.fieldErrors.stage ? <p className="text-xs text-red-500">{state.fieldErrors.stage}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="result">最终结果</Label>
          <Select name="result" value={formValues.result} onValueChange={(value) => setField("result", value)} disabled={isPending}>
            <SelectTrigger id="result" className={dialogSelectTriggerClassName}>
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
          {state.fieldErrors.result ? <p className="text-xs text-red-500">{state.fieldErrors.result}</p> : null}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="interviewAt">下一场面试时间</Label>
        <Input id="interviewAt" name="interviewAt" type="datetime-local" value={formValues.interviewAt} onChange={(event) => setField("interviewAt", event.target.value)} disabled={isPending} />
        {state.fieldErrors.interviewAt ? <p className="text-xs text-red-500">{state.fieldErrors.interviewAt}</p> : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">备注</Label>
        <Textarea id="notes" name="notes" value={formValues.notes} onChange={(event) => setField("notes", event.target.value)} disabled={isPending} className="min-h-[96px]" />
        {state.fieldErrors.notes ? <p className="text-xs text-red-500">{state.fieldErrors.notes}</p> : null}
      </div>

      {state.message ? (
        <div className={state.status === "success" ? "rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700" : "rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"}>
          {state.message}
        </div>
      ) : null}

      <DialogFooter className="border-t border-border/30 pt-4">
        <Button type="submit" size="lg" disabled={isPending} className="min-w-[120px]">
          {isPending ? "保存中..." : "保存投递记录"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function AddApplicationDialog({ disabled = false }: AddApplicationDialogProps) {
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
          新增投递记录
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] w-[min(92vw,640px)] overflow-y-auto rounded-2xl p-6 sm:p-7">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="size-5" />
            新增投递记录
          </DialogTitle>
        </DialogHeader>

        <AddApplicationForm
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
