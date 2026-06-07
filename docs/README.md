# note-apps

多应用 monorepo —— 笔记管理、音乐内容聚合、后台管理等一站式全栈项目。

## 项目结构

```
note-apps/
├── docs/                    # 📖 项目文档
├── note-mark/               # 🐱 NestJS 后端服务
├── note-web/                # 🖥️ Vue 3 前端
├── nest-minio/              # 📦 MinIO 对象存储 NestJS 模块（可复用 npm 包）
├── react-admin/             # ⚙️ 全栈后台管理系统
├── starter-monkey/          # 🐵 油猴脚本开发模板
├── docker-compose.yml       # Docker 容器编排
└── .env.example             # 环境变量模板
```

## 子项目一览

### [note-mark](./note-mark/) — 后端核心

NestJS v10 构建的 REST API 服务，聚合以下数据源：

| 模块 | 数据源 | 存储 |
|------|--------|------|
| **xhs** | 小红书笔记（图文/视频） | MongoDB |
| **my903** | 叱咤903 电台音乐排行榜 | MongoDB |
| **auth** | 用户注册/登录（JWT） | MySQL |

**技术栈**: NestJS · TypeORM · Mongoose · Passport JWT · Swagger · MinIO · Axios

### [note-web](./note-web/) — 前端门户

Vue 3 + Vite + TypeScript 构建的内容浏览器：

- 🏠 **首页** — 多引擎搜索 + 常用网站 + 音乐内容
- 📕 **小红书笔记** — 瀑布流浏览、图文/视频筛选、详情查看
- 🎵 **音乐内容** — 叱咤903 歌曲列表、歌手聚合、同步状态
- 📊 **图表** — ECharts 演示

**技术栈**: Vue 3 · Element Plus · UnoCSS · Pinia · vue-router · Axios

### [nest-minio](./nest-minio/) — MinIO 模块

可复用的 NestJS 动态模块，封装 MinIO 客户端：

- `MinioModule.forRoot()` / `forRootAsync()` 注册
- `MinioService` 提供 upload / download / delete / list / presignedUrl
- 自动创建 bucket

已发布为 npm 包 `@usssul/nest-minio`。

### [react-admin](./react-admin/) — 后台管理

企业级前后端分离管理系统：

- **Xmw_server** — NestJS + Sequelize + MySQL 后台 API
- **Xmw_web** — UmiJS 4 + React 18 + Ant Design 5 界面
- 完整的 RBAC 权限、菜单、组织架构管理

### [starter-monkey](./starter-monkey/) — 油猴脚本模板

Vite 7 + React 18 + TypeScript 的油猴脚本开发脚手架。

## 快速开始

### 1. 启动基础设施

```bash
# 创建本地 .env 文件
cp .env.example .env

# 启动 MySQL / MongoDB / MinIO
docker compose up -d
```

### 2. 启动后端

```bash
cd note-mark
cp .env.example .env   # 编辑填入真实配置
pnpm install
pnpm start:dev         # 开发模式，默认 http://localhost:6090
```

API 文档：http://localhost:6090/api-docs

### 3. 启动前端

```bash
cd note-web
pnpm install
pnpm dev               # 开发模式，默认 http://localhost:5173
```

### 环境要求

- Node.js >= 20
- pnpm
- Docker & Docker Compose
