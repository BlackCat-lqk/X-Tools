<template>
  <div class="obfuscator-container">
    <div class="header">
      <h2>Vue3 代码混淆工具</h2>
      <p>保护您的JavaScript和Vue代码，防止轻易被反向工程</p>
    </div>

    <div class="main-content">
      <div class="input-section">
        <div class="section-header">
          <h3>源代码</h3>
          <select v-model="language">
            <option value="javascript">JavaScript</option>
            <option value="vue">Vue</option>
          </select>
        </div>
        
        <div class="options-group">
          <div class="option">
            <input type="checkbox" id="obfuscateVars" v-model="options.obfuscateVariables">
            <label for="obfuscateVars">混淆变量名</label>
          </div>
          <div class="option">
            <input type="checkbox" id="encryptStrings" v-model="options.encryptStrings">
            <label for="encryptStrings">加密字符串</label>
          </div>
          <div class="option">
            <input type="checkbox" id="removeComments" v-model="options.removeComments">
            <label for="removeComments">移除注释</label>
          </div>
        </div>
        
        <textarea 
          v-model="sourceCode" 
          placeholder="请输入要混淆的代码..."
          class="code-textarea"
        ></textarea>
        
        <div class="stats">
          <span>行数: {{ lineCount }}</span>
          <span>字符数: {{ charCount }}</span>
        </div>
        
        <div class="action-buttons">
          <button class="btn btn-primary" @click="obfuscateCode">混淆代码</button>
          <button class="btn btn-secondary" @click="clearCode">清空</button>
          <button class="btn btn-example" @click="loadExampleCode">示例代码</button>
        </div>
      </div>
      
      <div class="output-section">
        <div class="section-header">
          <h3>混淆结果</h3>
          <button class="btn btn-copy" @click="copyResult">复制结果</button>
        </div>
        <textarea 
          v-model="obfuscatedCode" 
          placeholder="混淆后的代码将显示在这里..." 
          readonly
          class="code-textarea"
        ></textarea>
        
        <div class="stats">
          <span>行数: {{ obfuscatedLineCount }}</span>
          <span>字符数: {{ obfuscatedCharCount }}</span>
          <span>压缩率: {{ compressionRate }}%</span>
        </div>
        
        <div v-if="showSuccess" class="success-message">
          已复制到剪贴板！
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const sourceCode = ref('');
const obfuscatedCode = ref('');
const language = ref('javascript');
const showSuccess = ref(false);

const options = ref({
  obfuscateVariables: true,
  encryptStrings: false,
  removeComments: true
});

// 计算行数和字符数
const lineCount = computed(() => {
  return sourceCode.value ? sourceCode.value.split('\n').length : 0;
});

const charCount = computed(() => {
  return sourceCode.value.length;
});

const obfuscatedLineCount = computed(() => {
  return obfuscatedCode.value ? obfuscatedCode.value.split('\n').length : 0;
});

const obfuscatedCharCount = computed(() => {
  return obfuscatedCode.value.length;
});

const compressionRate = computed(() => {
  if (!sourceCode.value.length) return 0;
  const rate = (1 - (obfuscatedCharCount.value / charCount.value)) * 100;
  return rate > 0 ? rate.toFixed(2) : 0;
});

// 示例代码
const loadExampleCode = () => {
  if (language.value === 'javascript') {
    sourceCode.value = `// 计算阶乘的函数
function calculateFactorial(n) {
  if (n === 0 || n === 1) {
    return 1;
  }
  
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  
  return result;
}

// 使用示例
const number = 5;
const factorial = calculateFactorial(number);
console.log(\`\${number}的阶乘是: \${factorial}\`);
`;
  } else {
    sourceCode.value = `<template>
  <div class="counter">
    <h2>计数器: {{ count }}</h2>
    <button @click="increment">增加</button>
    <button @click="decrement">减少</button>
    <button @click="reset">重置</button>
  </div>
</template>

<script>
export default {
  name: 'Counter',
  data() {
    return {
      count: 0
    }
  },
  methods: {
    increment() {
      this.count++;
    },
    decrement() {
      this.count--;
    },
    reset() {
      this.count = 0;
    }
  }
}
<\/script>

<style scoped>
.counter {
  text-align: center;
  padding: 20px;
}

button {
  margin: 5px;
  padding: 10px 15px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>`;
  }
};

