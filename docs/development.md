# 开发指南

## 环境准备

### 必需安装

- **Node.js** >= 20.17.0
- **pnpm** — `npm install -g pnpm`
- **Docker Desktop** — 用于本地 MySQL/MongoDB/MinIO
- **Git**

### VS Code 推荐插件

- ESLint
- Prettier
- Vue - Official (Volar)
- UnoCSS
- MongoDB for VS Code
- Thunder Client / Postman

---

## 项目启动

### 环境变量配置

项目使用两层环境变量：

| 文件 | 用途 | Git |
|------|------|-----|
| 根目录 `.env` | Docker Compose 密码 | ❌ gitignored |
| 根目录 `.env.example` | Docker Compose 模板 | ✅ |
| `note-mark/.env.local` | 后端本地开发配置 | ❌ gitignored |
| `note-mark/.env.example` | 后端配置模板 | ✅ |

```bash
# 1. 配置 Docker 密码
cp .env.example .env
# 编辑 .env，确保密码与后端 .env.local 中的一致

# 2. 后端配置（已有 .env.local 可跳过）
cd note-mark
cp .env.example .env.local
# 编辑 .env.local 填入本地数据库连接信息
```

### 启动基础设施

```bash
docker compose up -d
```

验证服务：

| 服务 | 地址 | 说明 |
|------|------|------|
| MySQL | `localhost:3308` | root 登录 |
| MongoDB | `localhost:27091` | admin 登录 |
| MinIO API | `localhost:9000` | S3 兼容接口 |
| MinIO Console | `localhost:9001` | Web 管理面板 |

### 启动后端 (note-mark)

```bash
cd note-mark
pnpm install

# 重要：ConfigModule 按 NODE_ENV 加载配置文件
# - NODE_ENV=local → 优先读取 .env.local
# - 不设 NODE_ENV → 默认也读取 .env.local（.env.${NODE_ENV || 'local'}）
NODE_ENV=local pnpm start:dev
# → http://localhost:6090
# → Swagger: http://localhost:6090/api-docs
```

