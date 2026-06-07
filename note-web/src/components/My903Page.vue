<template>
  <div class="min-h-screen bg-gray-50 font-inter text-gray-800">
    <!-- 顶部导航栏 -->
    <header class="sticky top-0 z-50 bg-white shadow-sm">
      <div class="container mx-auto px-4 py-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="title-badge">
            唱開去，毛管戙萬歲！
          </div>
          <div class="flex items-center gap-3 flex-wrap">
            <!-- 逐栏目同步状态 -->
            <div v-if="syncInfoList.length" class="flex items-center gap-2 flex-wrap">
              <div
                v-for="info in syncInfoList"
                :key="info.column_id"
                class="flex items-center gap-1 text-xs bg-gray-100 rounded-full px-3 py-1"
              >
                <span class="font-semibold text-gray-700">{{ info.column_name }}</span>
                <span class="text-gray-300">|</span>
                <i class="fa fa-clock-o text-gray-400 text-xs"></i>
                <span class="time-badge text-xs">{{ info.last_fetch_time }}</span>
                <span class="text-gray-300">|</span>
                <span class="text-gray-500">{{ info.fetch_count ?? '-' }}条</span>
              </div>
            </div>
            <!-- 歌曲总数 -->
            <div v-if="statsTotal" class="text-sm text-gray-500">
              共 <strong class="text-primary">{{ statsTotal }}</strong> 首歌曲
            </div>
            <!-- 刷新按钮 -->
            <button
              :disabled="isTriggering"
              @click="triggerFetch"
              class="px-3 py-1.5 bg-primary cursor-pointer text-white rounded-lg hover:bg-primary/90 active:bg-primary/80 active:scale-95 transition-all duration-300 flex items-center gap-2 text-sm"
              :class="isTriggering ? 'opacity-50 cursor-not-allowed' : ''"
            >
              <i :class="isTriggering ? 'fa fa-spinner fa-spin' : 'fa fa-refresh'"></i>
              {{ isTriggering ? '抓取中...' : '刷新数据' }}
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- 主要内容区 -->
    <main class="container mx-auto px-4 py-8">
      <!-- 筛选栏 -->
      <div class="mb-6 flex flex-wrap items-center gap-3">
        <div class="flex flex-wrap gap-2">
          <div
            v-for="tag in filterTags"
            :key="tag.value"
            @click="setTag(tag.value)"
            class="px-4 py-2 rounded-full text-sm cursor-pointer transition-colors select-none"
            :class="activeTag === tag.value ? 'bg-primary text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'"
          >
            {{ tag.label }}
          </div>
        </div>
        <router-link
          to="/my903/singers"
          class="ml-auto px-4 py-2 rounded-full text-sm bg-white border border-primary text-primary hover:bg-primary/5 transition-colors flex items-center gap-1 no-underline"
        >
          <i class="fa fa-users"></i>歌手列表
        </router-link>
      </div>

      <!-- Loading 骨架 -->
      <div v-if="loading && songs.length === 0" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <div v-for="i in 8" :key="i" class="bg-white rounded-xl overflow-hidden animate-pulse">
          <div class="h-64 bg-gray-200"></div>
          <div class="p-4 space-y-3">
            <div class="h-5 bg-gray-200 rounded w-3/4"></div>
            <div class="h-4 bg-gray-200 rounded w-full"></div>
            <div class="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error && songs.length === 0" class="text-center py-20">
        <el-empty description="加载失败，请检查网络连接">
          <el-button type="primary" @click="fetchList()">重新加载</el-button>
        </el-empty>
      </div>

      <!-- 空状态 -->
      <div v-else-if="!loading && songs.length === 0" class="text-center py-20">
        <el-empty description="暂无歌曲数据" />
      </div>

      <!-- 歌曲网格 -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <div
          v-for="song in songs"
          :key="song.article_id"
          class="bg-white rounded-xl overflow-hidden img-card-shadow hover:shadow-lg transition-all duration-300 flex flex-col"
        >
          <div class="img-hover-zoom h-64 cursor-pointer" @click="openDetail(song.article_id)">
            <img
              :src="song.cover"
              :alt="song.title"
              class="w-full h-full object-cover"
              loading="lazy"
              @error="($event.target as HTMLImageElement).style.display='none'"
            />
          </div>
          <div class="p-4 flex flex-col justify-between flex-1">
            <div class="flex-1">
              <h3 class="font-semibold text-lg mb-1 desc-limit-2">{{ song.title }}</h3>
              <div v-if="song.desc" class="text-neutral text-sm mb-3 desc-limit" v-html="song.desc"></div>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-xs text-gray-500">
                <i class="fa fa-calendar-o mr-1"></i>{{ song.create_date }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="totalPages > 1" class="mt-8 flex justify-center">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[12, 24, 48]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @current-change="changePage"
          @size-change="changePageSize"
        />
      </div>
    </main>

    <!-- 页脚 -->
    <footer class="bg-gray-800 text-white py-10 mt-16">
      <div class="container mx-auto px-4">
        <div class="flex sm:flex-row justify-between items-center">
          <div class="mb-6 md:mb-0">
            <h2 class="text-xl font-bold mb-2 flex items-center">
              <i class="fa fa-images mr-2"></i>叱咤派台
            </h2>
            <div class="text-gray-400 text-sm">支持广东歌等于支持你自己</div>
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

const filterTags = [
  { label: '全部', value: '' },
  { label: '派台歌', value: '派台歌' },
  { label: '新歌', value: '新歌' },
  { label: '热播', value: '热播' },
]

const {
  songs, loading, error, total, currentPage, pageSize, totalPages,
  activeTag, syncInfoList, statsTotal, isTriggering,
  showDetail, currentDetail,
  fetchList, fetchSyncInfo, fetchStatistics, triggerFetch,
  openDetail, changePage, changePageSize, setTag,
} = useMy903Api()

onMounted(() => {
  fetchList()
  fetchSyncInfo()
  fetchStatistics()
})
</script>

<style scoped>
.img-card-shadow {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.img-hover-zoom {
  overflow: hidden;
}

.img-hover-zoom img {
  transition: transform 0.5s ease;
}

.img-hover-zoom:hover img {
  transform: scale(1.05);
}

.desc-limit {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 5;
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

.time-badge {
  display: inline-block;
  padding: 1px 8px;
  background-color: #3880ff;
  color: white;
  transform: skewX(-10deg);
  margin-left: 2px;
}

.title-badge {
  width: fit-content;
  display: inline-block;
  padding: 0 0 0 8px;
  background-color: #3880ff;
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
  transform: skewX(-20deg);
}
</style>
