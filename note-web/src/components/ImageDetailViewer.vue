<template>
    <div
      v-if="visible"
      class="xhs-viewer-overlay"
      @click.self="closeViewer"
    >
      <div class="xhs-viewer-container">
        <!-- 左侧：媒体列（图片 + 缩略图） -->
        <div class="xhs-viewer-media">
          <!-- 关闭按钮 -->
          <button class="xhs-viewer-close" @click="closeViewer">
            <i class="fa fa-times"></i>
          </button>

          <!-- 大图区域 -->
          <div
            class="xhs-viewer-image"
            :class="{ 'is-live-playing': currentIsLivePhoto && !videoEnded }"
          >
            <!-- 静态图（视频笔记不展示） -->
            <img
              v-if="!isVideoNote"
              :src="currentImage"
              :alt="imageData.title"
              class="xhs-viewer-img"
              :class="{ 'xhs-viewer-img-replay': currentIsLivePhoto && videoEnded }"
              draggable="false"
              @click.stop="currentIsLivePhoto && videoEnded && replayVideo()"
            >
            <!-- Live Photo 视频叠加层（覆盖在图片上方） -->
            <video
              v-if="currentIsLivePhoto && currentVideoUrl"
              ref="videoRef"
              :src="currentVideoUrl"
              class="xhs-viewer-img xhs-viewer-live-video"
              :class="{ 'is-hidden': videoEnded }"
              autoplay
              muted
              playsinline
              @ended="videoEnded = true"
            ></video>
            <!-- Live Photo 标记 -->
            <div v-if="currentIsLivePhoto" class="xhs-viewer-live-badge" title="Live Photo">LIVE</div>

            <!-- 视频笔记播放器 -->
            <video
              v-if="isVideoNote"
              ref="mainVideoRef"
              :src="imageData.mainVideoUrl"
              :poster="currentImage"
              class="xhs-viewer-main-video"
              controls
              playsinline
              @play="mainVideoPlaying = true"
              @pause="mainVideoPlaying = false"
              @ended="mainVideoPlaying = false"
            ></video>

            <!-- 视频笔记：未播放时显示封面 + 播放按钮 -->
            <div
              v-if="isVideoNote && !mainVideoPlaying"
              class="xhs-viewer-video-cover"
              :style="{ backgroundImage: 'url(' + currentImage + ')' }"
            >
              <button class="xhs-viewer-play-btn" @click.stop="playMainVideo">
                <svg viewBox="0 0 24 24" width="48" height="48" fill="white">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </button>
            </div>

            <!-- 视频标记 -->
            <div v-if="isVideoNote" class="xhs-viewer-live-badge xhs-viewer-video-badge" title="视频笔记">VIDEO</div>

            <!-- 上一张 -->
            <button v-if="hasPrevious" class="xhs-viewer-nav xhs-viewer-prev" @click.stop="previousImage">
              <i class="fa fa-chevron-left"></i>
            </button>

            <!-- 下一张 -->
            <button v-if="hasNext" class="xhs-viewer-nav xhs-viewer-next" @click.stop="nextImage">
              <i class="fa fa-chevron-right"></i>
            </button>

            <!-- 图片计数器 -->
            <div v-if="images.length > 1" class="xhs-viewer-counter">
              {{ currentIndex + 1 }} / {{ images.length }}
            </div>
          </div>

          <!-- 缩略图条 -->
          <div v-if="images.length > 1" class="xhs-viewer-thumbnails" @wheel="onThumbnailsWheel">
            <div
              v-for="(img, idx) in images"
              :key="idx"
              class="xhs-viewer-thumb"
              :class="{ 'xhs-viewer-thumb-active': idx === currentIndex }"
              @click="selectThumbnail(idx, $event)"
            >
              <img
                :src="img.url"
                :alt="`缩略图 ${idx + 1}`"
                draggable="false"
              >
            <div v-if="img.livePhoto" class="absolute top-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                <path d="M0 0h24v24H0z" fill="none" />
                <g fill="none">
                  <path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z" />
                  <path fill="#fff" d="M12.191 19.998a1 1 0 1 1 .047 2L12 22l-.238-.003a1 1 0 1 1 .047-2L12 20zm5.347-.833a1 1 0 0 1-.332 1.375a10 10 0 0 1-.412.238a1 1 0 0 1-.96-1.755a8 8 0 0 0 .33-.19a1 1 0 0 1 1.374.332m-9.701-.332q.162.1.33.19a1 1 0 0 1-.961 1.755a10 10 0 0 1-.412-.238a1 1 0 1 1 1.043-1.707M12 6a6 6 0 1 1 0 12a6 6 0 0 1 0-12m8.38 9.437a1 1 0 0 1 .398 1.357q-.114.21-.238.412a1 1 0 0 1-1.707-1.043q.1-.162.19-.33a1 1 0 0 1 1.358-.396Zm-15.403.397a8 8 0 0 0 .19.33a1 1 0 1 1-1.707 1.042a10 10 0 0 1-.238-.412a1 1 0 0 1 1.755-.96M12 8a4 4 0 1 0 0 8a4 4 0 0 0 0-8m0 2a2 2 0 1 1 0 4a2 2 0 0 1 0-4m-8.974.785a1 1 0 0 1 .976 1.024L4 12q0 .096.002.191a1 1 0 0 1-2 .047L2 12q0-.12.003-.238a1 1 0 0 1 1.023-.977m17.948 0a1 1 0 0 1 1.023.977L22 12l-.003.238a1 1 0 1 1-2-.047L20 12l-.002-.191a1 1 0 0 1 .976-1.024m-.434-3.991q.123.203.238.412a1 1 0 1 1-1.755.96a8 8 0 0 0-.19-.33a1 1 0 1 1 1.707-1.042M4.835 6.462a1 1 0 0 1 .332 1.375q-.1.162-.19.33a1 1 0 1 1-1.755-.961q.115-.21.238-.412a1 1 0 0 1 1.375-.332m11.959-3.24q.21.115.412.238a1 1 0 0 1-1.043 1.707a8 8 0 0 0-.33-.19a1 1 0 1 1 .961-1.755m-8.23.397a1 1 0 0 1-.398 1.358a8 8 0 0 0-.33.19A1 1 0 0 1 6.795 3.46q.203-.123.412-.238a1 1 0 0 1 1.357.397m3.674-1.616a1 1 0 0 1-.047 2L12 4l-.191.002a1 1 0 0 1-.047-2L12 2z" />
                </g>
              </svg>
            </div>


              
            </div>
          </div>
        </div>

        <!-- 右侧：详情区 -->
        <div class="xhs-viewer-detail">
          <!-- 作者 -->
          <div class="xhs-viewer-detail-head">
            <div class="xhs-viewer-author">
              <img
                v-if="imageData.authorAvatar"
                :src="imageData.authorAvatar"
                class="xhs-viewer-author-avatar"
                @error="(e) => { e.target.style.display = 'none' }"
              >
              <div v-else class="xhs-viewer-author-fallback">
                {{ getInitial(imageData.author || '用户') }}
              </div>
              <div class="xhs-viewer-author-info">
                <div class="xhs-viewer-author-name">{{ imageData.author || '匿名用户' }}</div>
                <div class="xhs-viewer-author-date">{{ imageData.create_date }}</div>
              </div>
            </div>
            <h2
              v-if="imageData.title && imageData.title !== '无标题'"
              class="xhs-viewer-title"
            >
              {{ imageData.title }}
            </h2>
          </div>

          <!-- 内容区 -->
          <div class="xhs-viewer-detail-body">
            <!-- 创作者（my903） -->
            <div v-if="hasCreatorInfo" class="xhs-viewer-creators">
              <div v-if="imageData.composer_list" class="xhs-viewer-creator-row">
                <span class="xhs-viewer-creator-label">曲：</span>
                <span>{{ formatCreatorList(imageData.composer_list) }}</span>
              </div>
              <div v-if="imageData.lyricist_list" class="xhs-viewer-creator-row">
                <span class="xhs-viewer-creator-label">詞：</span>
                <span>{{ formatCreatorList(imageData.lyricist_list) }}</span>
              </div>
              <div v-if="imageData.arranger_list" class="xhs-viewer-creator-row">
                <span class="xhs-viewer-creator-label">編：</span>
                <span>{{ formatCreatorList(imageData.arranger_list) }}</span>
              </div>
              <div v-if="imageData.producer_list" class="xhs-viewer-creator-row">
                <span class="xhs-viewer-creator-label">監：</span>
                <span>{{ formatCreatorList(imageData.producer_list) }}</span>
              </div>
            </div>

            <!-- 描述 -->
            <div
              v-if="imageData.description"
              class="xhs-viewer-desc"
            >{{ imageData.description }}</div>

            <!-- 标签 -->
            <div v-if="imageData.tags && imageData.tags.length" class="xhs-viewer-tags">
              <span
                v-for="tag in imageData.tags"
                :key="tag"
                class="xhs-viewer-tag"
              >#{{ tag }}</span>
            </div>

            <!-- 统计 -->
            <div class="xhs-viewer-stats">
              <div class="xhs-viewer-stat">
                <i class="fa fa-heart-o"></i>
                <span>{{ formatNumber(imageData.likes || 0) }}</span>
              </div>
              <div class="xhs-viewer-stat">
                <i class="fa fa-bookmark-o"></i>
                <span>{{ formatNumber(imageData.collects || 0) }}</span>
              </div>
              <div class="xhs-viewer-stat">
                <i class="fa fa-share-alt"></i>
                <span>{{ formatNumber(imageData.shares || 0) }}</span>
              </div>
            </div>

            <!-- 评论 -->
            <div v-if="imageData.comments && imageData.comments.length" class="xhs-viewer-comments">
              <div class="xhs-viewer-comments-title">
                评论 ({{ imageData.commentCount || imageData.comments.length }})
              </div>
              <div
                v-for="comment in imageData.comments"
                :key="comment.id"
                class="xhs-viewer-comment"
              >
                <!-- 主评论 -->
                <div class="xhs-viewer-comment-main">
                  <img
                    v-if="comment.avatar"
                    :src="comment.avatar"
                    class="xhs-viewer-comment-avatar"
                    @error="(e) => { e.target.style.display = 'none' }"
                  >
                  <div
                    v-else
                    class="xhs-viewer-comment-avatar xhs-viewer-comment-avatar-fallback"
                  >{{ getInitial(comment.nickname) }}</div>
                  <div class="xhs-viewer-comment-body">
                    <div class="xhs-viewer-comment-header">
                      <span class="xhs-viewer-comment-nick">{{ comment.nickname }}</span>
                      <span class="xhs-viewer-comment-meta">
                        <span v-if="comment.ipLocation">{{ comment.ipLocation }}</span>
                        <span v-if="comment.ipLocation && comment.createTime"> · </span>
                        <span v-if="comment.createTime">{{ comment.createTime }}</span>
                      </span>
                    </div>
                    <div class="xhs-viewer-comment-content">{{ comment.content }}</div>
                    <div class="xhs-viewer-comment-footer">
                      <span class="xhs-viewer-comment-like">
                        <i class="fa fa-heart-o"></i> {{ formatLikeCount(comment.likeCount) }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- 子评论 -->
                <div
                  v-if="comment.subComments && comment.subComments.length"
                  class="xhs-viewer-subcomments"
                >
                  <div
                    v-for="sub in comment.subComments"
                    :key="sub.id"
                    class="xhs-viewer-subcomment"
                  >
                    <img
                      v-if="sub.avatar"
                      :src="sub.avatar"
                      class="xhs-viewer-comment-avatar xhs-viewer-subcomment-avatar"
                      @error="(e) => { e.target.style.display = 'none' }"
                    >
                    <div
                      v-else
                      class="xhs-viewer-comment-avatar xhs-viewer-subcomment-avatar xhs-viewer-comment-avatar-fallback"
                    >{{ getInitial(sub.nickname) }}</div>
                    <div class="xhs-viewer-comment-body">
                      <div class="xhs-viewer-comment-header">
                        <span class="xhs-viewer-comment-nick">{{ sub.nickname }}</span>
                        <span
                          v-if="sub.targetNickname"
                          class="xhs-viewer-comment-reply-to"
                        > 回复 <span class="xhs-viewer-comment-nick">{{ sub.targetNickname }}</span></span>
                        <span class="xhs-viewer-comment-meta">
                          <span v-if="sub.ipLocation">{{ sub.ipLocation }}</span>
                          <span v-if="sub.ipLocation && sub.createTime"> · </span>
                          <span v-if="sub.createTime">{{ sub.createTime }}</span>
                        </span>
                      </div>
                      <div class="xhs-viewer-comment-content">{{ sub.content }}</div>
                      <div class="xhs-viewer-comment-footer">
                        <span class="xhs-viewer-comment-like">
                          <i class="fa fa-heart-o"></i> {{ formatLikeCount(sub.likeCount) }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  imageData: {
    type: Object,
    default: () => ({
      cover: '', id: '', name: '', description: '',
      singer_list: [], composer_list: [], arranger_list: [],
      lyricist_list: [], producer_list: [], youtube_media: {},
      title: '', desc: '', author: '', authorAvatar: '',
      create_date: '', images: [], tags: [],
      views: 0, likes: 0, collects: 0, shares: 0,
      comments: [], commentCount: 0,
      noteType: 'normal', mainVideoUrl: '',
    }),
  },
})

