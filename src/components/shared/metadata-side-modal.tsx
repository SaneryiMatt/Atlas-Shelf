"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";

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
            "fixed left-1/2 top-1/2 z-[60] w-[22rem] rounded-xl border border-border bg-card/95 shadow-xl backdrop-blur",
            "max-xl:top-[calc(50%+18.5rem)] max-xl:-translate-x-1/2 max-xl:-translate-y-1/2",
            "xl:-translate-y-1/2 xl:translate-x-[34rem]",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            className
          )}
        >
          <div className="border-b border-border/70 px-4 py-3">
            <DialogPrimitive.Title className="text-sm font-medium text-foreground">{title}</DialogPrimitive.Title>
          </div>
          <div className="p-4">{children}</div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
