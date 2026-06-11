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
            <div v-if="isVideoNote" class="xhs-viewer-video-wrapper" @mousemove="wakeControls">
              <video
                ref="mainVideoRef"
                :src="imageData.mainVideoUrl"
                :poster="currentImage"
                class="xhs-viewer-main-video"
                playsinline
                @play="onVideoPlay"
                @pause="onVideoPause"
                @ended="onVideoEnded"
                @timeupdate="onVideoTimeUpdate"
                @loadedmetadata="onVideoLoaded"
                @progress="onVideoProgress"
                @waiting="videoLoading = true"
                @canplay="videoLoading = false"
              ></video>

              <!-- 加载旋转 -->
              <div v-if="videoLoading" class="xhs-viewer-video-spinner">
                <svg viewBox="0 0 50 50" width="44" height="44">
                  <circle cx="25" cy="25" r="20" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="3"/>
                  <circle cx="25" cy="25" r="20" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="31.4 94.2" stroke-linecap="round">
                    <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="0.8s" repeatCount="indefinite"/>
                  </circle>
                </svg>
              </div>

              <!-- 封面 + 大播放按钮（未播放时） -->
              <div v-if="!videoStarted" class="xhs-viewer-video-cover" @click.stop="playMainVideo">
                <img :src="currentImage" class="xhs-viewer-video-cover-img" alt="" />
                <button class="xhs-viewer-play-btn" @click.stop="playMainVideo">
                  <span class="xhs-viewer-play-ring"></span>
                  <svg viewBox="0 0 24 24" width="26" height="26" fill="white">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </button>
              </div>

              <!-- 自定义控制栏 -->
              <div
                v-if="videoStarted"
                class="xhs-viewer-video-controls"
                :class="{ 'is-idle': controlsIdle }"
                @mouseenter="wakeControls"
                @mouseleave="idleControls"
                @touchstart="wakeControls"
              >
                <button class="xhs-viewer-ctrl-btn" @click.stop="toggleVideoPlay">
                  <svg v-if="mainVideoPlaying" viewBox="0 0 24 24" width="18" height="18" fill="white"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
                  <svg v-else viewBox="0 0 24 24" width="18" height="18" fill="white"><path d="M8 5v14l11-7z"/></svg>
                </button>
                <span class="xhs-viewer-ctrl-time">{{ formatVideoTime(videoCurrentTime) }}</span>
                <div
                  class="xhs-viewer-ctrl-progress"
                  :class="{ 'is-dragging': isDragging }"
                  @mousedown.stop="startDrag"
                  @mousemove="onProgressHover"
                  @mouseleave="onProgressLeave"
                >
                  <div class="xhs-viewer-ctrl-track">
                    <div class="xhs-viewer-ctrl-buffered" :style="{ width: videoBufferedPercent + '%' }"></div>
                    <div class="xhs-viewer-ctrl-filled" :style="{ width: videoProgress + '%' }"></div>
                    <div class="xhs-viewer-ctrl-thumb" :style="{ left: videoProgress + '%' }"></div>
                  </div>
                  <div
                    v-if="hoverPreviewVisible"
                    class="xhs-viewer-ctrl-preview"
                    :style="{ left: hoverPreviewPos + '%' }"
                  >{{ formatVideoTime(hoverPreviewTime) }}</div>
                </div>
                <span class="xhs-viewer-ctrl-time xhs-viewer-ctrl-duration">{{ formatVideoTime(videoDuration) }}</span>
                <button class="xhs-viewer-ctrl-btn" @click.stop="toggleVideoMute">
                  <svg v-if="videoMuted" viewBox="0 0 24 24" width="18" height="18" fill="white"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>
                  <svg v-else viewBox="0 0 24 24" width="18" height="18" fill="white"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
                </button>
              </div>

              <!-- 视频标记 -->
              <div class="xhs-viewer-live-badge xhs-viewer-video-badge" title="视频笔记">VIDEO</div>
            </div>

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
                <a
                  class="xhs-viewer-author-name"
                  :href="authorSearchUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  :title="`在小红书搜索 ${imageData.author}`"
                >{{ imageData.author || '匿名用户' }}</a>
                <div class="xhs-viewer-author-date">{{ imageData.create_date }}</div>
              </div>
              <!-- 收藏按钮 -->
              <button
                v-if="noteId"
                @click.stop="$emit('toggleFavorite', noteId)"
                class="xhs-viewer-fav-btn"
                :class="{ 'is-favorited': isFavorited }"
                :title="isFavorited ? '取消收藏' : '收藏'"
              >
                <svg viewBox="0 0 24 24" :fill="isFavorited ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </button>
              <!-- 删除按钮 -->
              <button
                v-if="noteId"
                @click.stop="$emit('delete', noteId)"
                class="xhs-viewer-del-btn"
                title="删除笔记"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
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
  noteId: { type: String, default: '' },
  isFavorited: { type: Boolean, default: false },
  imageData: {
    type: Object,
    default: () => ({
      cover: '', id: '', name: '', description: '',
      singer_list: [], composer_list: [], arranger_list: [],
      lyricist_list: [], producer_list: [], youtube_media: {},
      title: '', desc: '', author: '', userId: '', authorAvatar: '',
      create_date: '', images: [], tags: [],
      views: 0, likes: 0, collects: 0, shares: 0,
      comments: [], commentCount: 0,
      noteType: 'normal', mainVideoUrl: '',
    }),
  },
})

