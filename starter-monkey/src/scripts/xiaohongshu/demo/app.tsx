import { useState, useEffect, useRef } from 'react'
import useCreateUis from '@/hooks/ui'
import { reactRenderInShadowRoot } from '@/helpers/react/shadow-root-helpers'
import { createShadowRootUi } from '@/helpers/ui/shadow-root'
import { injectGlobalStyles } from '@/helpers/scripts'
import { useFetch } from '@/helpers/fetch'

/** nodeId → Promise<boolean>，缓存去重，避免同一笔记重复请求 */
const nodeCheckCache = new Map<string, Promise<boolean>>()

async function checkNodeExists(nodeId: string): Promise<boolean> {
  if (!nodeCheckCache.has(nodeId)) {
    nodeCheckCache.set(
      nodeId,
      useFetch({ url: 'http://127.0.0.1:6090/xhs/check/' + nodeId })
        .then(res => res.data?.exists ?? false)
        .catch(() => false)
    )
  }
  return nodeCheckCache.get(nodeId)!
}

/** 存储 shadow root 引用，方便导入成功后动态刷新 UI */
const checkMarkRefs = new Map<string, { container: HTMLElement; shadow: ShadowRoot; shadowHost: HTMLElement }>()
const buttonRefs = new Map<string, { container: HTMLElement; shadow: ShadowRoot; shadowHost: HTMLElement }>()

/** 已导入标记图标（复用） */
const CheckMarkIcon = () => (
  <div
    className="block absolute"
    style={{
      width: '28px',
      height: '28px',
      right: '4px',
      top: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #eb404a, #ff6b7a)',
      borderRadius: '50%',
      boxShadow: '0 2px 8px rgba(235, 64, 74, 0.4), 0 0 0 2px rgba(255,255,255,0.8)',
    }}
  >
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="#fff"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ width: '16px', height: '16px' }}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  </div>
)

