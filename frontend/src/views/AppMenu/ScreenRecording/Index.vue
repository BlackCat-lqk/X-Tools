<template>
  <div class="screen-recorder-container">
    <!-- 控制面板 -->
    <div class="control-panel">
      <div class="source-selection">
        <label class="source-option">
          <input
            type="radio"
            v-model="recordingSource"
            value="screen"
            :disabled="isRecording"
          />
          <span>录制屏幕</span>
        </label>
        <label class="source-option">
          <input
            type="radio"
            v-model="recordingSource"
            value="camera"
            :disabled="isRecording"
          />
          <span>录制摄像头</span>
        </label>
        <label class="source-option">
          <input
            type="radio"
            v-model="recordingSource"
            value="screen-camera"
            :disabled="isRecording"
          />
          <span>屏幕+摄像头</span>
        </label>
      </div>

      <div class="audio-settings">
        <label class="audio-option">
          <input
            type="checkbox"
            v-model="includeAudio"
            :disabled="isRecording"
          />
          <span>包含系统音频</span>
        </label>
        <label class="audio-option">
          <input
            type="checkbox"
            v-model="includeMicrophone"
            :disabled="isRecording"
          />
          <span>包含麦克风</span>
        </label>
      </div>

      <div class="quality-settings">
        <label>视频质量:</label>
        <select v-model="videoQuality" :disabled="isRecording">
          <option value="high">高质量</option>
          <option value="medium">中等质量</option>
          <option value="low">低质量</option>
        </select>
        
        <label>帧率:</label>
        <select v-model="frameRate" :disabled="isRecording">
          <option value="60">60 FPS</option>
          <option value="30">30 FPS</option>
          <option value="15">15 FPS</option>
        </select>
      </div>

      <div class="control-buttons">
        <button
          @click="startRecording"
          :disabled="isRecording || !isSupported"
          class="btn btn-start"
        >
          <i class="fas fa-record-vinyl"></i> 开始录制
        </button>
        <button
          @click="pauseRecording"
          :disabled="!isRecording || isPaused"
          class="btn btn-pause"
        >
          <i class="fas fa-pause"></i> 暂停
        </button>
        <button
          @click="resumeRecording"
          :disabled="!isRecording || !isPaused"
          class="btn btn-resume"
        >
          <i class="fas fa-play"></i> 继续
        </button>
        <button
          @click="stopRecording"
          :disabled="!isRecording"
          class="btn btn-stop"
        >
          <i class="fas fa-stop"></i> 停止
        </button>
        <button
          @click="downloadRecording"
          :disabled="!recordedVideoUrl"
          class="btn btn-download"
        >
          <i class="fas fa-download"></i> 下载
        </button>
      </div>

      <div class="recording-info" v-if="isRecording">
        <div class="timer">
          <i class="fas fa-clock"></i>
          {{ formatTime(recordingTime) }}
        </div>
        <div class="recording-status">
          <span class="status-dot" :class="{ paused: isPaused }"></span>
          {{ isPaused ? '已暂停' : '录制中' }}
        </div>
        <div class="file-size">
          文件大小: {{ formatFileSize(fileSize) }}
        </div>
      </div>
    </div>

    <!-- 预览区域 -->
    <div class="preview-area">
      <div class="screen-preview" ref="previewContainer">
        <video
          v-if="recordedVideoUrl && !isRecording"
          ref="playbackVideo"
          :src="recordedVideoUrl"
          controls
          class="playback-video"
        ></video>
        <div v-else class="preview-placeholder">
          <i class="fas fa-video"></i>
          <p>{{ isRecording ? '录制中...' : '预览将在这里显示' }}</p>
        </div>
      </div>

      <!-- 摄像头画中画 -->
      <div
        v-if="showCameraPreview && cameraStream"
        class="camera-preview"
        ref="cameraPreview"
      >
        <video ref="cameraVideo" autoplay muted class="camera-video"></video>
      </div>
    </div>

    <!-- 状态提示 -->
    <div v-if="!isSupported" class="browser-support-warning">
      <i class="fas fa-exclamation-triangle"></i>
      <p>您的浏览器不支持屏幕录制功能</p>
      <p>请使用 Chrome、Edge 或 Firefox 等现代浏览器</p>
    </div>

    <!-- 权限提示 -->
    <div v-if="permissionError" class="permission-error">
      <i class="fas fa-ban"></i>
      <p>权限被拒绝: {{ permissionError }}</p>
      <button @click="retryPermission" class="btn btn-retry">
        重试权限请求
      </button>
    </div>

    <!-- 录制指示器 -->
    <div v-if="isRecording" class="recording-indicator">
      <span class="recording-dot"></span>
      正在录制
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'

