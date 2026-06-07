<template>
  <div class="search-container">
    <!-- 搜索主体 -->
    <div class="search-wrapper">
      <!-- 搜索引擎选择器 -->
      <div class="engine-selector" @click="toggleEngineDropdown">
        <img :src="currentEngine.icon" :alt="currentEngine.name" class="engine-icon">

        <ElIcon size="12px" :class="{ 'rotate-180': showEngineDropdown }">
          <ArrowDown />
        </ElIcon>

        <!-- 搜索引擎下拉菜单 -->
        <div class="engine-dropdown" v-if="showEngineDropdown" @click.stop>
          <div class="engine-option" v-for="engine in engines" :key="engine.id" @click="selectEngine(engine)">
            <img :src="engine.icon" :alt="engine.name" class="option-icon">
            <span class="option-name">{{ engine.name }}</span>
          </div>
        </div>
      </div>

      <!-- 搜索输入框 -->
      <div class="search-input-wrapper">
        <input type="text" v-model="searchQuery" class="search-input" placeholder="请输入搜索内容..."
          @keyup.enter="handleSearch" @focus="showSearchHistory = true" @blur="hideSearchHistory">
        <i class="el-icon-circle-close clear-icon" v-if="searchQuery" @click="clearSearchQuery"></i>
      </div>

      <!-- 搜索按钮 -->
      <button class="search-button" @click="handleSearch">

        <el-icon size="12px" class="el-icon-search search-icon" style="vertical-align: middle">
          <Search />
        </el-icon>
        <span class="search-text">搜索</span>
      </button>
    </div>

    <!-- 搜索历史记录 -->
    <div class="search-history" v-if="showSearchHistory && searchHistory.length">
      <div class="history-header">
        <span class="history-title">最近搜索</span>
        <button class="clear-history" @click="clearSearchHistory">
          <i class="el-icon-delete"></i>
          <span>清除历史</span>
        </button>
      </div>
      <div class="history-list">
        <div class="history-item" v-for="(item, index) in searchHistory" :key="index" @click="useHistoryItem(item)">
          <i class="el-icon-time"></i>
          <span class="history-text">{{ item }}</span>
          <i class="el-icon-circle-close delete-item" @click.stop="deleteHistoryItem(index)"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>

import { ArrowDown, CaretBottom,Search } from '@element-plus/icons-vue';

// 搜索引擎数据 - 实际项目中替换为真实图标
const engines = ref([
  {
    id: 'google',
    name: '谷歌',
    icon: assertSafeResolve('/icons/google.png'),
    url: 'https://www.google.com/search?q='
  },
  {
    id: 'baidu',
    name: '百度',
    icon: assertSafeResolve('/icons/baidu.png'),
    url: 'https://www.baidu.com/s?wd='
  },
  {
    id: 'bing',
    name: '必应',
    icon: assertSafeResolve('/icons/bing.png'),
    url: 'https://www.bing.com/search?q='
  }
]);

// 状态管理
const currentEngineId = ref('google');
const currentEngine = ref(engines.value[0]);
const showEngineDropdown = ref(false);
const searchQuery = ref('');
const showSearchHistory = ref(false);
const searchHistory = ref([]);


// 从本地存储加载搜索历史
onMounted(() => {
  currentEngineId.value = localStorage.getItem('currentEngineId') || 'google';
  currentEngine.value = engines.value.find(engine => engine.id === currentEngineId.value);
  const savedHistory = localStorage.getItem('searchHistory');
  if (savedHistory) {
    searchHistory.value = JSON.parse(savedHistory);
  }

  // 点击页面其他地方关闭下拉菜单
  document.addEventListener('click', (e) => {
    const engineSelector = document.querySelector('.engine-selector');
    if (!engineSelector?.contains(e.target)) {
      showEngineDropdown.value = false;
    }
  });
});

// 监听搜索历史变化，保存到本地存储
watch(searchHistory, (newVal) => {
  localStorage.setItem('searchHistory', JSON.stringify(newVal));
}, { deep: true });

// 切换搜索引擎下拉菜单显示状态
const toggleEngineDropdown = () => {
  showEngineDropdown.value = !showEngineDropdown.value;
};

// 选择搜索引擎
const selectEngine = (engine) => {
  currentEngine.value = engine;
  // 使用nextTick确保DOM更新后再关闭下拉菜单
  localStorage.setItem('currentEngineId', engine.id);
  nextTick(() => {
    showEngineDropdown.value = false;
  });
};

// 处理搜索
const handleSearch = () => {
  if (!searchQuery.value.trim()) return;

  // 添加到搜索历史
  addToSearchHistory(searchQuery.value.trim());

  // 跳转到对应搜索引擎
  window.open(currentEngine.value.url + encodeURIComponent(searchQuery.value.trim()), '_blank');

  // 清空输入框
  searchQuery.value = '';
};

