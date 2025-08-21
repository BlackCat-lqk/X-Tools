<template>
  <div class="deobfuscator-tool">
    <div class="header">
      <h1><i class="fas fa-code"></i> 代码反混淆工具</h1>
      <p>将混淆的代码转换为可读性更高的格式</p>
    </div>
    
    <div class="tool-container">
      <div class="input-section">
        <div class="section-header">
          <h3>输入混淆代码</h3>
          <div class="actions">
            <button @click="clearInput" class="action-btn">
              <i class="fas fa-trash"></i> 清空
            </button>
            <button @click="pasteFromClipboard" class="action-btn">
              <i class="fas fa-paste"></i> 粘贴
            </button>
            <button @click="loadExample" class="action-btn">
              <i class="fas fa-lightbulb"></i> 示例
            </button>
          </div>
        </div>
        
        <div class="code-area">
          <div class="language-selector">
            <select v-model="inputLanguage">
              <option v-for="lang in languages" :key="lang" :value="lang">
                {{ lang }}
              </option>
            </select>
          </div>
          <textarea 
            v-model="inputCode" 
            placeholder="粘贴或输入混淆的代码..."
            spellcheck="false"
          ></textarea>
          <div class="code-info">
            <span>行数: {{ inputLineCount }}</span>
            <span>字符数: {{ inputCharCount }}</span>
          </div>
        </div>
      </div>
      
      <div class="controls">
        <div class="process-btn-group">
          <button @click="deobfuscate" :disabled="!inputCode" class="process-btn primary">
            <i class="fas fa-cogs"></i> 反混淆代码
          </button>
          <button @click="beautify" :disabled="!inputCode" class="process-btn">
            <i class="fas fa-paint-brush"></i> 美化代码
          </button>
        </div>
        
        <div class="options">
          <h4>反混淆选项</h4>
          <div class="option-group">
            <label class="option-checkbox">
              <input type="checkbox" v-model="options.formatCode"> 格式化代码
            </label>
            <label class="option-checkbox">
              <input type="checkbox" v-model="options.renameVars"> 重命名变量
            </label>
            <label class="option-checkbox">
              <input type="checkbox" v-model="options.removeDeadCode"> 移除死代码
            </label>
            <label class="option-checkbox">
              <input type="checkbox" v-model="options.decodeStrings"> 解码字符串
            </label>
            <label class="option-checkbox">
              <input type="checkbox" v-model="options.evalExpressions"> 计算常量表达式
            </label>
          </div>
        </div>
      </div>
      
      <div class="output-section">
        <div class="section-header">
          <h3>反混淆结果</h3>
          <div class="actions">
            <button @click="copyToClipboard" :disabled="!outputCode" class="action-btn">
              <i class="fas fa-copy"></i> 复制
            </button>
            <button @click="downloadCode" :disabled="!outputCode" class="action-btn">
              <i class="fas fa-download"></i> 下载
            </button>
          </div>
        </div>
        
        <div class="code-area">
          <div class="language-selector">
            <select v-model="outputLanguage">
              <option v-for="lang in languages" :key="lang" :value="lang">
                {{ lang }}
              </option>
            </select>
          </div>
          <div class="code-output" ref="codeOutput">
            <pre v-if="outputCode">{{ outputCode }}</pre>
            <div v-else class="placeholder">
              <i class="fas fa-code"></i>
              <p>反混淆后的代码将显示在这里</p>
            </div>
          </div>
          <div class="code-info">
            <span>行数: {{ outputLineCount }}</span>
            <span>字符数: {{ outputCharCount }}</span>
            <span>减少: {{ reductionPercentage }}%</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="history-section">
      <h3>最近处理 <span class="badge">{{ history.length }}</span></h3>
      
      <div v-if="history.length > 0" class="history-list">
        <div 
          v-for="(item, index) in history" 
          :key="index" 
          class="history-item"
          @click="loadFromHistory(item)"
        >
          <div class="history-preview">
            <span class="lang-badge">{{ item.language }}</span>
            {{ item.inputPreview }}
          </div>
          <div class="history-actions">
            <span class="time">{{ formatTime(item.timestamp) }}</span>
            <button class="icon-btn" @click.stop="removeHistoryItem(index)">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
      </div>
      
      <div v-else class="empty-history">
        <i class="fas fa-history"></i>
        <p>没有历史记录</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// 响应式数据
