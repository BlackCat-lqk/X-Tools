<template>
  <div class="ocr-container">
    <div class="ocr-header">
      <h1>图片文字识别工具</h1>
      <p>上传图片，智能识别其中的文字内容</p>
    </div>

    <div class="ocr-main">
      <!-- 上传区域 -->
      <div class="upload-section">
        <div
          class="upload-area"
          :class="{ 'drag-over': isDragOver, 'has-image': uploadedImage }"
          @click="triggerFileInput"
          @dragover.prevent="handleDragOver"
          @dragleave="handleDragLeave"
          @drop="handleDrop"
        >
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            @change="handleFileSelect"
            class="file-input"
          />
          
          <div v-if="!uploadedImage" class="upload-placeholder">
            <div class="upload-icon">📷</div>
            <p>点击或拖拽图片到此处</p>
            <p class="upload-hint">支持 JPG, PNG, BMP 格式</p>
          </div>

          <div v-else class="image-preview">
            <img :src="uploadedImage" alt="上传的图片" class="preview-image" />
            <button @click.stop="removeImage" class="remove-image-btn" title="移除图片">
              ✕
            </button>
          </div>
        </div>

        <div v-if="error" class="error-message">
          ❌ {{ error }}
        </div>
      </div>

      <!-- 识别选项 -->
      <div class="options-section">
        <h3>识别设置</h3>
        <div class="options-grid">
          <div class="option-group">
            <label>识别语言：</label>
            <select v-model="options.language" class="select">
              <option value="eng">英语</option>
              <option value="chi_sim">简体中文</option>
              <option value="chi_tra">繁体中文</option>
              <option value="jpn">日语</option>
              <option value="kor">韩语</option>
              <option value="fra">法语</option>
              <option value="deu">德语</option>
              <option value="spa">西班牙语</option>
              <option value="rus">俄语</option>
              <option value="ara">阿拉伯语</option>
            </select>
          </div>

          <div class="option-group">
            <label>识别模式：</label>
            <select v-model="options.ocrEngine" class="select">
              <option value="tesseract">Tesseract (标准)</option>
              <option value="fast">快速模式</option>
              <option value="accurate">精确模式</option>
            </select>
          </div>

          <div class="option-group">
            <label>图片预处理：</label>
            <div class="checkbox-group">
              <label>
                <input type="checkbox" v-model="options.enhanceContrast"> 增强对比度
              </label>
              <label>
                <input type="checkbox" v-model="options.removeNoise"> 去除噪点
              </label>
              <label>
                <input type="checkbox" v-model="options.grayscale"> 灰度处理
              </label>
            </div>
          </div>

          <div class="option-group">
            <label>输出格式：</label>
            <select v-model="options.outputFormat" class="select">
              <option value="text">纯文本</option>
              <option value="json">JSON格式</option>
              <option value="html">HTML格式</option>
            </select>
          </div>
        </div>

        <button
          @click="recognizeText"
          :disabled="!uploadedImage || isProcessing"
          class="recognize-btn"
        >
          {{ isProcessing ? '识别中...' : '开始识别' }}
          <span v-if="isProcessing" class="processing-dots"></span>
        </button>
      </div>

      <!-- 结果展示 -->
      <div v-if="results.length > 0" class="results-section">
        <div class="results-header">
          <h3>识别结果</h3>
          <div class="result-stats">
            <span>识别字数: {{ totalCharacters }}</span>
            <span v-if="averageConfidence > 0">置信度: {{ averageConfidence }}%</span>
            <span>耗时: {{ processingTime }}ms</span>
          </div>
        </div>

        <div class="results-tabs">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="{ active: activeTab === tab.id }"
            class="tab-btn"
          >
            {{ tab.label }}
          </button>
        </div>

        <div class="results-content">
          <!-- 文本结果 -->
          <div v-if="activeTab === 'text'" class="text-result">
            <div class="text-content">
              <pre>{{ currentResult.text }}</pre>
            </div>
            <div class="text-actions">
              <button @click="copyText" class="action-btn" title="复制文本">
                📋 复制
              </button>
              <button @click="downloadText" class="action-btn" title="下载文本">
                💾 下载
              </button>
              <button @click="clearResults" class="action-btn" title="清空结果">
                🗑️ 清空
              </button>
            </div>
          </div>

          <!-- 详情结果 -->
          <div v-if="activeTab === 'details' && currentResult.words && currentResult.words.length > 0" class="details-result">
            <div class="confidence-bars">
              <div
                v-for="(word, index) in currentResult.words"
                :key="index"
                class="confidence-item"
              >
                <span class="word-text">{{ word.text }}</span>
                <div class="confidence-bar">
                  <div
                    class="confidence-fill"
                    :style="{ width: word.confidence + '%' }"
                    :class="getConfidenceClass(word.confidence)"
                  ></div>
                </div>
                <span class="confidence-value">{{ word.confidence }}%</span>
              </div>
            </div>
          </div>

          <div v-else-if="activeTab === 'details'" class="no-details">
            <p>暂无详细的单词识别数据</p>
          </div>

          <!-- 历史记录 -->
          <div v-if="activeTab === 'history'" class="history-result">
            <div v-if="history.length === 0" class="no-history">
              暂无历史记录
            </div>
            <div v-else class="history-list">
              <div
                v-for="(item, index) in history"
                :key="index"
                class="history-item"
                @click="loadHistoryItem(item)"
              >
                <div class="history-preview">
                  <img :src="item.image" alt="历史图片" class="history-image" />
                  <div class="history-info">
                    <div class="history-text">
                      {{ truncateText(item.result.text, 50) }}
                    </div>
                    <div class="history-meta">
                      {{ formatDate(item.timestamp) }} · 
                      {{ item.result.text ? item.result.text.length : 0 }} 个字符
                    </div>
                  </div>
                </div>
                <button
                  @click.stop="deleteHistoryItem(index)"
                  class="delete-history-btn"
                  title="删除记录"
                >
                  🗑️
                </button>
              </div>
            </div>
            <button
              @click="clearHistory"
              class="clear-history-btn"
              :disabled="history.length === 0"
            >
              清空历史记录
            </button>
          </div>
        </div>
      </div>

      <!-- 使用提示 -->
      <div class="tips-section">
        <h3>使用提示</h3>
        <ul>
          <li>📷 确保图片清晰，文字方向正确</li>
          <li>💡 光线充足的照片识别效果更好</li>
          <li>🌐 选择正确的语言可以提高识别准确率</li>
          <li>⚙️ 复杂的背景可以尝试启用图片预处理</li>
          <li>💾 识别结果会自动保存到历史记录</li>
        </ul>
      </div>
    </div>

    <!-- 加载遮罩 -->
    <div v-if="isProcessing" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>正在识别文字...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { createWorker } from 'tesseract.js'

