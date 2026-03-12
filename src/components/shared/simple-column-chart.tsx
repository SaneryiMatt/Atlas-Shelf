import type { ChartDatum } from "@/lib/types/items";

export function SimpleColumnChart({ items }: { items: ChartDatum[] }) {
  const maxValue = Math.max(...items.map((item) => item.value), 1);

  return (
    <div className="space-y-4">
      <div className="flex h-52 items-end gap-2">
        {items.map((item) => (
          <div key={item.label} className="flex min-w-0 flex-1 flex-col items-center gap-3">
            <div className="text-xs text-muted-foreground">{item.displayValue}</div>
            <div className="flex h-36 w-full items-end">
              <div
                className="w-full rounded-t-md bg-primary/80"
                style={{
                  height: `${Math.max((item.value / maxValue) * 100, item.value > 0 ? 10 : 4)}%`,
                  backgroundColor: item.accent ?? "#7c6f64"
                }}
              />
            </div>
            <div className="text-center text-xs text-muted-foreground">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
