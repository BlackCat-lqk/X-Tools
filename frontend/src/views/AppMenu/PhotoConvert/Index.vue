<template>
  <div class="image-converter">
    <div class="converter-header">
      <h2>图片格式转换工具</h2>
      <p>支持多种图片格式之间的相互转换</p>
    </div>

    <div class="upload-section">
      <div class="upload-area" @click="triggerFileInput" @dragover.prevent @drop="handleDrop">
        <input
          type="file"
          ref="fileInput"
          multiple
          accept="image/*"
          @change="handleFileSelect"
          class="file-input"
        />
        <div class="upload-content">
          <div class="upload-icon">🖼️</div>
          <p>点击选择图片或拖拽图片到这里</p>
          <p class="upload-hint">支持多选，最大支持 {{ maxFiles }} 张图片</p>
        </div>
      </div>
    </div>

    <div v-if="selectedFiles.length > 0" class="selected-files">
      <h3>已选择 {{ selectedFiles.length }} 张图片</h3>
      <div class="file-list">
        <div v-for="(file, index) in selectedFiles" :key="index" class="file-item">
          <img :src="file.preview" class="file-preview" />
          <div class="file-info">
            <span class="file-name">{{ file.name }}</span>
            <span class="file-format">{{ file.originalFormat }}</span>
            <span class="file-size">{{ formatFileSize(file.size) }}</span>
          </div>
          <button @click="removeFile(index)" class="remove-btn">×</button>
        </div>
      </div>
    </div>

    <div v-if="selectedFiles.length > 0" class="conversion-settings">
      <h3>转换设置</h3>
      
      <div class="settings-grid">
        <div class="setting-group">
          <label>目标格式：</label>
          <select v-model="targetFormat" class="setting-input">
            <option v-for="format in supportedFormats" :key="format" :value="format">
              {{ format.toUpperCase() }} (.{{ format }})
            </option>
          </select>
        </div>

        <div v-if="showQualitySetting" class="setting-group">
          <label>质量：</label>
          <input
            v-model="quality"
            type="range"
            min="0"
            max="100"
            step="1"
            class="setting-input"
          />
          <span>{{ quality }}%</span>
        </div>

        <div v-if="targetFormat === 'jpeg' || targetFormat === 'jpg'" class="setting-group">
          <label>背景颜色：</label>
          <input v-model="backgroundColor" type="color" class="setting-input color-input" />
        </div>

        <div class="setting-group">
          <label>输出文件名：</label>
          <input
            v-model="outputFileName"
            placeholder="输出文件名（不含扩展名）"
            class="setting-input"
          />
        </div>

        <div class="setting-group">
          <label>批量处理：</label>
          <label class="checkbox-label">
            <input type="checkbox" v-model="batchProcess" />
            <span>同时处理所有图片</span>
          </label>
        </div>
      </div>

      <div class="format-info" v-if="formatInfo[targetFormat]">
        <h4>{{ targetFormat.toUpperCase() }} 格式信息：</h4>
        <p>{{ formatInfo[targetFormat] }}</p>
      </div>
    </div>

    <div v-if="selectedFiles.length > 0" class="action-buttons">
      <button
        @click="convertImages"
        :disabled="processing"
        class="convert-btn"
      >
        {{ processing ? `转换中... (${processedCount}/${selectedFiles.length})` : '开始转换' }}
      </button>
      
      <button
        @click="downloadAll"
        :disabled="convertedImages.length === 0"
        class="download-btn"
      >
        下载全部 ({{ convertedImages.length }})
      </button>
      
      <button @click="clearAll" class="clear-btn">清空所有</button>
    </div>

    <div v-if="convertedImages.length > 0" class="results-section">
      <h3>转换结果</h3>
      <div class="results-grid">
        <div v-for="(image, index) in convertedImages" :key="index" class="result-item">
          <div class="image-comparison">
            <div class="original">
              <img :src="image.originalPreview" />
              <span class="format-badge original-badge">{{ image.originalFormat }}</span>
            </div>
            <div class="arrow">→</div>
            <div class="converted">
              <img :src="image.preview" />
              <span class="format-badge converted-badge">{{ targetFormat }}</span>
            </div>
          </div>
          <div class="result-info">
            <span class="file-name">{{ image.name }}</span>
            <span class="file-size">{{ formatFileSize(image.size) }}</span>
            <span class="reduction" :class="getReductionClass(image.sizeReduction)">
              体积 {{ image.sizeReduction > 0 ? '减少' : '增加' }} {{ Math.abs(image.sizeReduction) }}%
            </span>
          </div>
          <div class="result-actions">
            <a :href="image.url" :download="image.name" class="download-link">下载</a>
            <button @click="copyToClipboard(image.url)" class="copy-btn">复制链接</button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div class="format-support">
      <h3>支持的格式</h3>
      <div class="format-grid">
        <div v-for="format in supportedFormats" :key="format" class="format-item">
          <span class="format-name">{{ format.toUpperCase() }}</span>
          <span class="format-desc">.{{ format }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'

const maxFiles = 10
const fileInput = ref(null)

const selectedFiles = ref([])
const convertedImages = ref([])
const processing = ref(false)
const processedCount = ref(0)
const error = ref('')

const targetFormat = ref('webp')
const quality = ref(80)
const backgroundColor = ref('#ffffff')
const outputFileName = ref('')
const batchProcess = ref(true)

const supportedFormats = [
  'png', 'jpeg', 'jpg', 'webp', 'bmp', 'gif', 
  'tiff', 'tga', 'ico', 'svg'
]

const formatInfo = {
  png: 'PNG格式，支持透明背景，无损压缩，适合图标和图形',
  jpeg: 'JPEG格式，有损压缩，适合照片，文件较小',
  jpg: 'JPEG格式，有损压缩，适合照片，文件较小',
  webp: 'WebP格式，Google开发，支持有损和无损压缩，文件小质量高',
  bmp: 'BMP格式，Windows位图，无损，文件较大',
  gif: 'GIF格式，支持动画，256色限制，适合简单动画',
  tiff: 'TIFF格式，高质量，适合印刷和存档',
  tga: 'TGA格式，Truevision开发，支持透明通道',
  ico: 'ICO格式，Windows图标文件',
  svg: 'SVG格式，矢量图形，可缩放不失真'
}

const showQualitySetting = computed(() => {
  return ['jpeg', 'jpg', 'webp', 'png'].includes(targetFormat.value)
})

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event) => {
  const files = Array.from(event.target.files)
  if (selectedFiles.value.length + files.length > maxFiles) {
    error.value = `最多只能选择 ${maxFiles} 张图片`
    return
  }
  
  files.forEach(file => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const format = getFileFormat(file.name, file.type)
        selectedFiles.value.push({
          file,
          name: file.name,
          size: file.size,
          preview: e.target.result,
          originalFormat: format
        })
      }
      reader.readAsDataURL(file)
    }
  })
  
  error.value = ''
}

