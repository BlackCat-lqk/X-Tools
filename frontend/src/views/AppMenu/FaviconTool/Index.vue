<template>
  <div class="favicon-maker">
    <div class="header">
      <h1><i class="fas fa-icons"></i> Favicon 制作工具</h1>
      <p>上传图片并生成多种尺寸的Favicon，实时预览效果</p>
    </div>

    <div class="main-content">
      <!-- 上传区域 -->
      <div class="upload-section">
        <div 
          class="drop-area" 
          :class="{ 'drag-over': isDragOver }"
          @dragover.prevent="handleDragOver"
          @dragleave="handleDragLeave"
          @drop.prevent="handleDrop"
        >
          <div v-if="!originalImage" class="upload-placeholder">
            <i class="fas fa-cloud-upload-alt"></i>
            <p>拖放图片到这里或点击上传</p>
            <p class="format-hint">支持 JPG, PNG, SVG 格式</p>
            <input 
              type="file" 
              accept="image/*" 
              @change="handleFileSelect" 
              ref="fileInputRef"
              class="file-input"
            />
          </div>
          <div v-else class="image-preview">
            <img :src="originalImage" alt="原始图片" class="original-image" />
            <button @click="clearImage" class="clear-btn">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>

        <div class="action-buttons">
          <button @click="triggerFileInput" class="btn primary">
            <i class="fas fa-folder-open"></i> 选择图片
          </button>
          <button @click="generateFavicons" :disabled="!originalImage" class="btn success">
            <i class="fas fa-magic"></i> 生成Favicon
          </button>
        </div>
      </div>

      <!-- 尺寸选择区域 -->
      <div class="size-selection">
        <h3>选择需要的尺寸</h3>
        <div class="size-options">
          <label v-for="size in availableSizes" :key="size" class="size-option">
            <input 
              type="checkbox" 
              :value="size" 
              v-model="selectedSizes" 
              class="size-checkbox"
            />
            <span class="size-label">{{ size }}×{{ size }} px</span>
          </label>
        </div>
      </div>

      <!-- 浏览器预览区域 -->
      <div class="browser-preview-section" v-if="favicons.length > 0">
        <h3>浏览器页签预览效果</h3>
        <div class="browser-tabs">
          <div class="browser-tab" v-for="favicon in favicons" :key="favicon.size">
            <div class="tab-header">
              <div class="tab-favicon">
                <img :src="favicon.dataUrl" :alt="`${favicon.size}x${favicon.size}`" />
              </div>
              <div class="tab-title">网页标题 - {{ favicon.size }}×{{ favicon.size }}</div>
              <div class="tab-controls">
                <span class="tab-close">×</span>
              </div>
            </div>
            <div class="tab-content">
              <p>此标签页显示 {{ favicon.size }}×{{ favicon.size }} 尺寸的Favicon效果</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 多场景预览 -->
      <div class="multi-preview" v-if="favicons.length > 0">
        <h3>多场景预览</h3>
        <div class="preview-scenes">
          <div class="preview-scene">
            <h4>浏览器地址栏</h4>
            <div class="address-bar">
              <div class="favicon-preview-small">
                <img :src="getFaviconBySize(16)?.dataUrl || ''" alt="16x16" />
              </div>
              <span class="url">https://example.com</span>
              <div class="security-indicator">🔒</div>
            </div>
          </div>
          
          <div class="preview-scene">
            <h4>书签栏</h4>
            <div class="bookmark-item">
              <div class="favicon-preview-small">
                <img :src="getFaviconBySize(16)?.dataUrl || ''" alt="16x16" />
              </div>
              <span class="bookmark-title">我的网站</span>
            </div>
          </div>
          
          <div class="preview-scene">
            <h4>移动设备</h4>
            <div class="mobile-preview">
              <div class="mobile-screen">
                <div class="mobile-favicon">
                  <img :src="getFaviconBySize(180)?.dataUrl || getLargestFavicon()" alt="移动设备图标" />
                </div>
                <div class="mobile-site-name">我的网站</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Favicon列表 -->
      <div class="favicon-list" v-if="favicons.length > 0">
        <h3>生成的Favicon</h3>
        <div class="favicons-grid">
          <div v-for="favicon in favicons" :key="favicon.size" class="favicon-item">
            <div class="favicon-preview">
              <img :src="favicon.dataUrl" :alt="`${favicon.size}x${favicon.size}`" />
              <div class="favicon-size">{{ favicon.size }}×{{ favicon.size }}</div>
            </div>
            <div class="favicon-actions">
              <button @click="downloadFavicon(favicon)" class="btn download-btn">
                <i class="fas fa-download"></i> 下载
              </button>
              <button @click="copyToClipboard(favicon)" class="btn copy-btn">
                <i class="fas fa-copy"></i> 复制
              </button>
            </div>
          </div>
        </div>

        <!-- 批量操作 -->
        <div class="batch-actions">
          <button @click="downloadAll" class="btn primary" :disabled="favicons.length === 0">
            <i class="fas fa-download"></i> 下载全部
          </button>
          <button @click="generateFaviconPackage" class="btn success" :disabled="favicons.length === 0">
            <i class="fas fa-file-archive"></i> 生成打包文件
          </button>
        </div>
      </div>

      <!-- 使用说明 -->
      <div class="instructions">
        <h3>使用说明</h3>
        <div class="instruction-content">
          <p>1. 上传一张高质量的图片（建议至少 256×256 像素）</p>
          <p>2. 选择需要的Favicon尺寸（通常16×16和32×32是必需的）</p>
          <p>3. 点击"生成Favicon"按钮</p>
          <p>4. 在各种预览场景中查看效果</p>
          <p>5. 下载或复制生成的Favicon</p>
          <p>6. 将Favicon文件放置在网站根目录，并在HTML中添加：</p>
          <code>&lt;link rel="icon" type="image/x-icon" href="/favicon.ico"&gt;</code>
        </div>
      </div>
    </div>

    <!-- 消息提示 -->
    <div v-if="message" class="message" :class="messageType">
      {{ message }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 响应式状态
const isDragOver = ref(false)
const originalImage = ref('')
const selectedSizes = ref([16, 32, 48, 64, 128])
const favicons = ref([])
const message = ref('')
const messageType = ref('')
const fileInputRef = ref(null)

const availableSizes = [16, 32, 48, 64, 128, 180, 192, 256]

// 触发文件选择
const triggerFileInput = () => {
  fileInputRef.value?.click()
}

// 处理文件选择
const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file && file.type.startsWith('image/')) {
    processImageFile(file)
  } else {
    showMessage('请选择有效的图片文件', 'error')
  }
}

