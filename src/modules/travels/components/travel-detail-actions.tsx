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
import { Textarea } from "@/components/ui/textarea";
import type { TravelEditorValues } from "@/lib/types/items";
import { type CreateTravelFormState, deleteTravelAction, updateTravelAction } from "@/modules/travels/actions";

const initialFormState: CreateTravelFormState = {
  status: "idle",
  message: null,
  fieldErrors: {}
};

interface TravelEditFormProps {
  projectId: string;
  initialValues: TravelEditorValues;
  onSuccess: () => void;
}

function TravelEditForm({ projectId, initialValues, onSuccess }: TravelEditFormProps) {
  const [formValues, setFormValues] = useState(initialValues);
  const [state, formAction, isPending] = useActionState(updateTravelAction, initialFormState);

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
          <Label htmlFor="edit-travel-placeName">地点名称</Label>
          <Input
            id="edit-travel-placeName"
            name="placeName"
            value={formValues.placeName}
            onChange={(event) => setFormValues((current) => ({ ...current, placeName: event.target.value }))}
            disabled={isPending}
          />
          {state.fieldErrors.placeName ? <p className="text-sm text-red-600">{state.fieldErrors.placeName}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-travel-country">国家或地区</Label>
          <Input
            id="edit-travel-country"
            name="country"
            value={formValues.country}
            onChange={(event) => setFormValues((current) => ({ ...current, country: event.target.value }))}
            disabled={isPending}
          />
          {state.fieldErrors.country ? <p className="text-sm text-red-600">{state.fieldErrors.country}</p> : null}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="edit-travel-city">城市</Label>
          <Input
            id="edit-travel-city"
            name="city"
            value={formValues.city}
            onChange={(event) => setFormValues((current) => ({ ...current, city: event.target.value }))}
            disabled={isPending}
          />
          {state.fieldErrors.city ? <p className="text-sm text-red-600">{state.fieldErrors.city}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-travel-travelDate">旅行日期</Label>
          <Input
            id="edit-travel-travelDate"
            name="travelDate"
            type="date"
            value={formValues.travelDate}
            onChange={(event) => setFormValues((current) => ({ ...current, travelDate: event.target.value }))}
            disabled={isPending}
          />
          {state.fieldErrors.travelDate ? <p className="text-sm text-red-600">{state.fieldErrors.travelDate}</p> : null}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-travel-description">描述</Label>
        <Textarea
          id="edit-travel-description"
          name="description"
          value={formValues.description}
          onChange={(event) => setFormValues((current) => ({ ...current, description: event.target.value }))}
          disabled={isPending}
        />
        {state.fieldErrors.description ? <p className="text-sm text-red-600">{state.fieldErrors.description}</p> : null}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="edit-travel-latitude">纬度</Label>
          <Input
            id="edit-travel-latitude"
            name="latitude"
            inputMode="decimal"
            value={formValues.latitude}
            onChange={(event) => setFormValues((current) => ({ ...current, latitude: event.target.value }))}
            disabled={isPending}
          />
          {state.fieldErrors.latitude ? <p className="text-sm text-red-600">{state.fieldErrors.latitude}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-travel-longitude">经度</Label>
          <Input
            id="edit-travel-longitude"
            name="longitude"
            inputMode="decimal"
            value={formValues.longitude}
            onChange={(event) => setFormValues((current) => ({ ...current, longitude: event.target.value }))}
            disabled={isPending}
          />
          {state.fieldErrors.longitude ? <p className="text-sm text-red-600">{state.fieldErrors.longitude}</p> : null}
        </div>
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

interface EditTravelDialogProps {
  projectId: string;
  initialValues: TravelEditorValues;
}

function EditTravelDialog({ projectId, initialValues }: EditTravelDialogProps) {
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
          <DialogTitle>编辑旅行地点</DialogTitle>
          <DialogDescription>更新地点、时间、描述和坐标信息。</DialogDescription>
        </DialogHeader>

        <TravelEditForm
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

interface TravelDetailActionsProps {
  projectId: string;
  projectTitle: string;
  initialValues: TravelEditorValues;
}

export function TravelDetailActions({ projectId, projectTitle, initialValues }: TravelDetailActionsProps) {
  return (
    <>
      <EditTravelDialog projectId={projectId} initialValues={initialValues} />
      <UploadProjectPhotoDialog projectId={projectId} projectTitle={projectTitle} />
      <DeleteProjectDialog
        projectId={projectId}
        projectTitle={projectTitle}
        itemLabel="旅行地点"
        redirectTo="/travels"
        action={deleteTravelAction}
      />
    </>
  );
}
