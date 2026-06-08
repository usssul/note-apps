# 更新日志

本文件记录 note-apps 项目的重要变更。

格式参考 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，版本号遵循 [Semantic Versioning](https://semver.org/lang/zh-CN/)。

---

## [未发布]

### 新增

- **小红书统计仪表盘** (`/red-stats`)：多维度数据可视化页面
  - 5 项核心指标卡片：总笔记数、图文笔记、视频笔记、博主数、标签种类
  - 笔记类型分布饼图（ECharts）
  - 月度笔记趋势折线图（带渐变面积填充）
  - 收录最多的博主排行榜（Top 10，🏆领奖台样式，按收藏总数排序，支持点击跳转至博主笔记列表）
  - 地区分布横向条形图（地区名 + 渐变条 + 计数）
  - 热门标签云（CSS 实现，字号按频次 12-34px，颜色确定性哈希避免闪烁）
  - 最近 7 天收录笔记列表（支持点击跳转至小红书原站）
  - Top 10 点赞笔记表格（含封面、标题、作者头像、类型、点赞数、收藏数、发布时间）
- **API**: `GET /xhs/statistics/dashboard` — 一次返回 10 项聚合统计数据
  - `totalCount` / `uniqueUserCount` — 笔记 & 博主去重计数
  - `typeDistribution` — normal/video 分布
  - `monthlyTrend` — 按 YYYY-MM 月度趋势
  - `topCollectedUsers` — 按博主聚合总收藏数 Top 10
  - `interactionTotals` — 点赞/收藏/评论/分享总计
  - `topLikedNotes` — 点赞最多笔记 Top 10（含发布时间）
  - `tagCloud` — 标签频次 Top 50
  - `regionDistribution` — IP 属地分布 Top 20
  - `recentNotes` — 最近 7 天收录
- 博主跳转：统计页点击博主 → `/red?nickname=xxx` 自动筛选该博主笔记

### 变更

- **小红书笔记页瀑布流重构**：CSS Grid 手动行跨 → Flex 多列自适应布局
  - 移除 `grid-row-end: span N` + `rowHeight: 1px` + `getCardSpan()` 估算方案
  - 改为 Flex 列容器 + 轮询分配卡片，封面图通过 `aspect-ratio` 自动撑高
  - ResizeObserver 监听容器宽度，响应式切换 1~4 列（≤640/≤768/≤1200/>1200）
  - 骨架屏同步适配 Flex 列布局
- 统计页卡片精简：移除总点赞/总收藏/总评论/总分享/篇均数据卡片，聚焦核心指标
- 统一术语：全文"主播"改为"博主"
- 博主排行榜改为领奖台布局（1-3 名金银铜底座，4-10 名双列排列）
- 博主排行指标从"笔记数量"改为"收藏总数"
- 地区分布从中国地图回退为横向条形图（更稳定、数据更直观）
- 标签展示从 ECharts 气泡图回退为 CSS 标签云（更轻量可靠）
- Top 10 点赞笔记新增发布时间列
- 移除图表暗色模式跟随，图表始终亮色主题
- 移除 ECharts MapChart/ScatterChart/GeoComponent/VisualMapComponent 依赖

### 修复

- MongoDB 聚合中空字符串 `likedCount` / `collectedCount` 导致 `$toInt` 报错 — 改用 `$convert` + `onError: 0`
- 小红书中文格式化数字（如 "1.1万"）无法解析 — `$convert` 容错处理为 0
- 地区分布 `$match` 重复 key 报错 — 改用 `$nin: [null, '']`
- 标签颜色 `Math.random()` 导致每次渲染闪烁 — 改为确定性字符串哈希取色
- 领奖台底座 absolute 定位导致三个底座重叠 — 改用 flex 自然流布局

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 后端框架 | NestJS v10 |
| 数据库 | MongoDB (Mongoose) |
| 前端框架 | Vue 3 + TypeScript + Vite |
| 路由 | unplugin-vue-router (文件系统路由) |
| UI 组件 | Element Plus |
| 图表 | ECharts (tree-shakeable 按需加载) |
| 对象存储 | MinIO |
| 日期处理 | dayjs |