// 处理拖放事件
const handleDragOver = () => {
  isDragOver.value = true
}

const handleDragLeave = () => {
  isDragOver.value = false
}

const handleDrop = (event) => {
  isDragOver.value = false
  const file = event.dataTransfer.files[0]
  if (file && file.type.startsWith('image/')) {
    processImageFile(file)
  } else {
    showMessage('请拖放有效的图片文件', 'error')
  }
}

// 处理图片文件
const processImageFile = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    originalImage.value = e.target.result
    favicons.value = [] // 清除之前的生成结果
  }
  reader.readAsDataURL(file)
}

// 生成Favicon
const generateFavicons = () => {
  if (!originalImage.value) {
    showMessage('请先上传图片', 'error')
    return
  }

  if (selectedSizes.value.length === 0) {
    showMessage('请至少选择一个尺寸', 'error')
    return
  }

  favicons.value = []
  
  const img = new Image()
  img.onload = () => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    selectedSizes.value.forEach(size => {
      canvas.width = size
      canvas.height = size
      
      // 清除画布
      ctx.clearRect(0, 0, size, size)
      
      // 绘制缩放后的图片
      ctx.drawImage(img, 0, 0, size, size)
      
      // 获取DataURL
      const dataUrl = canvas.toDataURL('image/png')
      
      favicons.value.push({
        size,
        dataUrl
      })
    })

    showMessage('Favicon生成成功！', 'success')
  }
  img.onerror = () => {
    showMessage('图片加载失败，请重试', 'error')
  }
  img.src = originalImage.value
}

