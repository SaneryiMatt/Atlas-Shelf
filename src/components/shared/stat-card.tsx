import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import type { DashboardStat } from "@/lib/types/items";

const trendIcon = {
  up: ArrowUpRight,
  steady: ArrowRight,
  down: ArrowDownRight
};

export function StatCard({ label, value, detail, trend }: DashboardStat) {
  const TrendIcon = trendIcon[trend];

  return (
    <Card className="border-white/40 bg-white/80">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">{label}</p>
          <span className="rounded-full bg-secondary p-2 text-secondary-foreground">
            <TrendIcon className="size-4" />
          </span>
        </div>
        <div>
          <p className="text-3xl font-semibold tracking-tight text-foreground">{value}</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{detail}</p>
        </div>
      </CardContent>
    </Card>
  );
}

