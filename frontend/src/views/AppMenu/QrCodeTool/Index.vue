<template>
  <div class="qr-code-generator">
    <div class="generator-container">
      <!-- 输入区域 -->
      <div class="input-section">
        <h2>URL 转二维码</h2>
        <div class="url-input-group">
          <input
            v-model="url"
            type="url"
            placeholder="请输入要转换的URL地址"
            class="url-input"
            @keyup.enter="generateQRCode"
          >
          <button @click="generateQRCode" class="generate-btn" :disabled="!url">
            {{ isLoading ? '生成中...' : '生成二维码' }}
          </button>
        </div>
        
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
      </div>

      <!-- 自定义选项 -->
      <div class="customization-section">
        <h3>自定义选项</h3>
        <div class="options-grid">
          <!-- 尺寸设置 -->
          <div class="option-group">
            <label>尺寸：</label>
            <input
              v-model.number="options.size"
              type="range"
              min="100"
              max="500"
              step="10"
              class="slider"
            >
            <span>{{ options.size }}px</span>
          </div>

          <!-- 边距设置 -->
          <div class="option-group">
            <label>边距：</label>
            <input
              v-model.number="options.margin"
              type="range"
              min="0"
              max="20"
              step="1"
              class="slider"
            >
            <span>{{ options.margin }}px</span>
          </div>

          <!-- 颜色设置 -->
          <div class="option-group">
            <label>前景色：</label>
            <input
              v-model="options.foreground"
              type="color"
              class="color-picker"
            >
            <input
              v-model="options.foreground"
              type="text"
              class="color-input"
              placeholder="#000000"
            >
          </div>

          <div class="option-group">
            <label>背景色：</label>
            <input
              v-model="options.background"
              type="color"
              class="color-picker"
            >
            <input
              v-model="options.background"
              type="text"
              class="color-input"
              placeholder="#FFFFFF"
            >
          </div>

          <!-- 纠错等级 -->
          <div class="option-group">
            <label>纠错等级：</label>
            <select v-model="options.errorCorrectionLevel" class="select">
              <option value="L">L (低 - 7%)</option>
              <option value="M">M (中 - 15%)</option>
              <option value="Q">Q (高 - 25%)</option>
              <option value="H">H (最高 - 30%)</option>
            </select>
          </div>

          <!-- 二维码样式 -->
          <div class="option-group">
            <label>点样式：</label>
            <select v-model="options.dotsStyle" class="select">
              <option value="square">方形</option>
              <option value="rounded">圆角</option>
              <option value="dot">圆点</option>
            </select>
          </div>

          <!-- 添加Logo -->
          <div class="option-group">
            <label>添加Logo：</label>
            <input
              type="file"
              accept="image/*"
              @change="handleLogoUpload"
              class="file-input"
            >
            <button
              v-if="logo"
              @click="removeLogo"
              class="remove-logo-btn"
            >
              移除Logo
            </button>
          </div>

          <!-- Logo尺寸 -->
          <div v-if="logo" class="option-group">
            <label>Logo尺寸：</label>
            <input
              v-model.number="options.logoSize"
              type="range"
              min="20"
              max="100"
              step="5"
              class="slider"
            >
            <span>{{ options.logoSize }}%</span>
          </div>
        </div>
      </div>

      <!-- 二维码显示区域 -->
      <div class="output-section">
        <div class="qr-code-container">
          <div v-if="qrCodeDataUrl" class="qr-code-preview">
            <img
              :src="qrCodeDataUrl"
              :alt="'二维码: ' + url"
              class="qr-code-image"
              :style="{
                width: options.size + 'px',
                height: options.size + 'px'
              }"
            >
            
            <!-- Logo预览 -->
            <div v-if="logo" class="logo-overlay">
              <img
                :src="logo"
                alt="Logo"
                class="logo-image"
                :style="{
                  width: (options.size * options.logoSize / 100) + 'px',
                  height: (options.size * options.logoSize / 100) + 'px'
                }"
              >
            </div>
          </div>

          <div v-else class="placeholder">
            <div class="placeholder-icon">📱</div>
            <p>输入URL并生成二维码</p>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div v-if="qrCodeDataUrl" class="action-buttons">
          <button @click="downloadQRCode" class="action-btn download-btn">
            💾 下载二维码
          </button>
          <button @click="copyToClipboard" class="action-btn copy-btn">
            📋 复制图片
          </button>
          <button @click="shareQRCode" class="action-btn share-btn">
            🔗 分享
          </button>
          <button @click="saveToHistory" class="action-btn save-btn">
            ⭐ 保存记录
          </button>
        </div>

        <!-- 历史记录 -->
        <div v-if="history.length > 0" class="history-section">
          <h3>历史记录 ({{ history.length }})</h3>
          <div class="history-list">
            <div
              v-for="(item, index) in history"
              :key="index"
              class="history-item"
              @click="loadFromHistory(item)"
            >
              <img :src="item.qrCodeDataUrl" class="history-qr" alt="历史二维码">
              <div class="history-info">
                <div class="history-url">{{ truncateUrl(item.url) }}</div>
                <div class="history-date">{{ formatDate(item.timestamp) }}</div>
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

    <!-- 分享模态框 -->
    <div v-if="showShareModal" class="modal-overlay" @click="showShareModal = false">
      <div class="modal-content" @click.stop>
        <h3>分享二维码</h3>
        <div class="share-options">
          <button @click="copyShareLink" class="share-option">
            📋 复制链接
          </button>
          <button @click="downloadQRCode" class="share-option">
            💾 下载图片
          </button>
          <a
            :href="'mailto:?subject=二维码分享&body=请扫描此二维码: ' + url"
            class="share-option"
          >
            📧 邮件分享
          </a>
        </div>
        <button @click="showShareModal = false" class="close-modal-btn">
          关闭
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import QRCode from 'qrcode'