// 清空代码
const clearCode = () => {
  sourceCode.value = '';
  obfuscatedCode.value = '';
};

// 复制结果
const copyResult = async () => {
  try {
    await navigator.clipboard.writeText(obfuscatedCode.value);
    showSuccess.value = true;
    setTimeout(() => {
      showSuccess.value = false;
    }, 2000);
  } catch (err) {
    console.error('复制失败:', err);
  }
};

// 简单的代码混淆函数
const obfuscateCode = () => {
  if (!sourceCode.value.trim()) {
    obfuscatedCode.value = '请输入要混淆的代码';
    return;
  }
  
  let result = sourceCode.value;
  
  // 移除注释
  if (options.value.removeComments) {
    result = result.replace(/\/\/.*$/gm, ''); // 移除单行注释
    result = result.replace(/\/\*[\s\S]*?\*\//g, ''); // 移除多行注释
  }
  
  // 混淆变量名
  if (options.value.obfuscateVariables) {
    const variables = new Set();
    const variableRegex = /(?:let|const|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
    let match;
    
    // 收集所有变量名
    while ((match = variableRegex.exec(result)) !== null) {
      variables.add(match[1]);
    }
    
    // 函数参数和函数名
    const functionRegex = /function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)|function\s*\(([^)]*)\)/g;
    while ((match = functionRegex.exec(result)) !== null) {
      if (match[1]) variables.add(match[1]);
      if (match[2]) {
        match[2].split(',').forEach(param => {
          const trimmed = param.trim();
          if (trimmed) variables.add(trimmed);
        });
      }
    }
    
    // 替换变量名
    variables.forEach(variable => {
      if (variable.length < 2) return; // 跳过太短的变量名
      
      // 生成混淆后的变量名
      const obfuscated = '_' + Math.random().toString(36).substr(2, 5);
      const regex = new RegExp('\\b' + variable + '\\b', 'g');
      result = result.replace(regex, obfuscated);
    });
  }
  
  // 简单字符串加密
  if (options.value.encryptStrings) {
    const stringRegex = /(["'`])(?:(?=(\\?))\2.)*?\1/g;
    result = result.replace(stringRegex, match => {
      // 对字符串进行简单编码
      return btoa(encodeURIComponent(match));
    });
  }
  
  obfuscatedCode.value = result;
};
</script>

<style scoped>
.obfuscator-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  text-align: center;
  margin-bottom: 30px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.header h2 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.header p {
  color: #7f8c8d;
}

.main-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

@media (max-width: 768px) {
  .main-content {
    grid-template-columns: 1fr;
  }
}

.input-section, .output-section {
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.section-header h3 {
  color: #3498db;
  font-size: 1.4rem;
}

.options-group {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.option {
  display: flex;
  align-items: center;
  gap: 5px;
}

.option input[type="checkbox"] {
  width: 18px;
  height: 18px;
}

.code-textarea {
  width: 100%;
  min-height: 300px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
  resize: vertical;
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
  margin-bottom: 15px;
  flex-grow: 1;
}

.stats {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  color: #7f8c8d;
  font-size: 14px;
}

.action-buttons {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover {
  background: #2980b9;
}

.btn-secondary {
  background: #95a5a6;
  color: white;
}

.btn-secondary:hover {
  background: #7f8c8d;
}

.btn-example {
  background: #2ecc71;
  color: white;
}

.btn-example:hover {
  background: #27ae60;
}

.btn-copy {
  background: #9b59b6;
  color: white;
}

.btn-copy:hover {
  background: #8e44ad;
}

.success-message {
  background: #2ecc71;
  color: white;
  padding: 10px;
  border-radius: 5px;
  text-align: center;
  margin-top: 15px;
  animation: fadeOut 3s forwards;
}

@keyframes fadeOut {
  0% { opacity: 1; }
  70% { opacity: 1; }
  100% { opacity: 0; }
}
</style>