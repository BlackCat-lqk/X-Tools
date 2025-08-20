<template>
  <div v-if="props.show" class="timestamp-converter">
    <div class="converter-header">
      <h1>时间戳转换工具</h1>
      <p>支持时间戳与日期时间之间的相互转换</p>
    </div>
    
    <div class="converter-body">
      <!-- 时间戳转日期时间 -->
      <div class="conversion-section">
        <h2>时间戳 → 日期时间</h2>
        <div class="input-group">
          <label>时间戳</label>
          <input 
            v-model="timestampInput" 
            type="number" 
            class="input-field" 
            placeholder="输入时间戳"
            @input="convertTimestampToDate"
          >
        </div>
        
        <div class="options-row">
          <div class="option-group">
            <label>单位</label>
            <select v-model="timestampUnit" class="select-field" @change="convertTimestampToDate">
              <option value="seconds">秒</option>
              <option value="milliseconds">毫秒</option>
            </select>
          </div>
          
          <div class="option-group">
            <label>时区</label>
            <select v-model="timezone" class="select-field" @change="convertTimestampToDate">
              <option v-for="tz in timezones" :key="tz.value" :value="tz.value">
                {{ tz.label }}
              </option>
            </select>
          </div>
        </div>
        
        <div class="result-group">
          <label>转换结果</label>
          <input 
            :value="dateTimeResult" 
            class="input-field result-field" 
            readonly
            placeholder="日期时间结果将显示在这里"
          >
        </div>
      </div>
      
      <div class="divider">
        <span>或</span>
      </div>
      
      <!-- 日期时间转时间戳 -->
      <div class="conversion-section">
        <h2>日期时间 → 时间戳</h2>
        <div class="input-group">
          <label>日期时间</label>
          <input 
            v-model="dateTimeInput" 
            type="datetime-local" 
            class="input-field"
            @input="convertDateToTimestamp"
          >
        </div>
        
        <div class="options-row">
          <div class="option-group">
            <label>输出单位</label>
            <select v-model="outputUnit" class="select-field" @change="convertDateToTimestamp">
              <option value="seconds">秒</option>
              <option value="milliseconds">毫秒</option>
            </select>
          </div>
          
          <div class="option-group">
            <label>时区</label>
            <select v-model="timezone" class="select-field" @change="convertDateToTimestamp">
              <option v-for="tz in timezones" :key="tz.value" :value="tz.value">
                {{ tz.label }}
              </option>
            </select>
          </div>
        </div>
        
        <div class="result-group">
          <label>转换结果</label>
          <input 
            :value="timestampResult" 
            class="input-field result-field" 
            readonly
            placeholder="时间戳结果将显示在这里"
          >
        </div>
      </div>
    </div>
    
    <div class="converter-footer">
      <button class="btn-clear" @click="clearAll">清空所有</button>
      <button class="btn-copy" @click="copyToClipboard">复制结果</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const props = defineProps({
  show: Boolean,
});
const emit = defineEmits(["update:show"]);
// 输入和输出数据
const timestampInput = ref('')
const dateTimeInput = ref('')
const timestampResult = ref('')
const dateTimeResult = ref('')

// 选项
const timestampUnit = ref('seconds')
const outputUnit = ref('seconds')
const timezone = ref('local')

// 时区选项
const timezones = ref([
  { value: 'local', label: '本地时间' },
  { value: 'UTC', label: 'UTC' },
  { value: 'UTC-12', label: 'UTC-12' },
  { value: 'UTC-8', label: 'UTC-8' },
  { value: 'UTC-5', label: 'UTC-5' },
  { value: 'UTC+0', label: 'UTC+0' },
  { value: 'UTC+1', label: 'UTC+1' },
  { value: 'UTC+8', label: 'UTC+8' },
  { value: 'UTC+9', label: 'UTC+9' },
])