// 状态管理
const url = ref('')
const qrCodeDataUrl = ref('')
const isLoading = ref(false)
const error = ref('')
const logo = ref('')
const showShareModal = ref(false)
const history = ref([])

// 二维码选项
const options = reactive({
  size: 200,
  margin: 4,
  foreground: '#000000',
  background: '#ffffff',
  errorCorrectionLevel: 'M',
  dotsStyle: 'square',
  logoSize: 25
})

// 生成二维码
const generateQRCode = async () => {
  if (!url.value) {
    error.value = '请输入URL地址'
    return
  }

  // 验证URL格式
  try {
    new URL(url.value)
  } catch {
    error.value = '请输入有效的URL地址'
    return
  }

  isLoading.value = true
  error.value = ''

  try {
    const qrOptions = {
      width: options.size,
      margin: options.margin,
      color: {
        dark: options.foreground,
        light: options.background
      },
      errorCorrectionLevel: options.errorCorrectionLevel,
      type: 'image/png',
      quality: 1
    }

    qrCodeDataUrl.value = await QRCode.toDataURL(url.value, qrOptions)
  } catch (err) {
    error.value = '生成二维码失败: ' + err.message
    console.error('QR Code generation error:', err)
  } finally {
    isLoading.value = false
  }
}

// 处理Logo上传
const handleLogoUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      logo.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

// 移除Logo
const removeLogo = () => {
  logo.value = ''
}

// 下载二维码
const downloadQRCode = () => {
  if (!qrCodeDataUrl.value) return

  const link = document.createElement('a')
  link.href = qrCodeDataUrl.value
  link.download = `qrcode-${Date.now()}.png`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// 复制到剪贴板
const copyToClipboard = async () => {
  try {
    const response = await fetch(qrCodeDataUrl.value)
    const blob = await response.blob()
    await navigator.clipboard.write([
      new ClipboardItem({
        [blob.type]: blob
      })
    ])
    alert('二维码图片已复制到剪贴板！')
  } catch (err) {
    console.error('复制失败:', err)
    alert('复制失败，请尝试下载图片')
  }
}

// 分享二维码
const shareQRCode = () => {
  showShareModal.value = true
}

// 复制分享链接
const copyShareLink = async () => {
  try {
    await navigator.clipboard.writeText(url.value)
    alert('链接已复制到剪贴板！')
  } catch (err) {
    console.error('复制链接失败:', err)
  }
}

// 保存到历史记录
const saveToHistory = () => {
  if (!qrCodeDataUrl.value) return

  const historyItem = {
    url: url.value,
    qrCodeDataUrl: qrCodeDataUrl.value,
    timestamp: Date.now(),
    options: { ...options }
  }

  history.value.unshift(historyItem)
  
  // 限制历史记录数量
  if (history.value.length > 10) {
    history.value.pop()
  }

  // 保存到localStorage
  localStorage.setItem('qrCodeHistory', JSON.stringify(history.value))
  alert('已保存到历史记录！')
}

// 从历史记录加载
const loadFromHistory = (item) => {
  url.value = item.url
  qrCodeDataUrl.value = item.qrCodeDataUrl
  Object.assign(options, item.options)
}

// 删除历史记录项
const deleteHistoryItem = (index) => {
  history.value.splice(index, 1)
  localStorage.setItem('qrCodeHistory', JSON.stringify(history.value))
}

// 清空历史记录
const clearHistory = () => {
  if (confirm('确定要清空所有历史记录吗？')) {
    history.value = []
    localStorage.removeItem('qrCodeHistory')
  }
}

// 工具函数
const truncateUrl = (url) => {
  if (url.length > 30) {
    return url.substring(0, 27) + '...'
  }
  return url
}

const formatDate = (timestamp) => {
  return new Date(timestamp).toLocaleString('zh-CN')
}

// 监听选项变化，重新生成二维码
watch(options, () => {
  if (qrCodeDataUrl.value) {
    generateQRCode()
  }
}, { deep: true })

// 初始化
onMounted(() => {
  // 从localStorage加载历史记录
  const savedHistory = localStorage.getItem('qrCodeHistory')
  if (savedHistory) {
    history.value = JSON.parse(savedHistory)
  }

  // 设置默认URL（可选）
  url.value = 'https://github.com'
})
</script>

<style scoped>
.qr-code-generator {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.generator-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 30px;
}

.input-section {
  margin-bottom: 30px;
}

.input-section h2 {
  margin: 0 0 20px 0;
  color: #2c3e50;
  text-align: center;
}

.url-input-group {
  display: flex;
  gap: 12px;
  align-items: center;
  max-width: 600px;
  margin: 0 auto;
}

.url-input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.url-input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
}

