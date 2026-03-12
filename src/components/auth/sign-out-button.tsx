import { LogOut } from "lucide-react";

import { signOutAction } from "@/app/login/actions";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  return (
    <form action={signOutAction}>
      <Button type="submit" variant="ghost" size="icon" title="退出登录">
        <LogOut className="size-4" />
        <span className="sr-only">退出登录</span>
      </Button>
    </form>
  );
}
