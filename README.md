# 同游 - 沉浸式讲解 App 原型

一款以**同游（边走边听）**为核心的沉浸式 AI 旅伴应用；MVP 聚焦恭王府动线与苏东坡 / 毒舌老炮双旅伴。

---

## 🧭 产品导航（MVP）

| Tab | 路径 | 说明 |
|-----|------|------|
| **同游** | `/walk`（默认首页） | 恭王府模拟游览、围栏触发、聊天式讲解 |
| **城市故事** | `/discover` | 浏览 / 搜索城市故事，可切换旅伴听不同版本 |
| **我的** | `/profile` | 默认旅伴、收藏、设置 |

`/` 自动重定向至 `/walk`。

---

## 📋 项目概览

| 项目信息 | 详情 |
|---------|------|
| 应用名称 | 同游 |
| 项目类型 | 移动端 Web App 原型 |
| 技术栈 | React 18 + TypeScript + Vite 6 + TailwindCSS 3 |
| 部署方式 | Cloudflare Pages + Pages Functions |
| 状态管理 | Zustand |
| 路由管理 | React Router DOM 7 |

---

## ✨ 已实现功能

### 1. 同游 · 边走边听 (`/walk`) — MVP 核心

| 功能模块 | 说明 |
|---------|------|
| 出场视频 | `WalkIntroVideo` 组件、`walk-intro-played`（24h/旅伴）、`public/videos/` 资源已就绪（**WalkListen 待挂载**） |
| 模拟游览 | 恭王府 12 站点条，MVP 不依赖现场 GPS |
| 围栏触发 | 进入围栏随机播一个**未播**段子的第一幕 |
| 多段子列表 | 同一围栏每个段子各占聊天列表一行（`addMessage`） |
| 卡片续读 | 同一段子内「继续说 / 上一幕」切换 1～3 幕（`updateMessage`，不增行） |
| 段子去重 | 已播段子 localStorage 持久化，API `exclude` 参数排除 |
| 旅伴 | 使用「我的」页 **默认旅伴**（本页不可切换）；TTS 走 ElevenLabs |
| 首屏提示 | 进入聊天页后悬浮显示「我的页可改默认旅伴」，渐隐消失（不占布局） |

> 设计目标、阶段规划、语料格式、状态机详见 **[docs/walk-listen-architecture.md](docs/walk-listen-architecture.md)**。

### 2. 城市故事 (`/discover`)

| 功能模块 | 说明 |
|---------|------|
| 故事浏览 | 双列卡片展示城市故事 |
| 搜索 / 标签 | 按标题、描述搜索；按标签筛选 |
| 连播入口 | 跳转连播编排页（`/playlist`） |

### 3. 故事列表页 (`/stories`)

Legacy 路由，功能与 Discover 类似，保留兼容。

### 4. 故事播放页 (`/story/:id`)

| 功能模块 | 说明 |
|---------|------|
| 播放器控制 | 播放/暂停、进度条拖动、音量调节 |
| 时间显示 | 当前播放时间 / 总时长 |
| 旅伴选择 | 可切换苏东坡 / 毒舌老炮两位旅伴（不同故事版本） |
| 更多旅伴 | 点击进入旅伴选择列表页面 |
| 故事内容 | 展开/收起展示故事详情文本 |
| 收藏功能 | 收藏/取消收藏故事 |
| 分享功能 | 分享按钮入口 |
| 迷你播放器 | 播放时底部显示迷你播放器 |
| 附近推荐 | 展示附近更多故事 |

### 5. 旅伴选择列表页 (`/companions`)

| 功能模块 | 说明 |
|---------|------|
| 2 位旅伴卡片 | 苏东坡、毒舌老炮 |
| 收藏旅伴 | 点击心形图标收藏/取消收藏旅伴 |
| 听TA讲故事 | 点击按钮选中旅伴并返回故事播放页 |
| 点击卡片 | 返回故事播放页并切换旅伴 |
| 旅伴说明 | 底部说明卡片，解释旅伴选择的意义 |