// 状态管理
const fileInput = ref(null)
const uploadedImage = ref('')
const isProcessing = ref(false)
const isDragOver = ref(false)
const error = ref('')
const activeTab = ref('text')
const results = ref([])
const history = ref([])

// 当前结果
const currentResult = computed(() => 
  results.value.length > 0 ? results.value[results.value.length - 1] : { text: '', words: [] }
)

// 识别选项
const options = reactive({
  language: 'chi_sim',
  ocrEngine: 'tesseract',
  enhanceContrast: true,
  removeNoise: false,
  grayscale: false,
  outputFormat: 'text'
})

// 标签页
const tabs = [
  { id: 'text', label: '文本结果' },
  { id: 'details', label: '识别详情' },
  { id: 'history', label: '历史记录' }
]

// 统计信息
const totalCharacters = computed(() => 
  currentResult.value.text ? currentResult.value.text.length : 0
)

const averageConfidence = computed(() => {
  if (!currentResult.value.words || currentResult.value.words.length === 0) return 0
  const total = currentResult.value.words.reduce((sum, word) => sum + (word.confidence || 0), 0)
  return Math.round(total / currentResult.value.words.length)
})

const processingTime = computed(() => 
  currentResult.value.processingTime || 0
)

// 文件处理
const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    processImageFile(file)
  }
}

const handleDragOver = (event) => {
  event.preventDefault()
  isDragOver.value = true
}

const handleDragLeave = () => {
  isDragOver.value = false
}

const handleDrop = (event) => {
  event.preventDefault()
  isDragOver.value = false
  
  const files = event.dataTransfer.files
  if (files.length > 0) {
    processImageFile(files[0])
  }
}

const processImageFile = (file) => {
  // 验证文件类型
  if (!file.type.startsWith('image/')) {
    error.value = '请选择图片文件'
    return
  }

  // 验证文件大小（最大10MB）
  if (file.size > 10 * 1024 * 1024) {
    error.value = '图片大小不能超过10MB'
    return
  }

  error.value = ''
  const reader = new FileReader()
  reader.onload = (e) => {
    uploadedImage.value = e.target.result
  }
  reader.readAsDataURL(file)
}

