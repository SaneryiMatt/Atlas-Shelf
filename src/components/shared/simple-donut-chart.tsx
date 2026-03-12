import type { ChartDatum } from "@/lib/types/items";

interface SimpleDonutChartProps {
  items: ChartDatum[];
  centerLabel?: string;
  centerValue?: string;
}

const chartSize = 160;
const strokeWidth = 20;
const radius = (chartSize - strokeWidth) / 2;
const circumference = 2 * Math.PI * radius;

// 优雅的配色方案
const defaultColors = [
  "#3b82f6", // blue
  "#a855f7", // purple
  "#10b981", // emerald
  "#f59e0b", // amber
  "#ec4899", // pink
  "#06b6d4", // cyan
];

export function SimpleDonutChart({ items, centerLabel, centerValue }: SimpleDonutChartProps) {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  let progress = 0;

  // 为每个项目分配颜色
  const itemsWithColors = items.map((item, index) => ({
    ...item,
    color: item.accent ?? defaultColors[index % defaultColors.length]
  }));

  return (
    <div className="flex flex-col items-center gap-5">
      {/* 饼图 */}
      <div className="relative size-[160px]">
        <svg viewBox={`0 0 ${chartSize} ${chartSize}`} className="-rotate-90">
          {/* 背景圆环 */}
          <circle
            cx={chartSize / 2}
            cy={chartSize / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={strokeWidth}
          />
          {/* 数据段 */}
          {total > 0
            ? itemsWithColors.map((item) => {
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
                    stroke={item.color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${segmentLength} ${circumference}`}
                    strokeDashoffset={dashOffset}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                );
              })
            : null}
        </svg>

        {/* 中心内容 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-2xl font-bold text-foreground">{centerValue ?? total}</div>
          <div className="text-xs text-muted-foreground/70">{centerLabel ?? "总数"}</div>
        </div>
      </div>

      {/* 图例 */}
      <div className="w-full space-y-2">
        {itemsWithColors.map((item) => (
          <div 
            key={item.label} 
            className="flex items-center justify-between rounded-lg px-3 py-2 transition-colors hover:bg-accent/20"
          >
            <div className="flex items-center gap-2.5">
              <span
                className="size-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-foreground/90">{item.label}</span>
            </div>
            <span className="text-sm font-medium text-muted-foreground">{item.displayValue}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
