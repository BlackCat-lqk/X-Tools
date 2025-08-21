<template>
  <div class="regex-tool">
    <div class="header">
      <h2>正则表达式工具</h2>
      <p>测试、验证和生成正则表达式</p>
    </div>

    <div class="main-content">
      <!-- 常用正则模式选择 -->
      <div class="common-patterns">
        <h3>常用正则模式</h3>
        <div class="patterns-grid">
          <button 
            v-for="pattern in commonPatterns" 
            :key="pattern.name"
            class="pattern-btn"
            :class="{ active: selectedPattern === pattern.name }"
            @click="selectPattern(pattern)"
          >
            {{ pattern.name }}
          </button>
        </div>
      </div>

      <!-- 正则表达式输入区 -->
      <div class="input-section">
        <div class="section-header">
          <h3>正则表达式</h3>
          <div class="flags">
            <label v-for="flag in availableFlags" :key="flag" class="flag-checkbox">
              <input type="checkbox" :value="flag" v-model="selectedFlags">
              {{ flag }}
            </label>
          </div>
        </div>
        <div class="regex-input-container">
          <span class="regex-delimiter">/</span>
          <input 
            v-model="regexPattern" 
            placeholder="输入正则表达式"
            class="regex-input"
            @input="validateRegex"
          >
          <span class="regex-delimiter">/</span>
          <span class="flags-display">{{ selectedFlags.join('') }}</span>
        </div>
        <div class="validation-status">
          <span v-if="regexError" class="error">❌ {{ regexError }}</span>
          <span v-else-if="regexPattern" class="success">✅ 正则表达式有效</span>
        </div>
      </div>

      <!-- 测试文本输入区 -->
      <div class="input-section">
        <div class="section-header">
          <h3>测试文本</h3>
          <button class="btn btn-clear" @click="clearTestText">清空</button>
        </div>
        <textarea 
          v-model="testText" 
          placeholder="输入要测试的文本..."
          class="test-textarea"
          @input="testRegex"
        ></textarea>
      </div>

      <!-- 结果展示区 -->
      <div class="results-section">
        <div class="section-header">
          <h3>匹配结果</h3>
          <span class="matches-count">匹配: {{ matches.length }} 处</span>
        </div>
        <div class="results-container">
          <div 
            v-if="matches.length > 0" 
            class="matches-display"
            v-html="highlightedText"
          ></div>
          <div v-else-if="testText && regexPattern" class="no-matches">
            没有找到匹配项
          </div>
          <div v-else class="placeholder">
            输入正则表达式和测试文本后查看匹配结果
          </div>
        </div>

        <!-- 匹配详情 -->
        <div v-if="matches.length > 0" class="matches-details">
          <h4>匹配详情</h4>
          <div class="matches-list">
            <div 
              v-for="(match, index) in matches" 
              :key="index"
              class="match-item"
            >
              <span class="match-index">#{{ index + 1 }}</span>
              <span class="match-text">{{ match[0] }}</span>
              <span class="match-position">位置: {{ match.index }}-{{ match.index + match[0].length }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 正则表达式说明 -->
      <div class="explanation-section">
        <h3>正则表达式说明</h3>
        <div class="explanation-content">
          <div v-if="selectedPattern" class="pattern-explanation">
            <h4>{{ selectedPatternData.name }} 模式说明</h4>
            <p>{{ selectedPatternData.description }}</p>
            <div class="pattern-examples">
              <strong>示例:</strong>
              <ul>
                <li v-for="(example, exIndex) in selectedPatternData.examples" :key="exIndex">
                  {{ example }}
                </li>
              </ul>
            </div>
          </div>
          <div class="regex-cheatsheet">
            <h4>正则表达式速查表</h4>
            <div class="cheatsheet-grid">
              <div class="cheatsheet-category" v-for="category in cheatsheet" :key="category.title">
                <h5>{{ category.title }}</h5>
                <div class="cheatsheet-items">
                  <div v-for="item in category.items" :key="item.pattern" class="cheatsheet-item">
                    <code>{{ item.pattern }}</code>
                    <span>{{ item.description }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

// 常用正则模式库
const commonPatterns = [
  {
    name: '电子邮箱',
    pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
    description: '匹配常见的电子邮件地址格式',
    examples: ['example@email.com', 'user.name@domain.cn']
  },
  {
    name: '手机号码',
    pattern: '^1[3-9]\\d{9}$',
    description: '匹配中国大陆手机号码',
    examples: ['13800138000', '13912345678']
  },
  {
    name: '身份证号',
    pattern: '^[1-9]\\d{5}(18|19|20)\\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\\d|3[01])\\d{3}[0-9Xx]$',
    description: '匹配中国大陆18位身份证号码',
    examples: ['110101199003077774', '11010119900307777X']
  },
  {
    name: '车牌号码',
    pattern: '^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼][A-HJ-NP-Z][A-HJ-NP-Z0-9]{4,5}[A-HJ-NP-Z0-9挂学警港澳]$',
    description: '匹配中国大陆车牌号码',
    examples: ['京A12345', '粤B1234学']
  },
  {
    name: 'URL网址',
    pattern: '^(https?:\\/\\/)?([\\da-z.-]+)\\.([a-z.]{2,6})([\\/\\w .-]*)*\\/?$',
    description: '匹配HTTP/HTTPS网址',
    examples: ['https://www.example.com', 'http://sub.domain.cn/path']
  },
  {
    name: 'IP地址',
    pattern: '^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$',
    description: '匹配IPv4地址',
    examples: ['192.168.1.1', '127.0.0.1']
  },
  {
    name: '日期(YYYY-MM-DD)',
    pattern: '^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$',
    description: '匹配YYYY-MM-DD格式的日期',
    examples: ['2023-12-25', '1999-01-01']
  },
  {
    name: '时间(HH:MM:SS)',
    pattern: '^([01]\\d|2[0-3]):([0-5]\\d):([0-5]\\d)$',
    description: '匹配24小时制的时间格式',
    examples: ['23:59:59', '08:30:00']
  },
  {
    name: '中文汉字',
    pattern: '^[\\u4e00-\\u9fa5]+$',
    description: '匹配中文字符',
    examples: ['中文', '正则表达式']
  },
  {
    name: '数字',
    pattern: '^\\d+$',
    description: '匹配纯数字',
    examples: ['123', '456789']
  },
  {
    name: '字母',
    pattern: '^[a-zA-Z]+$',
    description: '匹配纯字母',
    examples: ['abc', 'ABCdef']
  },
  {
    name: '数字和字母',
    pattern: '^[a-zA-Z0-9]+$',
    description: '匹配数字和字母组合',
    examples: ['abc123', 'ABC456def']
  },
  {
    name: '密码强度',
    pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$',
    description: '匹配强密码（至少8位，包含大小写字母、数字和特殊字符）',
    examples: ['Password123!', 'Strong@Pass1']
  },
  {
    name: '邮政编码',
    pattern: '^[1-9]\\d{5}$',
    description: '匹配中国大陆邮政编码',
    examples: ['100000', '518000']
  },
  {
    name: 'QQ号码',
    pattern: '^[1-9]\\d{4,10}$',
    description: '匹配QQ号码',
    examples: ['12345', '1000000000']
  },
  {
    name: '微信号',
    pattern: '^[a-zA-Z][a-zA-Z0-9_-]{5,19}$',
    description: '匹配微信号码',
    examples: ['username', 'user_name123']
  },
  {
    name: '金额',
    pattern: '^\\d+(\\.\\d{1,2})?$',
    description: '匹配金额格式（最多两位小数）',
    examples: ['123.45', '100']
  },
  {
    name: 'HTML标签',
    pattern: '<([a-z]+)([^<]+)*(?:>(.*)<\\/\\1>|\\s+\\/>)',
    description: '匹配HTML标签',
    examples: ['<div>content</div>', '<img src="image.jpg"/>']
  }
];

// 正则表达式速查表
const cheatsheet = [
  {
    title: '字符类',
    items: [
      { pattern: '.', description: '任意字符（除换行符外）' },
      { pattern: '\\d', description: '数字 [0-9]' },
      { pattern: '\\D', description: '非数字 [^0-9]' },
      { pattern: '\\w', description: '单词字符 [a-zA-Z0-9_]' },
      { pattern: '\\W', description: '非单词字符' },
      { pattern: '\\s', description: '空白字符' },
      { pattern: '\\S', description: '非空白字符' }
    ]
  },
  {
    title: '锚点',
    items: [
      { pattern: '^', description: '字符串开始' },
      { pattern: '$', description: '字符串结束' },
      { pattern: '\\b', description: '单词边界' },
      { pattern: '\\B', description: '非单词边界' }
    ]
  },
  {
    title: '量词',
    items: [
      { pattern: '*', description: '0次或多次' },
      { pattern: '+', description: '1次或多次' },
      { pattern: '?', description: '0次或1次' },
      { pattern: '{n}', description: '恰好n次' },
      { pattern: '{n,}', description: '至少n次' },
      { pattern: '{n,m}', description: 'n到m次' }
    ]
  },
  {
    title: '分组',
    items: [
      { pattern: '(...)', description: '捕获分组' },
      { pattern: '(?:...)', description: '非捕获分组' },
      { pattern: '(?=...)', description: '正向先行断言' },
      { pattern: '(?!...)', description: '负向先行断言' }
    ]
  }
];

const regexPattern = ref('');
const testText = ref('');
const selectedFlags = ref(['g', 'm']);
const regexError = ref('');
const matches = ref([]);
const selectedPattern = ref('');

const availableFlags = ['g', 'i', 'm', 's'];

// 当前选中的模式数据
const selectedPatternData = computed(() => {
  return commonPatterns.find(p => p.name === selectedPattern.value) || {};
});

// 高亮显示匹配文本
const highlightedText = computed(() => {
  if (!testText.value || !regexPattern.value || regexError.value) {
    return testText.value;
  }

  try {
    const regex = new RegExp(regexPattern.value, selectedFlags.value.join(''));
    let result = testText.value;
    let lastIndex = 0;
    const highlighted = [];

    let match;
    while ((match = regex.exec(testText.value)) !== null) {
      // 添加匹配前的文本
      highlighted.push(testText.value.slice(lastIndex, match.index));
      // 添加高亮的匹配文本
      highlighted.push(`<span class="highlight">${match[0]}</span>`);
      lastIndex = match.index + match[0].length;
      
      // 避免无限循环
      if (match.index === regex.lastIndex) {
        regex.lastIndex++;
      }
    }
    
    // 添加剩余的文本
    highlighted.push(testText.value.slice(lastIndex));
    return highlighted.join('');
  } catch (error) {
    return testText.value;
  }
});

// 验证正则表达式
const validateRegex = () => {
  try {
    if (regexPattern.value) {
      new RegExp(regexPattern.value, selectedFlags.value.join(''));
      regexError.value = '';
    } else {
      regexError.value = '';
    }
  } catch (error) {
    regexError.value = error.message;
  }
};

// 测试正则表达式
const testRegex = () => {
  matches.value = [];
  if (!regexPattern.value || !testText.value || regexError.value) {
    return;
  }

  try {
    const regex = new RegExp(regexPattern.value, selectedFlags.value.join(''));
    const result = testText.value.matchAll(regex);
    matches.value = Array.from(result);
  } catch (error) {
    // 忽略匹配错误
  }
};

// 选择常用模式
const selectPattern = (pattern) => {
  selectedPattern.value = pattern.name;
  regexPattern.value = pattern.pattern;
  validateRegex();
  testRegex();
};

// 清空测试文本
const clearTestText = () => {
  testText.value = '';
  matches.value = [];
};

// 监听变化
watch(regexPattern, validateRegex);
watch(selectedFlags, () => {
  validateRegex();
  testRegex();
});
watch(regexError, testRegex);
</script>

<style scoped>
.regex-tool {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  text-align: center;
  margin-bottom: 30px;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 15px;
  color: white;
}

.header h2 {
  margin-bottom: 10px;
  font-size: 2rem;
}

.common-patterns {
  margin-bottom: 20px;
}

.common-patterns h3 {
  margin-bottom: 15px;
  color: #2c3e50;
}

.patterns-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 10px;
  margin-bottom: 20px;
}

.pattern-btn {
  padding: 10px 15px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.pattern-btn:hover {
  border-color: #3498db;
  transform: translateY(-2px);
}

.pattern-btn.active {
  background: #3498db;
  color: white;
  border-color: #3498db;
}

.input-section, .results-section, .explanation-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 2px solid #f8f9fa;
}

.section-header h3 {
  color: #2c3e50;
  margin: 0;
}

.flags {
  display: flex;
  gap: 15px;
}

.flag-checkbox {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
}

.regex-input-container {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.regex-delimiter {
  font-size: 1.2rem;
  font-weight: bold;
  color: #e74c3c;
}

.regex-input {
  flex: 1;
  padding: 12px 15px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  font-size: 1rem;
}

.flags-display {
  padding: 5px 10px;
  background: #f8f9fa;
  border-radius: 5px;
  font-family: 'Courier New', monospace;
}

.validation-status {
  min-height: 20px;
}

.error {
  color: #e74c3c;
  font-weight: 500;
}

.success {
  color: #27ae60;
  font-weight: 500;
}

.test-textarea {
  width: 100%;
  min-height: 120px;
  padding: 15px;
  border: 2px solid #ddd;
  border-radius: 8px;
  resize: vertical;
  font-family: 'Courier New', monospace;
  font-size: 0.95rem;
}

.results-container {
  min-height: 100px;
  padding: 15px;
  border: 2px solid #eee;
  border-radius: 8px;
  background: #fafafa;
  font-family: 'Courier New', monospace;
  line-height: 1.5;
}

.matches-display :deep(.highlight) {
  background: linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%);
  padding: 2px 4px;
  border-radius: 3px;
  font-weight: bold;
}

.no-matches, .placeholder {
  color: #6c757d;
  font-style: italic;
  text-align: center;
  padding: 20px;
}

.matches-count {
  color: #6c757d;
  font-weight: 500;
}

.matches-details {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 2px solid #f8f9fa;
}

.matches-details h4 {
  color: #2c3e50;
  margin-bottom: 15px;
}

.matches-list {
  max-height: 200px;
  overflow-y: auto;
}

.match-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 10px;
  border-bottom: 1px solid #eee;
  font-family: 'Courier New', monospace;
}