### 6. 地图选址页 (`/map`)

| 功能模块 | 说明 |
|---------|------|
| 地图展示 | 显示当前位置和故事点标记（Leaflet + OpenStreetMap） |
| 热门城市 | 北京、上海、西安、成都、杭州等快捷切换 |
| 搜索功能 | 支持搜索城市名称 |
| 附近故事点 | 展示最近的故事点列表 |
| 选点功能 | 点击地图选择位置 |

### 7. 我的页面 (`/profile`)

| 功能模块 | 说明 |
|---------|------|
| **默认旅伴** | 苏东坡 / 毒舌老炮二选一；**边走边听始终使用此项** |
| 我的收藏 | 收藏故事、旅伴统计（收藏仅限城市故事） |
| 功能菜单 | 我的旅伴、收藏故事、设置、帮助与反馈 |
| 关于应用 | 版本与产品介绍 |

### 8. 收藏页面 (`/favorites`)

| 功能模块 | 说明 |
|---------|------|
| 收藏故事列表 | 展示用户收藏的故事 |
| 收藏旅伴列表 | 展示用户收藏的旅伴 |

---

## 🏗️ 技术架构

### 前端技术栈

| 技术 | 版本 | 用途 |
|-----|------|-----|
| React | 18.3.x | 前端框架 |
| TypeScript | 5.8.x | 类型安全 |
| Vite | 6.3.x | 构建工具 |
| TailwindCSS | 3.4.x | 样式框架 |
| Zustand | 5.0.x | 状态管理 |
| React Router DOM | 7.3.x | 路由管理 |
| Lucide React | 0.511.x | 图标库 |
| Leaflet + react-leaflet | 1.9.x / 4.2.x | 地图组件 |

### 后端技术栈

| 技术 | 版本 | 用途 |
|-----|------|-----|
| Express | 4.21.x | 开发环境后端 |
| Cloudflare Pages Functions | - | 生产环境 API |

---

## 📁 项目结构

