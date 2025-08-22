<template>
  <div class="ua-analyzer">
    <div class="analyzer-header">
      <h2>UserAgent 分析工具</h2>
      <p>粘贴 UserAgent 字符串，解析设备、操作系统和浏览器信息</p>
    </div>

    <div class="input-section">
      <div class="input-group">
        <textarea
          v-model="userAgent"
          placeholder="请输入或粘贴 UserAgent 字符串，例如：Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
          class="ua-textarea"
          rows="3"
        ></textarea>
        <button @click="analyzeUA" :disabled="!userAgent.trim()" class="analyze-btn">
          分析 UserAgent
        </button>
      </div>
    </div>

    <div v-if="analysisResult" class="result-section">
      <div class="result-card">
        <h3>解析结果</h3>
        
        <div class="result-grid">
          <div class="result-item">
            <label>原始 UserAgent：</label>
            <span class="ua-original">{{ userAgent }}</span>
          </div>

          <div class="result-item">
            <label>设备类型：</label>
            <span :class="['device-type', getDeviceClass(analysisResult.device.type)]">
              {{ analysisResult.device.type || '未知' }}
            </span>
          </div>

          <div class="result-item">
            <label>操作系统：</label>
            <span class="os-info">
              {{ analysisResult.os.name || '未知' }} 
              <span v-if="analysisResult.os.version">{{ analysisResult.os.version }}</span>
            </span>
          </div>

          <div class="result-item">
            <label>浏览器：</label>
            <span class="browser-info">
              {{ analysisResult.browser.name || '未知' }}
              <span v-if="analysisResult.browser.version">v{{ analysisResult.browser.version }}</span>
            </span>
          </div>

          <div v-if="analysisResult.engine" class="result-item">
            <label>渲染引擎：</label>
            <span class="engine-info">
              {{ analysisResult.engine.name || '未知' }}
              <span v-if="analysisResult.engine.version">v{{ analysisResult.engine.version }}</span>
            </span>
          </div>

          <div v-if="analysisResult.device.model" class="result-item">
            <label>设备型号：</label>
            <span class="device-model">{{ analysisResult.device.model }}</span>
          </div>

          <div v-if="analysisResult.device.vendor" class="result-item">
            <label>设备厂商：</label>
            <span class="device-vendor">{{ analysisResult.device.vendor }}</span>
          </div>

          <div v-if="analysisResult.cpu" class="result-item">
            <label>CPU 架构：</label>
            <span class="cpu-arch">{{ analysisResult.cpu.architecture || '未知' }}</span>
          </div>
        </div>

        <div v-if="analysisResult.raw" class="raw-data">
          <h4>原始解析数据：</h4>
          <pre class="raw-json">{{ JSON.stringify(analysisResult.raw, null, 2) }}</pre>
        </div>
      </div>
    </div>

    <div v-else-if="userAgent && !analysisResult" class="loading">
      分析中...
    </div>

    <div class="sample-section">
      <h4>示例 UserAgent：</h4>
      <div class="sample-list">
        <div 
          v-for="(sample, index) in sampleUserAgents" 
          :key="index" 
          class="sample-item"
          @click="userAgent = sample.ua"
        >
          <span class="sample-desc">{{ sample.desc }}</span>
          <span class="sample-ua">{{ sample.ua }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const userAgent = ref('')
const analysisResult = ref(null)

const sampleUserAgents = ref([
  {
    desc: 'Windows Chrome',
    ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  },
  {
    desc: 'macOS Safari',
    ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15'
  },
  {
    desc: 'iPhone iOS',
    ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
  },
  {
    desc: 'Android Phone',
    ua: 'Mozilla/5.0 (Linux; Android 10; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.162 Mobile Safari/537.36'
  },
  {
    desc: 'iPad',
    ua: 'Mozilla/5.0 (iPad; CPU OS 13_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/87.0.4280.77 Mobile/15E148 Safari/604.1'
  }
])

const analyzeUA = () => {
  if (!userAgent.value.trim()) return

  analysisResult.value = null

  // 模拟分析过程
  setTimeout(() => {
    const result = parseUserAgent(userAgent.value)
    analysisResult.value = result
  }, 300)
}

const parseUserAgent = (ua) => {
  const result = {
    device: { type: '', model: '', vendor: '' },
    os: { name: '', version: '' },
    browser: { name: '', version: '' },
    engine: { name: '', version: '' },
    cpu: { architecture: '' },
    raw: {}
  }

  // 设备类型检测
  if (ua.match(/iPhone|iPod/i)) {
    result.device.type = '手机'
    result.device.vendor = 'Apple'
    result.device.model = ua.match(/iPhone|iPod/)[0]
  } else if (ua.match(/iPad/i)) {
    result.device.type = '平板'
    result.device.vendor = 'Apple'
    result.device.model = 'iPad'
  } else if (ua.match(/Android.*Mobile/i)) {
    result.device.type = '手机'
    result.device.vendor = ua.match(/Linux; Android.*?([^;)]+)/)?.[1] || 'Android'
  } else if (ua.match(/Android/i)) {
    result.device.type = '平板'
    result.device.vendor = 'Android'
  } else if (ua.match(/Windows NT/i)) {
    result.device.type = '电脑'
    result.device.vendor = 'PC'
  } else if (ua.match(/Macintosh/i)) {
    result.device.type = '电脑'
    result.device.vendor = 'Apple'
  } else {
    result.device.type = '未知设备'
  }

  // 操作系统检测
  if (ua.match(/Windows NT 10.0/i)) {
    result.os.name = 'Windows'
    result.os.version = '10'
  } else if (ua.match(/Windows NT 6.3/i)) {
    result.os.name = 'Windows'
    result.os.version = '8.1'
  } else if (ua.match(/Windows NT 6.2/i)) {
    result.os.name = 'Windows'
    result.os.version = '8'
  } else if (ua.match(/Windows NT 6.1/i)) {
    result.os.name = 'Windows'
    result.os.version = '7'
  } else if (ua.match(/Mac OS X ([0-9_]+)/i)) {
    result.os.name = 'macOS'
    result.os.version = ua.match(/Mac OS X ([0-9_]+)/)[1].replace(/_/g, '.')
  } else if (ua.match(/CPU iPhone OS ([0-9_]+)/i)) {
    result.os.name = 'iOS'
    result.os.version = ua.match(/CPU iPhone OS ([0-9_]+)/)[1].replace(/_/g, '.')
  } else if (ua.match(/Android ([0-9.]+)/i)) {
    result.os.name = 'Android'
    result.os.version = ua.match(/Android ([0-9.]+)/)[1]
  } else if (ua.match(/Linux/i)) {
    result.os.name = 'Linux'
  }

  // 浏览器检测
  if (ua.match(/Chrome\/([0-9.]+)/i) && !ua.match(/Edg/i)) {
    result.browser.name = 'Chrome'
    result.browser.version = ua.match(/Chrome\/([0-9.]+)/)[1]
  } else if (ua.match(/Safari\/([0-9.]+)/i) && !ua.match(/Chrome/i)) {
    result.browser.name = 'Safari'
    result.browser.version = ua.match(/Version\/([0-9.]+)/)?.[1] || ua.match(/Safari\/([0-9.]+)/)[1]
  } else if (ua.match(/Firefox\/([0-9.]+)/i)) {
    result.browser.name = 'Firefox'
    result.browser.version = ua.match(/Firefox\/([0-9.]+)/)[1]
  } else if (ua.match(/Edg\/([0-9.]+)/i)) {
    result.browser.name = 'Edge'
    result.browser.version = ua.match(/Edg\/([0-9.]+)/)[1]
  } else if (ua.match(/MSIE ([0-9.]+)/i)) {
    result.browser.name = 'Internet Explorer'
    result.browser.version = ua.match(/MSIE ([0-9.]+)/)[1]
  }

  // 渲染引擎
  if (ua.match(/AppleWebKit\/([0-9.]+)/i)) {
    result.engine.name = 'WebKit'
    result.engine.version = ua.match(/AppleWebKit\/([0-9.]+)/)[1]
  } else if (ua.match(/Gecko\/([0-9.]+)/i)) {
    result.engine.name = 'Gecko'
    result.engine.version = ua.match(/Gecko\/([0-9.]+)/)[1]
  }

  // CPU 架构
  if (ua.match(/x64|x86_64/i)) {
    result.cpu.architecture = 'x64'
  } else if (ua.match(/x86|i686|i386/i)) {
    result.cpu.architecture = 'x86'
  } else if (ua.match(/arm64|aarch64/i)) {
    result.cpu.architecture = 'ARM64'
  } else if (ua.match(/arm/i)) {
    result.cpu.architecture = 'ARM'
  }

  result.raw = { ua }
  return result
}

