<template>
    <div class="frequent-websites">
        <!-- 添加按钮 -->
        <!-- <div class="flex justify-end">
            <el-button type="primary" size="small" class="add-button" @click="showAddDialog = true">
                + 添加
            </el-button>
        </div> -->


        <!-- 网站列表 - 两行布局 -->
        <div class="sites-container">
            <el-card v-for="(site, index) in filteredSites" :key="site.id" class="site-card">
                <!-- 删除按钮（右上角） -->
                <el-button type="text" size="small" class="delete-btn" @click.stop="handleDelete(index)">
                    ×
                </el-button>

                <!-- 网站内容 -->
                <div class="site-content" @click="visitSite(site.url)">
                    <div class="site-icon" :style="{ backgroundColor: site.color }">
                        <span>{{ site.name.substring(0, 2) }}</span>
                    </div>
                    <div class="site-name">{{ site.name }}</div>
                </div>
            </el-card>

            <!-- 空状态提示 -->
            <div class="empty-state" v-if="filteredSites.length === 0">
                <el-empty description="暂无网站，点击添加"></el-empty>
            </div>
        </div>

        <!-- 添加网站对话框 -->
        <el-dialog title="添加网站" v-model="showAddDialog" width="350px">
            <el-form :model="newSite" :rules="rules" ref="siteForm" label-width="70px">
                <el-form-item label="名称" prop="name">
                    <el-input v-model="newSite.name" placeholder="输入网站名称"></el-input>
                </el-form-item>
                <el-form-item label="网址" prop="url">
                    <el-input v-model="newSite.url" placeholder="输入http/https网址"></el-input>
                </el-form-item>
                <el-form-item label="颜色">
                    <el-color-picker v-model="newSite.color" :predefine="predefinedColors"></el-color-picker>
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="showAddDialog = false">取消</el-button>
                <el-button type="primary" @click="handleAddSite">添加</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { ElMessage, ElMessageBox, ElEmpty } from 'element-plus';

// 状态管理
const showAddDialog = ref(false);
const siteForm = ref(null);
const sites = ref([]);

// 新增网站表单数据
const newSite = reactive({
    name: '',
    url: '',
    color: '#409eff'
});

// 表单验证规则
const rules = {
    name: [
        { required: true, message: '请输入名称', trigger: 'blur' },
        { max: 10, message: '最多10个字符', trigger: 'blur' }
    ],
    url: [
        { required: true, message: '请输入网址', trigger: 'blur' },
        { type: 'url', message: '请输入有效网址', trigger: 'blur' }
    ]
};

// 预定义颜色选项
const predefinedColors = [
    '#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#909399',
    '#1890ff', '#722ed1', '#fa541c', '#0fc6c2', '#7cb305'
];

// 限制最多显示两行（12个网站）
const filteredSites = computed(() => {
    return sites.value.slice(0, 12);
});

// 从本地存储加载数据
onMounted(() => {
    const savedSites = localStorage.getItem('frequentWebsites');
    if (savedSites) {
        sites.value = JSON.parse(savedSites);
    }
});

// 保存数据到本地存储
const saveToLocalStorage = () => {
    localStorage.setItem('frequentWebsites', JSON.stringify(sites.value));
};

// 添加网站
const handleAddSite = () => {
    siteForm.value.validate((valid) => {
        if (valid) {
            // 检查是否已存在
            const exists = sites.value.some(site =>
                site.url.toLowerCase() === newSite.url.toLowerCase()
            );

            if (exists) {
                ElMessage.warning('该网站已存在');
                return;
            }

            // 添加新网站
            sites.value.unshift({
                id: Date.now(),
                ...{ ...newSite }
            });

            // 保存到本地存储
            saveToLocalStorage();

            // 重置表单并关闭对话框
            siteForm.value.resetFields();
            showAddDialog.value = false;
            ElMessage.success('添加成功');
        }
    });
};

// 删除网站
const handleDelete = (index) => {
    const site = sites.value[index];
    ElMessageBox.confirm(
        `删除 ${site.name}?`,
        '确认',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
            center:true,
        }
    ).then(() => {
        sites.value.splice(index, 1);
        saveToLocalStorage();
        ElMessage.success('已删除');
    }).catch(() => {
        // 取消删除
    });
};

// 访问网站
const visitSite = (url) => {
    window.open(url, '_blank');
};
</script>

<style scoped lang="less">
.frequent-websites {
    padding: 15px;
    background-color: #fff;
    border-radius: 6px;
}

.add-button {
    display: flex;
    align-items: center;
    margin-bottom: 15px;
}

/* 网站容器 - 两行布局 */
.sites-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 15px;
    max-height: 260px;
    /* 控制显示两行 */
}

.site-card {
    position: relative;
    height: 110px;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid #f0f0f0;
    border-radius: 20px;
    transition: all 0.3s ease;
    /* 过渡动画（时长、缓动效果） */
    transition-delay: 0s;
    /* 默认无延迟 */
}

.site-card:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

/* 删除按钮 */
.delete-btn {
    position: absolute;
    top: 5px;
    right: 5px;
    width: 24px;
    height: 24px;
    padding: 0;
    color: #ff4d4f;
    font-size: 16px;
    opacity: 0;
    transition: opacity 0.2s;
    z-index: 10;
}

.site-card:hover .delete-btn {
    opacity: 1;
    transition-delay: 0.8s;
    /* 悬停后延迟 0.5s 生效 */
}

.delete-btn:hover {
    background-color: rgba(255, 77, 79, 0.1);

}

/* 网站内容 */
.site-content {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 10px;
}

/* 网站图标 */
.site-icon {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    margin-bottom: 10px;
}

/* 网站名称 */
.site-name {
    font-size: 14px;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100px;
}

/* 空状态 */
.empty-state {
    grid-column: 1 / -1;
    padding: 30px 0;
    text-align: center;
}

/* 响应式调整 */
@media (max-width: 600px) {
    .sites-container {
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    }
}
</style>
