import { getXhsDashboardApi } from '@/api/xhs'

export interface TopCollectedUser {
  userId: string
  nickname: string
  avatar: string
  noteCount: number
}

export interface TagItem {
  name: string
  count: number
}

export interface RegionItem {
  region: string
  count: number
}

export interface RecentNote {
  _id: string
  note: {
    noteId: string
    title: string
    type: string
    user: { nickname: string }
    imageList: { urlDefault: string }[]
    interactInfo: { likedCount: string }
  }
  currentTime: number
}

export interface DashboardStats {
  totalCount: number
  uniqueUserCount: number
  typeDistribution: { type: string; count: number }[]
  monthlyTrend: { month: string; count: number }[]
  topCollectedUsers: TopCollectedUser[]
  interactionTotals: {
    totalLikes: number
    totalCollects: number
    totalComments: number
    totalShares: number
  }
  topLikedNotes: any[]
  tagCloud: TagItem[]
  regionDistribution: RegionItem[]
  recentNotes: RecentNote[]
}

export function useXhsStats() {
  const statsData = ref<DashboardStats | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchDashboard() {
    loading.value = true
    error.value = null
    try {
      const res = await getXhsDashboardApi()
      statsData.value = res.data ?? res
    } catch (e: any) {
      error.value = e.message || '加载失败'
    } finally {
      loading.value = false
    }
  }

  return {
    statsData,
    loading,
    error,
    fetchDashboard,
  }
}
