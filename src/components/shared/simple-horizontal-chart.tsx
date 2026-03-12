import type { ChartDatum } from "@/lib/types/items";

export function SimpleHorizontalChart({ items }: { items: ChartDatum[] }) {
  const maxValue = Math.max(...items.map((item) => item.value), 1);

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.label} className="space-y-2">
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="font-medium text-foreground">{item.label}</span>
            <span className="text-muted-foreground">{item.displayValue}</span>
          </div>
          <div className="h-2 rounded-full bg-secondary">
            <div
              className="h-2 rounded-full"
              style={{
                width: `${(item.value / maxValue) * 100}%`,
                backgroundColor: item.accent ?? "#a8a29e"
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