const emit = defineEmits(['close', 'update:visible', 'toggleFavorite', 'delete'])

const currentIndex = ref(0)
const videoRef = ref(null)
const videoEnded = ref(false)
const mainVideoRef = ref(null)
const mainVideoPlaying = ref(false)
const videoStarted = ref(false)
const videoLoading = ref(false)
const videoCurrentTime = ref(0)
const videoDuration = ref(0)
const videoBuffered = ref(0)
const videoMuted = ref(false)
const controlsIdle = ref(false)
let controlsTimer = null

const videoProgress = computed(() => {
  if (!videoDuration.value) return 0
  return (videoCurrentTime.value / videoDuration.value) * 100
})
const videoBufferedPercent = computed(() => {
  if (!videoDuration.value) return 0
  return (videoBuffered.value / videoDuration.value) * 100
})

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

const authorSearchUrl = computed(() => {
  const keyword = props.imageData.userId || props.imageData.author || ''
  return `https://www.xiaohongshu.com/search_result_ai?keyword=${encodeURIComponent(keyword)}&source=web_explore_feed`
})

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

// ---- 视频事件 ----
function onVideoPlay() { mainVideoPlaying.value = true; videoStarted.value = true }
function onVideoPause() { mainVideoPlaying.value = false }
function onVideoEnded() { mainVideoPlaying.value = false; videoStarted.value = false; videoCurrentTime.value = 0 }
function onVideoTimeUpdate() {
  if (mainVideoRef.value) videoCurrentTime.value = mainVideoRef.value.currentTime
}
function onVideoLoaded() {
  if (mainVideoRef.value) videoDuration.value = mainVideoRef.value.duration || 0
}
function onVideoProgress() {
  if (mainVideoRef.value && mainVideoRef.value.buffered.length) {
    videoBuffered.value = mainVideoRef.value.buffered.end(mainVideoRef.value.buffered.length - 1)
  }
}

function resetVideo() {
  videoEnded.value = false
  mainVideoPlaying.value = false
  videoStarted.value = false
  videoLoading.value = false
  videoCurrentTime.value = 0
  videoDuration.value = 0
  videoBuffered.value = 0
  hoverPreviewVisible.value = false
  if (isDragging.value) stopDrag()
  if (mainVideoRef.value) {
    mainVideoRef.value.pause()
    mainVideoRef.value.currentTime = 0
  }
}

function playMainVideo() {
  if (mainVideoRef.value) mainVideoRef.value.play()
}

function toggleVideoPlay() {
  if (!mainVideoRef.value) return
  mainVideoPlaying.value ? mainVideoRef.value.pause() : mainVideoRef.value.play()
}

// ---- 进度条拖拽 & 悬停 ----
const isDragging = ref(false)
const hoverPreviewVisible = ref(false)
const hoverPreviewPos = ref(0)
const hoverPreviewTime = ref(0)

