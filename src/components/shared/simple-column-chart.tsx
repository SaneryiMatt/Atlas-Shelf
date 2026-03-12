import type { ChartDatum } from "@/lib/types/items";

// 渐变色配置
const barGradients = [
  { from: "#3b82f6", to: "#1d4ed8" },
  { from: "#a855f7", to: "#7c3aed" },
  { from: "#10b981", to: "#059669" },
  { from: "#f59e0b", to: "#d97706" },
  { from: "#ec4899", to: "#be185d" },
  { from: "#06b6d4", to: "#0891b2" },
];

export function SimpleColumnChart({ items }: { items: ChartDatum[] }) {
  const maxValue = Math.max(...items.map((item) => item.value), 1);

  return (
    <div className="rounded-xl border border-border/30 bg-background/50 p-5">
      {/* 图表区域 */}
      <div className="flex h-48 items-end gap-1 sm:gap-2">
        {items.map((item, index) => {
          const heightPercent = Math.max((item.value / maxValue) * 100, item.value > 0 ? 8 : 3);
          const gradient = barGradients[index % barGradients.length];
          
          return (
            <div 
              key={item.label} 
              className="group flex min-w-0 flex-1 flex-col items-center gap-2"
            >
              {/* 数值标签 */}
              <div className="text-xs font-medium text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                {item.displayValue}
              </div>
              
              {/* 柱子容器 */}
              <div className="relative flex h-36 w-full items-end justify-center px-0.5">
                <div
                  className="relative w-full max-w-[32px] rounded-t-lg transition-all duration-300 group-hover:opacity-90"
                  style={{
                    height: `${heightPercent}%`,
                    background: item.accent 
                      ? item.accent 
                      : `linear-gradient(to top, ${gradient.to}, ${gradient.from})`,
                  }}
                >
                  {/* 顶部高光效果 */}
                  <div className="absolute inset-x-0 top-0 h-1/3 rounded-t-lg bg-gradient-to-b from-white/20 to-transparent" />
                </div>
              </div>
              
              {/* 月份标签 */}
              <div className="text-center text-xs text-muted-foreground/70">
                {item.label}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* 底部基线 */}
      <div className="mt-2 h-px bg-border/50" />
    </div>
  );
}