const handleDrop = (event) => {
  event.preventDefault()
  const files = Array.from(event.dataTransfer.files)
  if (files.length > 0) {
    handleFileSelect({ target: { files } })
  }
}

const getFileFormat = (fileName, mimeType) => {
  const extension = fileName.split('.').pop().toLowerCase()
  if (supportedFormats.includes(extension)) {
    return extension
  }
  
  // 从MIME类型推断
  const mimeMap = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/bmp': 'bmp',
    'image/tiff': 'tiff',
    'image/svg+xml': 'svg',
    'image/x-icon': 'ico'
  }
  
  return mimeMap[mimeType] || 'unknown'
}

const removeFile = (index) => {
  selectedFiles.value.splice(index, 1)
}

const convertImages = async () => {
  if (selectedFiles.value.length === 0) return
  
  processing.value = true
  processedCount.value = 0
  convertedImages.value = []
  error.value = ''
  
  const filesToProcess = batchProcess.value ? selectedFiles.value : [selectedFiles.value[0]]
  
  for (const fileData of filesToProcess) {
    try {
      const convertedImage = await convertImage(fileData)
      convertedImages.value.push(convertedImage)
    } catch (err) {
      console.error('转换图片失败:', err)
      error.value = `转换图片 ${fileData.name} 时出错`
    }
    processedCount.value++
  }
  
  processing.value = false
}