const emit = defineEmits(['close', 'update:visible'])

const currentIndex = ref(0)
const videoRef = ref(null)
const videoEnded = ref(false)
const mainVideoRef = ref(null)
const mainVideoPlaying = ref(false)

const isVideoNote = computed(() => props.imageData.noteType === 'video' && !!props.imageData.mainVideoUrl)

// 归一化：支持字符串数组（旧）和对象数组（新，含 livePhoto / videoUrl）
function normalizeImage(img) {
  if (typeof img === 'string') return { url: img, livePhoto: false, videoUrl: '' }
  return { url: img?.url || '', livePhoto: !!img?.livePhoto, videoUrl: img?.videoUrl || '' }
}

const images = computed(() => {
  if (props.imageData.images && props.imageData.images.length > 0) {
    return props.imageData.images.map(normalizeImage)
  }
  return props.imageData.cover ? [{ url: props.imageData.cover, livePhoto: false }] : []
})

const currentImage = computed(() => images.value[currentIndex.value]?.url || '')
const currentIsLivePhoto = computed(() => images.value[currentIndex.value]?.livePhoto || false)
const currentVideoUrl = computed(() => images.value[currentIndex.value]?.videoUrl || '')
const hasPrevious = computed(() => currentIndex.value > 0)
const hasNext = computed(() => currentIndex.value < images.value.length - 1)