const inputCode = ref('')
const inputLanguage = ref('JavaScript')
const outputCode = ref('')
const outputLanguage = ref('JavaScript')
const codeOutput = ref(null)

const options = ref({
  formatCode: true,
  renameVars: true,
  removeDeadCode: true,
  decodeStrings: true,
  evalExpressions: true
})

const history = ref([])

// 支持的编程语言
const languages = [
  'JavaScript', 'HTML', 'CSS', 'Python', 'Java', 
  'C++', 'C#', 'PHP', 'TypeScript', 'JSON'
]

// 示例混淆代码
const codeExamples = {
  JavaScript: `(function(){var a=0x1f4;var b=function(c,d){return c+d;};console['log'](b(a,0x64));}());`,
  HTML: `<div id="a"><p class="b">Hello</p><!--[if IE]>Special content<![endif]--></div>`,
  CSS: `#a{color:#f00;font-size:16px;}.b{display:block;width:100%;}`,
  Python: `x = "Hello World"[::-1]; print(x if True else None)`,
  Java: `public class A{public static void main(String[]a){System.out.println("Hello");}}`
}

// 计算属性
const inputLineCount = computed(() => {
  return inputCode.value ? inputCode.value.split('\n').length : 0
})

const inputCharCount = computed(() => {
  return inputCode.value ? inputCode.value.length : 0
})

const outputLineCount = computed(() => {
  return outputCode.value ? outputCode.value.split('\n').length : 0
})

const outputCharCount = computed(() => {
  return outputCode.value ? outputCode.value.length : 0
})

const reductionPercentage = computed(() => {
  if (!inputCode.value || !outputCode.value) return 0
  const reduction = inputCharCount.value - outputCharCount.value
  return Math.max(0, Math.round((reduction / inputCharCount.value) * 100))
})

// 方法
const deobfuscate = () => {
  if (!inputCode.value.trim()) return
  
  try {
    // 在实际应用中，这里应该调用专业的反混淆库或算法
    // 这里是一个简化的示例实现
    let result = inputCode.value
    
    // 应用选定的反混淆选项
    if (options.value.formatCode) {
      result = formatCode(result, inputLanguage.value)
    }
    
    if (options.value.renameVars) {
      result = renameVariables(result, inputLanguage.value)
    }
    
    if (options.value.removeDeadCode) {
      result = removeDeadCode(result, inputLanguage.value)
    }
    
    if (options.value.decodeStrings) {
      result = decodeStrings(result)
    }
    
    if (options.value.evalExpressions) {
      result = evaluateExpressions(result, inputLanguage.value)
    }
    
    outputCode.value = result
    outputLanguage.value = inputLanguage.value
    
    // 添加到历史记录
    addToHistory()
  } catch (error) {
    outputCode.value = `// 反混淆过程中出错:\n// ${error.message}`
  }
}

const beautify = () => {
  if (!inputCode.value.trim()) return
  
  try {
    // 简单的代码美化功能
    outputCode.value = formatCode(inputCode.value, inputLanguage.value)
    outputLanguage.value = inputLanguage.value
    addToHistory()
  } catch (error) {
    outputCode.value = `// 美化过程中出错:\n// ${error.message}`
  }
}

// 简化的代码格式化函数
const formatCode = (code, language) => {
  // 这里应该是实际的格式化逻辑
  // 以下是简化实现
  
  // 基本的缩进和换行格式化
  let formatted = code
    .replace(/{/g, ' {\n')
    .replace(/}/g, '\n}\n')
    .replace(/;/g, ';\n')
    .replace(/,/g, ', ')
  
  // 添加缩进
  let indentLevel = 0
  const lines = formatted.split('\n')
  formatted = lines.map(line => {
    line = line.trim()
    if (line.endsWith('}') || line.endsWith('};')) indentLevel--
    const indent = '  '.repeat(Math.max(0, indentLevel))
    if (line.endsWith('{')) indentLevel++
    return indent + line
  }).join('\n')
  
  return formatted
}

