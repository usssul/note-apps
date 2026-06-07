import { logger } from '@/helpers/logger'

import { getUserscripts } from './helpers/scripts'

getUserscripts().then((userscripts) => {
  const matchedUserscripts = userscripts.filter((item) => item.matched)

  // 生成脚本列表
  const scriptLines = userscripts.map((item) => {
    const status = item.matched ? '🟢' : '🔴'
    const name = item.script.displayName
    return `${status} ${name}`
  })

  // 组合所有行
  const printInfo = [
    '',
    ...scriptLines,
  ].join('\n')

  logger.debug(printInfo)

  // 执行匹配的脚本
  matchedUserscripts.forEach((item) => {
    item.matched && item.script()
  })
})
