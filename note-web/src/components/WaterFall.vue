<template>
    <div class="min-h-screen bg-gray-50 font-inter text-gray-800">
        <!-- 顶部导航栏 -->
        <header class="sticky top-0 z-50 bg-white shadow-sm">
            <div class="container mx-auto px-4 py-4 flex flex-col justify-between sm:flex-row sm:items-center">
                <div class="title-badge">
                    唱開去，毛管戙萬歲！
                </div>
                <div class="flex items-center gap-4 mt-2">
                    <div v-if="lastFetchTime" class="text-sm flex items-center gap-1">
                        <i class="fa fa-clock-o text-gray-500"></i>
                        <span class="text-gray-500">上次更新:</span>
                        <span class="time-badge">{{ lastFetchTime }}</span>
                    </div>
                    <button :disabled="isUpdated" @click="checkForUpdates"
                        class="px-2 py-1 sm:py-1 bg-primary cursor-pointer text-white rounded-lg hover:bg-primary/90 active:bg-primary/80 active:scale-95 transition-all duration-300 flex items-center gap-2"
                        :class="isUpdated ? 'opacity-50 cursor-not-allowed' : ''">
                        <i class="fa" :class="isUpdated ? 'fa-spinner fa-spin' : 'fa-refresh'"></i>
                    </button>
                </div>
            </div>
        </header>

        <!-- 主要内容区 -->
        <main class="container mx-auto px-4 py-8">
            <!-- 过滤器和搜索 -->
            <!-- <div class="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div class="flex flex-wrap gap-2">
          <div 
            v-for="category in categories" 
            :key="category.id"
            @click="activeCategory = category.id"
            class="px-4 py-2 rounded-full text-sm transition-colors bg-blue cursor-pointer"
            :class="activeCategory === category.id ? 'bg-primary text-white' : 'bg-gray-200 hover:bg-gray-300'"
          >
            {{ category.name }}
          </div>
        </div>
        <div class="relative w-full md:w-100">
          <input 
            type="text" 
            placeholder="搜索图片..." 
            v-model="searchQuery"
            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
          <i class="fa fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
        </div>
      </div> -->

            <!-- 图片流网格 -->
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                <div v-for="img in filteredImages" :key="img.id"
                    class="bg-white rounded-xl overflow-hidden img-card-shadow hover:shadow-lg transition-all duration-300 flex flex-col">
                    <div class="img-hover-zoom h-64 cursor-pointer">
                        <img :src="img.cover" :alt="img.title" class="w-full h-full object-cover" loading="lazy"
                            @click="openImageViewer(img)">
                    </div>
                    <div class="p-4 flex flex-col justify-between flex-1">
                        <div class="flex-1">
                            <h3 class="font-semibold text-lg mb-1 desc-limit-2">{{ img.title }}</h3>
                            <div class="text-neutral text-sm mb-3 desc-limit">{{ img.desc }}</div>
                        </div>

                        <div class="flex justify-between items-center">
                            <span class="text-xs text-gray-500"><i class="fa fa-calendar-o mr-1"></i>{{ img.create_date
                                }}</span>
                            <div class="flex items-center gap-2">
                                <div class="transition-colors"
                                    :class="img.isLiked ? 'text-red-500 hover:text-red-600' : 'text-gray-400 hover:text-red-500'"
                                    @click.stop="toggleLike(img.id)">
                                    <i :class="img.isLiked ? 'fa fa-heart' : 'fa fa-heart-o'"></i>
                                </div>
                                <div class="transition-colors"
                                    :class="img.isBookmarked ? 'text-primary hover:text-primary/80' : 'text-gray-400 hover:text-primary'"
                                    @click.stop="toggleBookmark(img.id)">
                                    <i :class="img.isBookmarked ? 'fa fa-bookmark' : 'fa fa-bookmark-o'"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 加载更多按钮 -->
            <div class="mt-10 text-center w-full" v-if="!isFinished">
                <div @click="loadMoreImages" :disabled="isLoading"
                    class="w-fit cursor-pointer px-6 py-3 bg-white border border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors duration-300 flex items-center mx-auto">
                    <i v-if="isLoading" class="fa fa-spinner fa-spin mr-2"></i>
                    <i v-else class="fa fa-refresh mr-2"></i>
                    {{ isLoading ? '加载中...' : '加载更多' }}
                </div>
            </div>
        </main>

        <!-- 页脚 -->
        <footer class="bg-gray-800 text-white py-10 mt-16">
            <div class="container mx-auto px-4">
                <div class="flex sm:flex-row  justify-between items-center">
                    <div class="mb-6 md:mb-0">
                        <h2 class="text-xl font-bold mb-2 flex items-center">
                            <i class="fa fa-images mr-2"></i>叱咤派台
                        </h2>
                        <div class="text-gray-400 text-sm">支持广东歌等于支持你自己</div>
                    </div>
                    <div class="flex space-x-6">
                        <a href="#" class="text-gray-400 hover:text-white transition-colors"><i
                                class="fa fa-facebook"></i></a>
                        <a href="#" class="text-gray-400 hover:text-white transition-colors"><i
                                class="fa fa-twitter"></i></a>
                        <a href="#" class="text-gray-400 hover:text-white transition-colors"><i
                                class="fa fa-instagram"></i></a>
                        <a href="#" class="text-gray-400 hover:text-white transition-colors"><i
                                class="fa fa-pinterest"></i></a>
                    </div>
                </div>
                <div class="border-t border-gray-700 mt-6 pt-6 text-center text-gray-400 text-sm">
                    &copy; 2025
                    <a href="#" class="hover:text-white transition-colors">
                        逃生手册
                    </a> 强力支持 <i class="fa fa-flash mr-2"></i>
                </div>
            </div>
        </footer>

        <!-- 图片查看器模态框 -->
        <ImageDetailViewer v-model:visible="showDetailViewer" :image-data="currentImageData" />
    </div>
