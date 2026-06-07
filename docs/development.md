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

### 初始化

```bash
# 克隆仓库
git clone https://github.com/usssul/note-apps.git
cd note-apps

# 环境变量
cp .env.example .env
# 编辑 .env 填入密码（默认值仅开发可用）
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
cp .env.example .env
# 编辑 .env 配置数据库连接等

pnpm install
pnpm start:dev
# → http://localhost:6090
# → Swagger: http://localhost:6090/api-docs
```

### 启动前端 (note-web)

```bash
cd note-web
pnpm install
pnpm dev
# → http://localhost:5173
```

开发时代理规则（Vite 配置）：
- `/dev` → `http://127.0.0.1:6090`（后端 API）
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
mysql -h 127.0.0.1 -P 3308 -u root -p

# 连接 MongoDB
mongosh mongodb://admin:password@localhost:27091/notemark

# MinIO 管理面板
open http://localhost:9001
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
