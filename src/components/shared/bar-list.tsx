import type { CategoryBreakdown } from "@/lib/types/items";

export function BarList({ items }: { items: CategoryBreakdown[] }) {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.label} className="space-y-2">
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="font-medium text-foreground">{item.label}</span>
            <span className="text-muted-foreground">{item.value}</span>
          </div>
          <div className="h-2 rounded-full bg-secondary">
            <div
              className="h-2 rounded-full"
              style={{ width: item.value, backgroundColor: item.accent }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