function getSeekRatio(e) {
  // 优先从 currentTarget（进度条自身事件），否则从全局查找（拖拽时的事件）
  const track = e.currentTarget?.querySelector?.('.xhs-viewer-ctrl-track')
    || document.querySelector('.xhs-viewer-video-controls .xhs-viewer-ctrl-track')
  if (!track) return null
  const rect = track.getBoundingClientRect()
  return Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
}

function applySeek(e) {
  const ratio = getSeekRatio(e)
  if (ratio === null || !mainVideoRef.value || !videoDuration.value) return
  mainVideoRef.value.currentTime = ratio * videoDuration.value
}

function startDrag(e) {
  e.preventDefault()
  isDragging.value = true
  applySeek(e)
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
}

function onDrag(e) {
  if (!isDragging.value) return
  applySeek(e)
  updateHover(e)
}

function stopDrag() {
  isDragging.value = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
}

function onProgressHover(e) {
  if (isDragging.value) return
  updateHover(e)
}

function updateHover(e) {
  const ratio = getSeekRatio(e)
  if (ratio === null) return
  hoverPreviewPos.value = ratio * 100
  hoverPreviewTime.value = ratio * videoDuration.value
  hoverPreviewVisible.value = true
}

function onProgressLeave() {
  if (!isDragging.value) {
    hoverPreviewVisible.value = false
  }
}

function toggleVideoMute() {
  if (!mainVideoRef.value) return
  mainVideoRef.value.muted = !mainVideoRef.value.muted
  videoMuted.value = mainVideoRef.value.muted
}

function formatVideoTime(secs) {
  if (!secs || !isFinite(secs)) return '0:00'
  const m = Math.floor(secs / 60)
  const s = Math.floor(secs % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function wakeControls() {
  controlsIdle.value = false
  if (controlsTimer) clearTimeout(controlsTimer)
  controlsTimer = setTimeout(() => { controlsIdle.value = true }, 2500)
}
function idleControls() {
  controlsTimer = setTimeout(() => { controlsIdle.value = true }, 3000)
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
  if (controlsTimer) { clearTimeout(controlsTimer); controlsTimer = null }
  if (isDragging.value) stopDrag()
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
    if (controlsTimer) { clearTimeout(controlsTimer); controlsTimer = null }
    if (isDragging.value) stopDrag()
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
.xhs-viewer-video-wrapper {
  position: absolute;
  inset: 0;
  z-index: 1;
}

.xhs-viewer-main-video {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 4px;
  animation: xhs-video-fade-in 0.35s ease;
}
@keyframes xhs-video-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* 加载旋转 */
.xhs-viewer-video-spinner {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5;
  pointer-events: none;
}

/* 封面 + 大播放按钮 */
.xhs-viewer-video-cover {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  cursor: pointer;
  border-radius: 4px;
  overflow: hidden;
}
.xhs-viewer-video-cover-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
}
/* 封面暗色叠加层 */
.xhs-viewer-video-cover::after {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.08);
  transition: background 0.3s ease;
  pointer-events: none;
  z-index: 0;
}
.xhs-viewer-video-cover:hover::after {
  background: rgba(0, 0, 0, 0.22);
}

.xhs-viewer-play-btn {
  position: relative;
  z-index: 1;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1), background 0.3s ease;
  outline: none;
  padding: 0;
}
.xhs-viewer-play-btn svg {
  margin-left: 3px;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
  transition: transform 0.3s ease;
}
/* 脉冲光环 */
.xhs-viewer-play-ring {
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.35);
  animation: xhs-play-pulse 2s ease-out infinite;
  pointer-events: none;
}
@keyframes xhs-play-pulse {
  0% { transform: scale(1); opacity: 0.7; }
  100% { transform: scale(1.25); opacity: 0; }
}
.xhs-viewer-video-cover:hover .xhs-viewer-play-btn {
  background: rgba(255, 36, 66, 0.7);
  transform: scale(1.08);
}
.xhs-viewer-video-cover:hover .xhs-viewer-play-btn svg {
  transform: scale(1.08);
}
.xhs-viewer-video-cover:active .xhs-viewer-play-btn {
  transform: scale(0.94);
}

/* ====== 自定义控制栏 ====== */
.xhs-viewer-video-controls {
  position: absolute;
  bottom: 8px;
  left: 12px;
  right: 12px;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 8px;
  height: 36px;
  padding: 0 10px;
  border-radius: 8px;
  background: linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.25) 100%);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  transition: opacity 0.4s ease;
}
.xhs-viewer-video-controls.is-idle {
  opacity: 0;
}

