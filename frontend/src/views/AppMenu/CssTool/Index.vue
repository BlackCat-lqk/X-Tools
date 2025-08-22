<template>
  <div class="css-tool">
    <div class="tool-header">
      <h2>CSS 处理工具</h2>
    </div>
    
    <div class="input-section">
      <textarea 
        v-model="inputCSS" 
        placeholder="请输入CSS代码" 
        class="css-textarea"
        spellcheck="false"
      ></textarea>
    </div>

    <div class="control-buttons">
      <button @click="formatCSS" class="btn btn-format">格式化代码</button>
      <button @click="purifyCSS" class="btn btn-purify">净化代码</button>
      <button @click="organizeCSS" class="btn btn-organize">整理属性顺序</button>
      <button @click="optimizeCSS" class="btn btn-optimize">优化简写属性</button>
      <button @click="compressCSS" class="btn btn-compress">压缩代码</button>
      <button @click="processAll" class="btn btn-all">全部处理</button>
      <button @click="copyOutput" class="btn btn-copy">复制结果</button>
      <button @click="clearAll" class="btn btn-clear">清空</button>
    </div>

    <div class="output-section">
      <textarea 
        v-model="outputCSS" 
        placeholder="处理结果将显示在这里" 
        class="css-textarea output"
        readonly
        spellcheck="false"
      ></textarea>
    </div>

    <div class="stats" v-if="outputCSS">
      <span>原始大小: {{ originalSize }} 字符</span>
      <span>处理后: {{ processedSize }} 字符</span>
      <span>压缩率: {{ compressionRate }}%</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const inputCSS = ref('')
const outputCSS = ref('')

const originalSize = computed(() => inputCSS.value.length)
const processedSize = computed(() => outputCSS.value.length)
const compressionRate = computed(() => {
  if (!originalSize.value) return 0
  return Math.round((1 - processedSize.value / originalSize.value) * 100)
})

const formatCSS = () => {
  if (!inputCSS.value.trim()) return
  
  let formatted = inputCSS.value
    .replace(/\/\*[\s\S]*?\*\//g, '') // 移除注释
    .replace(/\s*{\s*/g, ' {\n  ')
    .replace(/\s*}\s*/g, '\n}\n\n')
    .replace(/\s*;\s*/g, ';\n  ')
    .replace(/\s*,\s*/g, ', ')
    .replace(/;\s*}/g, '\n}')
    .trim()
  
  outputCSS.value = formatted
}

const purifyCSS = () => {
  if (!inputCSS.value.trim()) return
  
  let purified = inputCSS.value
    .replace(/\/\*[\s\S]*?\*\//g, '') // 移除注释
    .replace(/\s+/g, ' ') // 合并多个空格
    .replace(/\s*([{}:;,])\s*/g, '$1') // 清理符号周围的空格
    .trim()
  
  outputCSS.value = purified
}

const organizeCSS = () => {
  if (!inputCSS.value.trim()) return
  
  const propertyOrder = [
    'position', 'z-index', 'top', 'right', 'bottom', 'left',
    'display', 'flex', 'flex-direction', 'flex-wrap', 'justify-content', 'align-items', 'align-content',
    'width', 'height', 'min-width', 'min-height', 'max-width', 'max-height',
    'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
    'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
    'border', 'border-radius', 'box-shadow',
    'background', 'background-color', 'background-image', 'background-position', 'background-size',
    'color', 'font', 'font-family', 'font-size', 'font-weight', 'line-height', 'text-align',
    'opacity', 'transform', 'transition', 'animation'
  ]
  
  let organized = inputCSS.value.replace(/{\s*([^}]+)\s*}/g, (match, content) => {
    const properties = content.split(';').filter(prop => prop.trim())
    const sortedProperties = properties.sort((a, b) => {
      const aName = a.split(':')[0].trim()
      const bName = b.split(':')[0].trim()
      const aIndex = propertyOrder.findIndex(p => aName.startsWith(p))
      const bIndex = propertyOrder.findIndex(p => bName.startsWith(p))
      return (aIndex === -1 ? Infinity : aIndex) - (bIndex === -1 ? Infinity : bIndex)
    })
    return `{ ${sortedProperties.join('; ')} }`
  })
  
  outputCSS.value = organized
}

const optimizeCSS = () => {
  if (!inputCSS.value.trim()) return
  
  let optimized = inputCSS.value
    .replace(/margin-top:\s*([^;]+);\s*margin-right:\s*([^;]+);\s*margin-bottom:\s*([^;]+);\s*margin-left:\s*([^;]+);/g, 
            'margin: $1 $2 $3 $4;')
    .replace(/padding-top:\s*([^;]+);\s*padding-right:\s*([^;]+);\s*padding-bottom:\s*([^;]+);\s*padding-left:\s*([^;]+);/g,
            'padding: $1 $2 $3 $4;')
    .replace(/border-width:\s*([^;]+);\s*border-style:\s*([^;]+);\s*border-color:\s*([^;]+);/g,
            'border: $1 $2 $3;')
  
  outputCSS.value = optimized
}

const compressCSS = () => {
  if (!inputCSS.value.trim()) return
  
  let compressed = inputCSS.value
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{}:;,])\s*/g, '$1')
    .replace(/;}/g, '}')
    .replace(/:\s*0px/g, ':0')
    .replace(/:\s*0em/g, ':0')
    .replace(/:\s*0rem/g, ':0')
    .trim()
  
  outputCSS.value = compressed
}

const processAll = () => {
  purifyCSS()
  organizeCSS()
  optimizeCSS()
  compressCSS()
}

const copyOutput = async () => {
  if (!outputCSS.value) return
  try {
    await navigator.clipboard.writeText(outputCSS.value)
    alert('已复制到剪贴板！')
  } catch (err) {
    console.error('复制失败:', err)
  }
}

const clearAll = () => {
  inputCSS.value = ''
  outputCSS.value = ''
}
</script>

<style scoped>
.css-tool {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.tool-header {
  text-align: center;
  margin-bottom: 20px;
}

.tool-header h2 {
  color: #333;
  margin: 0;
}

.css-textarea {
  width: 100%;
  height: 200px;
  padding: 15px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-family: 'Fira Code', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.5;
  resize: vertical;
  transition: border-color 0.3s ease;
}

.css-textarea:focus {
  outline: none;
  border-color: #007bff;
}

.output {
  background-color: #f8f9fa;
  border-color: #dee2e6;
}

.control-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 20px 0;
  justify-content: center;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.btn-format { background-color: #17a2b8; color: white; }
.btn-purify { background-color: #6f42c1; color: white; }
.btn-organize { background-color: #fd7e14; color: white; }
.btn-optimize { background-color: #28a745; color: white; }
.btn-compress { background-color: #dc3545; color: white; }
.btn-all { background-color: #007bff; color: white; }
.btn-copy { background-color: #6c757d; color: white; }
.btn-clear { background-color: #ffc107; color: #212529; }

.stats {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 15px;
  font-size: 14px;
  color: #666;
}

@media (max-width: 768px) {
  .control-buttons {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}
</style>