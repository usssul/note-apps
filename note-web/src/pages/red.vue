<template>
  <div class="min-h-screen bg-gray-50 font-inter text-gray-800">
    <!-- 顶部导航栏 -->
    <header class="sticky top-0 z-50 bg-white shadow-sm">
      <div class="container mx-auto px-4 py-4">
        <div class="flex sm:flex-row sm:items-center justify-between gap-3">
          <img
            src="data:image/png;base64,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"
            alt="小红书" class="h-10" />
          <div class="flex items-center gap-3 flex-wrap">
            <!-- 笔记总数 -->
            <div v-if="statsTotal" class="text-sm text-gray-500">
              共 <strong class="text-red-500">{{ statsTotal }}</strong> 条笔记
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- 主要内容区 -->
    <main class="container mx-auto px-4 py-8">
      <!-- 筛选栏 -->
      <div class="mb-6 flex flex-wrap items-center gap-3">
        <div class="flex flex-wrap gap-2">
          <div v-for="tag in filterTags" :key="tag.value"
            @click="activeTag = tag.value; clearUserFilter(); clearSearch()"
            class="px-4 py-2 rounded-full text-sm cursor-pointer transition-colors select-none"
            :class="activeTag === tag.value && !activeUserId ? 'bg-red-500 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'">
            {{ tag.label }}
          </div>
        </div>

        <!-- 搜索栏 -->
        <div class="flex items-center ml-auto">
          <div
            class="relative flex items-center bg-white rounded-full shadow-sm border border-gray-200 hover:shadow-md focus-within:shadow-md focus-within:border-red-300 transition-all duration-300">
            <i class="fa fa-search ml-4 text-gray-400 text-xs pointer-events-none"></i>
            <input v-model="searchInput" @keyup.enter="doSearch" placeholder="搜索昵称或标题…"
              class="w-40 md:w-56 pl-3 pr-4 py-2 bg-transparent text-sm outline-none text-gray-700 placeholder-gray-400" />
            <button v-if="searchInput" @click="clearSearch"
              class="absolute right-12 top-1 mr-1 text-gray-300 hover:text-gray-500 transition-colors">
              <i class="fa fa-times-circle text-xs"></i>
            </button>
            <button @click="doSearch"
              class="px-3 py-1.5 mr-1 text-red-500 text-xs font-medium hover:text-red-600 transition-colors whitespace-nowrap">
              搜索
            </button>
          </div>
        </div>

        <!-- 用户过滤标签 -->
        <div v-if="activeUserId"
          class="flex items-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-full text-sm">
          <img v-if="filteredNotes[0]?.userAvatar" :src="filteredNotes[0].userAvatar" class="w-4 h-4 rounded-full" />
          <span>{{ activeUserName }}</span>
          <span class="text-blue-400">· {{ filteredNotes.length }} 篇</span>
          <button @click="clearUserFilter()" class="ml-1 text-blue-400 hover:text-blue-600">
            <i class="fa fa-times-circle"></i>
          </button>
        </div>
      </div>

      <!-- Loading 骨架 -->
      <div v-if="loading && notes.length === 0" class="note-waterfall">
        <div v-for="i in 8" :key="i" class="bg-white rounded-xl overflow-hidden animate-pulse">
          <div class="aspect-[3/4] bg-gray-200"></div>
          <div class="p-4 space-y-3">
            <div class="h-5 bg-gray-200 rounded w-3/4"></div>
            <div class="h-4 bg-gray-200 rounded w-full"></div>
            <div class="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error && notes.length === 0" class="text-center py-20">
        <el-empty description="加载失败，请检查网络连接">
          <el-button type="primary" @click="fetchList()">重新加载</el-button>
        </el-empty>
      </div>

      <!-- 空状态 -->
      <div v-else-if="!loading && notes.length === 0" class="text-center py-20">
        <el-empty description="暂未收录小红书笔记">
          <p class="text-gray-400 text-sm mt-2">通过 POST /xhs/create 或 /xhs/batch 收录笔记</p>
        </el-empty>
      </div>

      <!-- 笔记瀑布流 -->
      <div v-else class="note-waterfall">
        <div v-for="note in filteredNotes" :key="note._id"
          class="bg-white rounded-xl overflow-hidden img-card-shadow hover:shadow-lg transition-all duration-300">
          <!-- 封面图：根据原始宽高自适应比例 -->
          <div class="img-hover-zoom cursor-pointer relative"
            :style="{ aspectRatio: `${note.coverWidth} / ${note.coverHeight}` }" @click="openDetail(note._id)">
            <img v-if="note.cover" :src="note.cover" :alt="note.note?.title" class="w-full h-full object-cover"
              loading="lazy" draggable="false" @error="($event.target.style.display = 'none')" />
            <div v-else class="w-full h-full bg-gray-100 flex items-center justify-center aspect-[3/4]">
              <i class="fa fa-image text-gray-300 text-5xl"></i>
            </div>
            <!-- 类型标记 -->
            <span v-if="note.note?.type === 'video'"
              class="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <i class="fa fa-play"></i>视频
            </span>
            <span v-if="note.hasLivePhoto"
              class="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-yellow-400 flex-shrink-0"></span><span
                class="text-xs font-bold live-name">LIVE</span>
            </span>
          </div>

          <!-- 内容区 -->
          <div class="pt-2 pb-4 px-4 flex flex-col justify-between flex-1">
            <div class="flex-1">
              <!-- 标题 -->
              <h3 class="font-semibold text-lg mb-1 desc-limit-2">{{ note.note?.title || '无标题' }}</h3>
              <!-- 描述 -->
              <!-- <div v-if="note.note?.desc" class="text-neutral text-sm mb-3 desc-limit">{{ note.note.desc }}</div> -->
            </div>

            <!-- 标签 -->
            <!-- <div v-if="note.note?.tagList?.length" class="flex flex-wrap gap-1 mb-3">
              <span
                v-for="tag in note.note.tagList.slice(0, 4)"
                :key="tag.id"
                class="text-xs bg-red-50 text-red-500 px-2 py-0.5 rounded-full"
              >#{{ tag.name }}</span>
            </div> -->

            <!-- 底部：用户信息 + 互动统计 + 时间 -->
            <div class="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-100">
              <div class="flex items-center gap-1.5 cursor-pointer hover:text-blue-500 transition-colors"
                :class="{ 'text-blue-500': activeUserId === note.userId }"
                @click.stop="filterByUser(note.userId, note.userName)" :title="`查看 ${note.userName} 的所有笔记`">
                <img v-if="note.userAvatar" :src="note.userAvatar" class="w-5 h-5 rounded-full object-cover"
                  @error="($event.target.style.display = 'none')" />
                <span class="truncate max-w-30">{{ note.userName }}</span>
              </div>
              <div class="flex items-center gap-3">
                <span v-if="note.note?.interactInfo?.likedCount" class="flex items-center gap-0.5">
                  <i class="fa fa-heart text-red-400"></i>{{ formatCount(note.note.interactInfo.likedCount) }}
                </span>
                <!-- <span> -->
                <!-- <i class="fa fa-calendar-o mr-1"></i> -->
                <!-- {{ formatTime(note.note?.time) }} -->
                <!-- </span> -->
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="totalPages > 1" class="mt-8 flex justify-center">
        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[12, 20, 40]"
          :total="total" layout="total, sizes, prev, pager, next, jumper" background @current-change="changePage"
          @size-change="changePageSize" />
      </div>
    </main>

    <!-- 页脚 -->
    <footer class="bg-gray-800 text-white py-10 mt-16">
      <div class="container mx-auto px-4">
        <div class="flex sm:flex-row justify-between items-center">
          <div class="mb-6 md:mb-0">
            <h2 class="text-xl font-bold mb-2 flex items-center">
              <i class="fa fa-book mr-2"></i>小红书笔记
            </h2>
            <div class="text-gray-400 text-sm">记录每一次灵光一闪</div>
          </div>
          <div class="flex space-x-6">
            <a href="#" class="text-gray-400 hover:text-white transition-colors"><i class="fa fa-facebook"></i></a>
            <a href="#" class="text-gray-400 hover:text-white transition-colors"><i class="fa fa-twitter"></i></a>
            <a href="#" class="text-gray-400 hover:text-white transition-colors"><i class="fa fa-instagram"></i></a>
          </div>
        </div>
        <div class="border-t border-gray-700 mt-6 pt-6 text-center text-gray-400 text-sm">
          &copy; 2025 逃生手册 强力支持 <i class="fa fa-flash ml-2"></i>
        </div>
      </div>
    </footer>

    <!-- 详情弹窗 -->
    <ImageDetailViewer v-model:visible="showDetail" :image-data="currentDetail" />
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import { useXhsApi } from '@/hooks/useXhsApi'

