"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

interface MetadataSideModalProps {
  open: boolean;
  title?: string;
  className?: string;
  children: React.ReactNode;
}

export function MetadataSideModal({
  open,
  title = "自动检索",
  className,
  children
}: MetadataSideModalProps) {
  return (
    <DialogPrimitive.Root open={open} modal={false}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Content
          data-metadata-side-modal="true"
          className={cn(
            "fixed left-1/2 top-1/2 z-[60] w-[22rem]",
            "rounded-2xl border border-border/40 bg-card/90 shadow-2xl backdrop-blur-xl",
            "ring-1 ring-white/[0.05]",
            "max-xl:top-[calc(50%+18.5rem)] max-xl:-translate-x-1/2 max-xl:-translate-y-1/2",
            "xl:-translate-y-1/2 xl:translate-x-[20rem]",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[state=closed]:slide-out-to-right-4 data-[state=open]:slide-in-from-right-4",
            className
          )}
        >
          <div className="flex items-center gap-2 border-b border-border/40 px-4 py-3">
            <div className="flex size-6 items-center justify-center rounded-md bg-accent/60">
              <Sparkles className="size-3.5 text-foreground/70" />
            </div>
            <DialogPrimitive.Title className="text-sm font-medium tracking-tight text-foreground">
              {title}
            </DialogPrimitive.Title>
          </div>
          <div className="p-4">{children}</div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