// 添加到搜索历史
const addToSearchHistory = (query) => {
  // 移除已存在的相同记录
  const index = searchHistory.value.indexOf(query);
  if (index !== -1) {
    searchHistory.value.splice(index, 1);
  }

  // 添加到历史记录最前面
  searchHistory.value.unshift(query);

  // 限制历史记录数量
  if (searchHistory.value.length > 10) {
    searchHistory.value.pop();
  }
};

// 清除搜索输入
const clearSearchQuery = () => {
  searchQuery.value = '';
};

// 隐藏搜索历史
const hideSearchHistory = () => {
  // 使用setTimeout避免点击历史项时立即隐藏
  setTimeout(() => {
    showSearchHistory.value = false;
  }, 200);
};

// 使用历史记录项
const useHistoryItem = (item) => {
  searchQuery.value = item;
  handleSearch();
};

// 清除所有搜索历史
const clearSearchHistory = () => {
  searchHistory.value = [];
  localStorage.removeItem('searchHistory');
};

// 删除单个历史记录项
const deleteHistoryItem = (index) => {
  searchHistory.value.splice(index, 1);
};
</script>

<style scoped>
/* 样式保持不变 */
.search-container {
  position: relative;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.search-wrapper {
  display: flex;
  align-items: center;
  background-color: #fff;
  border-radius: 30px;
  box-shadow: 0 0px 18px rgba(0, 0, 0, 0.1);
  padding: 8px 16px;
  transition: all 0.3s ease;
}

.search-wrapper:hover {
  /* box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08); */
  box-shadow: 0 0px 18px rgba(0, 0, 0, 0.1);
}

.engine-selector {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 20px;
  transition: background-color 0.2s ease;
  position: relative;
  z-index: 10;
}

.engine-selector:hover {
  background-color: #f5f5f5;
}

.engine-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  margin-right: 6px;
}

.engine-arrow {
  color: #888;
  font-size: 14px;
  transition: transform 0.2s ease;
}

.rotate-180 {
  transform: rotate(180deg);
  transition: transform 0.2s ease;
}

.engine-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 8px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  padding: 8px 0;
  width: 120px;
  z-index: 100;
  animation: fadeIn 0.2s ease forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.engine-option {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.engine-option:hover {
  background-color: #f5f5f5;
}

.option-icon {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  margin-right: 8px;
}

.option-name {
  font-size: 14px;
  color: #333;
}

.search-input-wrapper {
  flex: 1;
  position: relative;
  margin: 0 12px;
}

.search-input {
  width: 100%;
  border: none;
  outline: none;
  padding: 8px 0;
  font-size: 16px;
  color: #333;
  background: transparent;
}

.search-input::placeholder {
  color: #aaa;
}

.clear-icon {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  color: #aaa;
  cursor: pointer;
  transition: color 0.2s ease;
}

.clear-icon:hover {
  color: #666;
}

.search-button {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #4285f4;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
}

.search-button:hover {
  background-color: #3367d6;
  transform: translateY(-1px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.search-button:active {
  transform: translateY(0);
  box-shadow: none;
}

.search-icon {
  margin-right: 6px;
}

.search-history {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 8px;
  background-color: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  padding: 16px;
  z-index: 9;
  animation: slideDown 0.2s ease forwards;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.history-title {
  font-size: 14px;
  color: #888;
  font-weight: 500;
}

.clear-history {
  display: flex;
  align-items: center;
  background: none;
  border: none;
  color: #888;
  font-size: 13px;
  cursor: pointer;
  transition: color 0.2s ease;
  padding: 4px 8px;
  border-radius: 4px;
}

.clear-history:hover {
  color: #333;
  background-color: #f5f5f5;
}

.clear-history i {
  margin-right: 4px;
  font-size: 12px;
}

.history-list {
  max-height: 240px;
  overflow-y: auto;
}

.history-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  margin-bottom: 4px;
}

.history-item:hover {
  background-color: #f5f5f5;
}

.history-item i.el-icon-time {
  color: #aaa;
  margin-right: 12px;
  font-size: 14px;
}

.history-text {
  flex: 1;
  font-size: 14px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.delete-item {
  color: #ddd;
  font-size: 12px;
  opacity: 0;
  transition: all 0.2s ease;
}

.history-item:hover .delete-item {
  opacity: 1;
  color: #aaa;
}

.delete-item:hover {
  color: #ff4d4f !important;
}

/* 滚动条美化 */
.history-list::-webkit-scrollbar {
  width: 6px;
}

.history-list::-webkit-scrollbar-track {
  background: #f5f5f5;
  border-radius: 3px;
}

.history-list::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 3px;
}

.history-list::-webkit-scrollbar-thumb:hover {
  background: #ccc;
}

/* 响应式调整 */
@media (max-width: 600px) {
  .search-text {
    display: none;
  }

  .search-button {
    padding: 8px;
  }

  .search-icon {
    margin-right: 0;
  }

  .engine-selector {
    padding: 4px;
  }

  .engine-arrow {
    display: none;
  }

  .search-history {
    padding: 12px;
  }
}
</style>