```
├── api/                          # 后端代码（开发环境）
│   ├── app.ts                    # Express 入口
│   ├── server.ts                 # Express 服务器启动
│   ├── index.ts                  # API 入口
│   ├── data/                     # 模拟数据
│   │   ├── walk-service.ts       # 边走边听 D1 查询（Express / CF 共用）
│   │   ├── walk-area-types.ts    # 景区 / 围栏 / 段子类型
│   │   ├── walk-snippets.ts      # 地理计算（haversine）
│   │   ├── media.ts              # 封面 / 头像 / 出场视频路径
│   │   ├── tts-synthesize.ts     # ElevenLabs 合成
│   │   ├── stories.ts            # 城市故事数据
│   │   └── companions.ts         # 旅伴（MVP 两位）
│   ├── config/                   # 运营策略（单一数据源）
│   │   ├── walk-config.ts        # 围栏半径、触发冷却、模拟开关
│   │   ├── speech-config.ts      # TTS 时长估算
│   │   └── tts-config.ts         # ElevenLabs voice / model
│   ├── db/
│   │   └── local-walk-db.ts      # 本地 SQLite（.data/walk.sqlite）
│   ├── routes/                   # API 路由
│   │   ├── stories.ts            # 故事 API
│   │   ├── companions.ts         # 旅伴 API
│   │   ├── walk.ts               # 边走边听 API
│   │   ├── auth.ts               # 认证 API
│   │   └── tts.ts                # TTS 语音合成 API
│   └── worker.ts                 # Cloudflare Worker（备用）
├── functions/                    # Cloudflare Pages Functions
│   └── api/[[path]].js           # API 入口（处理所有 /api/* 请求）
├── public/                       # 静态资源（构建时复制到 dist）
│   ├── _routes.json              # Cloudflare 路由（含 /images、/videos 排除）
│   ├── _headers                  # 静态资源缓存头
│   ├── images/
│   │   ├── avatars/              # 旅伴头像
│   │   └── covers/               # 故事封面
│   ├── videos/                   # 边走边听出场视频（.mp4）
│   └── favicon.svg
├── migrations/
│   └── 0001_walk_content.sql     # D1 表结构
├── seeds/
│   └── 0001_gong_wang_fu.sql     # 恭王府语料（唯一数据源）
├── scripts/
│   ├── sync-functions-data.ts    # 同步 stories/companions 至 Functions
│   ├── seed-walk-from-sql.ts     # 本地灌库（读 seeds/*.sql）
│   └── geocode-walk-fences.ts    # 围栏坐标工具
├── src/                          # 前端代码
│   ├── components/
│   │   ├── Header.tsx            # 顶部栏（城市故事页）
│   │   ├── BottomNav.tsx         # 底部 Tab：城市故事 / 同游 / 我的
│   │   ├── WalkIntroVideo.tsx    # 边走边听出场视频（全屏）
│   │   ├── StoryCard.tsx
│   │   └── Empty.tsx
│   ├── hooks/
│   │   ├── useApi.ts
│   │   ├── useWalkGeofence.ts    # 围栏检测 / 模拟触发
│   │   └── useTheme.ts
│   ├── pages/
│   │   ├── WalkListen.tsx        # 同游 · 边走边听
│   │   ├── Discover.tsx          # 城市故事
│   │   ├── Profile.tsx           # 我的（含默认旅伴）
│   │   ├── StoryPlayer.tsx
│   │   ├── Companions.tsx
│   │   ├── Favorites.tsx
│   │   ├── StoriesPage.tsx       # Legacy 故事列表
│   │   └── PlaylistPage.tsx      # 连播
│   ├── store/
│   │   ├── player.ts             # 播放器（walk 模式传 companionId）
│   │   ├── preferences.ts        # defaultCompanionId
│   │   ├── walk-chat.ts
│   │   ├── walk-played-jokes.ts  # 段子去重
│   │   ├── walk-intro-played.ts  # 出场视频 24h 限播
│   │   ├── location.ts
│   │   └── favorites.ts
│   ├── App.tsx                   # 应用入口（路由配置）
│   ├── main.tsx                  # React 渲染入口
│   └── index.css                 # 全局样式（TailwindCSS）
├── docs/
│   └── walk-listen-architecture.md
├── .env.example                  # ELEVENLABS_API_KEY 示例
├── wrangler.toml                 # Cloudflare 部署配置
├── vite.config.ts                # Vite 配置
├── tailwind.config.js            # TailwindCSS 配置
├── postcss.config.js             # PostCSS 配置
├── tsconfig.json                 # TypeScript 配置
├── package.json                  # 项目依赖和脚本
└── README.md                     # 项目文档
```

---

## 🔄 核心交互流程

```
打开应用 (/) → 重定向 /walk（同游 Tab）

同游 /walk
  ├── （计划）出场视频 → 聊天页 + 恭王府模拟站点条
  ├── 进围栏 → 新段子卡片 + ElevenLabs TTS 第一幕
  ├── 卡片内「继续说 / 上一幕」→ 同卡片换幕（不增行）
  └── 首屏悬浮提示「我的页可改默认旅伴」（渐隐）

城市故事 /discover
  ├── 搜索 / 标签筛选 → 故事播放页
  └── 播放页可切换旅伴（不同 narrator 版本）

我的 /profile
  ├── 设置默认旅伴（影响边走边听，本页不可在 /walk 切换）
  ├── 收藏故事 / 旅伴
  └── 功能菜单 → companions / favorites / settings
```

---

## 🎨 设计风格