// 时间戳转日期时间
const convertTimestampToDate = () => {
  if (!timestampInput.value) {
    dateTimeResult.value = ''
    return
  }
  
  try {
    let timestamp = parseInt(timestampInput.value)
    
    // 根据单位调整时间戳
    if (timestampUnit.value === 'seconds') {
      timestamp *= 1000
    }
    
    // 创建日期对象
    const date = new Date(timestamp)
    
    // 根据时区调整
    let options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }
    
    if (timezone.value !== 'local') {
      options.timeZone = timezone.value === 'UTC' ? 'UTC' : `Etc/GMT${timezone.value.replace('UTC', '')}`
      options.timeZoneName = 'short'
    }
    
    dateTimeResult.value = date.toLocaleString('zh-CN', options)
  } catch (error) {
    dateTimeResult.value = '转换错误: 请输入有效的时间戳'
  }
}

// 日期时间转时间戳
const convertDateToTimestamp = () => {
  if (!dateTimeInput.value) {
    timestampResult.value = ''
    return
  }
  
  try {
    // 创建日期对象
    const date = new Date(dateTimeInput.value)
    
    // 根据时区调整
    if (timezone.value !== 'local') {
      const timezoneOffset = timezone.value === 'UTC' ? 0 : parseInt(timezone.value.replace('UTC', ''))
      const localOffset = date.getTimezoneOffset() / 60
      date.setHours(date.getHours() + localOffset - timezoneOffset)
    }
    
    // 获取时间戳
    let timestamp = date.getTime()
    
    // 根据单位调整输出
    if (outputUnit.value === 'seconds') {
      timestamp = Math.floor(timestamp / 1000)
    }
    
    timestampResult.value = timestamp.toString()
  } catch (error) {
    timestampResult.value = '转换错误: 请输入有效的日期时间'
  }
}

// 清空所有输入和结果
const clearAll = () => {
  timestampInput.value = ''
  dateTimeInput.value = ''
  timestampResult.value = ''
  dateTimeResult.value = ''
}

// 复制结果到剪贴板
const copyToClipboard = () => {
  const result = timestampResult.value || dateTimeResult.value
  if (result) {
    navigator.clipboard.writeText(result)
      .then(() => {
        alert('已复制到剪贴板!')
      })
      .catch(err => {
        console.error('复制失败:', err)
      })
  }
}
</script>

<style scoped>
.timestamp-converter {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  max-width: 600px;
  margin: 0 auto;
}

.converter-header {
  background: linear-gradient(90deg, #3498db, #2980b9);
  color: white;
  padding: 20px;
  text-align: center;
}

.converter-header h1 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 5px;
}

.converter-header p {
  opacity: 0.9;
  font-size: 14px;
}

.converter-body {
  padding: 25px;
}

.conversion-section {
  margin-bottom: 25px;
}

.conversion-section h2 {
  font-size: 18px;
  color: #2c3e50;
  margin-bottom: 15px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}

.input-group {
  margin-bottom: 15px;
}

.input-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #2c3e50;
}

.input-field {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.input-field:focus {
  border-color: #3498db;
  outline: none;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.options-row {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
}

.option-group {
  flex: 1;
}

.option-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #2c3e50;
}

.select-field {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  background-color: white;
  cursor: pointer;
}

.result-group {
  margin-top: 15px;
}

.result-field {
  background-color: #f8f9fa;
  cursor: default;
}

.divider {
  display: flex;
  align-items: center;
  margin: 25px 0;
  color: #7f8c8d;
}

.divider::before,
.divider::after {
  content: "";
  flex: 1;
  height: 1px;
  background-color: #ddd;
}

.divider span {
  padding: 0 15px;
  font-weight: 500;
}

.converter-footer {
  display: flex;
  justify-content: space-between;
  padding: 15px 25px;
  background-color: #f8f9fa;
  border-top: 1px solid #eee;
}

.btn-clear, .btn-copy {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-clear {
  background-color: #e74c3c;
  color: white;
}

.btn-clear:hover {
  background-color: #c0392b;
}

.btn-copy {
  background-color: #2ecc71;
  color: white;
}

.btn-copy:hover {
  background-color: #27ae60;
}

@media (max-width: 600px) {
  .options-row {
    flex-direction: column;
    gap: 10px;
  }
  
  .converter-footer {
    flex-direction: column;
    gap: 10px;
  }
  
  .btn-clear, .btn-copy {
    width: 100%;
  }
}
</style>