.generate-btn {
  padding: 12px 24px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
}

.generate-btn:hover:not(:disabled) {
  background: #2980b9;
}

.generate-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.error-message {
  color: #e74c3c;
  text-align: center;
  margin-top: 10px;
  font-size: 14px;
}

.customization-section {
  margin-bottom: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.customization-section h3 {
  margin: 0 0 20px 0;
  color: #2c3e50;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
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

.slider {
  width: 100%;
}

.color-picker {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.color-input {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.select, .file-input {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.remove-logo-btn {
  padding: 6px 12px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}

.remove-logo-btn:hover {
  background: #c0392b;
}

.output-section {
  text-align: center;
}

.qr-code-container {
  margin-bottom: 30px;
}

.qr-code-preview {
  position: relative;
  display: inline-block;
  margin: 0 auto;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  padding: 20px;
  background: white;
}

.qr-code-image {
  border-radius: 4px;
}

.logo-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.logo-image {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.placeholder {
  padding: 60px;
  color: #7f8c8d;
  border: 2px dashed #bdc3c7;
  border-radius: 8px;
  background: #f8f9fa;
}

.placeholder-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.action-btn {
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.download-btn {
  background: #27ae60;
  color: white;
}

.download-btn:hover {
  background: #229954;
}

.copy-btn {
  background: #3498db;
  color: white;
}

.copy-btn:hover {
  background: #2980b9;
}

.share-btn {
  background: #9b59b6;
  color: white;
}

.share-btn:hover {
  background: #8e44ad;
}

.save-btn {
  background: #f39c12;
  color: white;
}

.save-btn:hover {
  background: #e67e22;
}

.history-section {
  margin-top: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.history-section h3 {
  margin: 0 0 20px 0;
  color: #2c3e50;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e1e8ed;
  cursor: pointer;
  transition: transform 0.2s;
}

.history-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.history-qr {
  width: 50px;
  height: 50px;
  border-radius: 4px;
}

.history-info {
  flex: 1;
  text-align: left;
}

.history-url {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
}

.history-date {
  font-size: 12px;
  color: #7f8c8d;
}

.delete-history-btn {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  padding: 4px;
  opacity: 0.6;
  transition: opacity 0.3s;
}

.delete-history-btn:hover {
  opacity: 1;
}

.clear-history-btn {
  padding: 8px 16px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.clear-history-btn:hover:not(:disabled) {
  background: #c0392b;
}

.clear-history-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 12px;
  text-align: center;
  max-width: 400px;
  width: 90%;
}

.modal-content h3 {
  margin: 0 0 20px 0;
  color: #2c3e50;
}

.share-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.share-option {
  padding: 12px;
  border: 2px solid #3498db;
  background: white;
  color: #3498db;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s;
}

.share-option:hover {
  background: #3498db;
  color: white;
}

.close-modal-btn {
  padding: 10px 20px;
  background: #95a5a6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.close-modal-btn:hover {
  background: #7f8c8d;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .generator-container {
    padding: 20px;
  }
  
  .url-input-group {
    flex-direction: column;
  }
  
  .options-grid {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .history-item {
    flex-direction: column;
    text-align: center;
  }
  
  .history-info {
    text-align: center;
  }
}
</style>