const hasCreatorInfo = computed(() => {
  return props.imageData.composer_list
    || props.imageData.lyricist_list
    || props.imageData.arranger_list
    || props.imageData.producer_list
})

function previousImage() { if (hasPrevious.value) { currentIndex.value--; scrollThumbIntoView(); resetVideo() } }
function nextImage() { if (hasNext.value) { currentIndex.value++; scrollThumbIntoView(); resetVideo() } }

function replayVideo() {
  if (videoRef.value) {
    videoRef.value.currentTime = 0
    videoRef.value.play()
    videoEnded.value = false
  }
}

function resetVideo() {
  videoEnded.value = false
  // 重置主视频状态
  mainVideoPlaying.value = false
  if (mainVideoRef.value) {
    mainVideoRef.value.pause()
    mainVideoRef.value.currentTime = 0
  }
}

function playMainVideo() {
  if (mainVideoRef.value) {
    mainVideoRef.value.play()
  }
}

function selectThumbnail(idx, event) {
  currentIndex.value = idx
  resetVideo()
  const el = event.currentTarget
  el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
}

function scrollThumbIntoView() {
  const container = document.querySelector('.xhs-viewer-thumbnails')
  const active = container?.querySelector('.xhs-viewer-thumb-active')
  active?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
}

function onThumbnailsWheel(event) {
  const el = event.currentTarget
  el.scrollLeft += event.deltaY
  event.preventDefault()
}