const removeImage = () => {
  uploadedImage.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// 文字识别
const recognizeText = async () => {
  if (!uploadedImage.value) return

  isProcessing.value = true
  error.value = ''

  try {
    const startTime = Date.now()
    
    // 创建Tesseract worker
    const worker = await createWorker(options.language)
    
    // 设置识别参数
    await worker.setParameters({
      tessedit_pageseg_mode: '6', // 统一文本方向
      tessedit_char_whitelist: '', // 允许所有字符
    })

    // 执行OCR识别
    const result = await worker.recognize(uploadedImage.value)
    
    const processingTime = Date.now() - startTime

    // 处理识别结果 - 修复数据结构问题
    const formattedResult = {
      text: result.data.text || '',
      words: extractWordsFromResult(result.data),
      processingTime,
      timestamp: Date.now(),
      options: { ...options }
    }

    results.value.push(formattedResult)
    saveToHistory(formattedResult)
    
    await worker.terminate()
    
  } catch (err) {
    console.error('OCR识别错误:', err)
    error.value = `识别失败: ${err.message || '请重试'}`
  } finally {
    isProcessing.value = false
  }
}

// 从Tesseract结果中提取单词信息
const extractWordsFromResult = (data) => {
  try {
    // 尝试不同的数据结构
    if (data.words && Array.isArray(data.words)) {
      return data.words.map(word => ({
        text: word.text || '',
        confidence: Math.round(word.confidence || 0),
        bbox: word.bbox || {}
      }))
    }
    
    // 如果没有words数组，尝试从symbols或lines中提取
    if (data.symbols && Array.isArray(data.symbols)) {
      return data.symbols.map(symbol => ({
        text: symbol.text || '',
        confidence: Math.round(symbol.confidence || 0),
        bbox: symbol.bbox || {}
      }))
    }
    
    // 如果都没有，返回空数组
    return []
  } catch (error) {
    console.warn('提取单词信息失败:', error)
    return []
  }
}

// 结果操作
const copyText = async () => {
  try {
    await navigator.clipboard.writeText(currentResult.value.text)
    alert('文本已复制到剪贴板！')
  } catch (err) {
    console.error('复制失败:', err)
  }
}

const downloadText = () => {
  const blob = new Blob([currentResult.value.text], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `ocr-result-${Date.now()}.txt`
  link.click()
  URL.revokeObjectURL(url)
}

const clearResults = () => {
  if (confirm('确定要清空当前结果吗？')) {
    results.value = []
  }
}

// 历史记录管理
const saveToHistory = (result) => {
  const historyItem = {
    image: uploadedImage.value,
    result: result,
    timestamp: result.timestamp
  }

  history.value.unshift(historyItem)
  
  // 限制历史记录数量
  if (history.value.length > 20) {
    history.value.pop()
  }

  // 保存到localStorage
  localStorage.setItem('ocrHistory', JSON.stringify(history.value))
}

const loadHistoryItem = (item) => {
  uploadedImage.value = item.image
  results.value.push(item.result)
  activeTab.value = 'text'
}

const deleteHistoryItem = (index) => {
  history.value.splice(index, 1)
  localStorage.setItem('ocrHistory', JSON.stringify(history.value))
}

const clearHistory = () => {
  if (confirm('确定要清空所有历史记录吗？')) {
    history.value = []
    localStorage.removeItem('ocrHistory')
  }
}

// 工具函数
const getConfidenceClass = (confidence) => {
  if (confidence >= 80) return 'high-confidence'
  if (confidence >= 60) return 'medium-confidence'
  return 'low-confidence'
}

const truncateText = (text, length) => {
  if (!text) return ''
  return text.length > length ? text.substring(0, length) + '...' : text
}

const formatDate = (timestamp) => {
  return new Date(timestamp).toLocaleString('zh-CN')
}

// 初始化
onMounted(() => {
  // 从localStorage加载历史记录
  const savedHistory = localStorage.getItem('ocrHistory')
  if (savedHistory) {
    try {
      history.value = JSON.parse(savedHistory)
    } catch (err) {
      console.error('加载历史记录失败:', err)
    }
  }
})
</script>

<style scoped>
.ocr-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.ocr-header {
  text-align: center;
  margin-bottom: 40px;
}

.ocr-header h1 {
  color: #2c3e50;
  margin: 0 0 10px 0;
}

.ocr-header p {
  color: #7f8c8d;
  margin: 0;
}

.ocr-main {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 30px;
}

.upload-section {
  margin-bottom: 30px;
}

.upload-area {
  border: 3px dashed #bdc3c7;
  border-radius: 12px;
  padding: 60px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-area:hover {
  border-color: #3498db;
}

.upload-area.drag-over {
  border-color: #27ae60;
  background: rgba(39, 174, 96, 0.1);
}

.upload-area.has-image {
  padding: 20px;
  border-style: solid;
}

.file-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.upload-placeholder {
  color: #7f8c8d;
}

.upload-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.upload-hint {
  font-size: 14px;
  margin-top: 8px;
}

.image-preview {
  position: relative;
  max-width: 100%;
}

.preview-image {
  max-width: 100%;
  max-height: 300px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.remove-image-btn {
  position: absolute;
  top: -10px;
  right: -10px;
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 50%;
  background: #e74c3c;
  color: white;
  cursor: pointer;
  font-size: 16px;
}

.error-message {
  color: #e74c3c;
  text-align: center;
  margin-top: 10px;
  font-weight: 600;
}

.options-section {
  margin-bottom: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.options-section h3 {
  margin: 0 0 20px 0;
  color: #2c3e50;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.option-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.option-group label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 14px;
}

.select {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.checkbox-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: normal;
  cursor: pointer;
}

.recognize-btn {
  width: 100%;
  padding: 15px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
  position: relative;
}

.recognize-btn:hover:not(:disabled) {
  background: #2980b9;
}

.recognize-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.processing-dots::after {
  content: '...';
  animation: dots 1.5s infinite;
}

@keyframes dots {
  0%, 20% { content: '.'; }
  40% { content: '..'; }
  60%, 100% { content: '...'; }
}

.results-section {
  margin-bottom: 30px;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
}

.results-header h3 {
  margin: 0;
  color: #2c3e50;
}

.result-stats {
  display: flex;
  gap: 20px;
  font-size: 14px;
  color: #7f8c8d;
}

.results-tabs {
  display: flex;
  border-bottom: 2px solid #e1e8ed;
  margin-bottom: 20px;
}

.tab-btn {
  padding: 12px 24px;
  border: none;
  background: none;
  cursor: pointer;
  font-weight: 600;
  color: #7f8c8d;
  border-bottom: 2px solid transparent;
  transition: all 0.3s;
}

.tab-btn:hover {
  color: #3498db;
}

.tab-btn.active {
  color: #3498db;
  border-bottom-color: #3498db;
}

.results-content {
  min-height: 200px;
}

.text-result {
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  overflow: hidden;
}

.text-content {
  padding: 20px;
  background: #f8f9fa;
  max-height: 400px;
  overflow-y: auto;
}

.text-content pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: inherit;
  line-height: 1.6;
}

.text-actions {
  padding: 15px 20px;
  background: white;
  border-top: 1px solid #e1e8ed;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.action-btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  transition: all 0.3s;
}

.action-btn:hover {
  background: #f8f9fa;
  border-color: #3498db;
}

.details-result {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.confidence-item {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 10px;
  padding: 10px;
  background: white;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.word-text {
  min-width: 100px;
  font-weight: 600;
  color: #2c3e50;
}

.confidence-bar {
  flex: 1;
  height: 20px;
  background: #ecf0f1;
  border-radius: 10px;
  overflow: hidden;
}

.confidence-fill {
  height: 100%;
  background: #27ae60;
  transition: width 0.3s;
}

.confidence-fill.high-confidence {
  background: #27ae60;
}

.confidence-fill.medium-confidence {
  background: #f39c12;
}

.confidence-fill.low-confidence {
  background: #e74c3c;
}

.confidence-value {
  min-width: 40px;
  text-align: right;
  font-weight: 600;
}

.history-result {
  padding: 20px;
}

.no-history {
  text-align: center;
  color: #7f8c8d;
  padding: 40px;
}

.history-list {
  margin-bottom: 20px;
}

.history-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px;
  margin-bottom: 10px;
  background: white;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.history-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.history-preview {
  display: flex;
  align-items: center;
  gap: 15px;
  flex: 1;
}

.history-image {
  width: 60px;
  height: 60px;
  border-radius: 6px;
  object-fit: cover;
}

.history-info {
  flex: 1;
}

.history-text {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
}

.history-meta {
  font-size: 12px;
  color: #7f8c8d;
}

.delete-history-btn {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  padding: 5px;
  opacity: 0.6;
  transition: opacity 0.3s;
}

.delete-history-btn:hover {
  opacity: 1;
}

.clear-history-btn {
  width: 100%;
  padding: 12px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.clear-history-btn:hover:not(:disabled) {
  background: #c0392b;
}

.clear-history-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.tips-section {
  padding: 20px;
  background: #e8f4fd;
  border-radius: 8px;
}

.tips-section h3 {
  margin: 0 0 15px 0;
  color: #2c3e50;
}

.tips-section ul {
  margin: 0;
  padding-left: 20px;
}

.tips-section li {
  margin-bottom: 8px;
  color: #2c3e50;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}
.no-details {
  text-align: center;
  padding: 40px;
  color: #7f8c8d;
  background: #f8f9fa;
  border-radius: 8px;
}


@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .ocr-main {
    padding: 20px;
  }
  
  .upload-area {
    padding: 40px;
    min-height: 150px;
  }
  
  .options-grid {
    grid-template-columns: 1fr;
  }
  
  .results-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .result-stats {
    flex-wrap: wrap;
    gap: 10px;
  }
  
  .confidence-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .confidence-bar {
    width: 100%;
  }
  
  .history-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .delete-history-btn {
    align-self: flex-end;
  }
}
</style>