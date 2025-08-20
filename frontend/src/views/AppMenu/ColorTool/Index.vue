<template>
  <div class="color-picker">
    <!-- 主颜色选择区域 -->
    <div class="color-picker-main">
      <!-- 颜色显示和输入 -->
      <div class="color-display">
        <div 
          class="current-color" 
          :style="{ backgroundColor: currentColor }"
          @click="showPicker = !showPicker"
        ></div>
        <div class="color-inputs">
          <input 
            v-model="hexColor" 
            type="text" 
            placeholder="#RRGGBB"
            @input="updateFromHex"
            class="hex-input"
          >
          <div class="rgb-inputs">
            <input v-model="rgb.r" type="number" min="0" max="255" @input="updateFromRgb"> R
            <input v-model="rgb.g" type="number" min="0" max="255" @input="updateFromRgb"> G
            <input v-model="rgb.b" type="number" min="0" max="255" @input="updateFromRgb"> B
          </div>
        </div>
      </div>

      <!-- 颜色选择器面板 -->
      <div v-if="showPicker" class="picker-panel">
        <!-- 饱和度/亮度选择 -->
        <div class="saturation-lightness" @mousedown="(e) => startDragging('sl', e)">
          <div class="sl-gradient" :style="slGradientStyle"></div>
          <div 
            class="sl-handle" 
            :style="{ left: slHandleX + 'px', top: slHandleY + 'px' }"
          ></div>
        </div>

        <!-- 色相选择 -->
        <div class="hue-slider" @mousedown="(e) => startDragging('hue', e)">
          <div class="hue-gradient"></div>
          <div 
            class="hue-handle" 
            :style="{ left: hueHandleX + 'px' }"
          ></div>
        </div>

        <!-- 透明度选择 -->
        <div class="alpha-slider" @mousedown="(e) => startDragging('alpha', e)">
          <div class="alpha-background"></div>
          <div class="alpha-gradient" :style="{ background: alphaGradient }"></div>
          <div 
            class="alpha-handle" 
            :style="{ left: alphaHandleX + 'px' }"
          ></div>
        </div>

        <!-- 颜色格式显示 -->
        <div class="color-formats">
          <div>HEX: {{ hexColor }}</div>
          <div>RGB: rgb({{ rgb.r }}, {{ rgb.g }}, {{ rgb.b }})</div>
          <div>HSL: hsl({{ hsl.h }}, {{ hsl.s }}%, {{ hsl.l }}%)</div>
          <div>透明度: {{ Math.round(alpha * 100) }}%</div>
        </div>
      </div>
    </div>

    <!-- 调色板和历史记录 -->
    <div class="color-tools">
      <!-- 预设调色板 -->
      <div class="preset-palette">
        <h4>预设颜色</h4>
        <div class="preset-colors">
          <div 
            v-for="color in presetColors" 
            :key="color"
            class="preset-color"
            :style="{ backgroundColor: color }"
            @click="setColor(color)"
          ></div>
        </div>
      </div>

      <!-- 收藏颜色 -->
      <div class="color-favorites">
        <h4>收藏颜色 ({{ favoriteColors.length }})</h4>
        <div class="favorite-colors">
          <div 
            v-for="(color, index) in favoriteColors" 
            :key="index"
            class="favorite-color"
            :style="{ backgroundColor: color }"
            @click="setColor(color)"
            @contextmenu="removeFromFavorites(index)"
            :title="color + ' (右键删除)'"
          ></div>
        </div>
      </div>

      <!-- 历史记录 -->
      <div class="color-history">
        <h4>历史记录 ({{ colorHistory.length }})</h4>
        <div class="history-colors">
          <div 
            v-for="(color, index) in colorHistory" 
            :key="index"
            class="history-color"
            :style="{ backgroundColor: color }"
            @click="setColor(color)"
            :title="color"
          ></div>
        </div>
      </div>

      <!-- 渐变生成器 -->
      <div class="gradient-generator">
        <h4>渐变生成器</h4>
        <div class="gradient-controls">
          <div class="gradient-color" :style="{ backgroundColor: gradientStart }">
            <input 
              v-model="gradientStart" 
              type="color" 
              @input="updateGradient"
            >
          </div>
          <div class="gradient-color" :style="{ backgroundColor: gradientEnd }">
            <input 
              v-model="gradientEnd" 
              type="color" 
              @input="updateGradient"
            >
          </div>
        </div>
        <div class="gradient-preview" :style="{ background: gradientStyle }"></div>
        <div class="gradient-actions">
          <button @click="applyGradient" class="action-btn">应用渐变</button>
          <button @click="copyGradient" class="action-btn">复制CSS</button>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="color-actions">
        <button @click="copyToClipboard" class="action-btn">复制颜色</button>
        <button @click="addToFavorites" class="action-btn">收藏</button>
        <button @click="clearHistory" class="action-btn" :disabled="colorHistory.length === 0">
          清空历史
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, onUnmounted } from 'vue'