const convertImage = (fileData) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      canvas.width = img.width
      canvas.height = img.height
      
      // 绘制背景（对于JPEG等不支持透明的格式）
      if (targetFormat.value === 'jpeg' || targetFormat.value === 'jpg') {
        ctx.fillStyle = backgroundColor.value
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }
      
      // 绘制图片
      ctx.drawImage(img, 0, 0)
      
      // 转换为目标格式
      let mimeType
      switch (targetFormat.value) {
        case 'jpg':
        case 'jpeg':
          mimeType = 'image/jpeg'
          break
        case 'png':
          mimeType = 'image/png'
          break
        case 'webp':
          mimeType = 'image/webp'
          break
        case 'bmp':
          mimeType = 'image/bmp'
          break
        case 'gif':
          mimeType = 'image/gif'
          break
        case 'tiff':
          mimeType = 'image/tiff'
          break
        default:
          mimeType = 'image/png'
      }
      
      const qualityValue = showQualitySetting.value ? quality.value / 100 : 1
      const dataUrl = canvas.toDataURL(mimeType, qualityValue)
      
      // 计算文件大小变化
      const originalSize = fileData.size
      const newSize = Math.round((dataUrl.length - 'data:image/png;base64,'.length) * 0.75)
      const sizeReduction = Math.round(((originalSize - newSize) / originalSize) * 100)
      
      const outputName = outputFileName.value 
        ? `${outputFileName.value}.${targetFormat.value}`
        : `${fileData.name.split('.')[0]}.${targetFormat.value}`
      
      resolve({
        name: outputName,
        url: dataUrl,
        preview: dataUrl,
        originalPreview: fileData.preview,
        originalFormat: fileData.originalFormat,
        size: newSize,
        sizeReduction: sizeReduction
      })
    }
    
    img.onerror = reject
    img.src = fileData.preview
  })
}

const downloadAll = () => {
  convertedImages.value.forEach(image => {
    const link = document.createElement('a')
    link.href = image.url
    link.download = image.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  })
}

const copyToClipboard = async (url) => {
  try {
    await navigator.clipboard.writeText(url)
    alert('图片链接已复制到剪贴板！')
  } catch (err) {
    console.error('复制失败:', err)
    error.value = '复制失败，请手动复制'
  }
}

const clearAll = () => {
  selectedFiles.value = []
  convertedImages.value = []
  error.value = ''
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const getReductionClass = (reduction) => {
  return reduction > 0 ? 'positive' : 'negative'
}
</script>

<style scoped>
.image-converter {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.converter-header {
  text-align: center;
  margin-bottom: 30px;
}

.converter-header h2 {
  color: #2c3e50;
  margin: 0 0 10px 0;
}

.converter-header p {
  color: #7f8c8d;
  margin: 0;
}

.upload-area {
  border: 3px dashed #bdc3c7;
  border-radius: 12px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #f8f9fa;
}

.upload-area:hover {
  border-color: #3498db;
  background: #e3f2fd;
}

.file-input {
  display: none;
}

.upload-content {
  color: #7f8c8d;
}

.upload-icon {
  font-size: 48px;
  margin-bottom: 15px;
}

.upload-hint {
  font-size: 14px;
  margin-top: 10px;
  color: #95a5a6;
}

.selected-files {
  margin: 30px 0;
}

.file-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
  margin-top: 15px;
}

.file-item {
  position: relative;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  overflow: hidden;
  background: white;
}

.file-preview {
  width: 100%;
  height: 120px;
  object-fit: cover;
}

.file-info {
  padding: 10px;
}

.file-name {
  display: block;
  font-weight: 600;
  color: #2c3e50;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 14px;
}

.file-format {
  display: block;
  font-size: 12px;
  color: #3498db;
  font-weight: 600;
  margin: 2px 0;
}

.file-size {
  font-size: 12px;
  color: #7f8c8d;
}

.remove-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 50%;
  background: #e74c3c;
  color: white;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
}