const filterTags = [
  { label: '全部', value: '' },
  { label: '图文', value: 'normal' },
  { label: '视频', value: 'video' },
]

const {
  notes, loading, error, total, currentPage, pageSize, totalPages,
  searchKeyword,
  statsTotal,
  showDetail, currentDetail,
  fetchList, fetchStatistics,
  openDetail, changePage, changePageSize,
} = useXhsApi()

const activeTag = ref('')
const activeUserId = ref('')
const activeUserName = ref('')

// 搜索
const searchInput = ref('')
let searchTimer: ReturnType<typeof setTimeout> | null = null

function doSearch() {
  searchKeyword.value = searchInput.value
  activeTag.value = ''
  activeUserId.value = ''
  activeUserName.value = ''
  currentPage.value = 1
  fetchList(1)
}

function onSearchInput() {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(doSearch, 400)
}

function clearSearch() {
  searchInput.value = ''
  searchKeyword.value = ''
  fetchList(1)
}

// 按类型 + 用户过滤
const filteredNotes = computed(() => {
  let result = notes.value
  if (activeTag.value) {
    result = result.filter((n: any) => n.note?.type === activeTag.value)
  }
  if (activeUserId.value) {
    result = result.filter((n: any) => n.userId === activeUserId.value)
  }
  return result
})

