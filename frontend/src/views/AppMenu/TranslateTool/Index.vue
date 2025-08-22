<template>
  <div class="local-translator">
    <!-- 文件选择区域 -->
    <div class="file-section">
      <h3>选择词典文件</h3>
      <input
        type="file"
        accept=".json,.txt"
        @change="loadDictionaryFile"
        class="file-input"
      />
      <div v-if="selectedFileName" class="file-info">
        已选择: {{ selectedFileName }}
        <span class="word-count">({{ dictionary.length }} 个词条)</span>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="input-section">
      <textarea
        v-model="inputText"
        placeholder="请输入要翻译的文本"
        class="translation-input"
      ></textarea>
      
      <div class="language-selectors">
        <select v-model="sourceLang" class="lang-select">
          <option value="source">源语言</option>
        </select>
        
        <button @click="swapLanguages" class="swap-btn" title="切换方向">
          ↔
        </button>
        
        <select v-model="targetLang" class="lang-select">
          <option value="target">目标语言</option>
        </select>
      </div>
      
      <button 
        @click="handleTranslate" 
        :disabled="!inputText.trim() || dictionary.length === 0"
        class="translate-btn"
      >
        翻译
      </button>
    </div>

    <!-- 翻译结果 -->
    <div v-if="translatedText" class="result-section">
      <h3>翻译结果</h3>
      <div class="translation-result">
        {{ translatedText }}
      </div>
      
      <div v-if="untranslatedWords.length > 0" class="untranslated-words">
        <h4>未翻译词汇:</h4>
        <span v-for="word in untranslatedWords" :key="word" class="untranslated-word">
          {{ word }}
        </span>
      </div>
    </div>

    <!-- 词典预览 -->
    <div v-if="dictionary.length > 0" class="dictionary-preview">
      <h3>词典预览 (前20条)</h3>
      <div class="preview-list">
        <div v-for="(entry, index) in dictionary.slice(0, 20)" :key="index" class="preview-item">
          <span class="preview-source">{{ entry.source }}</span>
          <span class="preview-arrow">→</span>
          <span class="preview-target">{{ entry.target }}</span>
        </div>
        <div v-if="dictionary.length > 20" class="preview-more">
          还有 {{ dictionary.length - 20 }} 条记录...
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// 响应式状态
const inputText = ref('')
const translatedText = ref('')
const sourceLang = ref('source')
const targetLang = ref('target')
const dictionary = ref([])
const selectedFileName = ref('')
const untranslatedWords = ref([])

// 支持的词典文件格式
const supportedFormats = ref([
  { name: 'JSON 格式', example: '[{"source":"hello","target":"你好"}]' },
  { name: 'CSV/文本格式', example: 'hello,你好\nworld,世界' }
])

// 加载词典文件
const loadDictionaryFile = (event) => {
  const file = event.target.files[0]
  if (!file) return

  selectedFileName.value = file.name
  const reader = new FileReader()

  reader.onload = (e) => {
    try {
      const content = e.target.result
      
      // 尝试解析为JSON
      if (file.name.endsWith('.json')) {
        const parsed = JSON.parse(content)
        if (Array.isArray(parsed)) {
          dictionary.value = parsed.filter(item => 
            item.source && item.target
          )
        } else {
          throw new Error('JSON格式应为数组')
        }
      } 
      // 解析文本格式 (CSV或类似格式)
      else {
        const lines = content.split('\n')
        const entries = lines
          .map(line => {
            const [source, target] = line.split(/[,;\t]/).map(s => s.trim())
            return source && target ? { source, target } : null
          })
          .filter(Boolean)
        
        dictionary.value = entries
      }
      
      console.log(`成功加载 ${dictionary.value.length} 个词条`)
    } catch (error) {
      console.error('文件解析错误:', error)
      alert('文件格式错误，请选择正确的词典文件')
      dictionary.value = []
    }
  }

  reader.readAsText(file)
}