// 简化的变量重命名函数
const renameVariables = (code, language) => {
  // 这里应该是实际的变量重命名逻辑
  // 以下是简化实现
  
  // 将单字符变量名改为更有意义的名称
  return code
    .replace(/\bvar a\b/g, 'var amount')
    .replace(/\bvar b\b/g, 'var result')
    .replace(/\bvar c\b/g, 'var input')
    .replace(/\bvar d\b/g, 'var value')
    .replace(/\blet a\b/g, 'let amount')
    .replace(/\blet b\b/g, 'let result')
}

// 简化的死代码移除函数
const removeDeadCode = (code, language) => {
  // 这里应该是实际的死代码移除逻辑
  // 以下是简化实现
  
  // 移除明显的空函数和未使用的变量
  return code
    .replace(/var _0x[0-9a-f]+?=\[\];/g, '')
    .replace(/function\s+_\w+\(\)\{\}/g, '')
}

// 简化的字符串解码函数
const decodeStrings = (code) => {
  // 这里应该是实际的字符串解码逻辑
  // 以下是简化实现
  
  // 处理十六进制字符串
  return code.replace(/0x[0-9a-f]+/gi, match => {
    const num = parseInt(match, 16)
    return isNaN(num) ? match : num.toString()
  })
}

// 简化的常量表达式求值函数
const evaluateExpressions = (code, language) => {
  // 这里应该是实际的表达式求值逻辑
  // 以下是简化实现
  
  // 计算简单的数学表达式
  return code.replace(/(\d+)\s*[\+\-\*\/]\s*(\d+)/g, (match, a, op, b) => {
    const numA = parseInt(a)
    const numB = parseInt(b)
    if (isNaN(numA) || isNaN(numB)) return match
    
    switch (op) {
      case '+': return (numA + numB).toString()
      case '-': return (numA - numB).toString()
      case '*': return (numA * numB).toString()
      case '/': return (numA / numB).toString()
      default: return match
    }
  })
}

const clearInput = () => {
  inputCode.value = ''
  outputCode.value = ''
}

const pasteFromClipboard = async () => {
  try {
    const text = await navigator.clipboard.readText()
    inputCode.value = text
  } catch (error) {
    alert('无法访问剪贴板: ' + error.message)
  }
}

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(outputCode.value)
    alert('代码已复制到剪贴板')
  } catch (error) {
    alert('复制失败: ' + error.message)
  }
}