| 设计要素 | 详情 |
|---------|------|
| 主色调 | 深邃藏青色 (#0A1628) |
| 强调色 | 金色 (#D4AF37) / 琥珀色 (#FFB800) |
| 背景色 | 卡片背景 (#152238) |
| 文字色 | 浅蓝白 (#E8F4FD) |
| 字体 | Noto Serif SC（标题）、Noto Sans SC（正文） |
| 风格 | 沉浸式、文化感、高端大气 |
| 圆角 | 大圆角设计（2xl - 3xl） |

---

## 🚀 开发运行

### 环境要求

- Node.js >= 20.x
- npm >= 10.x

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
# 前端 + 后端同时启动
npm run dev

# 仅前端开发
npm run client:dev

# 仅后端开发
npm run server:dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

### 数据同步

```bash
npm run sync:functions-data   # stories / companions / 配置 → functions（walk 语料已迁 D1）
```

### 边走边听 D1 数据库

```bash
# 本地（Express dev）
npm run db:setup:local

# Cloudflare 生产（首次需 wrangler d1 create buddy-walk 并更新 wrangler.toml database_id）
npm run db:setup:remote
```

语料唯一数据源：`seeds/0001_gong_wang_fu.sql`。改 SQL 后本地 `npm run db:seed:local -- --force`，生产 `npm run db:seed:remote`。

### 本地调试（边走边听）

```js
localStorage.removeItem('joyjoy-walk-played-jokes')   // 重置已播段子
localStorage.removeItem('joyjoy-walk-intro-played')   // 重置出场视频 24h 限播
```

### 类型检查

```bash
npm run check
```

### 代码 lint

```bash
npm run lint
```

---

## ☁️ 部署信息

### Cloudflare Pages 部署

项目已配置 Cloudflare Pages 自动部署：

| 配置项 | 说明 |
|-------|------|
| 构建命令 | `npm run build` |
| 构建输出目录 | `dist` |
| API 处理 | `functions/api/[[path]].js`（Pages Functions） |
| SPA 回退 | `public/_routes.json` 将 404 映射到 `index.html` |

### `_routes.json` 说明

`exclude` 表示**不执行** Pages Functions 的路径。若将 `/api/*` 写入 `exclude`，API 请求会被当作静态资源处理，找不到文件时触发 404 并回退到 `index.html`，前端解析 JSON 会报错 `Unexpected token '<'`。

当前正确配置：

```json
{
  "version": 1,
  "include": ["/*"],
  "exclude": ["/assets/*", "/favicon.svg", "/images/*", "/videos/*"],
  "error_pages": {
    "404": "/index.html"
  }
}
```

- `/api/*` 由 `functions/api/[[path]].js` 处理，**不要**放入 `exclude`
- `/images/*`、`/videos/*` 排除后可走 CDN 直出，减少 Function 调用
- 非 API 路由 404 时回退到 `index.html`，支持 React Router 客户端路由

**静态资源**

| 类型 | 路径 | 维护 |
|------|------|------|
| 旅伴头像 | `public/images/avatars/` | 改图后递增 `api/data/media.ts` → `AVATAR_ASSET_VERSION` |
| 出场视频 | `public/videos/{companionId}.mp4` | 勿只改 `dist/`；需 commit 并重新部署 |
| 故事封面 | `public/images/covers/` | `media.ts` 中 `STORY_COVER_IMAGES` 映射 |

### 部署配置文件

- `wrangler.toml` - Cloudflare Wrangler 配置
- `public/_routes.json` - Cloudflare 路由规则
- `public/_headers` - HTTP 安全头
- `functions/api/[[path]].js` - API 入口函数

### API 端点

| 端点 | 方法 | 说明 |
|-----|------|-----|
| `/api/stories` | GET | 获取所有故事 |
| `/api/stories/:id` | GET | 获取单个故事 |
| `/api/stories/nearby` | GET | 获取附近故事 |
| `/api/companions` | GET | 获取旅伴列表（MVP：苏东坡、毒舌老炮） |
| `/api/companions/:id` | GET | 获取单个旅伴 |
| `/api/config/walk` | GET | 边走边听运营配置（围栏半径、模拟开关等） |
| `/api/walk/areas` | GET | 景区列表 |
| `/api/walk/areas/:areaId/fences` | GET | 某景区围栏列表 |
| `/api/walk/play` | GET | 解析播放（`areaId`, `fenceId`, `companionId`, `jokeId`, `actIndex`, `exclude`） |
| `/api/routes` | GET | 获取所有路线 |
| `/api/routes/:id` | GET | 获取单个路线 |
| `/api/tts` | GET | 语音合成（`?text=&companionId=&lang=`，ElevenLabs） |
| `/api/health` | GET | 健康检查 |

### ElevenLabs TTS 配置

1. 复制 `.env.example` 为 `.env`，填入 `ELEVENLABS_API_KEY`
2. 本地开发：`npm run dev`（Express 读 `.env`）
3. Cloudflare 生产：`wrangler secret put ELEVENLABS_API_KEY`
4. 旅伴默认音色见 `api/data/companions.ts` 的 `voiceId`（ElevenLabs voice_id）；可用 `ELEVENLABS_VOICE_SU_DONGPO` 等环境变量覆盖
5. 模型默认 `eleven_multilingual_v2`（中文）；ElevenLabs 失败时自动降级 Google TTS

---

## 🎙️ 音频生成说明

### 核心理念

> **最重要的不是"换 voice_id"，而是"让每个角色真的说自己的话"。**
>
> 声音只是表层，真正的差异化来自脚本、视角和人格。

同一地点可以有多个版本，但每个版本要先生成**各自独立的故事脚本**，再分别配不同的 voice_id 和语气参数，最后各自生成独立 mp3。

**"同一主题" ≠ "同一文案"，而是"同一地点、不同视角、不同叙事内容"。**

---

### 推荐实现方式

#### 第一步：先分角色写脚本

每个角色先产出自己的讲解稿，而不是共用一份稿子。同一个景点，不同角色讲的内容完全不同：

| 角色 | 讲述角度 | 内容侧重 | 例子 |
|-----|---------|---------|------|
| 苏东坡 | 山水、人生、旷达 | 诗词、历史典故、人生感悟 | 讲西湖：引用"欲把西湖比西子"，聊自己在杭州修苏堤的经历 |
| 毒舌老炮 | 避坑、现实、吐槽 | 冷知识、反套路、真相揭秘 | 讲兵马俑：告诉你彩色兵马俑掉色的真相，吐槽景区的坑 |

**关键原则：**
- 每个角色都有自己的观点，不只是声音不同
- 同一地点可以有共同事实，但叙事角度必须不同
- 先脚本，后声音；先内容差异，后音色差异

#### 第二步：再绑定角色声音

每份脚本绑定一个固定的 voice_id，并配套完整的语音参数：

| 参数 | 说明 | 作用 |
|-----|------|------|
| `voice_id` | 声音唯一标识 | 确保同一个角色在不同地点里声音稳定一致 |
| `speed` / `rate` | 语速 | 苏东坡慢而豪迈，毒舌老炮快而犀利 |
| `pitch` | 音高 | 毒舌老炮偏低，苏东坡醇厚 |
| `emotion` | 情绪参数 | 不同场景下的情绪基调（激昂、温柔、幽默、严肃） |
| `pause` | 停顿参数 | 句间停顿、段间停顿，增强节奏感 |

**好处：**
- 角色声音稳定，用户建立情感连接
- 便于后续批量生产和复用
- 参数可微调，持续优化音色表现

#### 第三步：每个版本独立生成 mp3

对每个"角色脚本 + voice_id"组合单独跑一次 TTS，输出独立音频文件。

**最终结果：**
- 一个地点 → 多个 mp3 版本
- 每个版本 = 独立脚本 + 独立声音 + 独立音频文件
- 不是一个音频里只换声音不换内容

---

### 生成流程

```
┌─────────────────┐
│   1. 生成脚本    │
│  AI 根据"地点 +  │
│  角色设定"生成   │
│  独立脚本        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   2. 审核脚本    │
│  人工审核内容，   │
│  确保质量和准确  │
│  性              │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   3. 调用 TTS    │
│  按角色配置参数， │
│  调用语音合成API  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   4. 输出音频    │
│  每个角色输出独  │
│  立 mp3 文件     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   5. 上传存储    │
│  mp3 上传对象存  │
│  储，JSON 保存   │
│  音频地址和版本  │
│  信息            │
└─────────────────┘
```

---

### 三层数据结构

为了支撑上述流程，数据结构拆分为三层：

#### 第一层：地点层 (Place)

景点的基础信息，所有角色共享。

```typescript
interface Place {
  placeId: string;           // 地点唯一标识
  placeName: string;         // 地点名称
  geo: {                     // 地理位置
    lat: number;             // 纬度
    lng: number;             // 经度
    address?: string;        // 详细地址
  };
  themeTags: string[];       // 主题标签（历史、建筑、文化等）
  coverImage: string;        // 封面图片
  description: string;       // 简介（通用描述）
}
```

#### 第二层：角色层 (Character)

旅伴的人格设定和声音配置，固定复用。

```typescript
interface Character {
  characterId: string;       // 角色唯一标识
  characterName: string;     // 角色名称
  avatar: string;            // 头像
  style: string;             // 风格标签
  description: string;       // 角色描述
  persona: string;           // 人格设定（详细的人物背景）
  voiceId: string;           // TTS 声音ID（固定绑定）
  toneProfile: {             // 语气配置
    speed: number;           // 语速
    pitch: number;           // 音高
    volume: number;          // 音量
    emotion: string;         // 基础情绪
    pauseBetweenSentences: number;  // 句间停顿（毫秒）
    pauseBetweenParagraphs: number; // 段间停顿（毫秒）
  };
}
```

#### 第三层：版本层 (Version)

每个地点 × 每个角色的独立版本，内容和音频各自独立。

```typescript
interface StoryVersion {
  versionId: string;         // 版本唯一标识
  placeId: string;           // 关联地点ID
  characterId: string;       // 关联角色ID
  scriptText: string;        // 完整脚本内容（逐字稿）
  audioUrl: string;          // 音频文件地址
  duration: number;          // 音频时长（秒）
  version: string;           // 版本号（如 v1.0.0）
  styleNote: string;         // 本版本风格说明
  tags: string[];            // 本版本特有标签
  createdAt: string;         // 创建时间
  updatedAt: string;         // 更新时间
  status: 'draft' | 'review' | 'published'; // 状态
}
```

---

### 当前项目数据结构说明

当前项目采用简化版数据结构，核心逻辑一致：

| 当前结构 | 对应三层结构 | 说明 |
|---------|-------------|------|
| `Story` | Place + 基础信息 | 故事 = 地点信息 + 默认配置 |
| `Companion` | Character | 旅伴 = 角色设定 + voiceType |
| `NarratorVersion` | StoryVersion | 讲解版本 = 独立脚本 + 音频地址 |

后续可平滑迁移到完整的三层结构。

---

### 关键原则总结

1. **每个角色都有自己的观点**，不只是声音不同
2. **同一地点可以有共同事实，但叙事角度必须不同**
3. **先脚本，后声音；先内容差异，后音色差异**
4. **一个版本对应一份独立音频**，不要运行时拼来拼去
5. **角色声音固定绑定**，保证跨地点的一致性

---

## 📊 数据模型

### 故事 (Story)

```typescript
interface Story {
  id: string;                    // 故事ID
  title: string;                 // 故事标题
  description: string;           // 故事描述
  coverImage: string;            // 封面图片
  location: {                    // 位置信息
    name: string;                // 位置名称
    lat: number;                 // 纬度
    lng: number;                 // 经度
  };
  distance?: number;             // 距离（米）
  duration: number;              // 时长（秒）
  tags: string[];                // 标签
  defaultCompanionId: string;    // 默认旅伴ID
  narrators: NarratorVersion[];  // 各旅伴讲解版本
}
```

### 旅伴讲解版本 (NarratorVersion)

```typescript
interface NarratorVersion {
  companionId: string;           // 旅伴ID
  content: string;               // 讲解内容
  styleNote: string;             // 风格说明
  duration: number;              // 时长（秒）
  audioUrl?: string;             // 音频URL
}
```

### 旅伴 (Companion)

```typescript
interface Companion {
  id: string;                    // 旅伴ID
  name: string;                  // 旅伴名称
  avatar: string;                // 头像图片
  style: string;                 // 风格标签
  description: string;           // 描述
}
```

### 边走边听语料（景区 → 围栏 → 段子 → 幕）

完整约定（含 §0 设计目标、阶段规划、段子去重）见 **[docs/walk-listen-architecture.md](docs/walk-listen-architecture.md)**。

```typescript
// api/data/walk-area-types.ts
interface WalkArea {
  id: string;
  name: string;
  areaTag: string;
  fences: WalkFence[];
}

interface WalkFence {
  id: string;
  label: string;
  location: { lat: number; lng: number; radiusMeters: number };
  byCompanion: Record<string, { jokes: WalkJoke[] }>;  // 每位旅伴独立段子池
}

interface WalkJoke {
  id: string;
  label?: string;
  acts: WalkAct[];               // 1～3 幕，用户点「继续说」才续读
}

interface WalkAct {
  versionId: string;
  content: string;
  label?: string;
}
```

语料文件：`seeds/0001_gong_wang_fu.sql`（一景区一 seed SQL，运行时读 D1 / 本地 SQLite）。

---

## 🔧 已解决问题

| 问题 | 原因 | 解决方案 |
|-----|------|---------|
| 地图瓦片加载失败 | OpenStreetMap 瓦片加载被拦截 | 切换到 CartoCDN / Yandex 地图服务 |
| 故事无法播放 | Web Speech API 兼容性问题 | 使用 HTML5 Audio 播放 TTS 音频文件 |
| 进度显示错误 | 进度单位不一致（百分比 vs 秒） | 统一进度管理为百分比 |
| Cloudflare 部署后 API 返回 HTML | `_routes.json` 将 `/api/*` 误放入 `exclude` | 从 `exclude` 移除 `/api/*` |
| 出场视频 / 头像 404 | 只改了 `dist/` 或未提交 `public/` | 资源放 `public/videos`、`public/images`，重新 build 部署 |
| TTS 0 秒或失败 | 未配置 `ELEVENLABS_API_KEY` 或 voice 无效 | 配置环境变量，检查 `api/config/tts-config.ts` |
| 头像更新仍显示旧图 | 浏览器/CDN 缓存 | 递增 `AVATAR_ASSET_VERSION` 并部署 |
| 分类过滤错误 | Story 类型缺少 `category` 字段 | 使用 `tags` 字段进行过滤 |

---

## 📝 版本记录

| 版本 | 日期 | 主要更新 |
|-----|------|---------|
| v1.0.0 | 初始版本 | 基础功能：首页、故事播放、旅伴选择 |
| v1.1.0 | - | 新增：故事列表页、地图选址页 |
| v1.2.0 | - | 优化：底部导航改为首页/我的、旅伴卡片优化 |
| v1.3.0 | - | 部署：Cloudflare Pages 部署配置完成 |
| v1.4.0 | 2026-06 | Cloudflare `_routes.json`、播放器重构 |
| v1.5.0 | 2026-06 | MVP：恭王府边走边听、双旅伴、出场视频、ElevenLabs TTS、Discover 导航重构 |

---

## 📄 许可证

MIT License
