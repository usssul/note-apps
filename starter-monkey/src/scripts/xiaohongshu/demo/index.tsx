import { reactRenderInShadowRoot } from '@/helpers/react/shadow-root-helpers'
import { createShadowRootUi } from '@/helpers/ui/shadow-root'

const Script: Userscript = async () => {
  const ui = await createShadowRootUi(
    {
      name: 'xiaohongshu-demo',
      position: 'inline',
      onMount: (container, shadowRoot, shadowHost) => {
        return reactRenderInShadowRoot(
          { uiContainer: container, shadow: shadowRoot, shadowHost },
          () => import('./app'),
        )
      },
    },
  )

  ui.mount()
}
console.log('xiaohongshu-demo')
Script.displayName = 'xiaohongshu-demo'
Script.matches = ['https://www.xiaohongshu.com/*']

export default Script