.conversion-settings {
  background: white;
  border-radius: 12px;
  padding: 25px;
  margin: 30px 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.setting-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.setting-group label {
  font-weight: 600;
  color: #2c3e50;
  min-width: 100px;
}

.setting-input {
  padding: 8px 12px;
  border: 2px solid #e1e5e9;
  border-radius: 6px;
  flex: 1;
}

.color-input {
  padding: 2px;
  height: 40px;
  width: 60px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.format-info {
  background: #e8f4fd;
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid #3498db;
}

.format-info h4 {
  margin: 0 0 10px 0;
  color: #2c3e50;
}

.format-info p {
  margin: 0;
  color: #7f8c8d;
  line-height: 1.5;
}

.action-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin: 30px 0;
  flex-wrap: wrap;
}

.convert-btn, .download-btn, .clear-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.convert-btn {
  background: linear-gradient(135deg, #27ae60, #229954);
  color: white;
}

.convert-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.download-btn {
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
}

.download-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.clear-btn {
  background: #e74c3c;
  color: white;
}

.convert-btn:hover:not(:disabled),
.download-btn:hover:not(:disabled),
.clear-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.results-section {
  margin-top: 40px;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.result-item {
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  padding: 15px;
  background: white;
}

.image-comparison {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
}

.original, .converted {
  position: relative;
  width: 45%;
}

.original img, .converted img {
  width: 100%;
  height: 100px;
  object-fit: cover;
  border-radius: 6px;
}

.format-badge {
  position: absolute;
  top: 5px;
  right: 5px;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
}

.original-badge {
  background: #e74c3c;
  color: white;
}

.converted-badge {
  background: #27ae60;
  color: white;
}

.arrow {
  font-size: 20px;
  color: #7f8c8d;
  font-weight: bold;
}

.result-info {
  margin-bottom: 15px;
}

.result-info span {
  display: block;
  margin-bottom: 5px;
}

.file-name {
  font-weight: 600;
  color: #2c3e50;
}

.reduction {
  font-weight: 600;
}

.reduction.positive {
  color: #27ae60;
}

.reduction.negative {
  color: #e74c3c;
}

.result-actions {
  display: flex;
  gap: 10px;
}

.download-link, .copy-btn {
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 14px;
  text-decoration: none;
  cursor: pointer;
}

.download-link {
  background: #3498db;
  color: white;
  border: none;
}

.copy-btn {
  background: #95a5a6;
  color: white;
  border: none;
}

.error-message {
  background: #f8d7da;
  color: #721c24;
  padding: 15px;
  border-radius: 6px;
  margin: 20px 0;
  border: 1px solid #f5c6cb;
}

.format-support {
  margin-top: 40px;
}

.format-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 10px;
  margin-top: 15px;
}

.format-item {
  padding: 10px;
  background: #f8f9fa;
  border-radius: 6px;
  text-align: center;
}

.format-name {
  display: block;
  font-weight: 600;
  color: #2c3e50;
}

.format-desc {
  font-size: 12px;
  color: #7f8c8d;
}

@media (max-width: 768px) {
  .settings-grid {
    grid-template-columns: 1fr;
  }
  
  .setting-group {
    flex-direction: column;
    align-items: stretch;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .file-list,
  .results-grid,
  .format-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
  
  .image-comparison {
    flex-direction: column;
    gap: 10px;
  }
  
  .original, .converted {
    width: 100%;
  }
  
  .arrow {
    transform: rotate(90deg);
  }
}
</style>