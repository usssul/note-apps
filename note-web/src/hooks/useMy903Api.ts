import dayjs from 'dayjs'

const COLUMN_IDS = ['7', '8', '9']

export function useMy903Api() {
  // ---- 歌曲列表状态 ----
  const songs = ref<any[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const total = ref(0)
  const currentPage = ref(1)
  const pageSize = ref(12)
  const activeTag = ref('')

  // ---- 同步信息状态 ----
  const syncInfoList = ref<any[]>([])
  const syncInfoLoading = ref(false)
  const statsTotal = ref(0)
  const isTriggering = ref(false)

  // ---- 详情弹窗状态 ----
  const showDetail = ref(false)
  const currentDetail = ref<any>({})

  // ---- 计算属性 ----
  const totalPages = computed(() => Math.ceil(total.value / pageSize.value) || 0)

  // ---- 方法：获取歌曲列表 ----
  async function fetchList(page?: number, tag?: string) {
    loading.value = true
    error.value = null
    try {
      const res = await getMy903List({
        pageNo: page ?? currentPage.value,
        pageSize: pageSize.value,
        tag: tag ?? activeTag.value,
      })
      songs.value = res.data.data || []
      total.value = res.data.total || 0
      if (page) currentPage.value = page
    } catch (e: any) {
      error.value = e.message || '加载失败'
      songs.value = []
    } finally {
      loading.value = false
    }
  }

  // ---- 方法：获取逐栏目同步信息 ----
  async function fetchSyncInfo() {
    syncInfoLoading.value = true
    try {
      const results = await Promise.all(
        COLUMN_IDS.map(id => getSyncInfoByColumnApi(id))
      )
      syncInfoList.value = results
        .map(r => r.data || r)
        .filter(Boolean)
    } catch {
      // 降级：尝试总览接口
      try {
        const res = await getSyncInfoApi()
        syncInfoList.value = res.data ? [res.data] : []
      } catch {
        syncInfoList.value = []
      }
    } finally {
      syncInfoLoading.value = false
    }
  }

  // ---- 方法：获取统计总数 ----
  async function fetchStatistics() {
    try {
      const res = await getStatisticsApi()
      // ResponseDto 格式: { code: 0, data: <count>, message: '...' }
      statsTotal.value = res.data ?? res ?? 0
    } catch {
      // ignore
    }
  }

  // ---- 方法：手动触发抓取 ----
  async function triggerFetch() {
    isTriggering.value = true
    try {
      await fetchNewApi()
      ElMessage.success('抓取任务已触发，正在刷新数据...')
      await Promise.all([
        fetchList(1),
        fetchSyncInfo(),
        fetchStatistics(),
      ])
    } catch (e: any) {
      ElMessage.error(e.message || '抓取失败')
    } finally {
      isTriggering.value = false
    }
  }

  // ---- 方法：获取歌曲详情 ----
  async function fetchDetail(articleId: number) {
    try {
      const res = await getDetailApi(articleId)
      return res.data
    } catch {
      return null
    }
  }

  // ---- 方法：打开详情弹窗 ----
  async function openDetail(articleId: number) {
    const detail = await fetchDetail(articleId)
    if (detail) {
      currentDetail.value = detail
      showDetail.value = true
    }
  }

  // ---- 方法：切换页码 ----
  function changePage(page: number) {
    fetchList(page)
  }

  // ---- 方法：切换每页条数 ----
  function changePageSize(size: number) {
    pageSize.value = size
    fetchList(1)
  }

  // ---- 方法：切换标签 ----
  function setTag(tag: string) {
    activeTag.value = tag
    fetchList(1, tag)
  }

  return {
    // 列表
    songs, loading, error, total, currentPage, pageSize, totalPages,
    // 标签
    activeTag,
    // 同步
    syncInfoList, syncInfoLoading, statsTotal, isTriggering,
    // 详情
    showDetail, currentDetail,
    // 方法
    fetchList, fetchSyncInfo, fetchStatistics, triggerFetch,
    fetchDetail, openDetail, changePage, changePageSize, setTag,
  }
}

export default useMy903Api
