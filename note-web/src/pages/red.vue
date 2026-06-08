<template>
  <div class="min-h-screen bg-gray-50 font-inter text-gray-800 flex flex-col">
    <!-- 顶部导航栏 -->
    <header class="sticky top-0 z-50 bg-white shadow-sm">
      <div class="container mx-auto px-4 py-4">
        <div class="flex sm:flex-row sm:items-center justify-between gap-3">
          <img
            src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAM0AAABgCAYAAAC+PvZZAAAACXBIWXMAACE4AAAhOAFFljFgAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAA0KSURBVHgB7Z1LbFTXGce/cz1UlRKc6SqRghRLmAq6Cd0EKa2UwZC2uwRYFhV7SwWEVApSUxW7UqTSRXlYTdVsakdtd7y6ahMeU6lZkE1gA6iA4kog0Z1rg1SBZ07P/94Zezy+j+8+z70z3w+ZGY+vZ65n7v98z3OOohKjtzfGqOU0SFOdFL1OWplbvdP7IY2RUF0ULZjPc9Hc63zpW+b7m+Q4C+re5zepxCgqEXp8b4OobUSh3jHfQRx1EoYU1TRfEM9ldf9Kk0qEddF4QiEjkvYkiUgEfxZdESl9Wd27NkeWsSIaPfZunWpLx8zd90iEIsRjkZS6RCObZtTdvy2QBQoVjWdV9Enz1SBBSI1rfeaLtj6FiEbEIuQKkgpEM0WJJ1fRuG7YpuXTpPUkCULuGMtT2zSVt9uWm2j0tj3HjFimSWIWoXimaWX0rFq4tEg5kLlo9PYfjdHK8z+KKyZYxXXZRvblUfNxKENc67Ly7CsRjGAdFL916ys9PnGSMiYzS2NO7jR5KWRBKBnZxjqpRdNxxy52KviCUE7gro18Y3cWwkklGlcwrWfXpQ9MqAimMDqyO22ckzimEcEIFaTuxjnf3nOIUpDI0ohghMrjqEn1r6vzlIDYohHBCAODVvvUg6uXKCaxRCOCEQaMRDEOO6ZxW2JEMMJgUSdqXXSNQQz4iYDa0kkRjDBw4Jo2JRPXKDBhiaZTVZXCpTCgmBpj7Qm7cyAypvGKl8++JkEYfI6r+9fORB0UbWkQxwjCcHCSE9+EisZ1yySOEYaHutehH06ge1Ypt2z0RaIdW6OPu3GLCuXDnxLt/V74MXfuEx3+JZWWyQNEhw6EH/PoMdHB92lgiKjf1AJ/ceXZaaoKEMyffht93LY9VBhbXjEX3P7o42YTFaWLY/ML5m95OfwYpWmgcPRpk01rBk1i83XP9LaJSXPzLgnJ2ffD6GMemhH6wt9JKBkISWpLgdniIEuT+cSdoePAD6KPmf00/OdvG9du84uUKXceeC5hP/uNyF/1sSi7GDM+cI77AwYJuG54zaUnxGa083ywco/+Q/TlLW+AKZZjxtqc8bM2G0TjWhkJ/tPhXoCvRB8XFWP9/LDn5mXJuflg0ex6nRKBi/zUB+HHfP4F0ZUvoi0rYqgPD69/DII7ZwaY+fNUIPWOtZnu/8FG90yrVG3TguHoT6KPwcXzqPDR0x6wmhBW88/BA4GfYABE+YvDyUWdnGN+nQLrRNNZn6xBQnK4VubcpzSU4L25/Af/bGdU4uRI4eM5rM1k/4PrLY3SYmXSsp+RABg2K9MPLAeynb0WB1YkarDBMaMZx3iRYDH+9ayKRo816rKoX0rwoXJcCMmYeRf/rz+g8qMbnUX6V1mzNJuc6qaYCx99AuBYmRs3iy+ylhXuINMFGbQ4Wbis0HqdNtZEU+UEwOYSiAauBss1+4yEHqK6DXqZtRQH9oUtrmhc10wSAOk4wsiYSTFzI1xLg84Je+9dvddF8+o0IyMNlEGtEtWqAZae5mOe074218oAZI2Wn/BeJyhZwKnd4Dn8znf5qf/xbu3G5xpAcB71ekGvxTlPuNY4Dud1w2fWMd4DWGfrLm27Yf5r4l6nuFkCK3P5k+jY5MSpfNwbTmMlRrkTv/H/GcfKAFwcf/0k/JjGj9cuwIM/8z/m3lWKBIXEoPP146OP/R/H33b0ULLXghXh9ASC2/eD/95SoN7q3vNiGrX2gDU4wfzSU8oFjvUKipsghCjBccFIO0ipaK51KENMGonJonUKnU4nnrG7pCw3+7WcU+aE09c0+oL/429kWDuYu0BDSdB7WzZqT1ydOFSr2V+DmTvS5GVpOGIM8s+PMl2zKCBcuDlCiWl3RNO5YxVOIA7ycl2SivE747yWGQ6zQ9pWUyUUuak+p1IdzXkVtjiWxk8c2xmzRTlIKroaaP0t3DgmCfAa2eZVZgo1LzBng0N/7HL3AWVC1a3Mq0xPoeoo5VoapJzt74nJCQSXcxTNf5nPDdH0ihdpUhTd0nTf4vls1SDw90S995xaC2LSLSmEA9Hh9x8yBy9bdLyyGik9ZruuyUoEPCxBKtbvPNHif/6zzizLvgsQ80OiMmsI/m2lmT/+VTZzVBDbXf8LJebUibX7eC9uP/Dc1RImRpB2rhnBlMDSWM7Tcy9ajIh+sx7x+3N9swpxMR5lWKBhnVcTBFx1fGEQwvuK96dM8d43F+soblZDNI9yNt1pajV+yLya9EA8mO15pFy9xJnu7pwY24kALtx6ErcXbViLmXFBLSxON3SetKheDtFwyFs0HEvGdSM5vWhomfFz9QR/IJwyzJvStZKIhpOyzNuN4Tw/50ODlWHN3pR5NbHAe3+Isfhi3tRWFiCaRbKNzWbNOHDO8w3GXHcpZiZjl/3mFWCKmxURzXLO7hknEcCJaTi9aHOFrt81OBS/hNNG/ldfNClntWh1Atqo5WbNOES5kdzlm6YOeLWNfiCmOxl1GQwqcH8t1uyw4qYpbrZvGeHYs3vcFSRzj2kYiYCXIgQ+yfS5Iaz9fX/3w8fF12ywW0FUGn3v9/0X8OsFSZqkOx90YxWu64WBy5ZoFC3gpkZtY2lib4yeIZuZtY+8s2fLKSaiAbgOO8YpMVivuOiaTdA05f5jolhO2QqEJWuxgmZZ0spBaLWAG8f8i7UddOZw3LPbBaRmbzPcIrdXK+B8uWsEBDHsnQFVyCZqckcGkz0bsSsazlThRwU08nFH+aDNo3akmCYgnQH8plmbKL2AG4eeP18gm3AyIkUVATmvE2RR0sxzl/6ziuC4BsZRC02TPVP2rA0ncfdlQa3zafzy+YQtMYO2mMYAo+5faeLW6wjQ+h9kC86eI0XNN+GIM8gqIF2MZYziWkWZ5lwRVLN7r7b2gD5GNkAAiC7WoAD7RoFGEOJEtijsXMKsAmITqfQPKGuGxbM0rVaTbLXT4CINq5AXmVXBuYQVF6VfbIhxmqv38J/1uAbxQFA9oOipwEGWIqxfrCy7Fgj5YIqa3XgG9Oy5qS+b/xpkAwgGF+RkX3HLRioWU2z9XLSg2APZNEyUgrgRz8QpwsKq9U/pRYF075uUGjxP1BQFv9e3xUulHniavd+siWalPUc1B7s625nJiQlZ/aLhNjZm2cjXdRd7pyqHWZlu60zcvVbAwfc3Pvb7mWzWUkPdKKp2hE1rixANZwGPIxktupgH2pnv/XZVNHDR9NaJeWOK7CQEYFEwWncvPFyk/fEFRvX+qa/4MLJ2j+YvrF8U42KAYNK0zjx8vNH15DZ8VpE0C2/YBK7ZvTXXDPTtuelcIpvM9gjaL7WLUXHLy+u/uIKJ04rTn5w4H5AASDN33c/dS9uKU1ayXKaq+C7wmf4H1onGC3bW8tGFgzcWXxCPXyzTjX2SEHdhP1ibrlvmdy7cGZp++Ll7Sdy7KjE7T6lByr/ItSJcK3Ntrv/hms+RM1b3q0GBMKoWkmREjruIBT6csP1S0vjgw2RlunQHxDQDQ9Epf02+St+wRoB1axOVLeu++XFw46ME/Ws4lyArk/Qi97MyaZ6vSlz5JyUG7nKRhWPMnamZ5JgPAQtrqBkqM3FMfR6Tu9JYGb+kQpkzR1kCS5HEvYJYgnZqywtjZdTd5oLfj3xFY93aRAFLw5m9Bx8YLlaWtZ60VqE/qTAsVgZEdX/4Hf/R7+Jtg5gFbjHz2nTQj2uBv1hrTdGK8zWVFcQFfiM0ZhHCFctrc1OIFR/i22/Gnw7gNzsT84luWGrG4MxTcmdlRpxfnEEJCZawuAavh4XQkSlFpszOIpGhnlboRGc9PjFtbk6SIAwLiuZMxmwq7JDwxQJX2me6iwkIwsCDa32kHRnPh4rGa+Rs7yNBGA5mgoL/XiKXpVX3mnBoj5MgDDJanfUrZPrBWsvZZBKMm6YyKOkKQgmBW9ZqTXMP5y+A/rz1ntU5N4KQB14cs9sLRXiwReM+aa21TxIDwgDhxuycOKaXWFttuE9uVCnCEQYCraY6MXssYu9PI8IRBgJFU+rB1URTYRKv4qy3N8ao5VzvbhMtCJUBgmFmyvx/PQUiHKFiLJIyQX8Cl6yXVNsHrrpqklUTyo7X6v/dtILxnioj9NaJM9bWFxCEUFQTDchxs2SBz0YZoscnTC2H7K1oIwgbmQlr809C5ts5SZwjlAK4Y9qZ6l3kL7unzgnX6sBdE/EIRaPVWbTFxKnyxyHXjQM9q6OmzR+RYq0jQeBiYhfVOp5FsB/6KlQAIh4hXzA1X83k4Yr5vhoViIhHyJZixbL6qmSBVfGQektiHiEmi+56ZMq5VLRYutjcDN1Fj+9tGD90UgQkhICAvmk8lHnspZRXgM/Fumh6cQVE7Z3mtN4x35lbqfcMKd5+SVrfctcXX1m5aVsovZRKNP3obY2d1B4ZI2UEpOg1M9KMEYSkdF2sUsXpdslrteBuNa7p395j7Zt5Z7/S8n8dgsfPv/PfFwAAAABJRU5ErkJggg=="
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
    <main ref="mainRef" class="container mx-auto px-4 py-8 flex-1">
      <!-- 筛选栏 -->
      <div class="mb-6 flex flex-wrap items-center gap-3">
        <div class="flex flex-wrap gap-2">
          <div v-for="tag in filterTags" :key="tag.value"
            @click="setTypeFilter(tag.value)"
            class="px-4 py-2 rounded-full text-sm cursor-pointer transition-colors select-none"
            :class="filterType === tag.value && !activeUserId ? 'bg-red-500 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'">
            {{ tag.label }}
            <span
              v-if="typeCounts.length"
              class="ml-1 text-xs opacity-70"
            >{{ getTypeCount(tag.value) }}</span>
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
          <img v-if="notes[0]?.userAvatar" :src="notes[0].userAvatar" class="w-4 h-4 rounded-full" />
          <span>{{ activeUserName }}</span>
          <span class="text-blue-400">· {{ total }} 篇</span>
          <button @click="clearUserFilter()" class="ml-1 text-blue-400 hover:text-blue-600">
            <i class="fa fa-times-circle"></i>
          </button>
        </div>
      </div>

      <!-- Loading 骨架 -->
      <div v-if="loading && notes.length === 0" class="note-waterfall">
        <div v-for="col in skeletonColumns" :key="col" class="waterfall-col">
          <div v-for="i in skeletonItemsPerCol" :key="i" class="waterfall-card bg-white rounded-xl overflow-hidden animate-pulse">
            <div class="aspect-[3/4] bg-gray-200"></div>
            <div class="p-4 space-y-3">
              <div class="h-5 bg-gray-200 rounded w-3/4"></div>
              <div class="h-4 bg-gray-200 rounded w-full"></div>
              <div class="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
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
        <div v-for="(column, colIdx) in masonryColumns" :key="colIdx" class="waterfall-col">
          <div v-for="note in column" :key="note._id"
          class="waterfall-card bg-white rounded-xl overflow-hidden img-card-shadow hover:shadow-lg transition-all duration-300 group">
          <!-- 封面图：根据原始宽高自适应比例 -->
          <div class="img-hover-zoom cursor-pointer relative"
            :style="{ aspectRatio: `${note.coverWidth} / ${note.coverHeight}` }" @click="openDetail(note._id)">
            <img v-if="note.cover" :src="note.cover" :alt="note.note?.title" class="w-full h-full object-cover"
              loading="lazy" draggable="false" @error="($event.target.style.display = 'none')" />
            <div v-else class="w-full h-full bg-gray-100 flex items-center justify-center aspect-[3/4]">
              <i class="fa fa-image text-gray-300 text-5xl"></i>
            </div>

            <!-- 视频笔记覆盖层 -->
            <template v-if="note.noteType === 'video'">
              <!-- 居中播放按钮 -->
              <div class="absolute inset-0 flex items-center justify-center z-10">
                <div class="w-14 h-14 rounded-full bg-black/55 backdrop-blur-sm flex items-center justify-center
                  border-2 border-white/70 shadow-lg
                  transition-all duration-300 group-hover:scale-110 group-hover:bg-black/70
                  hover:!scale-110 hover:!bg-red-500/80 hover:!border-red-300">
                  <svg class="w-6 h-6 text-white ml-1" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>
              <!-- 底部信息栏：时长 + 类型 -->
              <div class="absolute bottom-2 left-2 right-2 flex items-center justify-between z-10">
                <span
                  class="bg-black/55 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                  <svg class="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                  视频
                </span>
                <span v-if="note.videoDuration"
                  class="bg-black/55 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-full tabular-nums">
                  {{ formatDuration(note.videoDuration) }}
                </span>
              </div>
            </template>

            <!-- 动图标记 -->
            <span v-if="note.hasLivePhoto && note.noteType !== 'video'"
              class="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <span class="text-xs font-bold live-name">动图</span>
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
  searchKeyword, filterUserId, filterType, typeCounts,
  statsTotal,
  showDetail, currentDetail,
  fetchList, fetchStatistics,
  openDetail, changePage, changePageSize,
} = useXhsApi()

