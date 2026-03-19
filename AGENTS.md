# AGENTS.md

## 项目概览

- 产品名称为 `Atlas Shelf`。
- `package.json` 中的包名目前仍为 `vibe-coding-test`，修改工程配置时注意区分“产品名”和“包名”。
- 这是一个中文界面的个人追踪系统，主要覆盖四类条目：
  - 书籍
  - 影视
  - 旅行
  - 求职投递
- 技术栈：
  - Next.js 15 App Router
  - React 19
  - TypeScript
  - Tailwind CSS
  - Radix / shadcn 风格组件
  - Supabase
  - PostgreSQL
  - Drizzle ORM
- 默认主题为深色主题。
- 整体 UI 文案、日期格式、交互提示以中文为主。
- 当前主要开发环境为 Windows 11。

## Windows 开发环境与编码约束

- 本项目主要在 Windows 11 环境下开发与运行，所有代码修改都必须优先考虑 Windows 兼容性。
- 所有新建或修改的源码文件必须保持 UTF-8 编码。
- 不要引入 GBK、ANSI 或其他本地编码格式。
- 修改中文文案时，必须避免乱码、异常转义、隐藏字符、字符损坏。
- 保持现有文件的换行风格，不要因为 LF / CRLF 差异导致整文件出现无关 diff。
- 不要仅因格式化或编码问题重写整个文件，优先做最小修改。
- 提供命令、脚本或路径时，要优先考虑 Windows 可执行性。
- 不要默认依赖 bash、zsh、grep、sed、export 等 Unix 风格命令，除非明确说明替代方案。
- 路径写法、环境变量写法、脚本执行方式都要尽量采用跨平台方案。
- 修改包含中文的 TSX、JSON、Markdown、配置文件后，必须确保中文仍可正常显示。
- 如果发现现有文件存在乱码，不要继续扩散乱码内容，应优先恢复为正常 UTF-8 文本。

## 目录结构与职责

### `src/app`

- 路由入口目录。
- `src/app/(app)` 为登录后的受保护区域。
- `src/app/login` 处理登录与注册。
- `src/app/api` 放置 route handlers，目前包括搜索和元数据候选接口。

### `src/modules`

- 按业务模块组织代码。
- 每个核心模块通常包含：
  - `actions.ts`
  - 表单 schema
  - overview 组件
  - 详情页操作组件

### `src/components`

- `ui`：基础 UI 组件封装。
- `layout`：应用壳层组件。
- `shared`：跨模块复用的页面、弹窗、列表、详情等共享组件。

### `src/lib`

- 放共享运行时逻辑、类型、服务封装和数据访问适配。
- 重点包括：
  - `auth.ts`
  - `env.ts`
  - `module-list.ts`
  - `types/items.ts`
  - `supabase/*`
  - `db/queries/*`
  - `db/schema/*`
  - `metadata/*`

### `drizzle`

- SQL migration 输出目录。

### `scripts`

- 运维脚本或一次性脚本。
- 例如媒体路径回迁脚本。

## 关键架构约定

## 1 路由与认证

- 登录后页面统一走 `src/app/(app)/layout.tsx`。
- 该 layout 会调用 `requireUser()`。
- 新增需要登录保护的页面时，优先放到 `src/app/(app)` 下。
- 不要绕过现有认证壳层单独实现一套保护逻辑。
- `middleware.ts` 会调用 `src/lib/supabase/middleware.ts` 更新会话。

执行要求：

- 新增受保护页面时，默认放入 `src/app/(app)`。
- 服务端需要用户上下文的逻辑，优先复用 `requireUser()`。
- 不要在客户端伪造认证判断替代服务端校验。

## 2 数据读取

- 页面层通常不直接拼 Supabase 查询。
- 优先调用 `src/lib/db/queries/*` 下的查询函数。
- 查询层负责把 RPC 行数据映射成页面可直接消费的 view model。

当前项目是混合态，不要假设所有页面都已完全迁移到真实数据库：

- `src/lib/db/queries/analytics.ts` 仍完全依赖 `src/lib/db/mock-data.ts`
- `src/lib/db/queries/books.ts` 的列表来自 Supabase RPC，但 `notes` 仍来自 mock 数据
- `src/lib/db/queries/settings.ts` 为混合态：
  - 环境变量状态和数据库快照来自真实数据
  - `panels` 仍来自 mock 数据

执行要求：