**配置文件加载顺序**：`.env.${NODE_ENV}` → `.env`，详见 [app.module.ts](../note-mark/src/app.module.ts#L19-L24)。

启动时后台任务会自动执行一次 my903 数据抓取（可通过 `MY903_FETCH_COLUMNS` 环境变量控制抓取栏目）。

### 启动前端 (note-web)

```bash
cd note-web
pnpm install
pnpm dev
# → http://localhost:5174  （端口在 vite.config.ts 中硬编码）
```

开发时 Vite 代理配置（[vite.config.ts](../note-web/vite.config.ts#L55-L61)）：
- `/dev` → `http://127.0.0.1:6090`（后端 API），路径重写时去掉 `/dev` 前缀
- 生产环境 `/api` → 同源 Nginx 反代

---

## 目录约定

### note-mark 后端

```
src/
├── auth/           # 认证模块（controller + service + entity + guard）
├── xhs/            # 小红书模块
├── my903/          # 叱咤903 模块
├── red-note/       # 🚧 预留模块（空壳）
├── tasks/          # 定时任务（cron + startup）
├── common/         # 共享工具（DTO、拦截器、MinIO 助手）
├── config/         # 配置工厂（数据库、JWT、MinIO、Axios）
├── entities/       # TypeORM 实体
├── filters/        # 异常过滤器
├── utils/          # 工具函数（加密、日期、批量）
└── typings/        # 类型声明
```

### note-web 前端

```
src/
├── api/            # API 接口层（axios 实例 + 接口函数）
├── components/     # 公共组件
├── hooks/          # 自定义 hooks（useXhsApi、useMy903Api）
├── layouts/        # 布局组件（default、navigation、notFound）
├── pages/          # 页面（文件系统路由，自动注册）
│   └── my903/      #   嵌套路由页面
├── plugins/        # 插件（router、pinia、nprogress、title）
├── stores/         # Pinia 状态管理
└── styles/         # 全局样式
```

---

## 常用命令

### note-mark

```bash
pnpm start:dev      # 开发模式（热重载）
pnpm start:prod     # 生产模式
pnpm build          # 构建
pnpm test           # 单元测试
pnpm test:e2e       # E2E 测试
pnpm lint           # ESLint 修复
```

### note-web

```bash
pnpm dev            # 开发模式
pnpm build          # 生产构建
pnpm preview        # 预览构建结果
```

### 数据库

```bash
# 连接 MySQL
mysql -h 127.0.0.1 -P 3308 -u root -p   # 密码见根目录 .env

# 连接 MongoDB
mongosh mongodb://admin:buwanla@localhost:27091/notemark?authSource=admin

# MinIO 管理面板
open http://localhost:9001
```

### 验证服务

```bash
# 检查后端健康
curl http://localhost:6090/
# → {"code":200,...,"data":"Hello World!"}

# 检查音乐数据（首次启动时自动抓取 10 条）
curl 'http://localhost:6090/my903/list?page=1&pageSize=2'

# 检查 Swagger 文档
open http://localhost:6090/api-docs

# 检查前端（通过 Vite 代理访问后端）
curl 'http://localhost:5174/dev/my903/list?page=1&pageSize=2'
```

---

## 开发工作流

### 新增功能（以加新页面为例）

1. **后端** — 在对应的 `src/xxx/` 模块中添加 controller 路由和 service 逻辑
2. **更新 Swagger** — 确保 DTO 上有 `@ApiProperty` 注解
3. **前端** — 在 `src/pages/` 下新建 `.vue` 文件（自动注册路由）
4. **API 层** — 在 `src/api/` 下添加接口调用函数
5. **联调** — 通过 Swagger UI 或 Thunder Client 先验证接口，再对接前端

### 定时任务

my903 模块的定时抓取在 `note-mark/src/tasks/` 中定义：

- 启动后 3 秒自动执行一次
- 每天上午 10:00 (CST) 执行
- 也可手动触发：`GET /tasks/fetchNew`

### MinIO 文件管理

- 所有媒体文件统一存储在 MinIO 的 `my903` bucket
- 前端展示的 URL 是 MinIO 提供的直链（或预签名 URL）
- `MinioHelperService` 封装了上传逻辑，支持流上传、URL 下载后上传、视频流选择

---

## 部署

### Docker 构建

```bash
# 后端
cd note-mark
docker build -t note-mark .

# 或使用构建脚本
bash build.sh <tag>
```

### 环境变量参考

见各子项目下的 `.env.example` 文件：

- [note-mark/.env.example](../note-mark/.env.example)
- [nest-minio/.env.example](../nest-minio/.env.example)
- [根目录 .env.example](../.env.example)（Docker Compose 使用）

---

## 常见问题

### Docker 容器密码不匹配

如果 Docker 容器启动后后端连不上，检查根目录 `.env` 密码是否与后端 `.env.local` 一致：

```bash
# 根 .env → Docker Compose 用
MYSQL_ROOT_PASSWORD=root
MONGO_ROOT_PASSWORD=buwanla
MINIO_ROOT_PASSWORD=12345678

# note-mark/.env.local → 后端用
DB_PASSWORD=root
MONGODB_URI=mongodb://admin:buwanla@localhost:27091/...
MINIO_SECRET_KEY=12345678
```

如果不一致，先 `docker compose down -v` 然后重建容器。

### 前端跨域 CORS 错误

后端 CORS 白名单在 [main.ts](../note-mark/src/main.ts#L16-L19) 中配置。如果前端端口不是 5173/5174，需要添加对应 origin。

### 端口占用

- 后端默认 `6090`
- 前端默认 `5174`（[vite.config.ts](../note-web/vite.config.ts#L53) 中硬编码）
- 如果 5174 被占用，Vite 会自动尝试下一个端口

### 后端启动报 MinIO 环境变量缺失

`note-mark/.env.local` 必须包含所有 MinIO 配置项：
`MINIO_ENDPOINT`、`MINIO_PORT`、`MINIO_ACCESS_KEY`、`MINIO_SECRET_KEY`、`MINIO_BUCKET_NAME`、`MINIO_USE_SSL`

### MySQL 表 structure

后端使用 TypeORM，如果表不存在可能需要手动建表或临时开启 `DB_SYNC=true`（注意：生产环境不要开启）。

### 代理无法访问外部 API（my903 抓取失败）

如果 my903.com 无法直连，在 `.env.local` 中配置代理：

```env
HTTP_PROXY=http://127.0.0.1:7890
HTTPS_PROXY=http://127.0.0.1:7890
```

代理配置在 [axios.config.ts](../note-mark/src/config/axios.config.ts) 中生效。