function filterByUser(userId: string, userName: string) {
  activeUserId.value = userId
  activeUserName.value = userName
  activeTag.value = ''
  clearSearch()
}

function clearUserFilter() {
  activeUserId.value = ''
  activeUserName.value = ''
}

// 格式化互动数（超过1000显示为k）
function formatCount(num: number): string {
  if (!num) return '0'
  if (num >= 10000) return (num / 10000).toFixed(1) + 'w'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k'
  return String(num)
}

// 格式化时间
function formatTime(ts: number | string): string {
  if (!ts) return ''
  const d = dayjs(typeof ts === 'string' ? parseInt(ts) : ts)
  if (!d.isValid()) return ''
  if (d.isSame(dayjs(), 'day')) return d.format('HH:mm')
  if (d.isSame(dayjs().subtract(1, 'day'), 'day')) return '昨天'
  if (d.isSame(dayjs(), 'year')) return d.format('MM-DD')
  return d.format('YYYY-MM-DD')
}

onMounted(() => {
  fetchList()
  fetchStatistics()
})
</script>

<style scoped>
/* 瀑布流布局 */
.note-waterfall {
  columns: 4;
  column-gap: 1.5rem;
}

.note-waterfall>* {
  break-inside: avoid;
  margin-bottom: 1.5rem;
}

@media (max-width: 1024px) {
  .note-waterfall {
    columns: 3;
  }
}

@media (max-width: 768px) {
  .note-waterfall {
    columns: 2;
  }
}

@media (max-width: 640px) {
  .note-waterfall {
    columns: 1;
  }
}

.img-card-shadow {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.img-hover-zoom img {
  -webkit-user-drag: none;
}

.img-hover-zoom {
  overflow: hidden;
  position: relative;
}

.img-hover-zoom::after {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.2);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.img-hover-zoom:hover::after {
  opacity: 1;
}

.desc-limit {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
  text-overflow: ellipsis;
  height: auto;
}

.desc-limit-2 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
  height: auto;
}

.title-badge {
  width: fit-content;
  display: inline-block;
  padding: 0 8px 0 8px;
  background-color: #ff2442;
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
  transform: skewX(-20deg);
}

.live-name {
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 11px;
  font-weight: 600;
}
</style>

<route lang="json">{
  "meta": {
    "title": "小红书笔记",
    "layout": "default"
  }
}</route>