const activeUserId = ref('')
const activeUserName = ref('')

// ---- 瀑布流自适应布局 ----
const mainRef = ref<HTMLElement>()
const containerWidth = ref(typeof window !== 'undefined' ? window.innerWidth - 64 : 1200)

const columnCount = computed(() => {
  const w = containerWidth.value
  if (w <= 640) return 1
  if (w <= 768) return 2
  if (w <= 1200) return 3
  return 4
})

/** 将笔记按顺序分配到各列（左→右蛇形，保证视觉顺序） */
const masonryColumns = computed(() => {
  const cols = columnCount.value
  const columns: any[][] = Array.from({ length: cols }, () => [])
  // 轮询分配：卡片 0,1,2,… 依次放入列 0,1,2,0,1,2,… 保证左→右大致顺序
  notes.value.forEach((note, i) => {
    columns[i % cols].push(note)
  })
  return columns
})

/** 骨架屏列数 */
const skeletonColumns = computed(() => columnCount.value)
/** 骨架屏每列条数 */
const skeletonItemsPerCol = computed(() => Math.ceil(8 / Math.max(1, columnCount.value)))

let resizeObserver: ResizeObserver | null = null

// ---- 搜索 ----
const searchInput = ref('')

function doSearch() {
  searchKeyword.value = searchInput.value
  activeUserId.value = ''
  activeUserName.value = ''
  filterUserId.value = ''
  filterType.value = ''
  currentPage.value = 1
  fetchList(1)
}

