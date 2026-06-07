import { useEffect, useRef } from 'react'
import { useElementsMutationObserver } from 'react-dx'

interface UiLike { mount: () => void, remove: () => void }

// 全局 UI 实例存储，用于跨 hook 实例共享，避免热更新时重复创建
const globalUiMap = new WeakMap<Element, UiLike>()
const globalVersionMap = new WeakMap<Element, number>()

export function useCreateUis(
  selectors: string,
  createFn: (element: Element) => Promise<UiLike>,
) {
  // 使用全局 Map 而不是 ref，确保跨多次 hook 调用时共享状态
  const uiMap = useRef(globalUiMap)
  const versionMap = useRef(globalVersionMap)
  const cleanupElementsRef = useRef<Set<Element>>(new Set())

  useElementsMutationObserver<Element>(selectors, {
    onMount: (element) => {
      // 检查是否已经存在 UI 实例，避免热更新时重复创建
      const existingUi = uiMap.current.get(element)
      if (existingUi) {
        // 记录该元素由当前 hook 管理，以便卸载时清理
        cleanupElementsRef.current.add(element)
        return
      }
      
      // 记录该元素由当前 hook 管理
      cleanupElementsRef.current.add(element)

      // helpers with clearer names
      const removeUiSafe = (ui?: UiLike) => {
        if (!ui) {
          return
        }
        try {
          ui.remove()
        } catch (e) {
          /* ignore */
        }
      }
      const mountUiSafe = (ui?: UiLike) => {
        if (!ui) {
          return
        }
        try {
          ui.mount()
        } catch (e) {
          /* ignore */
        }
      }

      // 1) increment version for this element
      const prevVersion = versionMap.current.get(element) ?? 0
      const currentVersion = prevVersion + 1
      versionMap.current.set(element, currentVersion)

      // 2) check if UI already exists for this element
      if (existingUi) {
        // UI already exists, just remount it instead of creating a new one
        mountUiSafe(existingUi)
        return
      }

      // 3) start creation (allow concurrent creates). When done, only the latest version is kept
      createFn(element).then((createdUi) => {
        const latestVersion = versionMap.current.get(element) ?? 0
        if (latestVersion !== currentVersion) {
          // stale ui instance, remove and exit
          removeUiSafe(createdUi)
          return
        }

        // 4) we're the latest: replace previous instance and mount
        const previousUi = uiMap.current.get(element)
        if (previousUi && previousUi !== createdUi) {
          removeUiSafe(previousUi)
        }

        uiMap.current.set(element, createdUi)
        mountUiSafe(createdUi)
      })
    },
  })

  // 组件卸载时清理当前 hook 创建的 UI 实例
  useEffect(() => {
    return () => {
      // 只清理当前 hook 管理的元素
      cleanupElementsRef.current.forEach(element => {
        const ui = uiMap.current.get(element)
        if (ui) {
          try {
            ui.remove()
          } catch (e) {
            /* ignore */
          }
          // 从全局 Map 中移除
          uiMap.current.delete(element)
          versionMap.current.delete(element)
        }
      })
      cleanupElementsRef.current.clear()
    }
  }, [])

  return {
    // convenient helper to get the current mounted ui for an element
    getUiForElement: (el: Element) => uiMap.current.get(el),
  }
}

export default useCreateUis

export interface UseShadowModalOptions {
  name: string
  /** default 999 */
  zIndex?: number
  content: React.ReactNode
}

export function useShadowModal(options: UseShadowModalOptions) {
  const { name, zIndex = 999, content } = options

  const modalUi = useRef<ShadowRootUi | null>(null)
  const openRef = useRef(false)

  const toggleModal = () => {
    openRef.current = !openRef.current
    if (openRef.current) {
      modalUi.current?.mount()
    } else {
      modalUi.current?.remove()
    }
  }

  useEffect(() => {
    createShadowRootUi({
      name,
      position: 'modal',
      zIndex,
      onMount: (container, shadowRoot, shadowHost) => {
        shadowHost.style.display = 'block'
        return reactRenderInShadowRoot(
          { uiContainer: container, shadow: shadowRoot, shadowHost },
          <div
            className={`
              absolute inset-0 flex items-center justify-center backdrop-blur-lg
            `}
            onClick={() => {
              toggleModal()
            }}
          >
            <div
              className='max-h-[80vh] min-h-20 w-130 max-w-[80vw]'
              onClick={(event) => {
                event.stopPropagation()
              }}
            >
              {content}
            </div>
          </div>,
        )
      },
    }).then((ui) => {
      if (modalUi.current) {
        modalUi.current.remove()
      }
      modalUi.current = ui
      if (openRef.current) {
        ui.mount()
      }
    })

    // 组件卸载时清理 modal UI
    return () => {
      if (modalUi.current) {
        modalUi.current.remove()
        modalUi.current = null
      }
    }
  }, [name, zIndex, content])

  return {
    toggleModal,
  }
}
