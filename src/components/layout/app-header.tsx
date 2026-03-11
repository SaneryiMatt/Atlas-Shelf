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
        <p className="text-sm text-muted-foreground">Personal media and travel operating system</p>
        <p className="font-serif text-2xl text-foreground">Balanced tracking for stories, screens, and places.</p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Badge variant="outline" className="gap-2">
          <Database className="size-3.5" />
          Unified item model
        </Badge>
        <Badge variant="success" className="gap-2">
          <WandSparkles className="size-3.5" />
          AI-ready fields
        </Badge>
        <Badge variant="secondary">{userEmail}</Badge>
        <Button variant="outline" size="sm" className="gap-2">
          <BellDot className="size-4" />
          Review updates
        </Button>
        <SignOutButton />
      </div>
    </header>
  );
}