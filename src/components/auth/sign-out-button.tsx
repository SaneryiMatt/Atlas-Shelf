import { LogOut } from "lucide-react";

import { signOutAction } from "@/app/login/actions";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  return (
    <form action={signOutAction}>
      <Button type="submit" variant="outline" size="sm" className="gap-2">
        <LogOut className="size-4" />
        Sign out
      </Button>
    </form>
  );
}