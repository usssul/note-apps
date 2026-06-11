# Starter Monkey 开发文档

## 概述

Starter Monkey 是一个面向 **userscript（用户脚本/油猴脚本）** 的现代化起始模板，支持 Tampermonkey、Violentmonkey、Greasemonkey、ScriptCat 等主流用户脚本引擎。模板由 [vite-plugin-monkey](https://github.com/lisonge/vite-plugin-monkey) 强力驱动，让开发者可以用 **Vite 7 + React 18 + TypeScript + TailwindCSS 4** 这一现代前端技术栈来编写用户脚本。

## 技术栈

| 类别 | 技术 |
|------|------|
| 构建工具 | Vite 7 |
| UI 框架 | React 18 |
| 语言 | TypeScript 5 |
| 样式方案 | TailwindCSS 4 |
| 脚本引擎 | vite-plugin-monkey 7 |
| 包管理器 | pnpm |
| 代码规范 | ESLint + Prettier + commitlint |
| CI/CD | GitHub Actions（自动发布） |

## 项目结构

```
starter-monkey/
├── .github/workflows/release.yml   # 自动发布工作流
├── scripts/
│   ├── script-infos.ts             # 构建时解析脚本元信息（displayName、match）
│   └── tailwind-plugins/           # TailwindCSS 自定义插件
├── src/
│   ├── main.ts                     # 入口——自动发现、匹配、执行脚本
│   ├── shims.d.ts                  # Userscript 接口定义
│   ├── vite-env.d.ts               # Vite 类型声明
│   ├── components/
│   │   ├── inline-tailwindcss/     # 在 Shadow DOM 中注入 Tailwind CSS
│   │   └── monaco-editor/          # Monaco 编辑器封装（含文档样式同步）
│   ├── contexts/
│   │   └── mount-context.tsx       # React Context：挂载上下文（uiContainer/shadow/shadowHost）
│   ├── helpers/
│   │   ├── env.ts                  # 运行环境检测（是否在 Monkey 环境）
│   │   ├── fetch.ts                # GM_xmlhttpRequest 封装（gmFetch/monkeyFetch）
│   │   ├── logger.ts              # 带前缀 [starter-monkey] 的 console 封装
│   │   ├── modules.ts             # ESM 默认导出互操作
│   │   ├── scripts.ts             # 脚本发现与 URL 匹配
│   │   ├── react/
│   │   │   ├── context.tsx         # 泛型 createContext 工具（参考 Radix UI）
│   │   │   └── shadow-root-helpers.tsx  # 在 Shadow Root 中渲染 React 应用
│   │   └── ui/
│   │       ├── integrated.ts       # 集成式 UI（DOM 直插模式）
│   │       ├── shadow-root.ts      # Shadow Root 隔离式 UI
│   │       ├── shared.ts           # 公共逻辑：定位、锚点、挂载、自动挂载
│   │       ├── split-shadow-root-css.ts  # CSS 拆分（@property/@font-face → document）
│   │       └── types.ts            # UI 类型定义
│   ├── hooks/
│   │   ├── document.ts            # 同步 document head 元素到 shadow head
│   │   └── ui.tsx                 # useCreateUis / useShadowModal hooks
│   ├── locales/
│   │   └── meta.ts                 # 多语言元信息（脚本名称、描述）
│   └── scripts/
│       └── <站点>/<脚本名>/        # 业务脚本目录
│           └── index.tsx           # 脚本入口（导出 Userscript 函数）
├── package.json
├── vite.config.ts                  # Vite 配置
├── tsconfig.json
└── eslint.config.ts
```

## 核心架构

### 1. 入口流程

```
src/main.ts
  │
  ├─ getUserscripts()          ← 通过 import.meta.glob 自动扫描 src/scripts/*/*/index.tsx
  │   ├─ 加载每个脚本模块
  │   ├─ 用 browser-extension-url-match 匹配当前 URL
  │   └─ 返回 { key, script, matched } 列表
  │
  ├─ 打印匹配状态（🟢 命中 / 🔴 未命中）
  │
  └─ 执行所有 matched 脚本
```

### 2. 脚本模式

每个业务脚本遵循固定的目录和导出规范：

```
src/scripts/
  └── <站点>/              ← 如 xiaohongshu、v2ex
      └── <脚本名>/        ← 如 demo
          ├── index.tsx     ← 脚本入口（必需）
          └── app.tsx       ← 业务逻辑（推荐）
```

**`index.tsx`** 必须导出一个符合 `Userscript` 接口的函数：

```typescript
// src/shims.d.ts
declare interface Userscript {
  (): import('type-fest').Promisable<void>
  displayName: string
  matches: string[]
}
```

**示例**（[src/scripts/xiaohongshu/demo/index.tsx](src/scripts/xiaohongshu/demo/index.tsx)）：

```typescript
const Script: Userscript = async () => {
  const ui = await createShadowRootUi({
    name: 'xiaohongshu-demo',
    position: 'inline',
    onMount: (container, shadowRoot, shadowHost) => {
      return reactRenderInShadowRoot(
        { uiContainer: container, shadow: shadowRoot, shadowHost },
        () => import('./app'),  // 懒加载业务组件
      )
    },
  })
  ui.mount()
}

Script.displayName = 'xiaohongshu-demo'  // 构建时解析，用于日志输出
Script.matches = ['https://www.xiaohongshu.com/*']  // 构建时解析，自动注入 userscript match

export default Script
```

### 3. UI 系统

提供两种 UI 挂载策略，类型系统完整参考了 [wxt](https://github.com/wxt-dev/wxt) 的设计。

#### 3.1 集成式 UI（`createIntegratedUi`）

直接将 DOM 插入目标页面，样式**不隔离**，适合简单场景。

```typescript
// src/helpers/ui/integrated.ts
const ui = createIntegratedUi({
  position: 'inline',            // 定位模式
  anchor: '#target-selector',    // 锚点选择器
  append: 'after',               // 插入位置
  onMount: (wrapper) => {
    wrapper.innerHTML = '<div>Hello</div>'
  },
})
```

#### 3.2 Shadow Root 隔离式 UI（`createShadowRootUi`）

使用 Shadow DOM 实现**样式和事件完全隔离**，是推荐默认方案。

```typescript
// src/helpers/ui/shadow-root.ts
const ui = await createShadowRootUi({
  name: 'my-script',             // kebab-case 自定义元素名
  mode: 'open',                  // ShadowRoot mode
  position: 'inline',            // inline | overlay | modal | absolute | fixed
  anchor: 'body',                // CSS 选择器 / XPath / Element / 函数
  append: 'last',                // last | first | replace | before | after | 自定义函数
  css: '...',                    // 额外 CSS 文本
  isolateEvents: true,           // 阻止事件冒泡
  onMount: (uiContainer, shadow, shadowHost) => {
    // 在此渲染 React 应用
    return reactRenderInShadowRoot(
      { uiContainer, shadow, shadowHost },
      <App />,
    )
  },
  onRemove: (mounted) => {
    // 清理回调
  },
})
```

#### 3.3 定位模式

| 模式 | 说明 | 适用场景 |
|------|------|---------|
| `inline` | 作为锚点元素的子节点，参与正常文档流 | 嵌入页面内容 |
| `overlay` | 绝对定位，`0x0` 尺寸 + 对齐角 | 角标、浮动按钮 |
| `modal` | 固定定位，全屏覆盖 | 弹窗、对话框 |
| `absolute` | 绝对定位，支持 top/bottom/left/right | 任意位置覆盖 |
| `fixed` | 固定定位，全屏覆盖 | 浮层 |

#### 3.4 自动挂载（`autoMount`）

当锚点元素是动态出现/消失的（SPA 页面常见），可以用 `autoMount` 自动跟随：

```typescript
const ui = await createShadowRootUi({ ... })

// 自动跟随锚点的出现/消失进行 mount/unmount
ui.autoMount()

// 加上 once 选项，只挂载一次
ui.autoMount({ once: true })

// 停止自动监听但保留 UI
ui.autoMount().stopAutoMount()

// 完全移除 UI
ui.remove()
```

### 4. React 集成

#### 4.1 `reactRenderInShadowRoot`

在 Shadow Root 中渲染 React 应用：

```typescript
import { reactRenderInShadowRoot } from '@/helpers/react/shadow-root-helpers'

reactRenderInShadowRoot(
  { uiContainer, shadow, shadowHost },
  // 支持懒加载
  () => import('./app'),
)
```

它做的事情：
1. 在 `uiContainer` 中创建 `<div id="starter-monkey-root">` 并挂载 React Root
2. 使用 `createPortal` 将 `<InlineTailwindCSS />` 注入到 shadow 的 `<head>` 中
3. 提供 `MountContext`（含 `uiContainer`、`shadow`、`shadowHost`）

#### 4.2 `useCreateUis` Hook

用于批量在页面元素上创建 UI：

```typescript
useCreateUis('.note-item', async (element) => {
  return createShadowRootUi({
    name: 'my-ui',
    anchor: element,
    position: 'absolute',
    append: 'after',
    onMount: (container, shadowRoot, shadowHost) => {
      return reactRenderInShadowRoot(
        { uiContainer: container, shadow: shadowRoot, shadowHost },
        <MyComponent />,
      )
    },
  })
})
```

特点：使用全局 `WeakMap` 存储 UI 实例，避免热更新（HMR）时重复创建；版本号机制处理并发创建。

#### 4.3 `useShadowModal` Hook

快速创建一个全屏 Modal：

```typescript
const { toggleModal } = useShadowModal({
  name: 'my-modal',
  zIndex: 999,
  content: <div>Modal Content</div>,
})

// 调用 toggleModal() 切换显示/隐藏
```

### 5. GM API 与网络请求

#### 5.1 Auto Import

所有 GM API 已通过 `unplugin-auto-import` 全局自动导入，无需手动 import：

| API | 用途 |
|-----|------|
| `GM_xmlhttpRequest` | 跨域请求 |
| `GM_setValue` / `GM_getValue` | 持久化存储 |
| `GM_addStyle` | 注入 CSS |
| `GM_setClipboard` | 写入剪贴板 |
| `GM_notification` | 桌面通知 |
| `GM_openInTab` | 新标签页打开 |
| `GM_registerMenuCommand` | 注册菜单命令 |
| `unsafeWindow` | 访问页面原始 window |
| `GM_info` | 获取脚本信息 |
| ... | 更多见 [auto-imports.d.ts](auto-imports.d.ts) |

同时自动导入的还有：
- React 全家桶：`useState`、`useEffect`、`useRef`、`useMemo`、`useCallback`、...
- 项目工具：`createShadowRootUi`、`createIntegratedUi`、`reactRenderInShadowRoot`、`gmFetch`
- classnames：`cls`、`tw`

#### 5.2 `gmFetch`

对 `GM_xmlhttpRequest` 的标准 `fetch` 风格封装：

```typescript
import { gmFetch } from '@/helpers/fetch'

// 支持 fetch 风格调用，自动适配 GM_xmlhttpRequest
const res = await gmFetch('https://api.example.com/data', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ key: 'value' }),
})
const data = await res.json()
```

#### 5.3 `useFetch`（简单 Promise 封装）

```typescript
import { useFetch } from '@/helpers/fetch'

const data = await useFetch({
  url: 'http://127.0.0.1:6090/api/xxx',
  method: 'POST',
  data: { key: 'value' },
})
```

### 6. 环境判断

```typescript
// src/helpers/env.ts
export function isMonkeyEnv() {
  return typeof GM_info !== 'undefined' && typeof GM_xmlhttpRequest !== 'undefined'
}
```

在开发时（`pnpm dev`），代码运行在浏览器中而非用户脚本引擎中，此时 `GM_*` API 不存在。可以用 `isMonkeyEnv()` 做兼容处理。

### 7. TailwindCSS 集成

#### 7.1 Shadow DOM 中的 TailwindCSS

在 Shadow Root 中使用 TailwindCSS 需要特殊处理。项目通过 `InlineTailwindCSS` 组件实现（[src/components/inline-tailwindcss/index.tsx](src/components/inline-tailwindcss/index.tsx)）：

1. Tailwind CSS 内容通过 `?inline` 导入为字符串
2. 通过 `createPortal` 注入到 shadow 的 `<head>` 中
3. `@property` 规则需要提升到 `document.head`（Shadow DOM 不支持）

#### 7.2 `splitShadowRootCss`

自动识别并分离 CSS 规则（[src/helpers/ui/split-shadow-root-css.ts](src/helpers/ui/split-shadow-root-css.ts)）：
- `@property`、`@font-face` → `documentCss`（注入到 document.head）
- 其余规则 → `shadowCss`（注入到 shadow root）

#### 7.3 Monaco Editor 与样式同步

`MonacoEditor` 组件（[src/components/monaco-editor/index.tsx](src/components/monaco-editor/index.tsx)）配合 `useSyncDocumentHeadElements` hook，将 document.head 中 Monaco 相关的样式/link/script 同步拷贝到 shadow head，确保编辑器在 Shadow DOM 中正常工作。

## 快速开始

### 安装与运行

```bash
# 安装依赖
pnpm install

# 开发模式（启动 Vite dev server，输出 .user.js 可安装到油猴）
pnpm dev

# 构建
pnpm build

# 类型检查
pnpm typecheck

# 代码检查
pnpm lint

# 自动修复
pnpm lint:fix
```

### 创建新脚本

1. 在 `src/scripts/<站点>/<脚本名>/` 下创建 `index.tsx`：

```typescript
const Script: Userscript = async () => {
  const ui = await createShadowRootUi({
    name: 'my-script',
    position: 'inline',
    onMount: (container, shadowRoot, shadowHost) => {
      return reactRenderInShadowRoot(
        { uiContainer: container, shadow: shadowRoot, shadowHost },
        () => import('./app'),
      )
    },
  })
  ui.mount()
}

Script.displayName = 'my-script'
Script.matches = ['https://example.com/*']

export default Script
```

2. 在同目录下创建 `app.tsx` 编写业务 UI：

```typescript
export default function App() {
  return <div className="text-red-500">Hello from userscript!</div>
}
```

3. 运行 `pnpm dev`，脚本将自动带上 `https://example.com/*` 的 match 规则。

### 关键约定

| 约定 | 说明 |
|------|------|
| `displayName` | 必填，用于构建时日志输出 |
| `matches` | 必填，URL 匹配规则数组，构建时自动注入 userscript metadata |
| 目录结构 | 必须为 `src/scripts/<站点>/<名称>/index.tsx` 两层结构 |
| 懒加载 | 推荐在 `onMount` 中使用 `() => import('./app')` 实现组件按需加载 |

## 构建配置详解

### vite.config.ts（[文件](vite.config.ts)）

关键配置：

```typescript
monkey({
  entry: 'src/main.ts',
  userscript: {
    name: localesMeta.name,           // 多语言脚本名
    description: localesMeta.description,  // 多语言描述
    namespace: 'yuns',
    match: allMatches,                // 从所有脚本自动收集
    grant: ['unsafeWindow', 'GM_xmlhttpRequest'],
    connect: ['127.0.0.1', 'localhost', '*'],  // GM_xmlhttpRequest 允许的域名
    noframes: true,
    license: 'MIT',
  },
  build: {
    externalGlobals: {
      // React 从 CDN 加载，减小脚本体积
      'react': cdn.jsdelivr('React', 'umd/react.production.min.js'),
      'react-dom': cdn.jsdelivr('ReactDOM', 'umd/react-dom.production.min.js'),
    },
  },
})
```

构建输出：`dist/<name>.user.js`

### 脚本元信息自动收集

构建时，`scripts/script-infos.ts` 使用 TypeScript AST 解析所有 `src/scripts/*/*/index.tsx` 文件：

1. 提取 `Script.displayName`
2. 提取 `Script.matches`
3. 汇总所有 matches 注入到 userscript header
4. 在终端打印脚本树：

```
🐒 Userscript Configuration:
├── ⚡ xiaohongshu-demo
│   └── 🎯 https://www.xiaohongshu.com/*
└── ⚡ v2ex-demo
    └── 🎯 https://www.v2ex.com/*
```

## 自动发布

当推送 `v*.*.*` 格式的 tag 时，GitHub Actions 自动触发（[workflow](.github/workflows/release.yml)）：

1. Checkout 代码
2. 安装 pnpm 和依赖
3. `pnpm run build` 构建
4. 创建 GitHub Release 并上传 `dist/*.user.js`
5. 自动生成 Changelog

发布命令：
```bash
pnpm release  # 交互式选择版本号
```

## 常见问题

### 集成 shadcn/ui 时浮层组件样式丢失

Shadow DOM 中的 `@property` 规则需要在 document 层面定义。项目已通过 `splitShadowRootCss` 自动处理 `@property` 和 `@font-face`。如仍有问题，参考：[GitHub Issue #1](https://github.com/yunsii/starter-monkey/issues/1)

### 开发时 API 请求被浏览器拦截

在 `vite.config.ts` 的 `userscript.connect` 中添加你需要访问的域名：

```typescript
connect: ['127.0.0.1', 'localhost', '*', 'api.example.com']
```

### 脚本不生效？

1. 检查 `matches` 是否正确匹配目标 URL
2. 查看控制台日志，确认脚本是否被加载（🟢/🔴 指示器）
3. 确认 userscript 引擎已启用该脚本
4. 开发模式下，确保 Vite dev server 正在运行

### 如何同时开发多个脚本？

直接创建多个 `src/scripts/<站点>/<名称>/` 目录即可。入口 `main.ts` 会自动扫描所有脚本并分别匹配 URL。

## 参考项目

- [vite-plugin-monkey](https://github.com/lisonge/vite-plugin-monkey) — 核心驱动
- [wxt](https://github.com/wxt-dev/wxt) — 浏览器扩展开发框架（UI 系统参考）
- [Bob Monkey](https://github.com/yunsii/bob-monkey) — 基于本模板的实际项目