- 修改读取逻辑前，先确认目标页面属于真实数据、mock 数据还是混合态。
- 不要在页面组件内临时拼复杂查询替代查询层。
- 修改查询返回结构时，要同步检查调用该查询的 overview、detail、search、settings 等消费端。

## 3 数据写入

当前主链路为：

- 客户端表单组件
- 模块内 `actions.ts`
- `src/lib/supabase/app-data.ts` 中的 RPC 包装
- Supabase / PostgreSQL RPC

执行要求：

- 所有表单提交前都必须经过 Zod schema 校验。
- 写入完成后必须显式调用 `revalidatePath()`。
- `revalidatePath()` 需要覆盖：
  - 对应模块列表页
  - 对应详情页
  - 可能受影响的聚合页

常见需要同步刷新的路径包括：

- 模块列表页
- 模块详情页
- `/settings`
- `/timeline`
- `/search`
- `/` 的 layout

不要：

- 不要只写数据库、不做 revalidate。
- 不要在客户端直接绕过 action 调用高权限数据写入。
- 不要只改 action，不同步 RPC 包装层。

## 4 数据库角色分工

- 运行时核心数据读写依赖：
  - Supabase Auth
  - Supabase RPC
  - Supabase Storage
- Drizzle 主要承担：
  - schema 声明
  - migration 生成
  - migration 执行

注意：

- `DATABASE_URL` 更偏向迁移、脚本、受控后台任务。
- 普通前端运行时逻辑不要把 `DATABASE_URL` 当作主入口。
- 不要把 Drizzle 当作前端运行时主要读写通道。

## 5 类型语义约定

- UI 中使用 `movie` / `movies`。
- 数据库层的项目类型仍为 `screen`。
- `src/app/api/search/route.ts` 已显式把 `screen` 映射为前端的 `movie`。

执行要求：

- 做类型判断、搜索映射、详情页映射时，严格区分 `movie` 和 `screen`。
- 不要在前后端映射层混用命名。
- 若新增影视相关逻辑，先确认当前层语义属于 UI 层还是数据库层。

## 模块实现模式

## 1 模块目录约定

典型模块通常包含：

- `actions.ts`
- `*-form-schema.ts`
- `components/*-overview.tsx`
- `components/add-*.tsx`
- `components/*-detail-actions.tsx`

参考模块：

- `src/modules/books`
- `src/modules/movies`
- `src/modules/travels`
- `src/modules/applications`

执行要求：

- 新增模块或补齐模块能力时，优先参考现有最相近模块。
- 不要脱离现有目录结构重写一套并行模式。

## 2 表单约定

- 表单 schema 放在模块目录内，使用 Zod 定义。
- schema 除了基础字段校验，也承担跨字段约束。
- `actions.ts` 的返回值通常包含：
  - `status`
  - `message`
  - `fieldErrors`
- 客户端通过 `useActionState()` 绑定 server action。

执行要求：

- 新增表单字段时，同步更新 schema、action 返回错误结构、前端回显逻辑。
- 不要让字段校验散落在客户端组件和服务端 action 两边，优先集中到 schema。
- 错误提示文案保持中文。

## 3 页面与共享组件

优先复用以下共享组件：

- 详情页：`src/components/shared/project-detail-page.tsx`
- 删除条目：`src/components/shared/delete-project-dialog.tsx`
- 图片上传：`src/components/shared/upload-project-photo-dialog.tsx`
- 列表控制逻辑：`src/components/shared/list-controls.tsx`
- 应用壳层：`src/components/layout/app-shell.tsx`

执行要求：

- 能复用共享组件时，不要复制一份近似实现。
- 修改共享组件时，必须评估书籍、影视、旅行、投递等多个模块是否会受到影响。

## 4 UI 组件约定

- 优先复用 `src/components/ui/*` 中已经封装好的基础组件。
- 不要在业务组件里重复造一套 Button、Dialog、Select 等基础控件。
- 对话框中的下拉选择，优先复用 `src/components/ui/select.tsx` 导出的组件与样式常量：
  - `Select`
  - `SelectTrigger`
  - `SelectContent`
  - `dialogSelectTriggerClassName`
  - `dialogSelectContentClassName`
- 项目详情页操作按钮样式优先复用：
  - `src/components/shared/project-detail-action-button-styles.ts`

执行要求：

- 文案、标签、空态提示统一使用中文。
- 视觉风格要保持与现有深色主题、Tailwind 语言、shadcn 风格一致。
- 不要引入英文占位文案、英文按钮文本或风格突兀的新组件体系。