export default function App() {
  // 在组件挂载时注入全局样式（id 检查保证只注入一次）
  useEffect(() => {
    injectGlobalStyles(`
    .footer {
      position: relative;
    }`)
  }, [])
  /**
   * 从用户资料URL中提取目标ID（694009e8000000001f007c05这类）
   * @param {string} url - 待解析的URL字符串
   * @returns {string|null} 提取到的目标ID，未匹配到则返回null
   */
  function extractTargetIdFromProfileUrl(url) {
    // 正则表达式解析规则：
    // /user/profile/ 固定前缀
    // ([0-9a-f]+) 匹配第一段十六进制ID（非贪婪）
    // / 分隔符
    // ([0-9a-f]+) 匹配目标十六进制ID（非贪婪）
    // \? 匹配URL参数的问号（转义）
    const regex = /\/user\/profile\/[0-9a-f]+\/([0-9a-f]+)\?/i;

    // 执行正则匹配
    const matchResult = url.match(regex);

    // 匹配成功则返回第二个分组（目标ID），否则返回null
    return matchResult ? matchResult[1] : null;
  }

  /** 导入单个笔记（异步），返回是否成功 */
  async function importNote(noteItem: Element): Promise<boolean> {
    return new Promise((resolve) => {
      const cover = (noteItem as HTMLElement).querySelector<HTMLElement>('.cover')
      if (!cover) { resolve(false); return }

      const nodeId = extractTargetIdFromProfileUrl(cover.href || '')

      cover.click()
      setTimeout(() => {
        const noteDetailMap = Object.entries(
          window.__INITIAL_STATE__.note?.noteDetailMap ?? {}
        ).reduce((acc, [key, value]) => {
          if (key !== '' && key !== 'undefined') acc[key] = value
          return acc
        }, {} as Record<string, any>)

        const nodeData = noteDetailMap[nodeId]
        if (!nodeData) {
          document.querySelector<HTMLElement>('.close-circle')?.click()
          resolve(false)
          return
        }

        useFetch({
          url: 'http://127.0.0.1:6090/xhs/create',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          data: nodeData,
        }).then((res: any) => {
          console.log(res)

          if (res.data) {
            // 导入成功：更新缓存 + 隐藏按钮 + 显示标记
            nodeCheckCache.set(nodeId, Promise.resolve(true))

            const buttonRef = buttonRefs.get(nodeId)
            if (buttonRef) {
              buttonRef.shadowHost.style.display = 'none'
            }

            const checkRef = checkMarkRefs.get(nodeId)
            if (checkRef) {
              reactRenderInShadowRoot(
                { uiContainer: checkRef.container, shadow: checkRef.shadow, shadowHost: checkRef.shadowHost },
                <CheckMarkIcon />
              )
            }

            // 关闭详情弹窗
            document.querySelector<HTMLElement>('.close-circle')?.click()

            // 延时 1s 点赞
            setTimeout(() => {
              noteItem.querySelector<HTMLElement>('.like-wrapper.like-active')?.click()
              resolve(true)
            }, 300)
          } else {
            document.querySelector<HTMLElement>('.close-circle')?.click()
            resolve(false)
          }
        }).catch(() => {
          document.querySelector<HTMLElement>('.close-circle')?.click()
          resolve(false)
        })
      }, 500)
    })
  }

  // 单笔记导入（按钮点击入口）
  function toggleExportNode(e: any, root: Element) {
    const noteItem = root.closest('.note-item')
    if (noteItem) importNote(noteItem)
  }

  // ========== 批量导入悬浮面板组件（适配虚拟列表） ==========
  function BatchPanel() {
    interface LogItem {
      nodeId: string
      title: string
      ok: boolean
    }

    const [collapsed, setCollapsed] = useState(false)
    const [runStatus, setRunStatus] = useState<'idle' | 'running' | 'paused'>('idle')
    const [pausing, setPausing] = useState(false)
    const [executedCount, setExecutedCount] = useState(0)
    const [currentTitle, setCurrentTitle] = useState('')
    const [recentLog, setRecentLog] = useState<LogItem[]>([])
    const pausedRef = useRef(false)
    const processedRef = useRef<Set<string>>(new Set())
    const logRef = useRef<LogItem[]>([])
    const countRef = useRef(0)

    // ===== 持久缓存 =====
    const STORAGE_KEY = 'xhs_batch_stats'

    function saveToStorage() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          count: countRef.current,
          processedIds: [...processedRef.current],
          logs: logRef.current,
        }))
      } catch {}
    }

    function loadFromStorage() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return
        const saved = JSON.parse(raw)
        if (saved.count) {
          countRef.current = saved.count
          setExecutedCount(saved.count)
        }
        if (saved.processedIds?.length) {
          processedRef.current = new Set(saved.processedIds)
        }
        if (saved.logs?.length) {
          logRef.current = saved.logs
          setRecentLog([...saved.logs])
        }
      } catch {}
    }

    const handleReset = () => {
      if (runStatus === 'running' || pausing) return
      countRef.current = 0
      processedRef.current.clear()
      logRef.current = []
      setExecutedCount(0)
      setRecentLog([])
      try { localStorage.removeItem(STORAGE_KEY) } catch {}
    }

    // 组件挂载时从 localStorage 恢复
    useEffect(() => { loadFromStorage() }, [])

    /** 从当前 DOM 中取第一个未处理的可见笔记 */
    function findNextNoteItem(): { el: Element; nodeId: string; title: string } | null {
      const items = document.querySelectorAll('.note-item')
      for (const el of items) {
        const cover = el.querySelector<HTMLAnchorElement>('.cover')
        const nodeId = extractTargetIdFromProfileUrl(cover?.href || '')
        if (!nodeId || processedRef.current.has(nodeId)) continue
        const img = cover?.querySelector('img')
        const title = img?.getAttribute('alt') || cover?.textContent?.trim() || `笔记 ${nodeId.slice(-6)}`
        return { el, nodeId, title }
      }
      return null
    }

    const handleStart = async () => {
      if (runStatus === 'running') return
      setRunStatus('running')
      pausedRef.current = false

      // 连续无新笔记计数（滚动加载等待用）
      let emptyStreak = 0
      let batchCount = 0 // 每 15 个休息一次

      while (true) {
        if (pausedRef.current) break

        const next = findNextNoteItem()
        if (!next) {
          // 当前可见的全部已处理，滚动加载更多
          emptyStreak++
          if (emptyStreak > 3) break // 连续 3 次没新笔记，认为到底了

          // 检查 .feeds-container 内所有 section 是否都已处理完毕
          const feeds = document.querySelector('.feeds-container') as HTMLElement | null
          let allSectionsProcessed = true
          if (feeds) {
            const feedItems = feeds.querySelectorAll('.note-item')
            for (const item of feedItems) {
              const cover = item.querySelector<HTMLAnchorElement>('.cover')
              const nid = extractTargetIdFromProfileUrl(cover?.href || '')
              if (nid && !processedRef.current.has(nid)) {
                allSectionsProcessed = false
                break
              }
            }
          }

          if (allSectionsProcessed) {
            // feeds-container 内全部已处理，滚动 window 加载新内容
            window.scrollBy(0, window.innerHeight)
          } else if (feeds) {
            // 还有未处理的 section，滚动 feeds-container 到达
            feeds.scrollBy(0, 500)
          } else {
            window.scrollBy(0, window.innerHeight)
          }
          setCurrentTitle('加载更多笔记...')
          await new Promise(r => setTimeout(r, 1500))
          continue
        }

        emptyStreak = 0
        processedRef.current.add(next.nodeId)

        // 随机延迟 0.1~0.5s，模拟真人点击间隔
        const delayMs = 500 + Math.random() * 1000
        const endTime = Date.now() + delayMs
        while (Date.now() < endTime) {
          if (pausedRef.current) break
          const remaining = ((endTime - Date.now()) / 1000).toFixed(1)
          setCurrentTitle(`⏳ ${next.nodeId.slice(-6)} 等待 ${remaining}s...`)
          await new Promise(r => setTimeout(r, 500))
        }
        if (pausedRef.current) break

        setCurrentTitle(next.nodeId)
        const ok = await importNote(next.el)

        countRef.current++
        setExecutedCount(countRef.current)

        const logItem: LogItem = { nodeId: next.nodeId, title: next.title, ok }
        logRef.current = [logItem, ...logRef.current].slice(0, 50)
        setRecentLog([...logRef.current])
        saveToStorage()

        // 每导入 10 个滚动 window 一屏
        if (countRef.current % 10 === 0) {
          window.scrollBy(0, window.innerHeight)
        }

        // 每 15 个休息 30 秒，模拟真人操作节奏
        batchCount++
        if (batchCount >= 15) {
          batchCount = 0
          const restEnd = Date.now() + 30000
          while (Date.now() < restEnd) {
            if (pausedRef.current) break
            const restRemaining = Math.ceil((restEnd - Date.now()) / 1000)
            setCurrentTitle(`☕ 休息中... ${restRemaining}s 后继续`)
            await new Promise(r => setTimeout(r, 1000))
          }
          if (pausedRef.current) break
        }
      }

      setCurrentTitle('')
      setPausing(false)
      setRunStatus(pausedRef.current ? 'paused' : 'idle')
    }

    const handlePause = () => {
      pausedRef.current = true
      setPausing(true)
      // 不立即改 runStatus，当前 importNote 完成后循环自然退出再设状态
    }

    const HEADER_H = 40

    return (
      <div style={{
        width: '300px',
        maxHeight: collapsed ? `${HEADER_H}px` : '360px',
        background: 'rgba(255,255,255,0.96)',
        backdropFilter: 'blur(12px)',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        transition: 'max-height 0.3s ease',
        border: '1px solid rgba(0,0,0,0.08)',
      }}>
        {/* Header */}
        <div
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            height: `${HEADER_H}px`, padding: '0 16px', cursor: 'pointer',
            background: 'linear-gradient(135deg, #eb404a, #ff6b7a)',
            color: '#fff', userSelect: 'none', flexShrink: 0,
          }}
          onClick={(e) => { e.stopPropagation(); setCollapsed(prev => !prev) }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '14px' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }}>
              <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
              <line x1="12" y1="22" x2="12" y2="15.5" />
              <polyline points="22 8.5 12 15.5 2 8.5" />
            </svg>
            批量导入
          </div>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{
            width: '16px', height: '16px', transform: collapsed ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s',
          }}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>

        {/* Body — always mounted, hidden by overflow when collapsed */}
        <div style={{ display: 'flex', flexDirection: 'column', height: `calc(360px - ${HEADER_H}px)` }}>
          {/* Status bar */}
          <div style={{ padding: '10px 16px', borderBottom: '1px solid #eee', flexShrink: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
              <span style={{ color: '#333', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                已执行: <span style={{ color: '#eb404a', fontSize: '16px' }}>{executedCount}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); handleReset() }}
                  disabled={runStatus === 'running' || pausing}
                  title="重置计数"
                  style={{
                    width: '18px', height: '18px', border: 'none', borderRadius: '50%',
                    fontSize: '10px', lineHeight: '18px', cursor: 'pointer',
                    background: '#f0f0f0', color: '#999',
                    padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  ↺
                </button>
              </span>
              <span style={{
                color: pausing ? '#f59e0b' : runStatus === 'running' ? '#eb404a' : runStatus === 'paused' ? '#f59e0b' : '#999',
                fontWeight: runStatus === 'running' ? 600 : 400,
                fontSize: '11px',
              }}>
                {runStatus === 'idle' && '待开始'}
                {pausing && '⏸ 暂停中...'}
                {!pausing && runStatus === 'running' && '⏳ 执行中...'}
                {runStatus === 'paused' && '⏸ 已暂停'}
              </span>
            </div>
            {(runStatus === 'running' || pausing) && (
              <div style={{ height: '3px', background: '#eee', borderRadius: '2px', overflow: 'hidden', marginTop: '6px' }}>
                <div style={{
                  height: '100%', width: '60%', borderRadius: '2px',
                  background: 'linear-gradient(90deg, #eb404a, #ff6b7a)',
                  animation: 'indeterminate 1.5s ease-in-out infinite',
                }} />
              </div>
            )}
            {currentTitle && (runStatus === 'running' || pausing) && (
              <div style={{ marginTop: '6px', fontSize: '11px', color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                当前: {currentTitle}
              </div>
            )}
          </div>

          {/* Recent log */}
          <div style={{ flex: 1, overflow: 'auto', padding: '6px 12px', fontSize: '11px' }}>
            {recentLog.map((item, i) => (
              <div key={`${item.nodeId}-${i}`} style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '4px 4px', borderBottom: '1px solid #f8f8f8',
                color: '#555',
              }}>
                <span style={{ flexShrink: 0 }}>
                  {item.ok ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ width: '12px', height: '12px' }}>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" style={{ width: '12px', height: '12px' }}>
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  )}
                </span>
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.nodeId}
                </span>
              </div>
            ))}
            {recentLog.length === 0 && (
              <div style={{ textAlign: 'center', color: '#bbb', padding: '20px', fontSize: '12px' }}>
                点击开始执行
              </div>
            )}
          </div>

          {/* Buttons */}
          <div style={{ padding: '10px 16px', borderTop: '1px solid #eee', display: 'flex', gap: '10px', flexShrink: 0 }}>
            <button
              onClick={handleStart}
              disabled={runStatus === 'running'}
              style={{
                flex: 1, height: '34px', border: 'none', borderRadius: '17px',
                fontSize: '13px', fontWeight: 600,
                cursor: runStatus === 'running' ? 'not-allowed' : 'pointer',
                color: '#fff',
                background: runStatus === 'running' ? '#ccc' : 'linear-gradient(135deg, #eb404a, #ff6b7a)',
                boxShadow: runStatus === 'running' ? 'none' : '0 2px 8px rgba(235,64,74,0.35)',
                transition: 'all 0.2s',
                  opacity: runStatus === 'running' ? 0.6 : 1,
                }}
              >
                {runStatus === 'idle' ? '▶ 开始' : runStatus === 'paused' ? '▶ 继续' : '● 执行中'}
              </button>
              <button
                onClick={handlePause}
                disabled={runStatus !== 'running' || pausing}
                style={{
                  flex: 1, height: '34px', border: '2px solid #eb404a', borderRadius: '17px',
                  fontSize: '13px', fontWeight: 600,
                  cursor: runStatus === 'running' && !pausing ? 'pointer' : 'not-allowed',
                  color: runStatus === 'running' && !pausing ? '#eb404a' : '#ccc',
                  background: 'transparent',
                  transition: 'all 0.2s',
                }}
              >
                {pausing ? '⏸ 暂停中...' : '⏸ 暂停'}
              </button>
            </div>
          </div>
      </div>
    )
  }

  // 创建批量导入悬浮面板（只执行一次）
  const batchPanelRef = useRef<any>(null)
  useEffect(() => {
    console.log("创建批量导入悬浮面板",document.querySelectorAll('xiaohongshu-batch-panel'))
    if (batchPanelRef.current) return
    // 热更新/StrictMode 重渲染时，DOM 上可能已有旧面板，跳过创建
    if (document.querySelector('xiaohongshu-batch-panel')) return
    createShadowRootUi({
      name: 'xiaohongshu-batch-panel',
      position: 'overlay',
      zIndex: 99999,
      alignment: 'bottom-right',
      onMount: (container, shadowRoot, shadowHost) => {
        shadowHost.style.display = 'block'
        return reactRenderInShadowRoot(
          { uiContainer: container, shadow: shadowRoot, shadowHost },
          <div style={{ position: 'fixed', bottom: '20px', right: '20px' }}>
            <BatchPanel />
          </div>,
        )
      },
    }).then(ui => {
      batchPanelRef.current = ui
      ui.mount()
    })
    return () => {
      batchPanelRef.current?.remove()
      batchPanelRef.current = null
    }
  }, [])

  // 在组件顶层调用 - 检查标记
  useCreateUis('.note-item .cover img', async (element) => {
    return createShadowRootUi({
      name: 'xiaohongshu-check',
      position: 'absolute',
      append: 'after',
      anchor: element as HTMLAnchorElement,
      onMount: async (container, shadowRoot, shadowHost) => {
        shadowHost.style.display = 'block'
        const nodeId = extractTargetIdFromProfileUrl(
          element.closest('.note-item')?.querySelector('.cover')?.href || ''
        )

        checkMarkRefs.set(nodeId, { container, shadow: shadowRoot, shadowHost })

        const exists = await checkNodeExists(nodeId)
        return reactRenderInShadowRoot(
          { uiContainer: container, shadow: shadowRoot, shadowHost },
          exists ? <CheckMarkIcon /> : null
        )
      },
    })
  })

  // 导入按钮
  useCreateUis('.note-item .footer', async (element) => {
    return createShadowRootUi({
      name: 'xiaohongshu-export',
      position: 'absolute',
      append: 'first',
      anchor: element as HTMLAnchorElement,
      onMount: async (container, shadowRoot, shadowHost) => {
        const nodeId = extractTargetIdFromProfileUrl(
          element.closest('.note-item')?.querySelector('.cover')?.href || ''
        )

        buttonRefs.set(nodeId, { container, shadow: shadowRoot, shadowHost })

        const exists = await checkNodeExists(nodeId)
        if (exists) {
          return reactRenderInShadowRoot(
            { uiContainer: container, shadow: shadowRoot, shadowHost },
            null
          )
        }

        shadowHost.style.display = 'block'
        shadowHost.style.position = 'absolute'
        shadowHost.style.top = '-36px'
        shadowHost.style.right = '77px'
        return reactRenderInShadowRoot(
          { uiContainer: container, shadow: shadowRoot, shadowHost },
          <button
            type='button'
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              height: '28px',
              padding: '0 14px',
              fontSize: '13px',
              fontWeight: 600,
              lineHeight: 1,
              color: '#fff',
              background: 'linear-gradient(135deg, #eb404a, #ff6b7a)',
              border: 'none',
              borderRadius: '14px',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(235, 64, 74, 0.35)',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)'
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(235, 64, 74, 0.5)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(235, 64, 74, 0.35)'
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(0.96)'
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)'
            }}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              toggleExportNode(e, element)
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ width: '14px', height: '14px', flexShrink: 0 }}
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            导入
          </button>

          ,
        )
      },
    })
  })
  // 不直接渲染任何 DOM
  return null
}
