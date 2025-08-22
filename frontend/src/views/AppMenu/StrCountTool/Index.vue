<template>
  <div class="character-counter">
    <h2>字数统计工具</h2>
    <div class="input-section">
      <textarea 
        v-model="inputText" 
        placeholder="请输入要统计的文本..." 
        class="text-input"
        @input="updateStats"
      ></textarea>
    </div>
    
    <div class="stats-section">
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-label">总字数:</span>
          <span class="stat-value">{{ totalChars }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">UTF-8字符数:</span>
          <span class="stat-value">{{ utf8Chars }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">GBK字符数:</span>
          <span class="stat-value">{{ gbkChars }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">中文字数:</span>
          <span class="stat-value">{{ chineseChars }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">英文字数:</span>
          <span class="stat-value">{{ englishChars }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">标点字数:</span>
          <span class="stat-value">{{ punctuationChars }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">空白字符数:</span>
          <span class="stat-value">{{ whitespaceChars }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">全角字数:</span>
          <span class="stat-value">{{ fullWidthChars }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const inputText = ref('');

// 计算总字数（字符数）
const totalChars = computed(() => {
  return Array.from(inputText.value).length;
});

// 计算UTF-8字符数（字节数）
const utf8Chars = computed(() => {
  if (!inputText.value) return 0;
  return new TextEncoder().encode(inputText.value).length;
});

// 计算GBK字符数（字节数，近似计算）
const gbkChars = computed(() => {
  if (!inputText.value) return 0;
  let length = 0;
  for (let i = 0; i < inputText.value.length; i++) {
    const charCode = inputText.value.charCodeAt(i);
    // GBK编码中，ASCII字符占1字节，其他字符占2字节
    length += charCode <= 127 ? 1 : 2;
  }
  return length;
});

// 计算中文字数
const chineseChars = computed(() => {
  // 匹配中文字符（包括中文标点）
  const chineseRegex = /[\u4E00-\u9FFF\u3400-\u4DBF\uF900-\uFAFF\u3000-\u303F\uFF00-\uFFEF]/g;
  const matches = inputText.value.match(chineseRegex);
  return matches ? matches.length : 0;
});

// 计算英文字数
const englishChars = computed(() => {
  const englishRegex = /[a-zA-Z]/g;
  const matches = inputText.value.match(englishRegex);
  return matches ? matches.length : 0;
});

// 计算标点字数
const punctuationChars = computed(() => {
  // 匹配中文和英文标点符号
  const punctuationRegex = /[。，、；：！？""''（）【】《》〈〉.,;:!?\(\)\[\]{}'"`~…\-—]/g;
  const matches = inputText.value.match(punctuationRegex);
  return matches ? matches.length : 0;
});

// 计算空白字符数
const whitespaceChars = computed(() => {
  const whitespaceRegex = /\s/g;
  const matches = inputText.value.match(whitespaceRegex);
  return matches ? matches.length : 0;
});

// 计算全角字符数
const fullWidthChars = computed(() => {
  // 全角字符范围：FF00-FFEF 和 3000-303F
  const fullWidthRegex = /[\uFF00-\uFFEF\u3000-\u303F]/g;
  const matches = inputText.value.match(fullWidthRegex);
  return matches ? matches.length : 0;
});

// 更新统计（实际上computed属性会自动更新，这里只是占位）
const updateStats = () => {
  // computed属性会自动响应输入变化
};
</script>

<style scoped>
.character-counter {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Arial', sans-serif;
}

h2 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 20px;
}

.input-section {
  margin-bottom: 25px;
}

.text-input {
  width: 100%;
  min-height: 150px;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  resize: vertical;
  transition: border-color 0.3s;
}

.text-input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 15px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  padding: 12px 15px;
  background-color: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #3498db;
}

.stat-label {
  font-weight: 600;
  color: #2c3e50;
}

.stat-value {
  font-weight: bold;
  color: #e74c3c;
}

@media (max-width: 600px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .character-counter {
    padding: 15px;
  }
}
</style>