// 当前颜色状态
const currentColor = ref('#3498db')
const showPicker = ref(true)
let isDraggingNow = false

// HSL 值（0-360, 0-100, 0-100）
const hsl = reactive({ h: 204, s: 70, l: 53 })
const alpha = ref(1)

// RGB 值（0-255）
const rgb = computed(() => hslToRgb(hsl.h, hsl.s, hsl.l))

// HEX 颜色
const hexColor = computed(() => rgbToHex(rgb.value.r, rgb.value.g, rgb.value.b))

// 处理位置
const slHandleX = ref(210)
const slHandleY = ref(40)
const hueHandleX = ref(136)
const alphaHandleX = ref(255)

// 历史记录和预设
const colorHistory = ref([])
const favoriteColors = ref([])
const presetColors = [
  '#ff5252', '#ff4081', '#e040fb', '#7c4dff', '#536dfe',
  '#448aff', '#40c4ff', '#18ffff', '#64ffda', '#69f0ae',
  '#b2ff59', '#eeff41', '#ffff00', '#ffd740', '#ffab40',
  '#ff6e40', '#8d6e63', '#bdbdbd', '#78909c', '#000000'
]

// 渐变生成器
const gradientStart = ref('#3498db')
const gradientEnd = ref('#e74c3c')
const gradientStyle = computed(() => 
  `linear-gradient(to right, ${gradientStart.value}, ${gradientEnd.value})`
)

// 渐变样式
const slGradientStyle = computed(() => ({
  background: `linear-gradient(to right, white, hsl(${hsl.h}, 100%, 50%)), 
               linear-gradient(to top, black, transparent)`
}))

const alphaGradient = computed(() => 
  `linear-gradient(to right, rgba(${rgb.value.r}, ${rgb.value.g}, ${rgb.value.b}, 0), 
   rgba(${rgb.value.r}, ${rgb.value.g}, ${rgb.value.b}, 1))`
)

// 颜色转换函数
function hslToRgb(h, s, l) {
  s /= 100
  l /= 100
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2
  
  let r, g, b
  if (h >= 0 && h < 60) [r, g, b] = [c, x, 0]
  else if (h >= 60 && h < 120) [r, g, b] = [x, c, 0]
  else if (h >= 120 && h < 180) [r, g, b] = [0, c, x]
  else if (h >= 180 && h < 240) [r, g, b] = [0, x, c]
  else if (h >= 240 && h < 300) [r, g, b] = [x, 0, c]
  else [r, g, b] = [c, 0, x]
  
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255)
  }
}

function rgbToHex(r, g, b) {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

function rgbToHsl(r, g, b) {
  r /= 255
  g /= 255
  b /= 255
  
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h, s, l = (max + min) / 2
  
  if (max === min) {
    h = s = 0
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    
    h /= 6
  }
  
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  }
}

// 更新颜色
function updateColor(addToHist = true) {
  currentColor.value = hexColor.value
  if (addToHist && !isDraggingNow) {
    addToHistory(currentColor.value)
  }
}

function updateFromHex() {
  const rgbValue = hexToRgb(hexColor.value)
  if (rgbValue) {
    const newHsl = rgbToHsl(rgbValue.r, rgbValue.g, rgbValue.b)
    Object.assign(hsl, newHsl)
    updateHandlePositions()
    updateColor()
  }
}

function updateFromRgb() {
  const newHsl = rgbToHsl(Number(rgb.value.r), Number(rgb.value.g), Number(rgb.value.b))
  Object.assign(hsl, newHsl)
  updateHandlePositions()
  updateColor()
}

