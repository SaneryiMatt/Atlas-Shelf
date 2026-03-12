import { BellDot, Database, WandSparkles } from "lucide-react";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface AppHeaderProps {
  userEmail: string;
}

export function AppHeader({ userEmail }: AppHeaderProps) {
  return (
    <header className="flex flex-col gap-4 rounded-[2rem] border border-white/50 bg-white/75 p-5 shadow-soft backdrop-blur lg:flex-row lg:items-center lg:justify-between">
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">个人媒体与旅行追踪系统</p>
        <p className="font-serif text-2xl text-foreground">把书、影视和地点的记录放在同一个系统里。</p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Badge variant="outline" className="gap-2">
          <Database className="size-3.5" />
          统一项目模型
        </Badge>
        <Badge variant="success" className="gap-2">
          <WandSparkles className="size-3.5" />
          AI 就绪字段
        </Badge>
        <Badge variant="secondary">{userEmail}</Badge>
        <Button variant="outline" size="sm" className="gap-2">
          <BellDot className="size-4" />
          查看更新
        </Button>
        <SignOutButton />
      </div>
    </header>
  );
}
