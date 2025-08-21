<template>
  <div class="unit-converter">
    <div class="header">
      <h1><i class="fas fa-exchange-alt"></i> 多功能单位转换工具</h1>
      <p>支持多种物理量单位的快速转换</p>
    </div>
    
    <div class="converter-container">
      <div class="category-selector">
        <h3>选择转换类型</h3>
        <div class="category-grid">
          <button 
            v-for="category in categories" 
            :key="category.id"
            :class="['category-btn', { active: selectedCategory === category.id }]"
            @click="selectCategory(category.id)"
          >
            <i :class="category.icon"></i>
            {{ category.name }}
          </button>
        </div>
      </div>
      
      <div class="converter-panel">
        <div class="input-section">
          <div class="input-group">
            <input 
              type="number" 
              v-model="inputValue" 
              @input="convertUnits" 
              placeholder="输入数值"
            >
            <select v-model="inputUnit" @change="convertUnits">
              <option 
                v-for="unit in getCurrentUnits()" 
                :key="unit.key" 
                :value="unit.key"
              >
                {{ unit.name }} ({{ unit.symbol }})
              </option>
            </select>
          </div>
          
          <div class="swap-btn" @click="swapUnits">
            <i class="fas fa-exchange-alt"></i>
          </div>
          
          <div class="input-group">
            <input 
              type="text" 
              :value="outputValue" 
              readonly 
              placeholder="转换结果"
              class="output-field"
            >
            <select v-model="outputUnit" @change="convertUnits">
              <option 
                v-for="unit in getCurrentUnits()" 
                :key="unit.key" 
                :value="unit.key"
              >
                {{ unit.name }} ({{ unit.symbol }})
              </option>
            </select>
          </div>
        </div>
        
        <div class="conversion-table">
          <h3>常用转换参考</h3>
          <table>
            <thead>
              <tr>
                <th>{{ getUnitName(inputUnit) }}</th>
                <th>{{ getUnitName(outputUnit) }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="i in 5" :key="i">
                <td>{{ i * 10 }}</td>
                <td>{{ formatNumber(convertValue(i * 10, inputUnit, outputUnit)) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    
    <div class="recent-conversions">
      <h3>最近转换</h3>
      <div v-if="history.length > 0" class="history-list">
        <div 
          v-for="(item, index) in history" 
          :key="index" 
          class="history-item"
          @click="loadFromHistory(item)"
        >
          <div class="history-value">
            {{ item.inputValue }} {{ getUnitSymbol(item.inputUnit) }} = 
            {{ formatNumber(item.outputValue) }} {{ getUnitSymbol(item.outputUnit) }}
          </div>
          <div class="history-category">
            {{ getCategoryName(item.category) }}
          </div>
          <button class="delete-btn" @click.stop="removeHistoryItem(index)">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
      <div v-else class="empty-history">
        暂无转换记录
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// 单位类型定义
const categories = [
  { id: 'length', name: '长度', icon: 'fas fa-ruler' },
  { id: 'area', name: '面积', icon: 'fas fa-border-all' },
  { id: 'volume', name: '体积', icon: 'fas fa-cube' },
  { id: 'weight', name: '重量', icon: 'fas fa-weight' },
  { id: 'temperature', name: '温度', icon: 'fas fa-thermometer-half' },
  { id: 'time', name: '时间', icon: 'fas fa-clock' },
  { id: 'speed', name: '速度', icon: 'fas fa-tachometer-alt' },
  { id: 'angle', name: '角度', icon: 'fas fa-compass' },
  { id: 'pressure', name: '压力', icon: 'fas fa-compress-arrows-alt' },
  { id: 'energy', name: '能量', icon: 'fas fa-bolt' },
  { id: 'power', name: '功率', icon: 'fas fa-charging-station' },
  { id: 'data', name: '数据存储', icon: 'fas fa-database' }
]

// 单位定义
const units = {
  length: [
    { key: 'm', name: '米', symbol: 'm', factor: 1 },
    { key: 'km', name: '千米', symbol: 'km', factor: 1000 },
    { key: 'cm', name: '厘米', symbol: 'cm', factor: 0.01 },
    { key: 'mm', name: '毫米', symbol: 'mm', factor: 0.001 },
    { key: 'mi', name: '英里', symbol: 'mi', factor: 1609.344 },
    { key: 'yd', name: '码', symbol: 'yd', factor: 0.9144 },
    { key: 'ft', name: '英尺', symbol: 'ft', factor: 0.3048 },
    { key: 'in', name: '英寸', symbol: 'in', factor: 0.0254 },
    { key: 'nm', name: '海里', symbol: 'nm', factor: 1852 }
  ],
  area: [
    { key: 'm2', name: '平方米', symbol: 'm²', factor: 1 },
    { key: 'km2', name: '平方千米', symbol: 'km²', factor: 1000000 },
    { key: 'cm2', name: '平方厘米', symbol: 'cm²', factor: 0.0001 },
    { key: 'mm2', name: '平方毫米', symbol: 'mm²', factor: 0.000001 },
    { key: 'ha', name: '公顷', symbol: 'ha', factor: 10000 },
    { key: 'acre', name: '英亩', symbol: 'acre', factor: 4046.856 },
    { key: 'ft2', name: '平方英尺', symbol: 'ft²', factor: 0.092903 },
    { key: 'in2', name: '平方英寸', symbol: 'in²', factor: 0.00064516 }
  ],
  volume: [
    { key: 'm3', name: '立方米', symbol: 'm³', factor: 1 },
    { key: 'l', name: '升', symbol: 'L', factor: 0.001 },
    { key: 'ml', name: '毫升', symbol: 'mL', factor: 0.000001 },
    { key: 'cm3', name: '立方厘米', symbol: 'cm³', factor: 0.000001 },
    { key: 'ft3', name: '立方英尺', symbol: 'ft³', factor: 0.0283168 },
    { key: 'in3', name: '立方英寸', symbol: 'in³', factor: 0.0000163871 },
    { key: 'gal', name: '加仑(美)', symbol: 'gal', factor: 0.00378541 },
    { key: 'gal-uk', name: '加仑(英)', symbol: 'gal', factor: 0.00454609 }
  ],
  weight: [
    { key: 'kg', name: '千克', symbol: 'kg', factor: 1 },
    { key: 'g', name: '克', symbol: 'g', factor: 0.001 },
    { key: 'mg', name: '毫克', symbol: 'mg', factor: 0.000001 },
    { key: 't', name: '吨', symbol: 't', factor: 1000 },
    { key: 'lb', name: '磅', symbol: 'lb', factor: 0.453592 },
    { key: 'oz', name: '盎司', symbol: 'oz', factor: 0.0283495 },
    { key: 'ct', name: '克拉', symbol: 'ct', factor: 0.0002 }
  ],
  temperature: [
    { key: 'c', name: '摄氏度', symbol: '°C' },
    { key: 'f', name: '华氏度', symbol: '°F' },
    { key: 'k', name: '开尔文', symbol: 'K' }
  ],
  time: [
    { key: 's', name: '秒', symbol: 's', factor: 1 },
    { key: 'ms', name: '毫秒', symbol: 'ms', factor: 0.001 },
    { key: 'min', name: '分钟', symbol: 'min', factor: 60 },
    { key: 'h', name: '小时', symbol: 'h', factor: 3600 },
    { key: 'd', name: '天', symbol: 'd', factor: 86400 },
    { key: 'wk', name: '周', symbol: 'wk', factor: 604800 },
    { key: 'month', name: '月', symbol: 'month', factor: 2592000 }, // 近似值
    { key: 'yr', name: '年', symbol: 'yr', factor: 31536000 } // 近似值
  ],
  speed: [
    { key: 'mps', name: '米/秒', symbol: 'm/s', factor: 1 },
    { key: 'kmph', name: '千米/小时', symbol: 'km/h', factor: 0.277778 },
    { key: 'mph', name: '英里/小时', symbol: 'mph', factor: 0.44704 },
    { key: 'knot', name: '节', symbol: 'kn', factor: 0.514444 },
    { key: 'ftps', name: '英尺/秒', symbol: 'ft/s', factor: 0.3048 }
  ],
  angle: [
    { key: 'deg', name: '度', symbol: '°', factor: 1 },
    { key: 'rad', name: '弧度', symbol: 'rad', factor: 57.2958 },
    { key: 'grad', name: '百分度', symbol: 'grad', factor: 0.9 }
  ],
  pressure: [
    { key: 'pa', name: '帕斯卡', symbol: 'Pa', factor: 1 },
    { key: 'kpa', name: '千帕', symbol: 'kPa', factor: 1000 },
    { key: 'mpa', name: '兆帕', symbol: 'MPa', factor: 1000000 },
    { key: 'bar', name: '巴', symbol: 'bar', factor: 100000 },
    { key: 'atm', name: '标准大气压', symbol: 'atm', factor: 101325 },
    { key: 'psi', name: '磅力/平方英寸', symbol: 'psi', factor: 6894.76 }
  ],
  energy: [
    { key: 'j', name: '焦耳', symbol: 'J', factor: 1 },
    { key: 'kj', name: '千焦', symbol: 'kJ', factor: 1000 },
    { key: 'cal', name: '卡路里', symbol: 'cal', factor: 4.184 },
    { key: 'kcal', name: '千卡', symbol: 'kcal', factor: 4184 },
    { key: 'kwh', name: '千瓦时', symbol: 'kWh', factor: 3600000 },
    { key: 'ev', name: '电子伏特', symbol: 'eV', factor: 1.602e-19 }
  ],
  power: [
    { key: 'w', name: '瓦特', symbol: 'W', factor: 1 },
    { key: 'kw', name: '千瓦', symbol: 'kW', factor: 1000 },
    { key: 'mw', name: '兆瓦', symbol: 'MW', factor: 1000000 },
    { key: 'hp', name: '马力', symbol: 'hp', factor: 745.7 }
  ],
  data: [
    { key: 'b', name: '比特', symbol: 'b', factor: 1 },
    { key: 'B', name: '字节', symbol: 'B', factor: 8 },
    { key: 'KB', name: '千字节', symbol: 'KB', factor: 8192 },
    { key: 'MB', name: '兆字节', symbol: 'MB', factor: 8388608 },
    { key: 'GB', name: '千兆字节', symbol: 'GB', factor: 8589934592 },
    { key: 'TB', name: '太字节', symbol: 'TB', factor: 8796093022208 }
  ]
}

// 响应式数据
const selectedCategory = ref('length')
const inputValue = ref('')
const inputUnit = ref('')
const outputValue = ref('')
const outputUnit = ref('')
const history = ref([])

// 计算属性
const defaultUnits = computed(() => {
  return {
    length: { input: 'm', output: 'km' },
    area: { input: 'm2', output: 'ft2' },
    volume: { input: 'm3', output: 'l' },
    weight: { input: 'kg', output: 'lb' },
    temperature: { input: 'c', output: 'f' },
    time: { input: 'h', output: 'min' },
    speed: { input: 'kmph', output: 'mph' },
    angle: { input: 'deg', output: 'rad' },
    pressure: { input: 'pa', output: 'psi' },
    energy: { input: 'j', output: 'cal' },
    power: { input: 'w', output: 'hp' },
    data: { input: 'MB', output: 'GB' }
  }
})

// 方法
const selectCategory = (categoryId) => {
  selectedCategory.value = categoryId
  const defaults = defaultUnits.value[categoryId]
  inputUnit.value = defaults.input
  outputUnit.value = defaults.output
  inputValue.value = ''
  outputValue.value = ''
}

const getCurrentUnits = () => {
  return units[selectedCategory.value] || []
}

const convertUnits = () => {
  if (inputValue.value === '' || isNaN(inputValue.value)) {
    outputValue.value = ''
    return
  }
  
  const value = parseFloat(inputValue.value)
  
  // 特殊处理温度转换
  if (selectedCategory.value === 'temperature') {
    outputValue.value = convertTemperature(value, inputUnit.value, outputUnit.value)
  } else {
    outputValue.value = convertValue(value, inputUnit.value, outputUnit.value)
  }
  
  // 添加到历史记录
  addToHistory()
}

const convertValue = (value, fromUnit, toUnit) => {
  if (fromUnit === toUnit) return value
  
  const categoryUnits = units[selectedCategory.value]
  const fromUnitObj = categoryUnits.find(u => u.key === fromUnit)
  const toUnitObj = categoryUnits.find(u => u.key === toUnit)
  
  if (!fromUnitObj || !toUnitObj) return value
  
  // 转换为基准单位，然后再转换为目标单位
  const baseValue = value * fromUnitObj.factor
  return baseValue / toUnitObj.factor
}

const convertTemperature = (value, fromUnit, toUnit) => {
  if (fromUnit === toUnit) return value
  
  // 先转换为摄氏度
  let celsius
  switch (fromUnit) {
    case 'c':
      celsius = value
      break
    case 'f':
      celsius = (value - 32) * 5 / 9
      break
    case 'k':
      celsius = value - 273.15
      break
    default:
      return value
  }
  
  // 从摄氏度转换为目标单位
  switch (toUnit) {
    case 'c':
      return celsius
    case 'f':
      return (celsius * 9 / 5) + 32
    case 'k':
      return celsius + 273.15
    default:
      return value
  }
}

const swapUnits = () => {
  const tempUnit = inputUnit.value
  inputUnit.value = outputUnit.value
  outputUnit.value = tempUnit
  
  if (inputValue.value !== '') {
    const tempValue = inputValue.value
    inputValue.value = outputValue.value
    outputValue.value = tempValue
  } else {
    convertUnits()
  }
}

const formatNumber = (num) => {
  if (num === undefined || num === null) return ''
  
  // 处理非常大或非常小的数字
  if (Math.abs(num) < 0.0001 || Math.abs(num) > 1000000) {
    return num.toExponential(4)
  }
  
  // 处理小数位数
  const decimalPlaces = Math.abs(num) < 1 ? 6 : 4
  return parseFloat(num.toFixed(decimalPlaces)).toString()
}

const addToHistory = () => {
  if (inputValue.value === '' || outputValue.value === '') return
  
  history.value.unshift({
    inputValue: inputValue.value,
    inputUnit: inputUnit.value,
    outputValue: outputValue.value,
    outputUnit: outputUnit.value,
    category: selectedCategory.value,
    timestamp: new Date()
  })
  
  // 只保留最近10条记录
  if (history.value.length > 10) {
    history.value.pop()
  }
  
  // 保存到localStorage
  localStorage.setItem('conversionHistory', JSON.stringify(history.value))
}

const loadFromHistory = (item) => {
  selectedCategory.value = item.category
  inputValue.value = item.inputValue
  inputUnit.value = item.inputUnit
  outputUnit.value = item.outputUnit
  outputValue.value = item.outputValue
}

const removeHistoryItem = (index) => {
  history.value.splice(index, 1)
  localStorage.setItem('conversionHistory', JSON.stringify(history.value))
}

const getUnitName = (unitKey) => {
  const unit = getCurrentUnits().find(u => u.key === unitKey)
  return unit ? unit.name : unitKey
}

const getUnitSymbol = (unitKey) => {
  const unit = getCurrentUnits().find(u => u.key === unitKey)
  return unit ? unit.symbol : unitKey
}

const getCategoryName = (categoryId) => {
  const category = categories.find(c => c.id === categoryId)
  return category ? category.name : categoryId
}

// 生命周期
onMounted(() => {
  // 初始化默认单位
  selectCategory('length')
  
  // 从localStorage加载历史记录
  const savedHistory = localStorage.getItem('conversionHistory')
  if (savedHistory) {
    history.value = JSON.parse(savedHistory)
  }
})
</script>

<style scoped>
.unit-converter {
  margin: 0 auto;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.header {
  background: linear-gradient(120deg, #667eea 0%, #764ba2 100%);
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

.converter-container {
  padding: 25px;
  display: flex;
  gap: 25px;
}

.category-selector {
  width: 250px;
  flex-shrink: 0;
}

.category-selector h3 {
  color: #2c3e50;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 2px solid #667eea;
}

.category-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}

.category-btn {
  padding: 12px 15px;
  background: white;
  border: 1px solid #eaeaea;
  border-radius: 8px;
  cursor: pointer;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s;
}

.category-btn:hover {
  background: #f8f9fa;
  border-color: #667eea;
}

.category-btn.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.converter-panel {
  flex: 1;
}

.input-section {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 25px;
}

.input-group {
  display: flex;
  flex: 1;
}

.input-group input {
  flex: 1;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 8px 0 0 8px;
  border-right: none;
  font-size: 16px;
}

.input-group .output-field {
  background: #f8f9fa;
}

.input-group select {
  width: 150px;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 0 8px 8px 0;
  font-size: 16px;
  background: white;
}

.swap-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #667eea;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.swap-btn:hover {
  background: #5a6fd8;
  transform: rotate(180deg);
}

.conversion-table {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
}

.conversion-table h3 {
  color: #2c3e50;
  margin-bottom: 15px;
}

.conversion-table table {
  width: 100%;
  border-collapse: collapse;
}

.conversion-table th,
.conversion-table td {
  padding: 10px;
  text-align: center;
  border-bottom: 1px solid #eaeaea;
}

.conversion-table th {
  background: #e6eeff;
  font-weight: 600;
}

.conversion-table tr:last-child td {
  border-bottom: none;
}

.recent-conversions {
  padding: 25px;
  border-top: 1px solid #eaeaea;
}

.recent-conversions h3 {
  color: #2c3e50;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 2px solid #667eea;
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
  position: relative;
}

.history-item:hover {
  border-color: #667eea;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

.history-value {
  font-weight: 500;
  color: #2c3e50;
}

.history-category {
  background: #e6eeff;
  color: #667eea;
  padding: 4px 8px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.delete-btn {
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  padding: 5px;
  border-radius: 4px;
  transition: all 0.3s;
}

.delete-btn:hover {
  color: #e53e3e;
  background: #fff5f5;
}

.empty-history {
  text-align: center;
  padding: 30px;
  color: #6c757d;
  font-style: italic;
}

@media (max-width: 768px) {
  .converter-container {
    flex-direction: column;
  }
  
  .category-selector {
    width: 100%;
  }
  
  .category-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .input-section {
    flex-direction: column;
  }
  
  .input-group {
    width: 100%;
  }
  
  .swap-btn {
    transform: rotate(90deg);
  }
  
  .swap-btn:hover {
    transform: rotate(270deg);
  }
  
  .history-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .delete-btn {
    position: absolute;
    top: 10px;
    right: 10px;
  }
}
</style>