function updateHandlePositions() {
  slHandleX.value = (hsl.s / 100) * 300
  slHandleY.value = (1 - hsl.l / 100) * 200
  hueHandleX.value = (hsl.h / 360) * 300
  alphaHandleX.value = alpha.value * 300
}

// 拖拽功能
let isDragging = false
let dragType = ''

function startDragging(type, e) {
  isDragging = true
  isDraggingNow = true
  dragType = type
  handleDrag(e)
  window.addEventListener('mousemove', handleDrag)
  window.addEventListener('mouseup', stopDragging)
}

function handleDrag(e) {
  if (!isDragging) return
  
  const rect = e.target.getBoundingClientRect()
  const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left))
  const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top))
  
  switch (dragType) {
    case 'sl':
      slHandleX.value = x
      slHandleY.value = y
      hsl.s = Math.round((x / rect.width) * 100)
      hsl.l = 100 - Math.round((y / rect.height) * 100)
      break
    case 'hue':
      hueHandleX.value = x
      hsl.h = Math.round((x / rect.width) * 360)
      break
    case 'alpha':
      alphaHandleX.value = x
      alpha.value = x / rect.width
      break
  }
  
  updateColor(false) // 拖拽时不添加到历史记录
}

function stopDragging() {
  isDragging = false
  isDraggingNow = false
  // 拖拽结束后才添加到历史记录
  addToHistory(currentColor.value)
  window.removeEventListener('mousemove', handleDrag)
  window.removeEventListener('mouseup', stopDragging)
}

// 工具函数
function setColor(color) {
  const rgbValue = hexToRgb(color)
  if (rgbValue) {
    const newHsl = rgbToHsl(rgbValue.r, rgbValue.g, rgbValue.b)
    Object.assign(hsl, newHsl)
    updateHandlePositions()
    updateColor()
  }
}

function addToHistory(color) {
  if (!colorHistory.value.includes(color)) {
    colorHistory.value.unshift(color)
    if (colorHistory.value.length > 20) {
      colorHistory.value.pop()
    }
    // 保存到 localStorage
    localStorage.setItem('colorHistory', JSON.stringify(colorHistory.value))
  }
}

function addToFavorites() {
  if (!favoriteColors.value.includes(currentColor.value)) {
    favoriteColors.value.push(currentColor.value)
    localStorage.setItem('colorFavorites', JSON.stringify(favoriteColors.value))
    alert('已添加到收藏')
  } else {
    alert('颜色已在收藏中')
  }
}

function removeFromFavorites(index) {
  event.preventDefault()
  favoriteColors.value.splice(index, 1)
  localStorage.setItem('colorFavorites', JSON.stringify(favoriteColors.value))
}

function copyToClipboard() {
  navigator.clipboard.writeText(currentColor.value)
    .then(() => alert('颜色已复制到剪贴板：' + currentColor.value))
    .catch(err => console.error('复制失败:', err))
}

function clearHistory() {
  colorHistory.value = []
  localStorage.removeItem('colorHistory')
}

// 渐变功能
function updateGradient() {
  // 自动更新渐变预览
}

function applyGradient() {
  // 应用渐变中间色
  const midColor = getGradientMidColor(gradientStart.value, gradientEnd.value)
  setColor(midColor)
}

function copyGradient() {
  const cssCode = `background: ${gradientStyle.value};`
  navigator.clipboard.writeText(cssCode)
    .then(() => alert('渐变CSS代码已复制到剪贴板'))
    .catch(err => console.error('复制失败:', err))
}

function getGradientMidColor(color1, color2) {
  const rgb1 = hexToRgb(color1)
  const rgb2 = hexToRgb(color2)
  
  if (rgb1 && rgb2) {
    const r = Math.round((rgb1.r + rgb2.r) / 2)
    const g = Math.round((rgb1.g + rgb2.g) / 2)
    const b = Math.round((rgb1.b + rgb2.b) / 2)
    return rgbToHex(r, g, b)
  }
  return '#000000'
}

// 生命周期
onMounted(() => {
  // 从 localStorage 加载历史记录和收藏
  const savedHistory = localStorage.getItem('colorHistory')
  const savedFavorites = localStorage.getItem('colorFavorites')
  
  if (savedHistory) {
    colorHistory.value = JSON.parse(savedHistory)
  }
  if (savedFavorites) {
    favoriteColors.value = JSON.parse(savedFavorites)
  }
  
  updateHandlePositions()
})