.xhs-viewer-ctrl-btn {
  width: 30px;
  height: 30px;
  border: none;
  background: transparent;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background 0.15s;
  flex-shrink: 0;
  outline: none;
  padding: 0;
}
.xhs-viewer-ctrl-btn:hover {
  background: rgba(255,255,255,0.15);
}

.xhs-viewer-ctrl-time {
  font-size: 11px;
  color: rgba(255,255,255,0.85);
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
  min-width: 32px;
  text-align: center;
  user-select: none;
}
.xhs-viewer-ctrl-duration {
  color: rgba(255,255,255,0.55);
}

/* 进度条 */
.xhs-viewer-ctrl-progress {
  flex: 1;
  height: 28px;
  display: flex;
  align-items: center;
  cursor: pointer;
  min-width: 0;
  position: relative;
}
.xhs-viewer-ctrl-track {
  position: relative;
  width: 100%;
  height: 4px;
  border-radius: 2px;
  background: rgba(255,255,255,0.18);
  transition: height 0.2s ease;
}
.xhs-viewer-ctrl-progress:hover .xhs-viewer-ctrl-track,
.xhs-viewer-ctrl-progress.is-dragging .xhs-viewer-ctrl-track {
  height: 6px;
}
.xhs-viewer-ctrl-progress:hover .xhs-viewer-ctrl-track {
  box-shadow: 0 0 8px rgba(255,36,66,0.3);
}
.xhs-viewer-ctrl-buffered {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  border-radius: 2px;
  background: rgba(255,255,255,0.2);
}
.xhs-viewer-ctrl-filled {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  border-radius: 2px;
  background: linear-gradient(90deg, #ff2442, #ff6b81);
  transition: width 0.1s linear;
}
.xhs-viewer-ctrl-thumb {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 2px 6px rgba(0,0,0,0.5);
  opacity: 0;
  transform-origin: center center;
  transition: opacity 0.2s ease, transform 0.2s ease;
  pointer-events: none;
}
.xhs-viewer-ctrl-progress:hover .xhs-viewer-ctrl-thumb,
.xhs-viewer-ctrl-progress.is-dragging .xhs-viewer-ctrl-thumb {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1.15);
}

/* 悬停时间预览 */
.xhs-viewer-ctrl-preview {
  position: absolute;
  bottom: calc(100% + 6px);
  transform: translateX(-50%);
  padding: 3px 7px;
  border-radius: 4px;
  background: rgba(0,0,0,0.8);
  color: #fff;
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  pointer-events: none;
  user-select: none;
}
.xhs-viewer-ctrl-preview::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 4px solid transparent;
  border-top-color: rgba(0,0,0,0.8);
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
  text-decoration: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  transition: color 0.2s ease;
}
.xhs-viewer-author-name::after {
  content: '↗';
  font-size: 11px;
  opacity: 0;
  transform: translateY(-1px);
  transition: opacity 0.2s ease;
}
.xhs-viewer-author-name:hover {
  color: #ff2442;
}
.xhs-viewer-author-name:hover::after {
  opacity: 0.6;
}
.xhs-viewer-author-date {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}

/* 详情收藏按钮 */
.xhs-viewer-fav-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: #f3f4f6;
  color: #9ca3af;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
  outline: none;
  padding: 0;
  margin-left: auto;
}
.xhs-viewer-fav-btn svg {
  width: 18px;
  height: 18px;
}
.xhs-viewer-fav-btn:hover {
  background: #fee2e2;
  color: #ef4444;
}
.xhs-viewer-fav-btn.is-favorited {
  background: #fee2e2;
  color: #ef4444;
}
.xhs-viewer-fav-btn.is-favorited:hover {
  background: #fecaca;
  color: #dc2626;
}

/* 详情删除按钮 */
.xhs-viewer-del-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: #f3f4f6;
  color: #9ca3af;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
  outline: none;
  padding: 0;
}
.xhs-viewer-del-btn svg {
  width: 18px;
  height: 18px;
}
.xhs-viewer-del-btn:hover {
  background: #fee2e2;
  color: #ef4444;
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
