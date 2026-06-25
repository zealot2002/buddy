# AI旅伴 - 沉浸式讲解 App 原型

一款让用户在旅途中一键召唤 AI 旅伴讲故事的沉浸式讲解应用。

## 功能特性

### 1. 首页
- **一键播放**：用户到达景点后，直接点击"一键播放"即可收听附近故事
- **位置服务**：自动获取当前位置，推荐附近的故事点
- **附近故事**：横向滚动展示附近的故事卡片
- **热门故事**：双列网格展示热门故事
- **个性化推荐**：推荐卡片区域

### 2. 故事列表页
- **搜索功能**：支持搜索故事标题和描述
- **标签过滤**：根据故事标签（历史、文化、建筑、传说等）进行筛选
- **双列卡片布局**：展示所有故事

### 3. 故事播放页
- **播放器控制**：播放/暂停、进度条拖动、音量调节
- **旅伴选择**：可切换4位不同人格的旅伴（苏东坡、林徽因、温柔女士、毒舌老炮）
- **更多旅伴**：点击进入旅伴选择列表
- **故事内容**：展示故事详情文本
- **收藏/分享**：顶部收藏和分享按钮

### 4. 旅伴选择列表
- **4位旅伴卡片**：展示每位旅伴的头像、名字、风格、描述
- **听TA讲故事**：点击按钮选中旅伴并返回故事播放页
- **点击卡片**：返回故事播放页

### 5. 地图选址页
- **地图展示**：显示当前位置和故事点标记
- **热门城市**：北京、上海、西安、成都、杭州等快捷切换
- **搜索功能**：支持搜索城市名称
- **附近故事点**：展示最近的故事点列表

### 6. 我的页面
- **用户信息**：头像、昵称
- **收藏统计**：收藏故事、收藏旅伴、收藏路线数量
- **功能菜单**：我的旅伴、收藏故事、我的路线、设置、帮助与反馈
- **关于应用**：版本信息

### 7. 语音合成（TTS）
- 使用 Google Text-to-Speech API 生成音频
- 支持中文语音朗读
- 音频缓存优化

### 8. 数据模拟
- 4个故事：西湖断桥、太和殿、兵马俑、拙政园
- 每个故事包含4位旅伴的不同讲解版本
- 完整的模拟数据结构

## 技术栈

### 前端
- React 18 + TypeScript
- Vite 6
- TailwindCSS 3
- Zustand（状态管理）
- React Router DOM 7
- Lucide React（图标）

### 后端
- Express 4（开发环境）
- Cloudflare Pages Functions（生产环境）

### 部署
- Cloudflare Pages
- Cloudflare Pages Functions（API）

## 项目结构

```
├── api/                    # 后端代码（开发环境）
│   ├── app.ts              # Express 入口
│   ├── data/               # 模拟数据
│   │   ├── stories.ts      # 故事数据
│   │   ├── companions.ts   # 旅伴数据
│   │   └── routes.ts       # 路线数据
│   ├── routes/             # API 路由
│   └── worker.ts           # Cloudflare Worker（备用）
├── functions/              # Cloudflare Pages Functions
│   └── api/[[path]].js     # API 入口
├── public/                 # 静态资源
│   ├── _routes.json        # Cloudflare 路由配置
│   └── _headers            # HTTP 安全头
├── src/                    # 前端代码
│   ├── components/         # 通用组件
│   │   ├── Header.tsx      # 顶部导航栏
│   │   ├── BottomNav.tsx   # 底部导航栏
│   │   └── StoryCard.tsx   # 故事卡片
│   ├── hooks/              # 自定义 Hooks
│   │   └── useApi.ts       # API 请求封装
│   ├── pages/              # 页面组件
│   │   ├── Home.tsx        # 首页
│   │   ├── StoriesPage.tsx # 故事列表页
│   │   ├── StoryPlayer.tsx # 故事播放页
│   │   ├── Companions.tsx  # 旅伴选择页
│   │   ├── MapPage.tsx     # 地图选址页
│   │   ├── Profile.tsx     # 我的页面
│   │   ├── Routes.tsx      # 路线页面
│   │   └── Favorites.tsx   # 收藏页面
│   ├── store/              # Zustand 状态管理
│   │   ├── player.ts       # 播放器状态
│   │   ├── location.ts     # 定位状态
│   │   └── favorites.ts    # 收藏状态
│   └── index.css           # 全局样式
├── wrangler.toml           # Cloudflare 部署配置
└── vite.config.ts          # Vite 配置
```

## 核心交互流程

```
首页 → 点击故事卡片 → 故事播放页
                        ↓
                 点击"更多旅伴" → 旅伴选择列表
                        ↑
                 点击"听TA讲故事" → 返回播放页并切换旅伴
```

## 开发运行

```bash
# 安装依赖
npm install

# 开发模式（前端 + 后端）
npm run dev

# 前端开发
npm run client:dev

# 后端开发
npm run server:dev

# 构建生产版本
npm run build
```

## 部署

已配置 Cloudflare Pages 自动部署：
- 代码提交到 GitHub 后自动触发构建
- 前端静态资源托管在 Cloudflare Pages
- API 请求由 Pages Functions 处理

## 设计风格

- **主色调**：深邃藏青色 (#0A1628)
- **强调色**：金色 (#D4AF37)
- **字体**：Noto Serif SC（标题）、Noto Sans SC（正文）
- **风格**：沉浸式、文化感、高端大气