onUnmounted(() => {
  stopDragging()
})
</script>

<style scoped>
.color-picker {
  display: flex;
  gap: 20px;
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.color-picker-main {
  flex: 1;
}

.color-display {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}

.current-color {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  border: 2px solid #ddd;
  cursor: pointer;
  transition: transform 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.current-color:hover {
  transform: scale(1.05);
}

.color-inputs {
  flex: 1;
}

.hex-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  margin-bottom: 8px;
  font-size: 14px;
}

.hex-input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.rgb-inputs {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 12px;
  color: #666;
}

.rgb-inputs input {
  width: 50px;
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  text-align: center;
}

.picker-panel {
  border: 1px solid #eee;
  padding: 20px;
  border-radius: 8px;
  background: #fafafa;
}

.saturation-lightness {
  position: relative;
  width: 300px;
  height: 200px;
  margin-bottom: 20px;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.sl-gradient {
  width: 100%;
  height: 100%;
}

.sl-handle {
  position: absolute;
  width: 16px;
  height: 16px;
  border: 2px solid white;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 3px rgba(0, 0, 0, 0.5);
  pointer-events: none;
}

.hue-slider, .alpha-slider {
  position: relative;
  width: 300px;
  height: 20px;
  margin-bottom: 20px;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.hue-gradient {
  width: 100%;
  height: 100%;
  background: linear-gradient(to right, 
    #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000);
}

.alpha-slider {
  position: relative;
}

.alpha-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    linear-gradient(45deg, #ccc 25%, transparent 25%),
    linear-gradient(-45deg, #ccc 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #ccc 75%),
    linear-gradient(-45deg, transparent 75%, #ccc 75%);
  background-size: 10px 10px;
  background-position: 0 0, 0 5px, 5px -5px, -5px 0px;
  border-radius: 10px;
}

.alpha-gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 10px;
}

.hue-handle, .alpha-handle {
  position: absolute;
  top: 0;
  width: 4px;
  height: 100%;
  background: white;
  transform: translateX(-50%);
  box-shadow: 0 0 3px rgba(0, 0, 0, 0.5);
  pointer-events: none;
  border-radius: 1px;
}

.color-formats {
  margin-top: 15px;
  padding: 12px;
  background: white;
  border-radius: 6px;
  font-size: 12px;
  color: #666;
  border: 1px solid #eee;
}

.color-formats div {
  margin-bottom: 4px;
}

.color-formats div:last-child {
  margin-bottom: 0;
}

.color-tools {
  width: 220px;
}

.preset-palette, .color-favorites, .color-history, .gradient-generator {
  margin-bottom: 20px;
}

.preset-palette h4, .color-favorites h4, .color-history h4, .gradient-generator h4 {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #333;
  font-weight: 600;
}

.preset-colors, .favorite-colors, .history-colors {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
}

.preset-color, .favorite-color, .history-color {
  width: 100%;
  height: 30px;
  border-radius: 4px;
  cursor: pointer;
  border: 1px solid #ddd;
  transition: transform 0.2s;
  position: relative;
}

.preset-color:hover, .favorite-color:hover, .history-color:hover {
  transform: scale(1.1);
}

.favorite-color::after {
  content: '★';
  position: absolute;
  top: 2px;
  right: 2px;
  font-size: 8px;
  color: gold;
  text-shadow: 0 0 1px black;
}

.gradient-controls {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.gradient-color {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  border: 2px solid #ddd;
  position: relative;
  overflow: hidden;
}

.gradient-color input[type="color"] {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.gradient-preview {
  height: 40px;
  border-radius: 6px;
  border: 2px solid #ddd;
  margin-bottom: 10px;
  background: v-bind(gradientStyle);
}

.gradient-actions {
  display: flex;
  gap: 8px;
}

.color-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-btn {
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  background: #3498db;
  color: white;
  cursor: pointer;
  font-size: 12px;
  transition: background-color 0.2s;
}

.action-btn:hover {
  background: #2980b9;
}

.action-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.action-btn:active {
  transform: translateY(1px);
}
</style>