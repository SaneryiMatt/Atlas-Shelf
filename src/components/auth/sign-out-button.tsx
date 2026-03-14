"use client";

import { LogOut } from "lucide-react";
import { useFormStatus } from "react-dom";

import { signOutAction } from "@/app/login/actions";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SignOutButtonProps {
  className?: string;
  label?: string;
  pendingLabel?: string;
  showLabel?: boolean;
  size?: ButtonProps["size"];
  variant?: ButtonProps["variant"];
}

export function SignOutButton({
  className,
  label = "退出登录",
  pendingLabel = "正在退出",
  showLabel = false,
  size = "icon",
  variant = "ghost"
}: SignOutButtonProps) {
  return (
    <form action={signOutAction}>
      <SubmitButton
        className={className ?? ""}
        label={label}
        pendingLabel={pendingLabel}
        showLabel={showLabel}
        size={size}
        variant={variant}
      />
    </form>
  );
}

function SubmitButton({
  className,
  label,
  pendingLabel,
  showLabel,
  size,
  variant
}: Required<SignOutButtonProps>) {
  const { pending } = useFormStatus();
  const currentLabel = pending ? pendingLabel : label;

  return (
    <Button
      type="submit"
      variant={variant}
      size={size}
      title={currentLabel}
      disabled={pending}
      className={cn(showLabel && "min-w-24", className)}
    >
      <LogOut className="size-4" />
      {showLabel ? <span>{currentLabel}</span> : <span className="sr-only">{currentLabel}</span>}
    </Button>
  );
}