// 翻译处理
const handleTranslate = () => {
  if (!inputText.value.trim() || dictionary.value.length === 0) return

  const words = inputText.value.split(/\s+/)
  const translatedWords = []
  untranslatedWords.value = []

  words.forEach(word => {
    const cleanWord = word.replace(/[.,!?;:"]/g, '')
    const translation = dictionary.value.find(entry => 
      entry.source.toLowerCase() === cleanWord.toLowerCase()
    )
    
    if (translation) {
      translatedWords.push(translation.target)
    } else {
      translatedWords.push(cleanWord)
      if (cleanWord && !untranslatedWords.value.includes(cleanWord)) {
        untranslatedWords.value.push(cleanWord)
      }
    }
  })

  translatedText.value = translatedWords.join(' ')
}

// 切换翻译方向
const swapLanguages = () => {
  // 交换词典的源和目标
  dictionary.value = dictionary.value.map(entry => ({
    source: entry.target,
    target: entry.source
  }))
  
  // 清空当前结果
  inputText.value = ''
  translatedText.value = ''
  untranslatedWords.value = []
}

// 示例词典文件内容（用于测试）
const exampleDictionaryContent = ref({
  json: `[
  {"source": "hello", "target": "你好"},
  {"source": "world", "target": "世界"},
  {"source": "computer", "target": "电脑"},
  {"source": "programming", "target": "编程"},
  {"source": "language", "target": "语言"}
]`,
  text: `hello,你好
world,世界
computer,电脑
programming,编程
language,语言`
})
</script>

<style scoped>
.local-translator {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.file-section {
  background: #f5f7fa;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 20px;
}

.file-input {
  margin: 10px 0;
  padding: 8px;
  border: 2px dashed #ccc;
  border-radius: 5px;
  width: 100%;
}

.file-info {
  margin-top: 10px;
  color: #666;
  font-size: 14px;
}

.word-count {
  color: #4361ee;
  font-weight: 500;
}

.input-section {
  margin-bottom: 20px;
}

.translation-input {
  width: 100%;
  min-height: 100px;
  padding: 12px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 16px;
  resize: vertical;
  margin-bottom: 15px;
  font-family: inherit;
}

.language-selectors {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.lang-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  flex: 1;
}

.swap-btn {
  padding: 8px 12px;
  background: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
}

.swap-btn:hover {
  background: #e9ecef;
}

.translate-btn {
  width: 100%;
  padding: 12px;
  background: #4361ee;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s;
}

.translate-btn:hover:not(:disabled) {
  background: #3a56d4;
}

.translate-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.result-section {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 20px;
}

.translation-result {
  font-size: 18px;
  line-height: 1.6;
  margin-bottom: 15px;
  padding: 15px;
  background: white;
  border-radius: 8px;
  border-left: 4px solid #4361ee;
}

.untranslated-words {
  margin-top: 15px;
}

.untranslated-words h4 {
  margin-bottom: 8px;
  color: #666;
}

.untranslated-word {
  display: inline-block;
  background: #ffe6e6;
  color: #d32f2f;
  padding: 4px 8px;
  margin: 4px;
  border-radius: 4px;
  font-size: 12px;
}

.dictionary-preview {
  background: white;
  padding: 20px;
  border-radius: 10px;
  border: 1px solid #e1e5e9;
}

.preview-list {
  max-height: 300px;
  overflow-y: auto;
}

.preview-item {
  display: flex;
  align-items: center;
  padding: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.preview-item:last-child {
  border-bottom: none;
}

.preview-source {
  font-weight: 500;
  color: #333;
  min-width: 100px;
}

.preview-arrow {
  margin: 0 10px;
  color: #999;
}

.preview-target {
  color: #4361ee;
}

.preview-more {
  text-align: center;
  padding: 10px;
  color: #666;
  font-style: italic;
}

.format-examples {
  margin-top: 15px;
  font-size: 12px;
  color: #666;
}

.format-example {
  background: #f8f9fa;
  padding: 10px;
  border-radius: 5px;
  margin: 5px 0;
  font-family: 'Courier New', monospace;
}
</style>