function closeViewer() {
  emit('update:visible', false)
  emit('close')
  currentIndex.value = 0
  resetVideo()
}

function getInitial(name) {
  return name ? name.charAt(0).toUpperCase() : 'U'
}

function formatNumber(num) {
  if (num >= 10000) return (num / 10000).toFixed(1) + 'w'
  return String(num)
}

function formatLikeCount(count) {
  const n = parseInt(count, 10)
  if (isNaN(n) || n === 0) return '0'
  if (n >= 10000) return (n / 10000).toFixed(1) + 'w'
  return String(n)
}

function formatCreatorList(list) {
  if (!list) return ''
  return list.join('、')
}

function handleKeydown(e) {
  if (!props.visible) return
  if (e.key === 'Escape') closeViewer()
  else if (e.key === 'ArrowLeft') previousImage()
  else if (e.key === 'ArrowRight') nextImage()
}

watch(() => props.visible, (val) => {
  if (val) {
    document.addEventListener('keydown', handleKeydown)
    document.body.style.overflow = 'hidden'
  } else {
    document.removeEventListener('keydown', handleKeydown)
    document.body.style.overflow = ''
  }
})
</script>

<style>
/* ========== ImageDetailViewer 完全隔离样式 ========== */
/* 不使用 scoped，改用唯一命名空间前缀 xhs-viewer- */