## 元数据补全与外部能力

- 书籍、影视、旅行的新增表单支持元数据自动补全。
- 相关代码主要集中在：
  - `src/lib/metadata/*`
  - `src/app/api/metadata/candidates/route.ts`
  - 各模块的 `add-*` 对话框

依赖环境变量：

- `OPENROUTER_API_KEY`
- 相关 `OPENROUTER_*` 配置项

注意：

- 该接口要求用户已登录，匿名请求会返回 401。

执行要求：

- 修改元数据补全逻辑时，必须同时检查以下位置：
  - 路由请求 / 响应 schema
  - 前端 `useMetadataAutofill`
  - 候选映射器 `mappers.ts`
- 不要只改前端候选展示而不改后端 schema。
- 不要只改候选映射器而不验证 API 返回结构。

## 图片与存储

- 媒体文件当前使用 Supabase Storage。
- 存储辅助逻辑位于 `src/lib/supabase/storage.ts`。
- 路径约定按用户隔离：`${userId}/...`

正确上传顺序：

1. 先上传到 storage
2. 再创建数据库中的 photo record
3. 若创建记录失败，尽量回滚 storage 文件

正确删除顺序：

1. 先删除数据库记录
2. 再尽力清理 storage 文件
3. 若 storage 清理失败，保留数据库已删除结果，不回滚原逻辑

相关运维脚本：

- `scripts/rehome-media-assets.mjs`

执行要求：

- 修改图片上传/删除逻辑时，保持上述顺序不变。
- 不要只删 storage 不删数据库记录。
- 不要在 storage 清理失败时回滚已完成的数据库删除。

## 新增或修改功能时的同步检查面

## 1 为已有模块新增字段

通常需要同步检查以下位置：

- 模块表单 schema
- 模块 `actions.ts`
- `src/lib/types/items.ts`
- overview / detail 组件
- `src/lib/db/queries/*` 的映射逻辑
- `src/lib/supabase/app-data.ts` 的 RPC payload 与返回类型
- 数据库 RPC
- migration
- Drizzle schema
- `revalidatePath()` 覆盖范围

执行要求：

- 不要只加前端字段，不改底层写入。
- 不要只改数据库，不改上层类型与映射。
- 不要漏掉详情页、列表页、搜索页、设置页等消费端。

## 2 新增一个全新模块

至少需要补齐：

- `src/app/(app)` 下的列表页和详情页
- `src/modules/<module>` 目录
- `src/lib/types/items.ts`
- `src/lib/db/queries/<module>.ts`
- `src/lib/supabase/app-data.ts`
- `src/lib/db/schema/*`
- `drizzle/*`

并额外检查是否需要接入：

- 导航
- 搜索
- 时间线
- 设置页预览

执行要求：

- 新模块应尽量沿用既有模块模式。
- 不要先做一套页面，再事后补类型、搜索、设置接入。
- 如果模块属于项目条目体系，优先检查是否应复用 `project-detail-page` 及现有 project 抽象。

## 3 修改 RPC 或数据库结构

- 运行时逻辑以 `src/lib/supabase/app-data.ts` 作为统一封装面。
- 新增或修改 RPC 时，这里必须同步更新。
- Drizzle schema 和 `drizzle` 目录下的 migration 必须保持一致。

执行要求：

- 不要只改 TypeScript 类型而不改底层 SQL / RPC。
- 不要只改 migration 而不更新上层映射。
- 不要让页面直接依赖未封装的 RPC 细节。

## 环境变量

关键环境变量定义在：

- `src/lib/env.ts`
- `.env.example`

常用项包括：

- `DATABASE_URL`
- `LEGACY_OWNER_USER_ID`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET`
- `OPENROUTER_API_KEY`
- `OPENROUTER_MODEL`
- `OPENROUTER_METADATA_MODEL`
- `OPENROUTER_METADATA_TIMEOUT_MS`
- `OPENROUTER_METADATA_MAX_TOKENS`

注意：

- 正常页面功能主要依赖 Supabase 公共环境变量。
- `SUPABASE_SERVICE_ROLE_KEY` 只应用于受控脚本或管理能力。
- 不要把 `SUPABASE_SERVICE_ROLE_KEY` 引入普通页面读写链路。

## 本地开发与验证

常用命令：

```bash
npm run dev
npm run lint
npm run build
npm run db:migrate
npm run storage:rehome -- --dry-run