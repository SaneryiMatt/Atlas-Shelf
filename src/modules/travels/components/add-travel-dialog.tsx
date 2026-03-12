"use client";

import { useActionState, useEffect, useState } from "react";
import { MapPinned } from "lucide-react";
import { useRouter } from "next/navigation";

import { createTravelAction, type CreateTravelFormState } from "@/modules/travels/actions";
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

const initialState: CreateTravelFormState = {
  status: "idle",
  message: null,
  fieldErrors: {}
};

const initialFormValues = {
  placeName: "",
  country: "",
  city: "",
  travelDate: "",
  description: "",
  latitude: "",
  longitude: ""
};

interface AddTravelDialogProps {
  disabled?: boolean;
}

interface AddTravelFormProps {
  onSuccess: () => void;
}

function AddTravelForm({ onSuccess }: AddTravelFormProps) {
  const [formValues, setFormValues] = useState(initialFormValues);
  const [state, formAction, isPending] = useActionState(createTravelAction, initialState);

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
          <Label htmlFor="placeName">地点名称</Label>
          <Input
            id="placeName"
            name="placeName"
            value={formValues.placeName}
            onChange={(event) => setFormValues((current) => ({ ...current, placeName: event.target.value }))}
            placeholder="例如：浅草寺"
            disabled={isPending}
          />
          {state.fieldErrors.placeName ? <p className="text-sm text-red-600">{state.fieldErrors.placeName}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="country">国家或地区</Label>
          <Input
            id="country"
            name="country"
            value={formValues.country}
            onChange={(event) => setFormValues((current) => ({ ...current, country: event.target.value }))}
            placeholder="例如：日本"
            disabled={isPending}
          />
          {state.fieldErrors.country ? <p className="text-sm text-red-600">{state.fieldErrors.country}</p> : null}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="city">城市</Label>
          <Input
            id="city"
            name="city"
            value={formValues.city}
            onChange={(event) => setFormValues((current) => ({ ...current, city: event.target.value }))}
            placeholder="例如：东京"
            disabled={isPending}
          />
          {state.fieldErrors.city ? <p className="text-sm text-red-600">{state.fieldErrors.city}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="travelDate">旅行日期</Label>
          <Input
            id="travelDate"
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
        <Label htmlFor="description">描述</Label>
        <Textarea
          id="description"
          name="description"
          value={formValues.description}
          onChange={(event) => setFormValues((current) => ({ ...current, description: event.target.value }))}
          placeholder="记录这个地点的印象、计划或为什么值得保存。"
          disabled={isPending}
        />
        {state.fieldErrors.description ? <p className="text-sm text-red-600">{state.fieldErrors.description}</p> : null}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="latitude">纬度</Label>
          <Input
            id="latitude"
            name="latitude"
            inputMode="decimal"
            value={formValues.latitude}
            onChange={(event) => setFormValues((current) => ({ ...current, latitude: event.target.value }))}
            placeholder="例如：35.714765"
            disabled={isPending}
          />
          {state.fieldErrors.latitude ? <p className="text-sm text-red-600">{state.fieldErrors.latitude}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="longitude">经度</Label>
          <Input
            id="longitude"
            name="longitude"
            inputMode="decimal"
            value={formValues.longitude}
            onChange={(event) => setFormValues((current) => ({ ...current, longitude: event.target.value }))}
            placeholder="例如：139.796655"
            disabled={isPending}
          />
          {state.fieldErrors.longitude ? <p className="text-sm text-red-600">{state.fieldErrors.longitude}</p> : null}
        </div>
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
          {isPending ? "保存中..." : "保存旅行地点"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function AddTravelDialog({ disabled = false }: AddTravelDialogProps) {
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
          <MapPinned className="size-4" />
          新增地点
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>新增旅行地点</DialogTitle>
          <DialogDescription>
            提交后会通过服务端 action 校验表单，并将数据写入 `projects`、`travel_details` 和 `project_notes`。
          </DialogDescription>
        </DialogHeader>

        <AddTravelForm
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