.xhs-viewer-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.92);
  display: flex;
  align-items: center;
  justify-content: center;

  /* 重置全局样式干扰 */
  -webkit-tap-highlight-color: transparent;

  /* 字体独立 */
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: #333;
}

.xhs-viewer-overlay *,
.xhs-viewer-overlay *::before,
.xhs-viewer-overlay *::after {
  box-sizing: border-box;
}

.xhs-viewer-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  max-width: 1400px;
  margin: 0 auto;
}

/* ====== 媒体列（图片 + 缩略图） ====== */
.xhs-viewer-media {
  flex: 1;
  min-height: 30vh;
  display: flex;
  flex-direction: column;
  position: relative;
  min-width: 0;
  user-select: none;
  -webkit-user-select: none;
}

.xhs-viewer-image {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 24px solid transparent;
  min-height: 0;
  box-sizing: border-box;
}

.xhs-viewer-close {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 10;
  width: 40px;
  height: 40px;
  border: none;
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  font-size: 20px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  outline: none;
}
.xhs-viewer-close:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Live Photo 视频叠加层 */
.xhs-viewer-live-video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transition: opacity 0.4s ease;
  /* 清除浏览器默认样式 */
  display: block;
  background: transparent;
  border: none;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
}
.xhs-viewer-live-video.is-hidden {
  opacity: 0;
  pointer-events: none;
}
/* 隐藏所有浏览器原生控件 */
.xhs-viewer-live-video::-webkit-media-controls,
.xhs-viewer-live-video::-webkit-media-controls-panel,
.xhs-viewer-live-video::-webkit-media-controls-play-button,
.xhs-viewer-live-video::-webkit-media-controls-start-playback-button,
.xhs-viewer-live-video::-webkit-media-controls-enclosure,
.xhs-viewer-live-video::-webkit-media-controls-overlay-play-button,
.xhs-viewer-live-video::-webkit-media-controls-timeline,
.xhs-viewer-live-video::-webkit-media-controls-current-time-display,
.xhs-viewer-live-video::-webkit-media-controls-time-remaining-display,
.xhs-viewer-live-video::-webkit-media-controls-mute-button,
.xhs-viewer-live-video::-webkit-media-controls-fullscreen-button,
.xhs-viewer-live-video::-webkit-media-controls-volume-slider {
  display: none !important;
  -webkit-appearance: none;
}

.xhs-viewer-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 4px;
  -webkit-user-drag: none;
  pointer-events: none;
  transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1);
}

/* iOS 风格 LIVE 徽章 — 黄点 + 毛玻璃 */
.xhs-viewer-live-badge {
  position: absolute;
  top: 32px;
  left: 32px;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 4px 8px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: #fff;
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 1px;
  pointer-events: none;
  transition: opacity 0.3s ease;
}
.xhs-viewer-live-badge::before {
  content: '';
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #ff213a;
  flex-shrink: 0;
}

/* 视频播放中，徽章淡隐 */
.xhs-viewer-image.is-live-playing .xhs-viewer-live-badge {
  opacity: 0.2;
}

