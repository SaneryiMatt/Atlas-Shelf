# Atlas Shelf

一个面向个人媒体与旅行追踪场景的生产级基础项目，基于 Next.js App Router、TypeScript、Tailwind CSS、shadcn/ui、Supabase、PostgreSQL 和 Drizzle ORM 构建。

## 模块

- 总览
- 书籍
- 影视
- 旅行
- 时间线
- 分析
- 设置

## 架构要点

- `src/app`：路由入口与共享布局
- `src/modules`：按功能模块组织的页面渲染逻辑和局部 schema
- `src/components`：共享布局、数据展示与 shadcn 风格基础组件
- `src/lib/db/schema`：统一的 `projects` 主表，以及详情表、标签、笔记和照片表
- `src/lib/db/queries`：面向页面的服务端查询函数，可从 mock data 平滑切换到真实数据库读取

## 快速开始

```bash
npm install
npm run dev
```

## 环境变量

接入真实服务时，至少需要配置以下变量：

- `DATABASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

