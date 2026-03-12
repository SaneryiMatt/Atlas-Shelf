import { CalendarDays, TimerReset } from "lucide-react";

import { SectionCard } from "@/components/shared/section-card";
import { TimelineFeed } from "@/components/shared/timeline-feed";
import type { TimelinePageData } from "@/lib/types/items";

export function TimelineOverview({ totalCount, groups }: TimelinePageData) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <header className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Timeline</h1>
        <p className="mt-2 text-muted-foreground">按时间回看全部条目</p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-medium text-muted-foreground">总条目数</p>
          <p className="mt-3 text-3xl font-semibold text-foreground">{totalCount}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-medium text-muted-foreground">活跃月份</p>
          <p className="mt-3 text-3xl font-semibold text-foreground">{groups.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-medium text-muted-foreground">最新分组</p>
          <p className="mt-3 text-base font-medium text-foreground">{groups[0]?.label ?? "暂无记录"}</p>
        </div>
      </section>

      {groups.length ? (
        <div className="space-y-6">
          {groups.map((group) => (
            <SectionCard
              key={group.key}
              title={group.label}
              description={`${group.events.length} 条记录，已按时间倒序排列。`}
            >
              <TimelineFeed events={group.events} />
            </SectionCard>
          ))}
        </div>
      ) : (
        <SectionCard title="Timeline" description="等你开始记录后，这里会自动汇总全部条目。">
          <div className="rounded-xl border border-dashed border-border bg-background p-6 text-sm leading-6 text-muted-foreground">
            <CalendarDays className="mb-3 size-5 text-primary" />
            还没有可展示的时间线数据。
          </div>
        </SectionCard>
      )}

      <SectionCard title="说明" description="时间线使用每个条目最接近实际发生时间的字段来排序。">
        <div className="rounded-3xl bg-background/70 p-5 text-sm leading-6 text-muted-foreground">
          <TimerReset className="mb-3 size-5 text-primary" />
          书籍和影视优先使用完成时间，其次是开始时间；旅行优先使用出发日期；如果这些字段为空，则回退到最近更新时间。
        </div>
      </SectionCard>
    </div>
  );
}