/* ====== 视频笔记播放器 ====== */
.xhs-viewer-main-video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 4px;
  z-index: 1;
  animation: xhs-video-fade-in 0.35s ease;
}
@keyframes xhs-video-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* 视频封面 + 播放按钮覆盖层 */
.xhs-viewer-video-cover {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  cursor: pointer;
  border-radius: 4px;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  transition: box-shadow 0.3s ease;
}
/* hover 时加暗色叠加层（不影响背景图） */
.xhs-viewer-video-cover::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 4px;
  background: transparent;
  transition: background 0.3s ease;
  pointer-events: none;
  z-index: 0;
}
.xhs-viewer-video-cover:hover::after {
  background: rgba(0, 0, 0, 0.18);
}

.xhs-viewer-play-btn {
  position: relative;
  z-index: 1;
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 2px solid rgba(255, 255, 255, 0.6);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s cubic-bezier(0.25, 1, 0.5, 1);
  outline: none;
  padding: 0;
}
.xhs-viewer-play-btn:hover {
  background: rgba(239, 68, 68, 0.75);
  border-color: rgba(255, 255, 255, 0.9);
  transform: scale(1.12);
  box-shadow: 0 0 32px rgba(239, 68, 68, 0.35);
}
.xhs-viewer-play-btn:active {
  transform: scale(0.92);
}
.xhs-viewer-play-btn svg {
  margin-left: 4px; /* 视觉居中（三角形偏左） */
  transition: transform 0.25s ease;
}
.xhs-viewer-play-btn:hover svg {
  transform: scale(1.1);
}

/* 视频标记（渐变紫调区别于 live 红色） */
.xhs-viewer-video-badge {
  left: auto;
  right: 32px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.55), rgba(139, 92, 246, 0.55));
  gap: 5px;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}
.xhs-viewer-video-badge::before {
  content: '▶';
  display: inline-block;
  font-size: 8px;
  width: auto;
  height: auto;
  border-radius: 0;
  background: none;
  line-height: 1;
}

/* livePhoto 播放完毕后，点击图片重新播放 */
.xhs-viewer-img-replay {
  cursor: pointer;
  pointer-events: auto;
}

/* 按压缩放反馈 */
.xhs-viewer-img-replay:active {
  transform: scale(0.97);
}

/* 桌面端 hover 提示可点击 */
@media (hover: hover) {
 /*  .xhs-viewer-img-replay:hover {
    transform: scale(1.02);
  }
  .xhs-viewer-img-replay:active {
    transform: scale(0.97);
  }*/
}

/* 导航按钮 */
.xhs-viewer-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.45);
  color: #fff;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  outline: none;
}
.xhs-viewer-nav:hover {
  background: rgba(0, 0, 0, 0.7);
}
.xhs-viewer-prev {
  left: 8px;
}
.xhs-viewer-next {
  right: 8px;
}

.xhs-viewer-counter {
  position: absolute;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  font-size: 12px;
  padding: 4px 14px;
  border-radius: 999px;
}

/* 缩略图条 */
.xhs-viewer-thumbnails {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 24px 12px;
  overflow-x: auto;
  flex-shrink: 0;
}
.xhs-viewer-thumbnails::-webkit-scrollbar {
  display: none;
}
.xhs-viewer-thumbnails {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.xhs-viewer-thumb {
  flex-shrink: 0;
  width: 56px;
  height: 56px;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: border-color 0.2s, opacity 0.2s;
  opacity: 0.5;
  position: relative;
}
.xhs-viewer-thumb:hover {
  opacity: 0.8;
}
.xhs-viewer-thumb-active {
  border-color: #fff;
  opacity: 1;
}
.xhs-viewer-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  -webkit-user-drag: none;
  pointer-events: none;
}

/* ====== 详情区域 ====== */
.xhs-viewer-detail {
  width: 100%;
  max-height: 65vh;
  min-height: 35vh;
  background: #fff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.xhs-viewer-detail-head {
  padding: 16px;
  border-bottom: 1px solid #eee;
  flex-shrink: 0;
}

