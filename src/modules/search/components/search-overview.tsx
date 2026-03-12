import Link from "next/link";
import { Compass, Film, Search, SearchX } from "lucide-react";

import { GlobalSearchForm } from "@/components/shared/global-search-form";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { SearchPageData, SearchResultGroup, SearchResultKind } from "@/lib/types/items";

const groupIcons: Record<SearchResultKind, typeof Search> = {
  book: Search,
  movie: Film,
  travel: Compass
};

type SearchOverviewProps = SearchPageData;

function SearchGroupSection({ group }: { group: SearchResultGroup }) {
  const GroupIcon = groupIcons[group.key];

  return (
    <SectionCard
      title={`${group.title} · ${group.items.length}`}
      description={group.description}
    >
      {group.items.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {group.items.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="group rounded-3xl border border-border/60 bg-background/70 p-5 transition hover:-translate-y-0.5 hover:border-primary/40 hover:bg-background/90"
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="gap-2">
                  <GroupIcon className="size-3.5" />
                  {group.title}
                </Badge>
                <Badge>{item.statusLabel}</Badge>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground transition group-hover:text-primary">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{item.meta}</p>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">{item.summary}</p>
              <div className="mt-4 grid gap-2 text-sm text-muted-foreground">
                <p>评分：{item.ratingLabel}</p>
                <p>最近更新：{item.updatedAtLabel}</p>
              </div>
              {item.tags.length ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <Badge key={`${item.id}-${tag}`} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              ) : null}
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-border bg-background/60 p-6 text-sm leading-6 text-muted-foreground">
          当前没有命中{group.title}结果。
        </div>
      )}
    </SectionCard>
  );
}

export function SearchOverview({ query, totalCount, groups }: SearchOverviewProps) {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="全局搜索"
        title="在 books、movies、travels 里统一检索"
        description="搜索会覆盖标题、摘要、类型详情字段和标签，当前使用 PostgreSQL ILIKE 查询。"
        actions={<GlobalSearchForm defaultValue={query} className="w-full max-w-xl" />}
      />

      {!query ? (
        <SectionCard title="开始搜索" description="输入关键词后，系统会统一返回书籍、影视和旅行结果。">
          <div className="rounded-3xl border border-dashed border-border bg-background/60 p-8 text-sm leading-7 text-muted-foreground">
            <Search className="mb-4 size-5 text-primary" />
            可以尝试搜索作品标题、作者、导演、平台、国家、城市或标签。
          </div>
        </SectionCard>
      ) : null}

      {query ? (
        <section className="grid gap-4 md:grid-cols-3">
          <Card className="border-white/40 bg-white/80">
            <CardContent className="space-y-3 p-5">
              <p className="text-sm text-muted-foreground">当前关键词</p>
              <p className="text-3xl font-semibold text-foreground">{query}</p>
              <p className="text-sm leading-6 text-muted-foreground">搜索会在三类内容中同时执行。</p>
            </CardContent>
          </Card>
          <Card className="border-white/40 bg-white/80">
            <CardContent className="space-y-3 p-5">
              <p className="text-sm text-muted-foreground">总命中数</p>
              <p className="text-3xl font-semibold text-foreground">{totalCount}</p>
              <p className="text-sm leading-6 text-muted-foreground">按模块分组展示，便于快速跳转。</p>
            </CardContent>
          </Card>
          <Card className="border-white/40 bg-white/80">
            <CardContent className="space-y-3 p-5">
              <p className="text-sm text-muted-foreground">搜索范围</p>
              <p className="text-3xl font-semibold text-foreground">3 个模块</p>
              <p className="text-sm leading-6 text-muted-foreground">Books、Movies、Travels</p>
            </CardContent>
          </Card>
        </section>
      ) : null}

      {query && totalCount === 0 ? (
        <SectionCard title="没有找到结果" description="可以尝试更短的关键词，或改搜作者、导演、地点和标签。">
          <div className="rounded-3xl border border-dashed border-border bg-background/60 p-8 text-sm leading-7 text-muted-foreground">
            <SearchX className="mb-4 size-5 text-primary" />
            “{query}” 当前没有命中任何书籍、影视或旅行记录。
          </div>
        </SectionCard>
      ) : null}

      {query && totalCount > 0 ? groups.map((group) => <SearchGroupSection key={group.key} group={group} />) : null}
    </div>
  );
}
