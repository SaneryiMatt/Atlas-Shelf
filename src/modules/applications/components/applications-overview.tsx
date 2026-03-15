import Link from "next/link";
import { ArrowRight, Briefcase, Clock3, TrendingDown, TrendingUp, Minus, CalendarClock, Building2 } from "lucide-react";

import { AddApplicationDialog } from "@/modules/applications/components/add-application-dialog";
import { ListControls } from "@/components/shared/list-controls";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ApplicationListItem, DashboardStat, PaginationInfo } from "@/lib/types/items";

interface ApplicationsOverviewProps {
  stats: DashboardStat[];
  items: ApplicationListItem[];
  sort: "applied" | "updated";
  pagination: PaginationInfo;
  canCreateApplications: boolean;
}

function StatCard({ label, value, detail, trend }: { label: string; value: string; detail: string; trend: string }) {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor = trend === "up" ? "text-green-500" : trend === "down" ? "text-red-500" : "text-muted-foreground";

  return (
    <div className="rounded-xl border border-border bg-card p-5 transition-colors hover:bg-accent/30">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <TrendIcon className={cn("size-4", trendColor)} />
      </div>
      <p className="mt-2 text-3xl font-semibold text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}

function SectionCard({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="border-b border-border px-5 py-4">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export function ApplicationsOverview({ stats, items, sort, pagination, canCreateApplications }: ApplicationsOverviewProps) {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-medium text-foreground">集中管理你的简历投递记录</h2>
          <p className="mt-1 text-sm text-muted-foreground">记录公司、岗位、来源、面试安排和最终结果，默认按投递时间倒序查看。</p>
        </div>
        <AddApplicationDialog disabled={!canCreateApplications} />
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      <SectionCard title="投递列表" description="点击卡片进入详情页，可继续更新进度、面试时间和结果。">
        <div className="space-y-4">
          <ListControls basePath="/applications" currentSort={sort} pagination={pagination} itemUnit="条投递" sortOptions={["applied", "updated"]} />

          {items.length ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((item) => (
                <Link
                  key={item.id}
                  href={`/applications/${item.id}`}
                  className="group flex flex-col rounded-xl border border-border bg-background p-4 transition-all hover:border-foreground/20 hover:bg-accent/50"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-medium text-foreground">{item.company}</h3>
                    <Badge className="text-xs">{item.stageLabel}</Badge>
                    <Badge variant="outline" className="text-xs">{item.resultLabel}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{item.role}</p>
                  <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{item.summary}</p>

                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Building2 className="size-3" />
                      {item.source}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="size-3" />
                      {item.appliedAtLabel}
                    </span>
                    <span className="flex items-center gap-1">
                      <CalendarClock className="size-3" />
                      {item.interviewAtLabel}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock3 className="size-3" />
                      {item.updatedAtLabel}
                    </span>
                  </div>

                  <div className="mt-auto flex items-center pt-4 text-sm text-muted-foreground transition-colors group-hover:text-foreground">
                    查看详情
                    <ArrowRight className="ml-1 size-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-background p-6 text-center text-sm text-muted-foreground">
              当前没有投递记录，可以先新增一条，后续再逐步更新进度和面试安排。
            </div>
          )}
        </div>
      </SectionCard>
    </div>
  );
}
