import { TimerReset } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { TimelineFeed } from "@/components/shared/timeline-feed";
import type { TimelineEvent } from "@/lib/types/items";

export function TimelineOverview({ events }: { events: TimelineEvent[] }) {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="时间线模块"
        title="用一条时间线串起书籍、影视和旅行。"
        description="时间线基于共享项目层构建，让整个产品能够讲述你在不同内容之间切换注意力的过程。"
      />

      <SectionCard title="最近活动流" description="汇总所有模块的事件，后续可继续扩展筛选和保存视图。">
        <TimelineFeed events={events} />
      </SectionCard>

      <SectionCard title="为什么这很重要" description="当每个模块都共享一致的核心模型时，跨模块时间线会简单很多。">
        <div className="rounded-3xl bg-background/70 p-5 text-sm leading-6 text-muted-foreground">
          <TimerReset className="mb-3 size-5 text-primary" />
          路由层保持精简，时间线组件统一复用，后续数据库查询也能直接组合关键事件，不需要重复写页面逻辑。
        </div>
      </SectionCard>
    </div>
  );
}

