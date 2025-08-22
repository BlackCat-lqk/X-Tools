<template>
  <div class="watermark-tool">
    <div class="tool-header">
      <h2>批量图片水印工具</h2>
      <p>支持批量添加文字或图片水印</p>
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
          <div class="upload-icon">📁</div>
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
            <span class="file-size">{{ formatFileSize(file.size) }}</span>
          </div>
          <button @click="removeFile(index)" class="remove-btn">×</button>
        </div>
      </div>
    </div>

    <div class="watermark-settings">
      <h3>水印设置</h3>
      
      <div class="settings-grid">
        <!-- 水印类型选择 -->
        <div class="setting-group">
          <label>水印类型：</label>
          <select v-model="watermarkType" class="setting-input">
            <option value="text">文字水印</option>
            <option value="image">图片水印</option>
          </select>
        </div>

        <!-- 文字水印设置 -->
        <template v-if="watermarkType === 'text'">
          <div class="setting-group">
            <label>水印文字：</label>
            <input v-model="textWatermark.text" placeholder="输入水印文字" class="setting-input" />
          </div>
          
          <div class="setting-group">
            <label>字体大小：</label>
            <input v-model="textWatermark.fontSize" type="number" min="12" max="100" class="setting-input" />
          </div>
          
          <div class="setting-group">
            <label>字体颜色：</label>
            <input v-model="textWatermark.color" type="color" class="setting-input color-input" />
          </div>
          
          <div class="setting-group">
            <label>字体：</label>
            <select v-model="textWatermark.fontFamily" class="setting-input">
              <option value="Arial">Arial</option>
              <option value="Microsoft YaHei">微软雅黑</option>
              <option value="SimSun">宋体</option>
              <option value="SimHei">黑体</option>
              <option value="KaiTi">楷体</option>
            </select>
          </div>
        </template>

        <!-- 图片水印设置 -->
        <template v-else>
          <div class="setting-group">
            <label>水印图片：</label>
            <input
              type="file"
              accept="image/*"
              @change="handleWatermarkImageSelect"
              class="setting-input"
            />
          </div>
          
          <div v-if="watermarkImage" class="watermark-preview">
            <img :src="watermarkImage" class="preview-img" />
          </div>
        </template>

        <!-- 通用设置 -->
        <div class="setting-group">
          <label>透明度：</label>
          <input
            v-model="watermarkOpacity"
            type="range"
            min="0.1"
            max="1"
            step="0.1"
            class="setting-input"
          />
          <span>{{ (watermarkOpacity * 100).toFixed(0) }}%</span>
        </div>

        <div class="setting-group">
          <label>水印位置：</label>
          <select v-model="watermarkPosition" class="setting-input">
            <option value="top-left">左上角</option>
            <option value="top-right">右上角</option>
            <option value="bottom-left">左下角</option>
            <option value="bottom-right">右下角</option>
            <option value="center">居中</option>
            <option value="tile">平铺</option>
          </select>
        </div>

        <div class="setting-group">
          <label>边距：</label>
          <input v-model="watermarkMargin" type="number" min="0" max="100" class="setting-input" />
          <span>像素</span>
        </div>

        <div class="setting-group">
          <label>旋转角度：</label>
          <input v-model="watermarkRotation" type="number" min="0" max="360" class="setting-input" />
          <span>度</span>
        </div>
      </div>
    </div>

    <div class="action-buttons">
      <button
        @click="processAllImages"
        :disabled="selectedFiles.length === 0 || processing"
        class="process-btn"
      >
        {{ processing ? `处理中... (${processedCount}/${selectedFiles.length})` : '开始批量处理' }}
      </button>
      
      <button
        @click="downloadAll"
        :disabled="processedImages.length === 0"
        class="download-btn"
      >
        下载全部 ({{ processedImages.length }})
      </button>
      
      <button @click="clearAll" class="clear-btn">清空所有</button>
    </div>

    <div v-if="processedImages.length > 0" class="results-section">
      <h3>处理结果</h3>
      <div class="results-grid">
        <div v-for="(image, index) in processedImages" :key="index" class="result-item">
          <img :src="image.url" class="result-image" />
          <div class="result-actions">
            <a :href="image.url" :download="image.name" class="download-link">下载</a>
          </div>
        </div>
      </div>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const maxFiles = 20
