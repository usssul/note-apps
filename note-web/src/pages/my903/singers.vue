<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 顶部 -->
    <header class="sticky top-0 z-50 bg-white shadow-sm">
      <div class="container mx-auto px-4 py-4 flex items-center gap-4">
        <router-link to="/home" class="text-gray-400 hover:text-primary transition-colors text-lg no-underline">
          <i class="fa fa-arrow-left"></i>
        </router-link>
        <div class="title-badge">歌手列表</div>
        <div v-if="!loading" class="text-sm text-gray-400 ml-auto">
          共 <strong class="text-primary">{{ singers.length }}</strong> 位歌手
        </div>
      </div>
    </header>

    <main class="container mx-auto px-4 py-8">
      <!-- 搜索框 -->
      <div class="mb-6 max-w-md">
        <el-input
          v-model="searchQuery"
          placeholder="搜索歌手..."
          clearable
          :prefix-icon="Search"
          size="large"
        />
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-20">
        <i class="fa fa-spinner fa-spin text-primary text-4xl"></i>
        <p class="text-gray-400 mt-4">正在加载歌手数据...</p>
      </div>

      <!-- 歌手网格 -->
      <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div
          v-for="singer in filteredSingers"
          :key="singer.name"
          class="bg-white rounded-xl p-4 text-center cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
          @click="goToSingerSongs(singer.name)"
        >
          <div class="w-16 h-16 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
            <span class="text-primary font-bold text-xl">{{ singer.name.charAt(0) }}</span>
          </div>
          <div class="font-semibold text-sm truncate" :title="singer.name">{{ singer.name }}</div>
          <div class="text-xs text-gray-400 mt-1">{{ singer.count }} 首</div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="!loading && singers.length === 0" class="text-center py-20">
        <el-empty description="暂无歌手数据" />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { Search } from '@element-plus/icons-vue'

const singers = ref<{ name: string; count: number }[]>([])
const searchQuery = ref('')
const loading = ref(false)

// 搜索过滤
const filteredSingers = computed(() => {
  if (!searchQuery.value) return singers.value
  const q = searchQuery.value.toLowerCase()
  return singers.value.filter(s => s.name.toLowerCase().includes(q))
})

// 从歌曲列表聚合歌手
async function loadSingers() {
  loading.value = true
  try {
    // 拉取大量条目来聚合歌手
    const res = await getMy903List({ pageNo: 1, pageSize: 500 })
    const songs = res.data.data || []
    const map = new Map<string, number>()

    songs.forEach((item: any) => {
      const names = item.singer_list || []
      names.forEach((name: string) => {
        if (name) {
          map.set(name, (map.get(name) || 0) + 1)
        }
      })
    })

    singers.value = Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
  } catch (e) {
    console.error('加载歌手列表失败:', e)
  } finally {
    loading.value = false
  }
}

// 跳转到歌手歌曲（回首页并带歌手参数过滤）
const router = useRouter()
function goToSingerSongs(singerName: string) {
  router.push({ path: '/home', query: { singer: singerName } })
}

onMounted(loadSingers)
</script>

<style scoped>
.title-badge {
  width: fit-content;
  display: inline-block;
  padding: 0 0 0 8px;
  background-color: #3880ff;
  color: white;
  font-size: 1.25rem;
  font-weight: bold;
  transform: skewX(-20deg);
}
</style>

<route lang="json">{
  "meta": {
    "title": "歌手列表",
    "layout": "navigation"
  }
}</route>