// 状态变量
const isRecording = ref(false)
const isPaused = ref(false)
const isSupported = ref(true)
const permissionError = ref('')
const recordingSource = ref('screen')
const includeAudio = ref(false)
const includeMicrophone = ref(false)
const videoQuality = ref('high')
const frameRate = ref(30)
const recordingTime = ref(0)
const fileSize = ref(0)

// 媒体流和录制相关
const mediaStream = ref(null)
const mediaRecorder = ref(null)
const recordedChunks = ref([])
const recordedVideoUrl = ref('')
const recordingTimer = ref(null)

// DOM 引用
const previewContainer = ref(null)
const cameraPreview = ref(null)
const cameraVideo = ref(null)
const playbackVideo = ref(null)

// 计算属性
const showCameraPreview = computed(() => {
  return (recordingSource.value === 'camera' || recordingSource.value === 'screen-camera') && 
         !recordedVideoUrl.value
})

const videoConstraints = computed(() => {
  const qualityMap = {
    high: { width: 1920, height: 1080 },
    medium: { width: 1280, height: 720 },
    low: { width: 854, height: 480 }
  }
  
  return {
    video: {
      ...qualityMap[videoQuality.value],
      frameRate: parseInt(frameRate.value),
      cursor: 'always'
    }
  }
})

// 检查浏览器支持
const checkBrowserSupport = () => {
  isSupported.value = !!(
    navigator.mediaDevices &&
    navigator.mediaDevices.getDisplayMedia &&
    window.MediaRecorder
  )
}

// 获取媒体流
const getMediaStream = async () => {
  try {
    permissionError.value = ''
    const streams = []

    // 获取屏幕流
    if (recordingSource.value !== 'camera') {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: videoConstraints.value.video,
        audio: includeAudio.value
      })
      streams.push(screenStream)

      // 监听屏幕共享停止事件
      screenStream.getVideoTracks()[0].onended = stopRecording
    }

    // 获取摄像头流
    if (recordingSource.value !== 'screen') {
      const cameraStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: includeMicrophone.value
      })
      streams.push(cameraStream)
    }

    // 合并流
    mediaStream.value = new MediaStream()
    streams.forEach(stream => {
      stream.getTracks().forEach(track => {
        mediaStream.value.addTrack(track)
      })
    })

    return mediaStream.value
  } catch (error) {
    console.error('获取媒体流失败:', error)
    permissionError.value = error.message
    throw error
  }
}

// 开始录制
const startRecording = async () => {
  try {
    recordedChunks.value = []
    recordedVideoUrl.value = ''
    fileSize.value = 0
    recordingTime.value = 0

    const stream = await getMediaStream()
    
    // 设置摄像头预览
    if (cameraVideo.value && stream) {
      cameraVideo.value.srcObject = stream
    }

    // 创建媒体录制器
    const options = {
      mimeType: 'video/webm;codecs=vp9,opus',
      videoBitsPerSecond: 5000000 // 5 Mbps
    }

    mediaRecorder.value = new MediaRecorder(stream, options)

    // 处理数据可用事件
    mediaRecorder.value.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        recordedChunks.value.push(event.data)
        fileSize.value = recordedChunks.value.reduce((total, chunk) => total + chunk.size, 0)
      }
    }

    // 处理录制停止事件
    mediaRecorder.value.onstop = () => {
      const blob = new Blob(recordedChunks.value, { type: 'video/webm' })
      recordedVideoUrl.value = URL.createObjectURL(blob)
      
      // 停止所有轨道
      if (mediaStream.value) {
        mediaStream.value.getTracks().forEach(track => track.stop())
      }
    }

    // 开始录制
    mediaRecorder.value.start(1000) // 每1秒收集一次数据
    isRecording.value = true
    isPaused.value = false

    // 开始计时器
    startTimer()

  } catch (error) {
    console.error('开始录制失败:', error)
  }
}

// 暂停录制
const pauseRecording = () => {
  if (mediaRecorder.value && mediaRecorder.value.state === 'recording') {
    mediaRecorder.value.pause()
    isPaused.value = true
    stopTimer()
  }
}

// 继续录制
const resumeRecording = () => {
  if (mediaRecorder.value && mediaRecorder.value.state === 'paused') {
    mediaRecorder.value.resume()
    isPaused.value = false
    startTimer()
  }
}

// 停止录制
const stopRecording = () => {
  if (mediaRecorder.value) {
    mediaRecorder.value.stop()
    isRecording.value = false
    isPaused.value = false
    stopTimer()
  }
}

