# 架构说明

## 系统架构图

```
                          ┌───────────────────────────────────┐
                          │          note-web (Vue 3)          │
                          │    :5173 (dev) / :80 (prod)       │
                          │   Element Plus · UnoCSS · Pinia   │
                          └──────────────┬────────────────────┘
                                         │ HTTP REST
                                         ▼
                          ┌───────────────────────────────────┐
                          │       note-mark (NestJS :6090)     │
                          │                                    │
                          │  ┌─────────┐  ┌──────┐  ┌───────┐ │
                          │  │ auth    │  │ xhs  │  │ my903 │ │
                          │  │ module  │  │module│  │module │ │
                          │  │ (JWT)   │  │      │  │       │ │
                          │  └────┬────┘  └──┬───┘  └──┬────┘ │
                          │       │          │          │      │
                          │  ┌────┴────┐     │          │      │
                          │  │  MySQL  │     │    ┌─────┴────┐ │
                          │  │ (users) │     │    │ MongoDB  │ │
                          │  └─────────┘     │    │(xhs_notes│ │
                          │                  │    │ my903_   │ │
                          │                  │    │ content) │ │
                          │  ┌───────────────┴────┴──────────┘ │
                          │  │         MinIO (:9000)           │
                          │  │    (images / videos / covers)   │
                          │  └─────────────────────────────────┘
                          └─────────────────────────────────────┘
```

## 数据流

### 小红书笔记流程

```
外部数据源（小红书 CDN）
      │
      ▼
POST /xhs/create  ──► 下载图片/视频 ──► 上传 MinIO
      │                                      │
      ▼                                      ▼
保存 MongoDB ◄────── 替换为 MinIO URL ◄──────┘
      │
      ▼
GET /xhs/list ◄──── note-web 瀑布流展示
```

### 电台音乐内容流程

```
                                            ┌─ article_column_id: 7  (专业推介)
Cron 每日 10:00 ──► GET my903.com/api ──►  ├─ article_column_id: 8  (豁达推介)
   + 启动触发                               └─ article_column_id: 9  (派台歌)
      │
      ▼
逐篇拉取详情 ──► 上传封面到 MinIO ──► 提取歌曲描述
      │                                      │
      ▼                                      ▼
去重（article_id + last_update_datetime）─► 存入 MongoDB
      │
      ▼
GET /my903/list ◄──── note-web 音乐浏览页
```

## 数据库设计

### MySQL (note-mark → users)

| 表 | 用途 |
|----|------|
| `users` | 用户账户（username, email, password） |

### MongoDB (note-mark → 内容存储)

| 集合 | 用途 |
|------|------|
| `xhs_notes` | 小红书笔记（图片/视频/评论/Live Photo） |
| `my903_content` | 叱咤903 音乐文章（歌曲/创作人员/栏目） |
| `my903_sync_info` | 各栏目抓取状态（最后抓取时间/条数） |

## 认证流程

```
注册 POST /auth/register  ──► MySQL users 表
登录 POST /auth/login      ──► 返回 JWT (24h 有效)
请求 GET /auth/profile     ──► Authorization: Bearer <token>
```

JWT payload: `{ sub: userId, username, email }`

## 关键技术决策

| 决策 | 原因 |
|------|------|
| MongoDB 存内容 / MySQL 存用户 | 笔记和音乐内容是文档型、结构灵活；用户是关系型 |
| MinIO 自建存储 | 替代 OSS，统一内容管理，开发环境友好 |
| 媒体同步上传（非异步） | 保证请求完成时数据已完整落库 |
| 前端哈希路由 | 简化 Nginx 部署，无需服务端路由 fallback |
| monorepo 非 workspace | 各子项目独立构建部署，`docker-compose.yml` 统一管理基础设施 |