function clearSearch() {
  searchInput.value = ''
  searchKeyword.value = ''
  filterUserId.value = ''
  filterType.value = ''
  fetchList(1)
}

// 类型切换 → 服务端筛选
function setTypeFilter(t: string) {
  filterType.value = t
  activeUserId.value = ''
  activeUserName.value = ''
  filterUserId.value = ''
  searchInput.value = ''
  searchKeyword.value = ''
  currentPage.value = 1
  fetchList(1)
}

function filterByUser(userId: string, userName: string) {
  activeUserId.value = userId
  activeUserName.value = userName
  searchInput.value = ''
  searchKeyword.value = ''
  filterUserId.value = userId
  filterType.value = ''
  currentPage.value = 1
  fetchList(1)
}

function clearUserFilter() {
  activeUserId.value = ''
  activeUserName.value = ''
  filterUserId.value = ''
  fetchList(1)
}

// 获取指定类型的笔记数量
function getTypeCount(type: string): string {
  if (!type) {
    // 全部 = 所有类型之和
    const total = typeCounts.value.reduce((sum, t) => sum + t.count, 0)
    return String(total)
  }
  const found = typeCounts.value.find(t => t.type === type)
  return found ? String(found.count) : '0'
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

// 格式化视频时长（秒 → mm:ss 或 h:mm:ss）
function formatDuration(sec: number): string {
  if (!sec || sec <= 0) return ''
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  if (m >= 60) {
    const h = Math.floor(m / 60)
    const rm = m % 60
    return `${h}:${String(rm).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  return `${m}:${String(s).padStart(2, '0')}`
}

onMounted(() => {
  // 瀑布流容器宽度监听
  if (mainRef.value) {
    containerWidth.value = mainRef.value.clientWidth - 32 // px-4 padding
    resizeObserver = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width
      if (w && w > 0) containerWidth.value = w
    })
    resizeObserver.observe(mainRef.value)
  }

  // 支持从统计页跳转
  const route = useRoute()
  const qUserId = route.query.userId as string
  const qNickname = route.query.nickname as string

  if (qUserId) {
    // 走 filterByUser 路径（内部调 clearSearch → fetchList）
    filterByUser(qUserId, qNickname || qUserId)
  } else if (qNickname) {
    searchInput.value = qNickname
    searchKeyword.value = qNickname
    fetchList(1)
  } else {
    fetchList()
  }
  fetchStatistics()
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
})

// 翻页后滚动到顶部
watch(currentPage, () => {
  nextTick(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  })
})
</script>

<style scoped>
/* 瀑布流布局（Flex 列布局，各列独立堆叠，天然形成瀑布流） */
.note-waterfall {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
}

.waterfall-col {
  flex: 1;
  min-width: 0; /* 防止内容溢出 */
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.waterfall-card {
  /* 卡片宽度由列宽自动决定，高度由内容（封面 aspect-ratio + 文字区）撑开 */
  break-inside: avoid;
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