const fileInput = ref(null)
const watermarkImage = ref(null)

const selectedFiles = ref([])
const processedImages = ref([])
const processing = ref(false)
const processedCount = ref(0)
const error = ref('')

const watermarkType = ref('text')
const watermarkOpacity = ref(0.7)
const watermarkPosition = ref('bottom-right')
const watermarkMargin = ref(20)
const watermarkRotation = ref(0)

const textWatermark = reactive({
  text: '我的水印',
  fontSize: 24,
  color: '#ffffff',
  fontFamily: 'Microsoft YaHei'
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
        selectedFiles.value.push({
          file,
          name: file.name,
          size: file.size,
          preview: e.target.result
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

const handleWatermarkImageSelect = (event) => {
  const file = event.target.files[0]
  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader()
    reader.onload = (e) => {
      watermarkImage.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const removeFile = (index) => {
  selectedFiles.value.splice(index, 1)
}

const processAllImages = async () => {
  if (selectedFiles.value.length === 0) return
  
  processing.value = true
  processedCount.value = 0
  processedImages.value = []
  error.value = ''
  
  for (const fileData of selectedFiles.value) {
    try {
      const processedImage = await addWatermark(fileData)
      processedImages.value.push(processedImage)
    } catch (err) {
      console.error('处理图片失败:', err)
      error.value = `处理图片 ${fileData.name} 时出错`
    }
    processedCount.value++
  }
  
  processing.value = false
}

const addWatermark = (fileData) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      canvas.width = img.width
      canvas.height = img.height
      
      // 绘制原始图片
      ctx.drawImage(img, 0, 0)
      
      // 设置水印样式
      ctx.globalAlpha = watermarkOpacity.value
      
      if (watermarkType.value === 'text') {
        addTextWatermark(ctx, canvas.width, canvas.height)
      } else if (watermarkType.value === 'image' && watermarkImage.value) {
        addImageWatermark(ctx, canvas.width, canvas.height)
      }
      
      // 恢复透明度
      ctx.globalAlpha = 1
      
      // 转换为DataURL
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
      
      resolve({
        name: `watermarked_${fileData.name}`,
        url: dataUrl,
        originalName: fileData.name
      })
    }
    
    img.onerror = reject
    img.src = fileData.preview
  })
}

const addTextWatermark = (ctx, width, height) => {
  ctx.font = `${textWatermark.fontSize}px ${textWatermark.fontFamily}`
  ctx.fillStyle = textWatermark.color
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  
  if (watermarkPosition.value === 'tile') {
    // 平铺水印
    const spacing = textWatermark.fontSize * 3
    for (let x = spacing; x < width; x += spacing) {
      for (let y = spacing; y < height; y += spacing) {
        drawRotatedText(ctx, textWatermark.text, x, y)
      }
    }
  } else {
    // 单个水印
    const positions = {
      'top-left': [watermarkMargin.value + textWatermark.fontSize, watermarkMargin.value + textWatermark.fontSize],
      'top-right': [width - watermarkMargin.value - textWatermark.fontSize, watermarkMargin.value + textWatermark.fontSize],
      'bottom-left': [watermarkMargin.value + textWatermark.fontSize, height - watermarkMargin.value],
      'bottom-right': [width - watermarkMargin.value - textWatermark.fontSize, height - watermarkMargin.value],
      'center': [width / 2, height / 2]
    }
    
    const [x, y] = positions[watermarkPosition.value] || positions['bottom-right']
    drawRotatedText(ctx, textWatermark.text, x, y)
  }
}

const drawRotatedText = (ctx, text, x, y) => {
  if (watermarkRotation.value !== 0) {
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(watermarkRotation.value * Math.PI / 180)
    ctx.fillText(text, 0, 0)
    ctx.restore()
  } else {
    ctx.fillText(text, x, y)
  }
}

const addImageWatermark = async (ctx, width, height) => {
  const watermarkImg = new Image()
  watermarkImg.src = watermarkImage.value
  
  await new Promise((resolve) => {
    watermarkImg.onload = resolve
  })
  
  const scale = Math.min(width, height) * 0.2 / Math.max(watermarkImg.width, watermarkImg.height)
  const wmWidth = watermarkImg.width * scale
  const wmHeight = watermarkImg.height * scale
  
  if (watermarkPosition.value === 'tile') {
    // 平铺图片水印
    const spacing = wmWidth * 1.5
    for (let x = spacing; x < width; x += spacing) {
      for (let y = spacing; y < height; y += spacing) {
        drawRotatedImage(ctx, watermarkImg, x, y, wmWidth, wmHeight)
      }
    }
  } else {
    // 单个图片水印
    const positions = {
      'top-left': [watermarkMargin.value, watermarkMargin.value],
      'top-right': [width - wmWidth - watermarkMargin.value, watermarkMargin.value],
      'bottom-left': [watermarkMargin.value, height - wmHeight - watermarkMargin.value],
      'bottom-right': [width - wmWidth - watermarkMargin.value, height - wmHeight - watermarkMargin.value],
      'center': [(width - wmWidth) / 2, (height - wmHeight) / 2]
    }
    
    const [x, y] = positions[watermarkPosition.value] || positions['bottom-right']
    drawRotatedImage(ctx, watermarkImg, x, y, wmWidth, wmHeight)
  }
}

const drawRotatedImage = (ctx, img, x, y, width, height) => {
  if (watermarkRotation.value !== 0) {
    ctx.save()
    ctx.translate(x + width / 2, y + height / 2)
    ctx.rotate(watermarkRotation.value * Math.PI / 180)
    ctx.drawImage(img, -width / 2, -height / 2, width, height)
    ctx.restore()
  } else {
    ctx.drawImage(img, x, y, width, height)
  }
}

const downloadAll = () => {
  processedImages.value.forEach(image => {
    const link = document.createElement('a')
    link.href = image.url
    link.download = image.name
    link.click()
  })
}

const clearAll = () => {
  selectedFiles.value = []
  processedImages.value = []
  watermarkImage.value = null
  error.value = ''
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>

<style scoped>
.watermark-tool {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.tool-header {
  text-align: center;
  margin-bottom: 30px;
}

.tool-header h2 {
  color: #2c3e50;
  margin: 0 0 10px 0;
}

.tool-header p {
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

.watermark-settings {
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
  margin-top: 20px;
}

.setting-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.setting-group label {
  font-weight: 600;
  color: #2c3e50;
  min-width: 80px;
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
}

.watermark-preview {
  grid-column: 1 / -1;
  text-align: center;
}

.preview-img {
  max-width: 200px;
  max-height: 100px;
  border-radius: 6px;
  border: 2px solid #e1e5e9;
}

.action-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin: 30px 0;
  flex-wrap: wrap;
}

.process-btn, .download-btn, .clear-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.process-btn {
  background: linear-gradient(135deg, #27ae60, #229954);
  color: white;
}

.process-btn:disabled {
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

.process-btn:hover:not(:disabled),
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
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.result-item {
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  overflow: hidden;
  background: white;
}

.result-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.result-actions {
  padding: 15px;
  text-align: center;
}

.download-link {
  color: #3498db;
  text-decoration: none;
  font-weight: 600;
}

.download-link:hover {
  text-decoration: underline;
}

.error-message {
  background: #f8d7da;
  color: #721c24;
  padding: 15px;
  border-radius: 6px;
  margin: 20px 0;
  border: 1px solid #f5c6cb;
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
  .results-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
}
</style>