// 下载录制内容
const downloadRecording = () => {
  if (recordedVideoUrl.value) {
    const a = document.createElement('a')
    a.href = recordedVideoUrl.value
    a.download = `screen-recording-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.webm`
    a.click()
  }
}

// 计时器函数
const startTimer = () => {
  stopTimer()
  recordingTimer.value = setInterval(() => {
    recordingTime.value++
  }, 1000)
}

const stopTimer = () => {
  if (recordingTimer.value) {
    clearInterval(recordingTimer.value)
    recordingTimer.value = null
  }
}

// 重试权限请求
const retryPermission = () => {
  permissionError.value = ''
}

// 工具函数
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 生命周期钩子
onMounted(() => {
  checkBrowserSupport()
})

onUnmounted(() => {
  stopRecording()
  if (recordedVideoUrl.value) {
    URL.revokeObjectURL(recordedVideoUrl.value)
  }
})

// 监听录制状态变化
watch(isRecording, (newVal) => {
  if (!newVal) {
    stopTimer()
  }
})
</script>

<style scoped>
.screen-recorder-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #1a1a1a;
  color: white;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.control-panel {
  padding: 20px;
  background: #2d2d2d;
  border-bottom: 1px solid #404040;
}

.source-selection,
.audio-settings,
.quality-settings {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
  flex-wrap: wrap;
  align-items: center;
}

.source-option,
.audio-option {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  background: #3d3d3d;
  transition: background 0.2s;
}

.source-option:hover,
.audio-option:hover {
  background: #4d4d4d;
}

.quality-settings {
  gap: 10px;
}

.quality-settings label {
  margin-right: 5px;
}

.quality-settings select {
  padding: 6px 10px;
  border-radius: 4px;
  border: 1px solid #555;
  background: #333;
  color: white;
  margin-right: 15px;
}

.control-buttons {
  display: flex;
  gap: 10px;
  margin: 20px 0;
  flex-wrap: wrap;
}

.btn {
  padding: 12px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-start {
  background: #ff4757;
  color: white;
}

.btn-start:hover:not(:disabled) {
  background: #ff3742;
}

.btn-pause {
  background: #ffa502;
  color: white;
}

.btn-pause:hover:not(:disabled) {
  background: #ff9a02;
}

.btn-resume {
  background: #2ed573;
  color: white;
}

.btn-resume:hover:not(:disabled) {
  background: #27c565;
}

.btn-stop {
  background: #3742fa;
  color: white;
}

.btn-stop:hover:not(:disabled) {
  background: #2f3af0;
}

.btn-download {
  background: #5352ed;
  color: white;
}

.btn-download:hover:not(:disabled) {
  background: #4847e0;
}

.btn-retry {
  background: #ff4757;
  color: white;
  margin-top: 10px;
}

.recording-info {
  display: flex;
  gap: 20px;
  align-items: center;
  padding: 15px;
  background: #2d2d2d;
  border-radius: 8px;
  margin-top: 15px;
}

.timer,
.recording-status,
.file-size {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #ff4757;
  animation: pulse 1.5s infinite;
}

.status-dot.paused {
  background: #ffa502;
  animation: none;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

.preview-area {
  flex: 1;
  position: relative;
  background: #000;
  overflow: hidden;
}

.screen-preview {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.playback-video {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.preview-placeholder {
  text-align: center;
  color: #666;
}

.preview-placeholder i {
  font-size: 48px;
  margin-bottom: 10px;
  opacity: 0.5;
}

.camera-preview {
  position: absolute;
  bottom: 20px;
  right: 20px;
  width: 200px;
  height: 150px;
  border: 2px solid #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.camera-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.browser-support-warning,
.permission-error {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  background: rgba(255, 71, 87, 0.9);
  padding: 30px;
  border-radius: 12px;
  max-width: 400px;
}

.browser-support-warning i,
.permission-error i {
  font-size: 48px;
  margin-bottom: 15px;
}

.recording-indicator {
  position: fixed;
  top: 20px;
  right: 20px;
  background: rgba(255, 71, 87, 0.9);
  padding: 10px 15px;
  border-radius: 20px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  animation: slideIn 0.3s ease;
}

.recording-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: white;
  animation: pulse 1.5s infinite;
}

@keyframes slideIn {
  from {
    transform: translateX(100px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .control-panel {
    padding: 15px;
  }
  
  .source-selection,
  .audio-settings,
  .quality-settings {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .control-buttons {
    justify-content: center;
  }
  
  .btn {
    flex: 1;
    min-width: 120px;
    justify-content: center;
  }
  
  .recording-info {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }
  
  .camera-preview {
    width: 150px;
    height: 100px;
    bottom: 10px;
    right: 10px;
  }
}
</style>