.xhs-viewer-author {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.xhs-viewer-author-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.xhs-viewer-author-fallback {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #d1d5db;
  color: #fff;
  font-weight: bold;
  font-size: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.xhs-viewer-author-info {
  flex: 1;
  min-width: 0;
}
.xhs-viewer-author-name {
  font-weight: 600;
  font-size: 14px;
  color: #111;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.xhs-viewer-author-date {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}

.xhs-viewer-title {
  font-size: 16px;
  font-weight: 700;
  color: #111;
  margin: 0;
}

.xhs-viewer-detail-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 16px 24px;
  min-height: 0;
}

.xhs-viewer-creators {
  margin-bottom: 14px;
  font-size: 13px;
  color: #555;
}
.xhs-viewer-creator-row {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  padding: 2px 0;
}
.xhs-viewer-creator-label {
  color: #999;
  font-weight: 500;
  white-space: nowrap;
}

.xhs-viewer-desc {
  font-size: 14px;
  color: #333;
  line-height: 1.7;
  margin-bottom: 14px;
  white-space: pre-wrap;
  word-break: break-word;
}

.xhs-viewer-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 14px;
}
.xhs-viewer-tag {
  padding: 4px 12px;
  background: #f3f4f6;
  color: #555;
  font-size: 12px;
  border-radius: 999px;
  cursor: pointer;
  transition: background 0.2s;
}
.xhs-viewer-tag:hover {
  background: #e5e7eb;
}

.xhs-viewer-stats {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 12px 0;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
}
.xhs-viewer-stat {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  color: #777;
}

/* ====== 评论区域 ====== */
.xhs-viewer-comments {
  margin-top: 16px;
}

.xhs-viewer-comments-title {
  font-size: 14px;
  font-weight: 600;
  color: #111;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.xhs-viewer-comment {
  margin-bottom: 16px;
}

.xhs-viewer-comment-main {
  display: flex;
  gap: 10px;
}

.xhs-viewer-comment-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.xhs-viewer-comment-avatar-fallback {
  background: #e5e7eb;
  color: #fff;
  font-weight: bold;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.xhs-viewer-comment-body {
  flex: 1;
  min-width: 0;
}

.xhs-viewer-comment-header {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 4px;
}

.xhs-viewer-comment-nick {
  font-size: 13px;
  font-weight: 500;
  color: #333;
}

.xhs-viewer-comment-reply-to {
  font-size: 12px;
  color: #999;
}

.xhs-viewer-comment-meta {
  font-size: 11px;
  color: #bbb;
  margin-left: 2px;
}

.xhs-viewer-comment-content {
  font-size: 13px;
  color: #333;
  line-height: 1.6;
  word-break: break-word;
  white-space: pre-wrap;
}

.xhs-viewer-comment-footer {
  margin-top: 6px;
}

.xhs-viewer-comment-like {
  font-size: 11px;
  color: #bbb;
  display: inline-flex;
  align-items: center;
  gap: 3px;
}

/* 子评论 */
.xhs-viewer-subcomments {
  margin-top: 10px;
  margin-left: 42px;
  padding-left: 12px;
  border-left: 2px solid #f0f0f0;
}

.xhs-viewer-subcomment {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.xhs-viewer-subcomment:last-child {
  margin-bottom: 0;
}

.xhs-viewer-subcomment-avatar {
  width: 26px;
  height: 26px;
}

/* 滚动条 */
.xhs-viewer-detail-body::-webkit-scrollbar { width: 4px; }
.xhs-viewer-detail-body::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.15);
  border-radius: 2px;
}

/* ====== 桌面端布局 ====== */
@media (min-width: 768px) {
  .xhs-viewer-container {
    flex-direction: row;
  }

  .xhs-viewer-media {
    min-height: 0;
  }

  .xhs-viewer-close {
    top: 20px;
    right: 20px;
    width: 44px;
    height: 44px;
    font-size: 22px;
  }

  .xhs-viewer-nav {
    width: 48px;
    height: 48px;
    font-size: 20px;
  }
  .xhs-viewer-prev { left: 16px; }
  .xhs-viewer-next { right: 16px; }

  .xhs-viewer-thumbnails {
    padding: 8px 16px 16px;
  }

  .xhs-viewer-detail {
    width: 420px;
    height: 100%;
    max-height: none;
    box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
  }
}
</style>
