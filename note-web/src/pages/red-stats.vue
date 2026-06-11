<template>
  <div class="min-h-screen bg-gray-50 font-inter text-gray-800">
    <!-- 顶部导航 -->
    <header class="sticky top-0 z-50 bg-white shadow-sm">
      <div class="container mx-auto px-4 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <h1 class="text-xl font-bold text-gray-800">
            <i class="fa fa-bar-chart mr-2 text-red-500"></i>小红书数据统计
          </h1>
        </div>
        <router-link to="/red" class="text-sm text-red-500 hover:text-red-600 transition-colors">
          <i class="fa fa-arrow-left mr-1"></i>返回笔记浏览
        </router-link>
      </div>
    </header>

    <main class="container mx-auto px-4 py-8">
      <!-- Loading -->
      <div v-if="loading" class="space-y-6">
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div v-for="i in 5" :key="i" class="bg-white rounded-xl p-5 animate-pulse">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 rounded-full bg-gray-200"></div>
              <div class="h-4 bg-gray-200 rounded w-16"></div>
            </div>
            <div class="h-8 bg-gray-200 rounded w-20"></div>
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-white rounded-xl p-6 animate-pulse h-80"></div>
          <div class="bg-white rounded-xl p-6 animate-pulse h-80"></div>
        </div>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="text-center py-20">
        <el-empty description="加载统计数据失败">
          <el-button type="primary" @click="fetchDashboard()">重新加载</el-button>
        </el-empty>
      </div>

      <!-- Data -->
      <template v-else-if="statsData">
        <!-- ====== 统计卡片行：5 个核心指标 ====== -->
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <div v-for="card in statCards" :key="card.label" class="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center" :style="{ boxShadow: `0 2px 8px ${card.bg}40` }">
                <i :class="['fa', card.icon, `text-${card.color}-500`]" style="font-size:16px"></i>
              </div>
              <span class="text-xs text-gray-400">{{ card.label }}</span>
            </div>
            <div :class="['text-2xl font-bold', `text-${card.color}-500`]">{{ card.value }}</div>
          </div>
        </div>

        <!-- ====== 图表行：饼图 + 月度趋势 ====== -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div class="bg-white rounded-xl p-6 shadow-sm">
            <h3 class="text-base font-semibold mb-4">笔记类型分布</h3>
            <v-chart class="chart-box" :option="typePieOption" autoresize />
          </div>

          <div class="bg-white rounded-xl p-6 shadow-sm">
            <h3 class="text-base font-semibold mb-4">月度笔记趋势</h3>
            <v-chart class="chart-box" :option="monthlyLineOption" autoresize />
          </div>
        </div>

        <!-- ====== 收录最多的博主（全宽） ====== -->
        <div class="bg-white rounded-xl p-6 shadow-sm mb-8">
          <h3 class="text-base font-semibold mb-6">
            <i class="fa fa-star mr-2 text-amber-400"></i>收录最多的博主
          </h3>

          <!-- 领奖台 Top 3 -->
          <div v-if="statsData.topCollectedUsers?.length" class="podium-container mb-8">
            <div
              v-for="(user, idx) in top3"
              :key="user.userId"
              class="podium-item"
              :class="`podium-${idx}`"
              @click="goToBlogger(user.userId, user.nickname)"
            >
              <!-- 头像 -->
              <div class="relative mb-2">
                <img
                  v-if="user.avatar"
                  :src="toThumb(user.avatar)"
                  class="rounded-full object-cover mx-auto border-4 shadow-lg"
                  :class="idx === 0 ? 'w-20 h-20 border-yellow-400' : idx === 1 ? 'w-16 h-16 border-gray-300' : 'w-14 h-14 border-orange-400'"
                  @error="($event.target as HTMLImageElement).style.display='none'"
                />
                <div v-else class="rounded-full bg-gray-200 flex items-center justify-center mx-auto border-4"
                  :class="idx === 0 ? 'w-20 h-20 border-yellow-400' : idx === 1 ? 'w-16 h-16 border-gray-300' : 'w-14 h-14 border-orange-400'"
                >
                  <i class="fa fa-user text-gray-400" :class="idx === 0 ? 'text-3xl' : 'text-xl'"></i>
                </div>
                <!-- 皇冠 -->
                <div class="absolute -top-5 left-1/2 -translate-x-1/2 text-2xl">
                  {{ idx === 0 ? '👑' : '' }}
                </div>
              </div>
              <!-- 名次 -->
              <div class="text-3xl font-bold mb-1" :class="idx === 0 ? 'text-yellow-500' : idx === 1 ? 'text-gray-400' : 'text-orange-500'">
                {{ idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉' }}
              </div>
              <!-- 名字 -->
              <div class="font-semibold text-sm truncate px-1">{{ user.nickname }}</div>
              <!-- 笔记数 -->
              <div class="text-xs mt-1" :class="idx === 0 ? 'text-yellow-600' : idx === 1 ? 'text-gray-500' : 'text-orange-600'">
                {{ user.noteCount }} 篇
              </div>
              <!-- 领奖台底座 -->
              <div class="podium-base" :class="`podium-base-${idx}`">
                <span class="podium-rank">{{ idx + 1 }}</span>
              </div>
            </div>
          </div>

          <!-- 第 4-10 名：自适应排列 -->
          <div class="rest-users">
            <div
              v-for="(user, idx) in restUsers"
              :key="user.userId"
              class="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer rest-user-item"
              @click="goToBlogger(user.userId, user.nickname)"
            >
              <div class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500 shrink-0">
                {{ idx + 4 }}
              </div>
              <img
                v-if="user.avatar"
                :src="toThumb(user.avatar)"
                class="w-8 h-8 rounded-full object-cover shrink-0"
                @error="($event.target as HTMLImageElement).style.display='none'"
              />
              <div v-else class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                <i class="fa fa-user text-gray-400 text-xs"></i>
              </div>
              <div class="flex-1 min-w-0">
                <div class="font-medium text-sm truncate">{{ user.nickname }}</div>
                <div class="text-xs text-gray-400">{{ user.noteCount }} 篇笔记</div>
              </div>
            </div>
          </div>

          <div v-if="!statsData.topCollectedUsers?.length" class="text-center text-gray-400 py-8">
            暂无数据
          </div>
        </div>

        <!-- ====== 地区分布 · 横向柱状图 ====== -->
        <div class="bg-white rounded-xl p-6 shadow-sm mb-8">
          <h3 class="text-base font-semibold mb-4">
            <i class="fa fa-map-marker mr-2 text-red-400"></i>地区分布
          </h3>
          <div v-if="statsData.regionDistribution?.length">
            <div class="region-list">
              <div
                v-for="r in statsData.regionDistribution"
                :key="r.region"
                class="region-row"
              >
                <span class="region-label">{{ r.region }}</span>
                <div class="region-bar-wrap">
                  <div
                    class="region-bar"
                    :style="{ width: barPercent(r.count) + '%' }"
                  ></div>
                </div>
                <span class="region-count">{{ r.count }}</span>
              </div>
            </div>
          </div>
          <div v-else class="text-center text-gray-400 py-8">暂无地区数据</div>
        </div>

        <!-- ====== 热门标签云 ====== -->
        <div class="bg-white rounded-xl p-6 shadow-sm mb-8">
          <h3 class="text-base font-semibold mb-4">
            <i class="fa fa-cloud mr-2 text-sky-400"></i>热门标签
          </h3>
          <div v-if="statsData.tagCloud?.length" class="tag-cloud">
            <span
              v-for="tag in statsData.tagCloud"
              :key="tag.name"
              class="tag-item"
              :style="{ fontSize: tagFontSize(tag.count) + 'px', color: tagHashColor(tag.name) }"
            >{{ tag.name }}<span class="tag-count">{{ tag.count }}</span></span>
          </div>
          <div v-else class="text-center text-gray-400 py-8">暂无标签数据</div>
        </div>

        <!-- ====== 最近 7 天收录 ====== -->
        <div class="bg-white rounded-xl p-6 shadow-sm mb-8">
          <h3 class="text-base font-semibold mb-4">
            <i class="fa fa-clock-o mr-2 text-blue-400"></i>最近 7 天收录
            <span class="text-sm font-normal text-gray-400 ml-2">共 {{ statsData.recentNotes?.length || 0 }} 篇</span>
          </h3>
          <el-table v-if="statsData.recentNotes?.length" :data="statsData.recentNotes" stripe style="width: 100%">
            <el-table-column label="封面" width="70">
              <template #default="{ row }">
                <img
                  v-if="row.note?.imageList?.[0]?.urlDefault"
                  :src="toThumb(row.note.imageList[0].urlDefault)"
                  class="w-12 h-12 object-cover rounded cursor-pointer"
                  loading="lazy"
                  @click="goToNote(row.note?.noteId)"
                />
              </template>
            </el-table-column>
            <el-table-column label="标题" min-width="200">
              <template #default="{ row }">
                <span class="line-clamp-1 cursor-pointer hover:text-red-500 transition-colors" @click="goToNote(row.note?.noteId)">{{ row.note?.title || '无标题' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="作者" width="130">
              <template #default="{ row }">
                <div class="flex items-center gap-2 cursor-pointer hover:text-blue-500 transition-colors" @click="goToBlogger(row.note?.user?.userId, row.note?.user?.nickname)">
                  <img
                    v-if="row.note?.user?.avatar"
                    :src="toThumb(row.note.user.avatar)"
                    class="w-5 h-5 rounded-full object-cover shrink-0"
                    @error="($event.target as HTMLImageElement).style.display='none'"
                  />
                  <div v-else class="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                    <i class="fa fa-user text-gray-400 text-xs"></i>
                  </div>
                  <span class="truncate">{{ row.note?.user?.nickname || '未知' }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="类型" width="70">
              <template #default="{ row }">
                <span class="px-2 py-0.5 rounded text-xs"
                  :class="row.note?.type === 'video' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'">
                  {{ row.note?.type === 'video' ? '视频' : '图文' }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="收录时间" width="140">
              <template #default="{ row }">
                {{ formatDate(row.currentTime) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="70" fixed="right">
              <template #default="{ row }">
                <el-button type="danger" size="small" text @click="handleDelete(row._id)">
                  <i class="fa fa-trash"></i>
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <div v-else class="text-center text-gray-400 py-8">最近 7 天暂无新收录</div>
        </div>

        <!-- ====== Top 10 点赞笔记 ====== -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h3 class="text-base font-semibold mb-4">
            <i class="fa fa-fire mr-2 text-orange-400"></i>Top 10 点赞笔记
          </h3>
          <el-table :data="statsData.topLikedNotes" stripe style="width: 100%">
            <el-table-column label="封面" width="80">
              <template #default="{ row }">
                <img
                  v-if="row.note?.imageList?.[0]?.urlDefault"
                  :src="toThumb(row.note.imageList[0].urlDefault)"
                  class="w-14 h-14 object-cover rounded cursor-pointer"
                  loading="lazy"
                  @click="goToNote(row.note?.noteId)"
                />
                <div v-else class="w-14 h-14 bg-gray-100 rounded flex items-center justify-center">
                  <i class="fa fa-image text-gray-300"></i>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="标题" min-width="220">
              <template #default="{ row }">
                <span class="line-clamp-2 cursor-pointer hover:text-red-500 transition-colors" @click="goToNote(row.note?.noteId)">{{ row.note?.title || '无标题' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="作者" width="140">
              <template #default="{ row }">
                <div class="flex items-center gap-2 cursor-pointer hover:text-blue-500 transition-colors" @click="goToBlogger(row.note?.user?.userId, row.note?.user?.nickname)">
                  <img
                    v-if="row.note?.user?.avatar"
                    :src="toThumb(row.note.user.avatar)"
                    class="w-5 h-5 rounded-full object-cover shrink-0"
                    @error="($event.target as HTMLImageElement).style.display='none'"
                  />
                  <div v-else class="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                    <i class="fa fa-user text-gray-400 text-xs"></i>
                  </div>
                  <span class="truncate">{{ row.note?.user?.nickname || '未知' }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="类型" width="70">
              <template #default="{ row }">
                <span class="px-2 py-0.5 rounded text-xs"
                  :class="row.note?.type === 'video' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'">
                  {{ row.note?.type === 'video' ? '视频' : '图文' }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="点赞" width="90">
              <template #default="{ row }">
                <span class="text-red-500 font-medium">
                  <i class="fa fa-heart mr-1"></i>{{ row.note?.interactInfo?.likedCount || '0' }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="收藏" width="90">
              <template #default="{ row }">
                <span class="text-amber-500 font-medium">
                  <i class="fa fa-star mr-1"></i>{{ row.note?.interactInfo?.collectedCount || '0' }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="发布时间" width="130">
              <template #default="{ row }">
                <span class="text-gray-500 text-sm">{{ formatTime(row.note?.time) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="70" fixed="right">
              <template #default="{ row }">
                <el-button type="danger" size="small" text @click="handleDelete(row._id)">
                  <i class="fa fa-trash"></i>
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </template>
    </main>

    <!-- 笔记详情独立弹窗 -->
    <ImageDetailViewer
      v-model:visible="showDetail"
      :image-data="currentDetail"
      :note-id="currentDetail._id || ''"
      :is-favorited="currentDetail.isFavorited || false"
      @toggle-favorite="toggleFavorite"
      @delete="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts/core'
import { PieChart, BarChart, LineChart } from 'echarts/charts'
import { CanvasRenderer } from 'echarts/renderers'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from 'echarts/components'
import VChart from 'vue-echarts'
import type { EChartsOption } from 'echarts'
import { useXhsStats } from '@/hooks/useXhsStats'
import { useXhsApi } from '@/hooks/useXhsApi'
import ImageDetailViewer from '@/components/ImageDetailViewer.vue'
import dayjs from 'dayjs'

echarts.use([
  CanvasRenderer,
  PieChart,
  BarChart,
  LineChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
])

const MINIO_BASE = 'http://localhost:9000'

function toThumb(path: string | undefined): string {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  return `${MINIO_BASE}${path.startsWith('/') ? '' : '/'}${path}`
}

const router = useRouter()
const { statsData, loading, error, fetchDashboard } = useXhsStats()
const { showDetail, currentDetail, openDetail, toggleFavorite, deleteNote } = useXhsApi()

// ---- 导航 ----
function goToNote(noteId: string) {
  if (!noteId) return
  openDetail(noteId)
}

async function handleDelete(noteId: string) {
  try {
    await ElMessageBox.confirm('确定要删除这篇笔记吗？此操作不可撤销。', '确认删除', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger',
      zIndex: 10000,
    })
  } catch {
    return
  }
  const ok = await deleteNote(noteId)
  if (ok) {
    ElMessage.success('笔记已删除')
    // 刷新仪表盘数据
    fetchDashboard()
  }
}

function goToBlogger(userId: string, nickname?: string) {
  if (!userId) return
  const resolved = router.resolve({ path: '/red', query: { userId, ...(nickname ? { nickname } : {}) } })
  window.open(resolved.href, '_blank')
}

// ---- 排行拆分 ----
const top3 = computed(() => (statsData.value?.topCollectedUsers || []).slice(0, 3))
const restUsers = computed(() => (statsData.value?.topCollectedUsers || []).slice(3))

// ---- 计算属性 ----
const normalCount = computed(() =>
  statsData.value?.typeDistribution?.find((t: any) => t.type === 'normal')?.count || 0)
const videoCount = computed(() =>
  statsData.value?.typeDistribution?.find((t: any) => t.type === 'video')?.count || 0)

// ---- 卡片数据 ----
const statCards = computed(() => [
  { label: '总笔记数', value: statsData.value?.totalCount ?? 0, color: 'red', icon: 'fa-file-text', bg: '#ef4444' },
  { label: '图文笔记', value: normalCount.value, color: 'blue', icon: 'fa-image', bg: '#3b82f6' },
  { label: '视频笔记', value: videoCount.value, color: 'purple', icon: 'fa-play', bg: '#a855f7' },
  { label: '博主数', value: statsData.value?.uniqueUserCount ?? 0, color: 'green', icon: 'fa-users', bg: '#22c55e' },
  { label: '标签种类', value: statsData.value?.tagCloud?.length ?? 0, color: 'indigo', icon: 'fa-tags', bg: '#6366f1' },
])

// ---- 饼图 ----
const typePieOption = computed<EChartsOption>(() => ({
  tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
  legend: { bottom: 0 },
  series: [{
    type: 'pie',
    radius: ['45%', '70%'],
    center: ['50%', '45%'],
    data: [
      { value: normalCount.value, name: '图文', itemStyle: { color: '#3b82f6' } },
      { value: videoCount.value, name: '视频', itemStyle: { color: '#a855f7' } },
    ],
    emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.5)' } },
  }],
}))

// ---- 月度折线图 ----
const monthlyLineOption = computed<EChartsOption>(() => ({
  tooltip: { trigger: 'axis' },
  grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
  xAxis: {
    type: 'category',
    data: (statsData.value?.monthlyTrend || []).map((m: any) => m.month),
    axisLabel: { rotate: 45, fontSize: 10 },
  },
  yAxis: { type: 'value', minInterval: 1 },
  series: [{
    type: 'line',
    data: (statsData.value?.monthlyTrend || []).map((m: any) => m.count),
    smooth: true,
    lineStyle: { color: '#ef4444', width: 3 },
    itemStyle: { color: '#ef4444' },
    areaStyle: {
      color: {
        type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
        colorStops: [
          { offset: 0, color: 'rgba(239,68,68,0.3)' },
          { offset: 1, color: 'rgba(239,68,68,0.02)' },
        ],
      },
    },
  }],
}))

// ---- 地区分布：条形图占比 ----
function barPercent(count: number): number {
  const max = statsData.value?.regionDistribution?.[0]?.count || 1
  return Math.round((count / max) * 100)
}

// ---- 标签云 ----
function tagHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  return Math.abs(hash)
}

function tagFontSize(count: number): number {
  const tags = statsData.value?.tagCloud || []
  const min = tags[tags.length - 1]?.count || 1
  const max = tags[0]?.count || 1
  if (max === min) return 16
  return 12 + ((count - min) / (max - min)) * 22 // 12px ~ 34px
}

function tagHashColor(name: string): string {
  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f43f5e', '#6366f1', '#84cc16']
  return colors[tagHash(name) % colors.length]
}

// ---- 数字格式化 ----
function fmtNum(n: number): string {
  if (!n) return '0'
  if (n >= 10000) return (n / 10000).toFixed(1) + 'w'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return String(n)
}

function formatTime(ts: number | string): string {
  if (!ts) return '-'
  const d = dayjs(ts)
  return d.isValid() ? d.format('YYYY-MM-DD') : String(ts)
}

// ---- 工具函数 ----
function formatDate(ts: number): string {
  if (!ts) return ''
  return dayjs(ts).format('MM-DD HH:mm')
}

onMounted(() => {
  fetchDashboard()
})
</script>

<style scoped>
.chart-box {
  width: 100%;
  height: 320px;
}

/* ====== 地区分布条形图 ====== */
.region-list {
  max-height: 420px;
  overflow-y: auto;
}

.region-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.region-label {
  width: 72px;
  text-align: right;
  font-size: 13px;
  color: #555;
  flex-shrink: 0;
}

.region-bar-wrap {
  flex: 1;
  height: 22px;
  background: #f3f4f6;
  border-radius: 4px;
  overflow: hidden;
}

.region-bar {
  height: 100%;
  background: linear-gradient(90deg, #fca5a5, #ef4444);
  border-radius: 4px;
  min-width: 4px;
  transition: width 0.6s ease;
}

.region-count {
  width: 40px;
  font-size: 13px;
  font-weight: 600;
  color: #ef4444;
  flex-shrink: 0;
}

/* ====== 标签云 ====== */
.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 14px;
  justify-content: center;
  align-items: center;
  min-height: 120px;
  padding: 10px 0;
}

.tag-item {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 4px;
  cursor: default;
  transition: transform 0.2s, opacity 0.2s;
  font-weight: 500;
  line-height: 1.4;
  opacity: 0.85;
}

.tag-item:hover {
  transform: scale(1.15);
  opacity: 1;
}

.tag-count {
  display: inline-block;
  margin-left: 3px;
  font-size: 0.65em;
  opacity: 0.55;
  font-weight: 400;
}

.line-clamp-1 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  overflow: hidden;
  text-overflow: ellipsis;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ====== 4-10 名自适应排列 ====== */
.rest-users {
  display: flex;
  flex-wrap: wrap;
  gap: 1em;
  margin-top: 2rem;
}

.rest-user-item {
  flex: 0 0 auto;
}

/* ====== 领奖台样式 ====== */
.podium-container {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 20px;
  max-width: 520px;
  margin: 0 auto;
  padding-top: 20px;
}

.podium-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: transform 0.2s;
}

.podium-item:hover {
  transform: translateY(-4px);
}

/* 第一名 - 中间最高 */
.podium-0 {
  order: 2;
}

/* 第二名 - 左边 */
.podium-1 {
  order: 1;
}

/* 第三名 - 右边 */
.podium-2 {
  order: 3;
}

/* 底座 */
.podium-base {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px 8px 0 0;
  font-weight: 700;
  color: #fff;
  margin-top: 10px;
}

.podium-base-0 {
  width: 140px;
  height: 120px;
  background: linear-gradient(180deg, #fbbf24 0%, #f59e0b 100%);
  font-size: 2rem;
}

.podium-base-1 {
  width: 120px;
  height: 70px;
  background: linear-gradient(180deg, #cbd5e1 0%, #94a3b8 100%);
  font-size: 1.5rem;
}

.podium-base-2 {
  width: 110px;
  height: 40px;
  background: linear-gradient(180deg, #fdba74 0%, #d97706 100%);
  font-size: 1.3rem;
}
</style>

<route lang="json">{
  "meta": {
    "title": "小红书统计",
    "layout": "default"
  }
}</route>
