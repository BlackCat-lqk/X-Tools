<template>
  <div class="search-container" ref="containerRef">
    <!-- 搜索输入框 -->
    <div class="search-input-wrapper">
      <input
        ref="inputRef"
        v-model="inputValue"
        type="text"
        class="search-input"
        :placeholder="placeholder"
        @keyup.enter="handleSearch"
        @input="handleInputChange"
        @focus="isFocused = true"
        @blur="handleBlur"
      />
      <button v-if="inputValue" class="clear-btn" @click="clearInput">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
        </svg>
      </button>
      <button class="search-btn" @click="handleSearch" :disabled="!inputValue">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
        </svg>
      </button>
    </div>

    <!-- 搜索历史 -->
    <div v-if="showHistory && historyList.length && isFocused" class="search-history">
      <div class="history-header">
        <h3>搜索历史</h3>
        <button @click="clearHistory" class="clear-history-btn">清空</button>
      </div>
      <ul class="history-list">
        <li 
          v-for="(item, index) in historyList" 
          :key="index" 
          class="history-item"
          @mousedown="selectHistory(item)"
        >
          <span class="history-text">{{ item }}</span>
          <button 
            @mousedown.stop="removeHistoryItem(index)" 
            class="remove-history-item-btn"
          >
            ×
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'

// 定义组件属性
const props = defineProps({
  // 防抖时间(毫秒)
  debounceTime: {
    type: Number,
    default: 300
  },
  // 是否模糊搜索
  fuzzy: {
    type: Boolean,
    default: false
  },
  // 占位文本
  placeholder: {
    type: String,
    default: '请输入搜索内容'
  },
  // 是否显示搜索历史
  showHistory: {
    type: Boolean,
    default: true
  },
  // 最大历史记录数量
  maxHistoryItems: {
    type: Number,
    default: 10
  },
  // 存储key
  storageKey: {
    type: String,
    default: 'searchHistory'
  },
  // 输入值
  modelValue: {
    type: String,
    default: ''
  }
})

watch(() => props.modelValue, (newValue) => {
  inputValue.value = newValue
})

// 定义事件
const emit = defineEmits(['search', 'update:modelValue'])

// 响应式数据
const inputValue = ref('')
const inputRef = ref(null)
const containerRef = ref(null)
const historyList = ref([])
const timeoutId = ref(null)
const isFocused = ref(false)

// 加载历史记录
onMounted(() => {
  const savedHistory = localStorage.getItem(props.storageKey)
  if (savedHistory) {
    try {
      historyList.value = JSON.parse(savedHistory)
    } catch (e) {
      console.error('Failed to parse search history:', e)
      historyList.value = []
    }
  }
  
  // 添加点击外部关闭历史记录的事件
  document.addEventListener('mousedown', handleClickOutside)
})

// 处理点击组件外部
const handleClickOutside = (event) => {
  if (containerRef.value && !containerRef.value.contains(event.target)) {
    isFocused.value = false
  }
}

// 处理输入框失去焦点
const handleBlur = () => {
  // 使用setTimeout让点击历史项的事件先触发
  setTimeout(() => {
    isFocused.value = false
  }, 200)
}

// 保存历史记录
const saveHistory = () => {
  localStorage.setItem(props.storageKey, JSON.stringify(historyList.value))
}

// 处理输入变化（带防抖）
const handleInputChange = () => {
  if (timeoutId.value) {
    clearTimeout(timeoutId.value)
  }
  
  if (props.debounceTime > 0) {
    timeoutId.value = setTimeout(() => {
      emit('update:modelValue', inputValue.value)
    }, props.debounceTime)
  } else {
    emit('update:modelValue', inputValue.value)
  }
}

// 处理搜索
const handleSearch = () => {
  if (timeoutId.value) {
    clearTimeout(timeoutId.value)
  }
  
  const searchValue = inputValue.value.trim()
  if (searchValue) {
    // 添加到历史记录
    addToHistory(searchValue)
    // 触发搜索事件
    emit('update:modelValue', searchValue)
    emit('search', searchValue, props.fuzzy)
    // 失去焦点
    isFocused.value = false
  }
}

// 添加到历史记录
const addToHistory = (value) => {
  // 移除已存在的相同记录
  const index = historyList.value.indexOf(value)
  if (index !== -1) {
    historyList.value.splice(index, 1)
  }
  
  // 添加到开头
  historyList.value.unshift(value)
  
  // 限制历史记录数量
  if (historyList.value.length > props.maxHistoryItems) {
    historyList.value = historyList.value.slice(0, props.maxHistoryItems)
  }
  
  // 保存到本地存储
  saveHistory()
}

// 选择历史记录
const selectHistory = (value) => {
  inputValue.value = value
  nextTick(() => {
    handleSearch()
  })
}

// 移除单条历史记录
const removeHistoryItem = (index) => {
  historyList.value.splice(index, 1)
  saveHistory()
}

// 清空历史记录
const clearHistory = () => {
  historyList.value = []
  saveHistory()
}

// 清空输入
const clearInput = () => {
  inputValue.value = ''
  if (timeoutId.value) {
    clearTimeout(timeoutId.value)
  }
  emit('update:modelValue', '')
  // 聚焦到输入框
  inputRef.value.focus()
  emit('search', inputValue.value, props.fuzzy)
}

// 暴露方法给父组件
defineExpose({
  focus: () => {
    inputRef.value.focus()
    isFocused.value = true
  },
  clear: () => {
    clearInput()
  },
  getHistory: () => {
    return historyList.value
  },
  setValue: (value) => {
    inputValue.value = value
  }
})
</script>

<style scoped>
.search-container {
  width: 100%;
  max-width: 500px;
  position: relative;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  flex: 1;
  padding: 8px 45px 8px 15px;
  border: 1px solid #ddd;
  border-radius: 24px;
  font-size: 14px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.search-input:focus {
  outline: none;
  border-color: #4a90e2;
  box-shadow: 0 2px 8px rgba(74, 144, 226, 0.3);
}

.search-btn {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  color: #666;
  transition: color 0.2s;
}

.search-btn:hover:not(:disabled) {
  color: #4a90e2;
}

.search-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.clear-btn {
  position: absolute;
  right: 35px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  color: #999;
  transition: color 0.2s;
}

.clear-btn:hover {
  color: #f44336;
}

.search-history {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 10px;
  z-index: 1000;
  margin-top: 5px;
  animation: fadeIn 0.3s ease;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.history-header h3 {
  margin: 0;
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.clear-history-btn {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  font-size: 13px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s;
}

.clear-history-btn:hover {
  color: #f44336;
  background-color: #f5f5f5;
}

.history-list {
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 200px;
  overflow-y: auto;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-bottom: 2px;
}

.history-item:hover {
  background-color: #f5f7fa;
}

.history-text {
  flex: 1;
  font-size: 14px;
  color: #333;
}

.remove-history-item-btn {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  font-size: 18px;
  padding: 0 5px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.remove-history-item-btn:hover {
  color: #f44336;
  background-color: #f5f5f5;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>