.match-item:last-child {
  border-bottom: none;
}

.match-index {
  background: #3498db;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  min-width: 40px;
  text-align: center;
}

.match-text {
  flex: 1;
  font-weight: 500;
}

.match-position {
  color: #6c757d;
  font-size: 0.9rem;
}

.explanation-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

.pattern-explanation h4 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.pattern-explanation p {
  color: #6c757d;
  line-height: 1.6;
  margin-bottom: 15px;
}

.pattern-examples {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid #3498db;
}

.pattern-examples ul {
  margin: 10px 0 0 0;
  padding-left: 20px;
}

.pattern-examples li {
  color: #495057;
  margin-bottom: 5px;
  font-family: 'Courier New', monospace;
}

.cheatsheet-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

.cheatsheet-category h5 {
  color: #2c3e50;
  margin-bottom: 10px;
  padding-bottom: 5px;
  border-bottom: 2px solid #e9ecef;
}

.cheatsheet-items {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}

.cheatsheet-item {
  display: grid;
  grid-template-columns: 80px 1fr;
  gap: 15px;
  padding: 8px;
  border-radius: 6px;
  background: #f8f9fa;
}

.cheatsheet-item code {
  background: #e9ecef;
  padding: 4px 8px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  text-align: center;
}

.cheatsheet-item span {
  color: #495057;
  font-size: 0.9rem;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-clear {
  background: #95a5a6;
  color: white;
}

.btn-clear:hover {
  background: #7f8c8d;
}

@media (max-width: 768px) {
  .explanation-content {
    grid-template-columns: 1fr;
  }
  
  .patterns-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
  
  .flags {
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .match-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>