const downloadCode = () => {
  const blob = new Blob([outputCode.value], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `deobfuscated-${outputLanguage.value.toLowerCase()}.txt`
  a.click()
  URL.revokeObjectURL(url)
}

const loadExample = () => {
  inputCode.value = codeExamples[inputLanguage.value] || codeExamples.JavaScript
}

const addToHistory = () => {
  if (!inputCode.value || !outputCode.value) return
  
  history.value.unshift({
    inputCode: inputCode.value,
    outputCode: outputCode.value,
    language: inputLanguage.value,
    inputPreview: inputCode.value.substring(0, 50) + (inputCode.value.length > 50 ? '...' : ''),
    timestamp: new Date()
  })
  
  // 只保留最近10条记录
  if (history.value.length > 10) {
    history.value.pop()
  }
  
  // 保存到localStorage
  localStorage.setItem('deobfuscationHistory', JSON.stringify(history.value))
}

const loadFromHistory = (item) => {
  inputCode.value = item.inputCode
  outputCode.value = item.outputCode
  inputLanguage.value = item.language
  outputLanguage.value = item.language
}

const removeHistoryItem = (index) => {
  history.value.splice(index, 1)
  localStorage.setItem('deobfuscationHistory', JSON.stringify(history.value))
}

const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

// 生命周期
onMounted(() => {
  // 从localStorage加载历史记录
  const savedHistory = localStorage.getItem('deobfuscationHistory')
  if (savedHistory) {
    history.value = JSON.parse(savedHistory)
  }
  
  // 加载一个默认示例
  inputCode.value = codeExamples.JavaScript
})
</script>

<style scoped>
.deobfuscator-tool {
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.header {
  background: linear-gradient(120deg, #2c3e50 0%, #4ca1af 100%);
  color: white;
  padding: 25px;
  text-align: center;
}

.header h1 {
  font-size: 2.2rem;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.header p {
  font-size: 1.1rem;
  opacity: 0.9;
}

.tool-container {
  padding: 25px;
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.input-section, .output-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-header h3 {
  color: #2c3e50;
  margin: 0;
}

.actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  padding: 8px 12px;
  background: #f8f9fa;
  border: 1px solid #eaeaea;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  transition: all 0.3s;
}

.action-btn:hover {
  background: #e9ecef;
  border-color: #ced4da;
}

.code-area {
  border: 1px solid #eaeaea;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
}

.language-selector {
  padding: 10px 15px;
  background: #f8f9fa;
  border-bottom: 1px solid #eaeaea;
}

.language-selector select {
  padding: 6px 10px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  background: white;
}

.code-area textarea, .code-output {
  width: 100%;
  min-height: 300px;
  padding: 15px;
  font-family: 'Fira Code', 'Consolas', 'Monaco', monospace;
  font-size: 14px;
  line-height: 1.5;
  border: none;
  resize: vertical;
  outline: none;
  tab-size: 2;
}

.code-output {
  background: #f8f9fa;
  overflow: auto;
}

.code-output pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
}

.placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #6c757d;
  gap: 10px;
}

.placeholder i {
  font-size: 2rem;
  opacity: 0.5;
}

.code-info {
  padding: 10px 15px;
  background: #f8f9fa;
  border-top: 1px solid #eaeaea;
  display: flex;
  gap: 15px;
  font-size: 0.8rem;
  color: #6c757d;
}

.controls {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.process-btn-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.process-btn {
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
}

.process-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.process-btn.primary {
  background: #4ca1af;
  color: white;
}

.process-btn.primary:hover:not(:disabled) {
  background: #3a8d9c;
}

.process-btn:not(.primary) {
  background: white;
  border: 1px solid #ced4da;
}

.process-btn:not(.primary):hover:not(:disabled) {
  background: #e9ecef;
}

.options {
  background: white;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #eaeaea;
  min-width: 250px;
}

.options h4 {
  margin: 0 0 15px 0;
  color: #2c3e50;
}

.option-group {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}

.option-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  cursor: pointer;
}

.history-section {
  padding: 25px;
  border-top: 1px solid #eaeaea;
}

.history-section h3 {
  color: #2c3e50;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.badge {
  background: #4ca1af;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
}

.history-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}

.history-item {
  background: white;
  border: 1px solid #eaeaea;
  border-radius: 8px;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s;
}

.history-item:hover {
  border-color: #4ca1af;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

.history-preview {
  font-family: 'Fira Code', monospace;
  font-size: 0.9rem;
  color: #495057;
  display: flex;
  align-items: center;
  gap: 10px;
}

.lang-badge {
  background: #e9ecef;
  color: #495057;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
}

.history-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.time {
  font-size: 0.8rem;
  color: #6c757d;
}

.icon-btn {
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  padding: 5px;
  border-radius: 4px;
  transition: all 0.3s;
}

.icon-btn:hover {
  color: #e53e3e;
  background: #fff5f5;
}

.empty-history {
  text-align: center;
  padding: 30px;
  color: #6c757d;
  font-style: italic;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.empty-history i {
  font-size: 2rem;
  opacity: 0.5;
}

@media (max-width: 768px) {
  .tool-container {
    padding: 15px;
  }
  
  .controls {
    flex-direction: column;
  }
  
  .process-btn-group {
    flex-direction: row;
    width: 100%;
  }
  
  .process-btn {
    flex: 1;
    justify-content: center;
  }
  
  .options {
    width: 100%;
  }
  
  .option-group {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .history-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .history-actions {
    align-self: flex-end;
  }
}
</style>