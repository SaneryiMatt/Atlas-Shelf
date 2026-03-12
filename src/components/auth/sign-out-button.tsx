import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";

export function SignOutButton() {
  // 暂时移除登出功能，方便前端开发
  return (
    <Button type="button" variant="ghost" size="icon" title="退出登录">
      <LogOut className="size-4" />
      <span className="sr-only">退出登录</span>
    </Button>
  );
}
