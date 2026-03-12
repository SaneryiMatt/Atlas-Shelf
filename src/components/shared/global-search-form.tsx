import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface GlobalSearchFormProps {
  defaultValue?: string;
  compact?: boolean;
  className?: string;
}

export function GlobalSearchForm({ defaultValue = "", compact = false, className }: GlobalSearchFormProps) {
  return (
    <form action="/search" method="get" className={cn("flex w-full items-center gap-3", className)}>
      <Input
        name="q"
        defaultValue={defaultValue}
        placeholder="搜索书籍、影视、旅行"
        autoComplete="off"
        className={compact ? "h-10" : "h-11"}
      />
      <Button type="submit" variant={compact ? "outline" : "default"} className="shrink-0 gap-2">
        <Search className="size-4" />
        搜索
      </Button>
    </form>
  );
}