</template>

<script setup>
import dayjs from 'dayjs';
import ImageDetailViewer from './ImageDetailViewer.vue';

// 图片分类
const categories = ref([
    { id: 'all', name: '全部' },
    { id: 'scenery', name: '风景' },
    { id: 'people', name: '人物' },
    { id: 'animal', name: '动物' },
    { id: 'architecture', name: '建筑' }
]);

// 状态管理
const activeCategory = ref('all');
const searchQuery = ref('');
const images = ref([]);
const isLoading = ref(false);
const showDetailViewer = ref(false);
const currentImageData = ref({});
const pageNo = ref(0);
const isFinished = ref(false);
const isUpdated = ref(false);
const lastFetchTime = ref('');

//获取同步信息
function getSyncInfo() {
    getSyncInfoApi().then(res => {
        lastFetchTime.value = res.data.last_fetch_time
    });
}

getSyncInfo()

// 初始化图片数据
onMounted(() => {
    loadMoreImages()
});
// 过滤图片（分类和搜索）
const filteredImages = computed(() => {
    return images.value.filter(img => {
        // 分类过滤
        const categoryMatch = activeCategory.value === 'all' || img.category === activeCategory.value;
        // 搜索过滤
        const searchMatch = img.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            img.desc.toLowerCase().includes(searchQuery.value.toLowerCase());
        return categoryMatch && searchMatch;
    });
});

// 加载更多图片
const loadMoreImages = () => {
    pageNo.value++;
    isLoading.value = true;

    getMy903List({ pageNo: pageNo.value }).then(res => {
        const data = res.data
        images.value = [...images.value, ...data.data.map(item => {
            return {
                ...item,
                title: item.title,
            }
        })];
        isLoading.value = false;
        if (images.value.length >= data.total) {
            isFinished.value = true;
        }
    });
};

// 图片查看器功能
const openImageViewer = (imageItem) => {
    getDetailApi(imageItem.article_id).then(res => {
        currentImageData.value = res.data

        showDetailViewer.value = true;
    })

};

// 切换喜欢状态
const toggleLike = (id) => {
    const img = images.value.find(item => item.id === id);
    if (img) {
        img.isLiked = !img.isLiked;
    }
};

// 切换收藏状态
const toggleBookmark = (id) => {
    const img = images.value.find(item => item.id === id);
    if (img) {
        img.isBookmarked = !img.isBookmarked;
    }
};
// 检查更新方法
const checkForUpdates = () => {
    if (isUpdated.value) return; // 防止重复点击

    isUpdated.value = true;
    fetchNewApi().then(res => {
        getSyncInfo();
        // 重置页码并清空现有数据
        pageNo.value = 0;
        images.value = [];
        isFinished.value = false;
        // 加载新数据
        loadMoreImages();
    }).finally(() => {
        isUpdated.value = false;
    });
};
</script>

<style scoped>
/* 自定义工具类 */
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
    /* 最多显示5行 */
    overflow: hidden;
    /* 超出部分隐藏 */
    text-overflow: ellipsis;
    /* 显示省略号 */
    /* 可选：确保高度自适应，避免固定高度导致的问题 */
    height: auto;
}

.desc-limit-2 {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    /* 最多显示5行 */
    overflow: hidden;
    /* 超出部分隐藏 */
    text-overflow: ellipsis;
    /* 显示省略号 */
    /* 可选：确保高度自适应，避免固定高度导致的问题 */
    height: auto;
}

/* 平行四边形时间标签 */
.time-badge {
    display: inline-block;
    padding: 2px 12px;
    background-color: #3880ff;
    color: white;
    transform: skewX(-10deg);
    margin-left: 4px;
}

.time-badge::before {
    content: '';
    display: inline-block;
    transform: skewX(10deg);
}

/* 平行四边形标题 */
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

.title-badge::before {
    content: '';
    display: inline-block;
    transform: skewX(10deg);
}
</style>