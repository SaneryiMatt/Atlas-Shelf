"use client";

import { useActionState, useEffect, useState } from "react";
import { MapPinned } from "lucide-react";
import { useRouter } from "next/navigation";

import { MetadataCandidates } from "@/components/shared/metadata-candidates";
import { MetadataSideModal } from "@/components/shared/metadata-side-modal";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { mapMetadataCandidateToTravelPatch } from "@/lib/metadata/mappers";
import { useMetadataAutofill } from "@/lib/metadata/use-metadata-autofill";
import type { TravelEditorValues } from "@/lib/types/items";
import { createTravelAction, type CreateTravelFormState } from "@/modules/travels/actions";
import { travelStatusOptions } from "@/modules/travels/travel-form-schema";

const initialState: CreateTravelFormState = {
  status: "idle",
  message: null,
  fieldErrors: {}
};

const initialFormValues: TravelEditorValues = {
  placeName: "",
  country: "",
  city: "",
  status: "planned",
  travelDate: "",
  description: ""
};

const travelMetadataFields = ["placeName", "country", "city", "description"] as const;

interface AddTravelDialogProps {
  disabled?: boolean;
}

interface AddTravelFormProps {
  open: boolean;
  onSuccess: () => void;
}

function isMetadataSideModalTarget(target: EventTarget | null) {
  return target instanceof Element && target.closest("[data-metadata-side-modal='true']") !== null;
}

function AddTravelForm({ open, onSuccess }: AddTravelFormProps) {
  const [formValues, setFormValues] = useState(initialFormValues);
  const [state, formAction, isPending] = useActionState(createTravelAction, initialState);
  const {
    status: metadataStatus,
    candidates: metadataCandidates,
    appliedCandidateId,
    hasAttemptedSearch,
    errorMessage,
    applyCandidate,
    markFieldAsManual,
    resetAutofillState
  } = useMetadataAutofill<TravelEditorValues>({
    kind: "travel",
    query: formValues.placeName,
    trackedFields: travelMetadataFields,
    setFormValues,
    buildPatch: mapMetadataCandidateToTravelPatch
  });

  useEffect(() => {
    if (state.status !== "success") {
      return;
    }

    setFormValues(initialFormValues);
    resetAutofillState();
    onSuccess();
  }, [onSuccess, resetAutofillState, state.status]);

  function handleFieldChange<Key extends keyof TravelEditorValues>(field: Key, value: TravelEditorValues[Key]) {
    setFormValues((current) => ({
      ...current,
      [field]: value
    }));
    markFieldAsManual(field);
  }

  return (
    <>
      <form action={formAction} className="mx-auto w-full max-w-none space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="placeName" className="text-sm font-medium text-foreground/90">地点名称</Label>

            <Input
              id="placeName"
              name="placeName"
              value={formValues.placeName}
              onChange={(event) => handleFieldChange("placeName", event.target.value)}
              placeholder="例如：浅草寺"
              disabled={isPending}
              className="h-10 border-border/50 bg-background/50 transition-colors focus:border-foreground/30 focus:bg-background/80"
            />
            {state.fieldErrors.placeName ? <p className="text-xs text-red-400">{state.fieldErrors.placeName}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="country" className="text-sm font-medium text-foreground/90">
              国家或地区
            </Label>
            <Input
              id="country"
              name="country"
              value={formValues.country}
              onChange={(event) => handleFieldChange("country", event.target.value)}
              placeholder="例如：日本"
              disabled={isPending}
              className="h-10 border-border/50 bg-background/50 transition-colors focus:border-foreground/30 focus:bg-background/80"
            />
            {state.fieldErrors.country ? <p className="text-xs text-red-400">{state.fieldErrors.country}</p> : null}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="city" className="text-sm font-medium text-foreground/90">
              城市
            </Label>
            <Input
              id="city"
              name="city"
              value={formValues.city}
              onChange={(event) => handleFieldChange("city", event.target.value)}
              placeholder="例如：东京"
              disabled={isPending}
              className="h-10 border-border/50 bg-background/50 transition-colors focus:border-foreground/30 focus:bg-background/80"
            />
            {state.fieldErrors.city ? <p className="text-xs text-red-400">{state.fieldErrors.city}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="status" className="text-sm font-medium text-foreground/90">
              状态
            </Label>
            <Select
              name="status"
              value={formValues.status}
              onValueChange={(value) => handleFieldChange("status", value as TravelEditorValues["status"])}
              disabled={isPending}
            >
              <SelectTrigger
                id="status"
                className="h-10 border-border/50 bg-background/50 transition-colors focus:border-foreground/30 focus:bg-background/80"
              >
                <SelectValue placeholder="请选择状态" />
              </SelectTrigger>
              <SelectContent className="border-border/50 bg-card/95 backdrop-blur-xl">
                {travelStatusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {state.fieldErrors.status ? <p className="text-xs text-red-400">{state.fieldErrors.status}</p> : null}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="travelDate" className="text-sm font-medium text-foreground/90">
            旅行日期
          </Label>
          <Input
            id="travelDate"
            name="travelDate"
            type="date"
            value={formValues.travelDate}
            onChange={(event) => handleFieldChange("travelDate", event.target.value)}
            disabled={isPending}
            className="h-10 border-border/50 bg-background/50 transition-colors focus:border-foreground/30 focus:bg-background/80"
          />
          {state.fieldErrors.travelDate ? <p className="text-xs text-red-400">{state.fieldErrors.travelDate}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium text-foreground/90">
            描述
          </Label>
          <Textarea
            id="description"
            name="description"
            value={formValues.description}
            onChange={(event) => handleFieldChange("description", event.target.value)}
            placeholder="记录这个地点的印象、计划或为什么值得保存。"
            disabled={isPending}
            className="min-h-[88px] resize-none border-border/50 bg-background/50 transition-colors focus:border-foreground/30 focus:bg-background/80"
          />
          {state.fieldErrors.description ? <p className="text-xs text-red-400">{state.fieldErrors.description}</p> : null}
        </div>

        {state.message ? (
          <div
            className={
              state.status === "success"
                ? "rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-400"
                : "rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400"
            }
          >
            {state.message}
          </div>
        ) : null}

        <DialogFooter className="border-t border-border/30 pt-4">
          <Button type="submit" size="lg" disabled={isPending} className="min-w-[120px]">
            {isPending ? "保存中..." : "保存旅行地点"}
          </Button>
        </DialogFooter>
      </form>

      <MetadataSideModal open={open} title="自动检索">
        <MetadataCandidates
          query={formValues.placeName}
          status={metadataStatus}
          candidates={metadataCandidates}
          appliedCandidateId={appliedCandidateId}
          hasAttemptedSearch={hasAttemptedSearch}
          errorMessage={errorMessage}
          onApplyCandidate={applyCandidate}
        />
      </MetadataSideModal>
    </>
  );
}

export function AddTravelDialog({ disabled = false }: AddTravelDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

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

      <DialogContent
        className="max-h-[90vh] w-[min(92vw,640px)] overflow-y-auto rounded-2xl p-6 sm:p-7"
        onInteractOutside={(event) => {
          if (isMetadataSideModalTarget(event.target)) {
            event.preventDefault();
          }
        }}
        onFocusOutside={(event) => {
          if (isMetadataSideModalTarget(event.target)) {
            event.preventDefault();
          }
        }}
      >
<DialogHeader>
          <DialogTitle>新增旅行地点</DialogTitle>
        </DialogHeader>

        <AddTravelForm
          key={formKey}
          open={open}
          onSuccess={() => {
            setOpen(false);
            router.refresh();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
