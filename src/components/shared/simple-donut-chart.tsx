import type { ChartDatum } from "@/lib/types/items";

interface SimpleDonutChartProps {
  items: ChartDatum[];
  centerLabel?: string;
  centerValue?: string;
}

const chartSize = 180;
const strokeWidth = 24;
const radius = (chartSize - strokeWidth) / 2;
const circumference = 2 * Math.PI * radius;

export function SimpleDonutChart({ items, centerLabel, centerValue }: SimpleDonutChartProps) {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  let progress = 0;

  return (
    <div className="grid gap-5 lg:grid-cols-[180px_minmax(0,1fr)] lg:items-center">
      <div className="relative mx-auto size-[180px]">
        <svg viewBox={`0 0 ${chartSize} ${chartSize}`} className="-rotate-90">
          <circle
            cx={chartSize / 2}
            cy={chartSize / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={strokeWidth}
          />
          {total > 0
            ? items.map((item) => {
                const segmentLength = (item.value / total) * circumference;
                const dashOffset = -progress * circumference;

                progress += item.value / total;

                return (
                  <circle
                    key={item.label}
                    cx={chartSize / 2}
                    cy={chartSize / 2}
                    r={radius}
                    fill="none"
                    stroke={item.accent ?? "#8b735b"}
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${segmentLength} ${circumference}`}
                    strokeDashoffset={dashOffset}
                  />
                );
              })
            : null}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          <div className="text-3xl font-semibold text-foreground">{centerValue ?? total}</div>
          <div className="mt-1 text-xs leading-5 text-muted-foreground">{centerLabel ?? "总数"}</div>
        </div>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.label} className="flex items-start justify-between gap-4 rounded-lg border border-border bg-background/70 px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <span
                className="mt-0.5 size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: item.accent ?? "#8b735b" }}
              />
              <span className="text-sm font-medium text-foreground">{item.label}</span>
            </div>
            <span className="shrink-0 text-sm text-muted-foreground">{item.displayValue}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