// 根据尺寸获取Favicon
const getFaviconBySize = (size) => {
  return favicons.value.find(favicon => favicon.size === size)
}

// 获取最大的Favicon
const getLargestFavicon = () => {
  if (favicons.value.length === 0) return ''
  const largest = [...favicons.value].sort((a, b) => b.size - a.size)[0]
  return largest.dataUrl
}

// 下载单个Favicon
const downloadFavicon = async (favicon) => {
  try {
    const response = await fetch(favicon.dataUrl)
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = `favicon-${favicon.size}x${favicon.size}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    showMessage(`已下载 ${favicon.size}x${favicon.size} Favicon`, 'success')
  } catch (error) {
    showMessage('下载失败', 'error')
  }
}

// 复制到剪贴板
const copyToClipboard = async (favicon) => {
  try {
    const response = await fetch(favicon.dataUrl)
    const blob = await response.blob()
    
    await navigator.clipboard.write([
      new ClipboardItem({
        [blob.type]: blob
      })
    ])
    
    showMessage(`已复制 ${favicon.size}x${favicon.size} Favicon 到剪贴板`, 'success')
  } catch (error) {
    showMessage('复制失败，请尝试下载', 'error')
  }
}

// 下载全部
const downloadAll = () => {
  if (favicons.value.length === 0) {
    showMessage('没有可下载的Favicon', 'error')
    return
  }

  favicons.value.forEach(favicon => {
    setTimeout(() => {
      downloadFavicon(favicon)
    }, 100)
  })
}

// 生成打包文件
const generateFaviconPackage = async () => {
  showMessage('打包功能将在后续版本中提供', 'info')
}

// 清除图片
const clearImage = () => {
  originalImage.value = ''
  favicons.value = []
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

// 显示消息
const showMessage = (text, type) => {
  message.value = text
  messageType.value = type
  setTimeout(() => {
    message.value = ''
  }, 3000)
}
</script>

<style scoped>
.favicon-maker {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.header {
  text-align: center;
  margin-bottom: 30px;
}

.header h1 {
  color: #2c3e50;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.header p {
  color: #7f8c8d;
}

.main-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

.upload-section {
  grid-column: 1 / -1;
}

.drop-area {
  border: 2px dashed #3498db;
  border-radius: 8px;
  padding: 30px;
  text-align: center;
  transition: all 0.3s ease;
  min-height: 250px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.drop-area.drag-over {
  border-color: #2ecc71;
  background-color: rgba(46, 204, 113, 0.05);
}

.upload-placeholder {
  color: #7f8c8d;
}

.upload-placeholder i {
  font-size: 48px;
  margin-bottom: 15px;
  color: #3498db;
}

.format-hint {
  font-size: 12px;
  color: #95a5a6;
  margin-top: 5px;
}

.file-input {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  opacity: 0;
  cursor: pointer;
}

.original-image {
  max-width: 100%;
  max-height: 200px;
  border-radius: 4px;
}

.clear-btn {
  position: absolute;
  top: -10px;
  right: -10px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-buttons {
  display: flex;
  gap: 10px;
  margin-top: 15px;
  justify-content: center;
}

.size-selection {
  grid-column: 1;
}

.browser-preview-section {
  grid-column: 2;
}

.multi-preview {
  grid-column: 1;
}

.favicon-list {
  grid-column: 2;
}

.instructions {
  grid-column: 1 / -1;
  margin-top: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.size-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-top: 15px;
}

.size-option {
  display: flex;
  align-items: center;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.size-option:hover {
  border-color: #3498db;
  background: #f8f9fa;
}

.size-checkbox {
  margin-right: 10px;
}

/* 浏览器标签页样式 */
.browser-tabs {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 20px;
}

.browser-tab {
  border: 1px solid #e1e4e8;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.tab-header {
  display: flex;
  align-items: center;
  padding: 12px;
  background: #f6f8fa;
  border-bottom: 1px solid #e1e4e8;
}

.tab-favicon {
  width: 16px;
  height: 16px;
  margin-right: 8px;
}

.tab-favicon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.tab-title {
  flex: 1;
  font-size: 14px;
  color: #24292e;
}

.tab-controls {
  display: flex;
  gap: 8px;
}

.tab-close {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #e1e4e8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  cursor: pointer;
  color: #586069;
}

.tab-content {
  padding: 15px;
  background: white;
}

/* 多场景预览样式 */
.preview-scenes {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.preview-scene {
  background: white;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #e1e4e8;
}

.preview-scene h4 {
  margin-bottom: 12px;
  color: #2c3e50;
  font-size: 14px;
}

.address-bar {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 20px;
  border: 1px solid #e1e4e8;
}

.favicon-preview-small {
  width: 16px;
  height: 16px;
  margin-right: 8px;
}

.favicon-preview-small img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.url {
  flex: 1;
  font-size: 12px;
  color: #586069;
}

.security-indicator {
  margin-left: 8px;
  font-size: 12px;
}

.bookmark-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 4px;
  border: 1px solid #e1e4e8;
}

.bookmark-title {
  font-size: 12px;
  color: #24292e;
}

.mobile-preview {
  display: flex;
  justify-content: center;
}

.mobile-screen {
  width: 60px;
  height: 60px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 2px solid #e1e4e8;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px;
}

.mobile-favicon {
  width: 32px;
  height: 32px;
  margin-bottom: 4px;
}

.mobile-favicon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.mobile-site-name {
  font-size: 8px;
  color: #24292e;
  text-align: center;
}

/* Favicon网格样式 */
.favicons-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.favicon-item {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 15px;
  text-align: center;
}

.favicon-preview {
  margin-bottom: 15px;
}

.favicon-preview img {
  width: 64px;
  height: 64px;
  object-fit: contain;
  margin-bottom: 10px;
}

.favicon-size {
  font-weight: 500;
  color: #2c3e50;
}

.favicon-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.batch-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 30px;
}

.btn {
  padding: 10px 15px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  font-size: 14px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn.primary {
  background: #3498db;
  color: white;
}

.btn.success {
  background: #2ecc71;
  color: white;
}

.btn.warning {
  background: #f39c12;
  color: white;
}

.download-btn {
  background: #27ae60;
  color: white;
  padding: 8px 12px;
  font-size: 12px;
}

.copy-btn {
  background: #95a5a6;
  color: white;
  padding: 8px 12px;
  font-size: 12px;
}

.message {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 12px 20px;
  border-radius: 6px;
  color: white;
  font-weight: 500;
  animation: slideIn 0.3s ease;
  z-index: 1000;
}

.message.success {
  background: #2ecc71;
}

.message.error {
  background: #e74c3c;
}

.message.info {
  background: #3498db;
}

.instruction-content {
  line-height: 1.6;
}

.instruction-content code {
  background: #2c3e50;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
  display: inline-block;
  margin-top: 10px;
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

@media (max-width: 768px) {
  .main-content {
    grid-template-columns: 1fr;
  }
  
  .size-selection,
  .browser-preview-section,
  .multi-preview,
  .favicon-list {
    grid-column: 1;
  }
  
  .action-buttons,
  .batch-actions {
    flex-direction: column;
  }
  
  .size-options {
    grid-template-columns: 1fr;
  }
  
  .favicons-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .preview-scenes {
    grid-template-columns: 1fr;
  }
}
</style>