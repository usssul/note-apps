import { useState, useEffect } from 'react'
import useCreateUis, { useShadowModal } from '@/hooks/ui'
import { injectGlobalStyles } from '@/helpers/scripts'
import { useFetch } from '@/helpers/fetch'

export default function App() {
  // 在组件挂载时注入全局样式
  injectGlobalStyles(`.footer {
          position: relative;
        }`)
  const { toggleModal: toggleEditorModal } = useShadowModal({
    name: 'xiaohongshu-demo-editor',
    content: (
      <div className='bg-white'>
        <div className='p-2 text-lg'>Monaco Editor</div>
      </div>
    ),
  })
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

  function toggleExportNode(e, root) {
    const noteItemNode = root.closest('.note-item').querySelector('.cover')
    noteItemNode && noteItemNode.click()
    setTimeout(() => {
      const noteDetailMap = Object.entries(window.__INITIAL_STATE__.note?.noteDetailMap)?.reduce((acc, [key, value]) => {
        if (key !== '' && key !== 'undefined') {
          acc[key] = value
        }
        return acc
      }, {})
      const nodeItem = noteDetailMap[extractTargetIdFromProfileUrl(noteItemNode.href)]
      const nodeJson = JSON.stringify(nodeItem)
      // console.log(nodeJson)
      useFetch({
        url: 'http://127.0.0.1:6090/xhs/create',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        data: nodeItem,
      }).then(res => {
        console.log(res)
      })
    }, 1000)

  }

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
        
        try {
          const res = await useFetch({
            url: 'http://127.0.0.1:6090/xhs/check/' + nodeId,
          })
          
          return reactRenderInShadowRoot(
            { uiContainer: container, shadow: shadowRoot, shadowHost },
            res.data?.exists ? (
              <div
                className="i-bx--bx-check-circle block absolute"
                style={{
                  width: '30px',
                  height: '30px',
                  color: '#eb404a',
                  right: '0',
                  top: '0',
                }}
              />
            ) : null
          )
        } catch (error) {
          console.error('检查失败:', nodeId, error)
          return reactRenderInShadowRoot(
            { uiContainer: container, shadow: shadowRoot, shadowHost },
            null
          )
        }
      },
    })
  })

  // 导出按钮
  useCreateUis('.note-item .footer', async (element) => {
    return createShadowRootUi({
      name: 'xiaohongshu-export',
      position: 'absolute',
      append: 'first',
      anchor: element as HTMLAnchorElement,
      onMount: (container, shadowRoot, shadowHost) => {
        shadowHost.style.display = 'block'
        shadowHost.style.position = 'absolute'
        shadowHost.style.top = '-36px'
        shadowHost.style.right = '0'
        return reactRenderInShadowRoot(
          { uiContainer: container, shadow: shadowRoot, shadowHost },
          <button
            type='button'
            className='block absolute whitespace-nowrap top-0 right-0 cursor-pointer bg-[#eb404a] items-center gap-1 font-bold m-2 text-[#fff] rounded-sm px-1.5 z-10'
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              toggleExportNode(e, element)
            }}
          >
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
