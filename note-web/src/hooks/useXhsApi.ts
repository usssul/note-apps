import { getXhsListApi, getXhsStatisticsApi, getXhsDetailApi } from '@/api/xhs'

const MINIO_BASE = 'http://localhost:9000'

/** 将 MinIO 相对路径转为完整 URL */
function toFullUrl(path: string | undefined): string {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  return `${MINIO_BASE}${path.startsWith('/') ? '' : '/'}${path}`
}

export function useXhsApi() {
  // ---- 笔记列表状态 ----
  const notes = ref<any[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const total = ref(0)
  const currentPage = ref(1)
  const pageSize = ref(20)

  // ---- 搜索状态 ----
  const searchKeyword = ref('')

  // ---- 统计状态 ----
  const statsTotal = ref(0)

  // ---- 详情弹窗 ----
  const showDetail = ref(false)
  const currentDetail = ref<any>({})

  // ---- 计算属性 ----
  const totalPages = computed(() => Math.ceil(total.value / pageSize.value) || 0)

  // ---- 方法：获取笔记列表 ----
  async function fetchList(page?: number) {
    loading.value = true
    error.value = null
    try {
      const res = await getXhsListApi({
        page: page ?? currentPage.value,
        limit: pageSize.value,
        keyword: searchKeyword.value || undefined,
      })
      // ResponseDto 格式: { code: 0, data: { list, total, page, limit, totalPages }, ... }
      const list = res.data?.list ?? []
      notes.value = list.map((item: any) => {
        const firstImg = item.note?.imageList?.[0]
        return {
          ...item,
          // 构建封面图完整 URL
          cover: toFullUrl(firstImg?.urlDefault),
          // 封面图原始尺寸（用于自适应比例）
          coverWidth: firstImg?.width || 300,
          coverHeight: firstImg?.height || 300,
          // 是否包含动图
          hasLivePhoto: item.note?.imageList?.some((img: any) => img.livePhoto) || false,
          // 用户信息
          userId: item.note?.user?.userId || '',
          userName: item.note?.user?.nickname || '未知',
          userAvatar: toFullUrl(item.note?.user?.avatar),
        }
      })
      total.value = res.data?.total ?? 0
      if (page) currentPage.value = page
    } catch (e: any) {
      error.value = e.message || '加载失败'
      notes.value = []
    } finally {
      loading.value = false
    }
  }

  // ---- 方法：获取统计总数 ----
  async function fetchStatistics() {
    try {
      const res = await getXhsStatisticsApi()
      // ResponseDto: { code: 0, data: <count>, ... }
      statsTotal.value = res.data ?? res ?? 0
    } catch {
      // ignore
    }
  }

  // ---- 方法：获取笔记详情 ----
  async function fetchDetail(noteId: string) {
    try {
      const res = await getXhsDetailApi(noteId)
      return res.data
    } catch {
      return null
    }
  }

  // ---- 方法：打开详情弹窗 ----
  async function openDetail(noteId: string) {
    const detail = await fetchDetail(noteId)
    if (detail) {
      // 将 XHS 数据结构映射为 ImageDetailViewer 期望的格式
      currentDetail.value = {
        title: detail.note?.title || '无标题',
        description: detail.note?.desc || '',
        author: detail.note?.user?.nickname || '未知',
        authorAvatar: toFullUrl(detail.note?.user?.avatar),
        create_date: detail.note?.time
          ? new Date(detail.note.time).toLocaleString('zh-CN')
          : '',
        images: detail.note?.imageList?.map((img: any) => ({
          url: toFullUrl(img.urlDefault),
          livePhoto: !!img.livePhoto,
          videoUrl: img.livePhoto && img.stream?.h264?.[0]?.masterUrl
            ? toFullUrl(img.stream.h264[0].masterUrl)
            : '',
        })) || [],
        cover: toFullUrl(detail.note?.imageList?.[0]?.urlDefault),
        tags: detail.note?.tagList?.map((t: any) => t.name) || [],
        likes: detail.note?.interactInfo?.likedCount || 0,
        collects: detail.note?.interactInfo?.collectedCount || 0,
        views: detail.note?.interactInfo?.viewCount || 0,
      }
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

  return {
    notes, loading, error, total, currentPage, pageSize, totalPages,
    searchKeyword,
    statsTotal,
    showDetail, currentDetail,
    fetchList, fetchStatistics,
    fetchDetail, openDetail, changePage, changePageSize,
  }
}

export default useXhsApi