const getDeviceClass = (type) => {
  const map = {
    '手机': 'mobile',
    '平板': 'tablet',
    '电脑': 'desktop',
    '未知设备': 'unknown'
  }
  return map[type] || 'unknown'
}
</script>

<style scoped>
.ua-analyzer {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.analyzer-header {
  text-align: center;
  margin-bottom: 30px;
}

.analyzer-header h2 {
  color: #2c3e50;
  margin: 0 0 10px 0;
}

.analyzer-header p {
  color: #7f8c8d;
  margin: 0;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.ua-textarea {
  width: 100%;
  padding: 15px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-family: 'Fira Code', 'Courier New', monospace;
  font-size: 14px;
  resize: vertical;
  transition: border-color 0.3s ease;
}

.ua-textarea:focus {
  outline: none;
  border-color: #3498db;
}

.analyze-btn {
  padding: 12px 24px;
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.analyze-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
}

.analyze-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
  transform: none;
}

.result-card {
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  margin-top: 20px;
}

.result-card h3 {
  color: #2c3e50;
  margin: 0 0 20px 0;
  padding-bottom: 10px;
  border-bottom: 2px solid #ecf0f1;
}

.result-grid {
  display: grid;
  gap: 15px;
}

.result-item {
  display: flex;
  align-items: flex-start;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
}

.result-item label {
  font-weight: 600;
  color: #2c3e50;
  min-width: 120px;
  margin-right: 15px;
}

.ua-original {
  font-family: 'Fira Code', monospace;
  font-size: 12px;
  color: #7f8c8d;
  word-break: break-all;
}

.device-type {
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 14px;
}

.device-type.mobile {
  background: #e8f5e8;
  color: #27ae60;
}

.device-type.tablet {
  background: #fff3cd;
  color: #f39c12;
}

.device-type.desktop {
  background: #d6eaf8;
  color: #3498db;
}

.device-type.unknown {
  background: #f2f2f2;
  color: #7f8c8d;
}

.raw-data {
  margin-top: 25px;
  padding-top: 20px;
  border-top: 1px solid #ecf0f1;
}

.raw-data h4 {
  color: #2c3e50;
  margin: 0 0 10px 0;
}

.raw-json {
  background: #2c3e50;
  color: #ecf0f1;
  padding: 15px;
  border-radius: 6px;
  overflow-x: auto;
  font-size: 12px;
  font-family: 'Fira Code', monospace;
}

.sample-section {
  margin-top: 30px;
}

.sample-section h4 {
  color: #2c3e50;
  margin: 0 0 15px 0;
}

.sample-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.sample-item {
  padding: 12px;
  background: #f8f9fa;
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.sample-item:hover {
  background: #e3f2fd;
  border-color: #3498db;
  transform: translateX(5px);
}

.sample-desc {
  display: block;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 5px;
}

.sample-ua {
  font-family: 'Fira Code', monospace;
  font-size: 12px;
  color: #7f8c8d;
  word-break: break-all;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #7f8c8d;
  font-style: italic;
}

@media (max-width: 768px) {
  .result-item {
    flex-direction: column;
    gap: 8px;
  }
  
  .result-item label {
    min-width: auto;
  }
}
</style>