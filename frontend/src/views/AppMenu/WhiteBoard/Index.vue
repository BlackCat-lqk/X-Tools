<template>
  <div class="whiteboard-container">
    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="tool-group">
        <button 
          @click="setTool('pen')" 
          :class="{ active: currentTool === 'pen' }" 
          class="tool-btn"
          title="画笔"
        >
          <i class="fas fa-pen"></i>
        </button>
        <button 
          @click="setTool('eraser')" 
          :class="{ active: currentTool === 'eraser' }" 
          class="tool-btn"
          title="橡皮擦"
        >
          <i class="fas fa-eraser"></i>
        </button>
        <button 
          @click="setTool('line')" 
          :class="{ active: currentTool === 'line' }" 
          class="tool-btn"
          title="直线"
        >
          <i class="fas fa-minus"></i>
        </button>
        <button 
          @click="setTool('rectangle')" 
          :class="{ active: currentTool === 'rectangle' }" 
          class="tool-btn"
          title="矩形"
        >
          <i class="fas fa-square"></i>
        </button>
        <button 
          @click="setTool('circle')" 
          :class="{ active: currentTool === 'circle' }" 
          class="tool-btn"
          title="圆形"
        >
          <i class="fas fa-circle"></i>
        </button>
        <button 
          @click="setTool('text')" 
          :class="{ active: currentTool === 'text' }" 
          class="tool-btn"
          title="文字"
        >
          <i class="fas fa-font"></i>
        </button>
      </div>

      <div class="tool-group">
        <div class="color-picker">
          <input type="color" v-model="currentColor" title="选择颜色">
          <div class="color-presets">
            <div 
              v-for="color in colorPresets" 
              :key="color" 
              :style="{ backgroundColor: color }"
              @click="currentColor = color"
              class="color-preset"
            ></div>
          </div>
        </div>
        
        <div class="brush-size">
          <label>粗细:</label>
          <input 
            type="range" 
            v-model.number="brushSize" 
            min="1" 
            max="50" 
            title="画笔粗细"
          >
          <span>{{ brushSize }}px</span>
        </div>
      </div>

      <div class="tool-group">
        <button @click="undo" :disabled="historyIndex <= 0" class="tool-btn" title="撤销">
          <i class="fas fa-undo"></i>
        </button>
        <button @click="redo" :disabled="historyIndex >= history.length - 1" class="tool-btn" title="重做">
          <i class="fas fa-redo"></i>
        </button>
        <button @click="clearCanvas" class="tool-btn" title="清空白板">
          <i class="fas fa-trash"></i>
        </button>
        <button @click="saveImage" class="tool-btn" title="保存图片">
          <i class="fas fa-download"></i>
        </button>
      </div>
    </div>

    <!-- 画布区域 -->
    <div class="canvas-container" ref="canvasContainer">
      <canvas
        ref="canvas"
        @mousedown="startDrawing"
        @mousemove="draw"
        @mouseup="stopDrawing"
        @mouseleave="stopDrawing"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
      ></canvas>
    </div>

    <!-- 文字输入模态框 -->
    <div v-if="textInputVisible" class="text-modal">
      <div class="modal-content">
        <h3>输入文字</h3>
        <input 
          v-model="textInput" 
          @keyup.enter="addText" 
          placeholder="输入文字..."
          ref="textInputRef"
        >
        <div class="modal-actions">
          <button @click="addText" class="btn-primary">确认</button>
          <button @click="cancelText" class="btn-secondary">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'

// 画布引用和上下文
const canvas = ref(null)
const canvasContainer = ref(null)
const ctx = ref(null)

// 工具状态
const currentTool = ref('pen')
const currentColor = ref('#000000')
const brushSize = ref(5)
const isDrawing = ref(false)
const lastX = ref(0)
const lastY = ref(0)

// 文字工具状态
const textInputVisible = ref(false)
const textInput = ref('')
const textInputRef = ref(null)
const textPosition = ref({ x: 0, y: 0 })

// 历史记录
const history = ref([])
const historyIndex = ref(-1)

// 颜色预设
const colorPresets = ref([
  '#000000', '#ff0000', '#00ff00', '#0000ff', '#ffff00',
  '#ff00ff', '#00ffff', '#ffffff', '#888888', '#ff8800'
])

// 形状绘制状态
const startX = ref(0)
const startY = ref(0)
const isDrawingShape = ref(false)

// 初始化画布
const initCanvas = () => {
  const canvasEl = canvas.value
  const container = canvasContainer.value
  
  if (!canvasEl || !container) return

  // 等待DOM更新完成
  nextTick(() => {
    // 获取容器尺寸
    const width = container.offsetWidth
    const height = container.offsetHeight

    // 设置画布尺寸
    canvasEl.width = width
    canvasEl.height = height

    // 获取上下文
    ctx.value = canvasEl.getContext('2d')
    ctx.value.lineCap = 'round'
    ctx.value.lineJoin = 'round'

    // 初始化白色背景
    ctx.value.fillStyle = '#ffffff'
    ctx.value.fillRect(0, 0, width, height)

    // 初始化历史记录
    saveToHistory()
  })
}

// 设置工具
const setTool = (tool) => {
  currentTool.value = tool
}

// 开始绘制
const startDrawing = (e) => {
  if (currentTool.value === 'text') {
    showTextInput(e)
    return
  }

  isDrawing.value = true
  const rect = canvas.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top

  lastX.value = x
  lastY.value = y
  startX.value = x
  startY.value = y

  if (['line', 'rectangle', 'circle'].includes(currentTool.value)) {
    isDrawingShape.value = true
    // 保存当前状态到历史记录
    saveToHistory()
  }
}

// 绘制
const draw = (e) => {
  if (!isDrawing.value || !ctx.value) return

  const rect = canvas.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top

  ctx.value.strokeStyle = currentColor.value
  ctx.value.lineWidth = brushSize.value

  if (currentTool.value === 'pen') {
    ctx.value.beginPath()
    ctx.value.moveTo(lastX.value, lastY.value)
    ctx.value.lineTo(x, y)
    ctx.value.stroke()
  } else if (currentTool.value === 'eraser') {
    ctx.value.save()
    ctx.value.globalCompositeOperation = 'destination-out'
    ctx.value.beginPath()
    ctx.value.arc(x, y, brushSize.value, 0, Math.PI * 2)
    ctx.value.fill()
    ctx.value.restore()
  }

  lastX.value = x
  lastY.value = y
}

// 停止绘制
const stopDrawing = () => {
  if (!isDrawing.value) return

  if (isDrawingShape.value) {
    drawShape()
    isDrawingShape.value = false
  }

  isDrawing.value = false
  // 保存到历史记录
  saveToHistory()
}

// 绘制形状
const drawShape = () => {
  if (!ctx.value) return

  const endX = lastX.value
  const endY = lastY.value

  ctx.value.strokeStyle = currentColor.value
  ctx.value.lineWidth = brushSize.value
  ctx.value.beginPath()

  switch (currentTool.value) {
    case 'line':
      ctx.value.moveTo(startX.value, startY.value)
      ctx.value.lineTo(endX, endY)
      break
    case 'rectangle':
      const width = endX - startX.value
      const height = endY - startY.value
      ctx.value.strokeRect(startX.value, startY.value, width, height)
      break
    case 'circle':
      const radius = Math.sqrt(Math.pow(endX - startX.value, 2) + Math.pow(endY - startY.value, 2))
      ctx.value.arc(startX.value, startY.value, radius, 0, Math.PI * 2)
      break
  }

  ctx.value.stroke()
}

// 显示文字输入框
const showTextInput = (e) => {
  const rect = canvas.value.getBoundingClientRect()
  textPosition.value = {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  }
  textInputVisible.value = true
  textInput.value = ''
  
  nextTick(() => {
    textInputRef.value?.focus()
  })
}

// 添加文字
const addText = () => {
  if (textInput.value.trim() && ctx.value) {
    ctx.value.font = `${brushSize.value * 4}px Arial`
    ctx.value.fillStyle = currentColor.value
    ctx.value.fillText(textInput.value, textPosition.value.x, textPosition.value.y)
    saveToHistory()
  }
  textInputVisible.value = false
}

// 取消文字输入
const cancelText = () => {
  textInputVisible.value = false
}

// 安全地保存到历史记录
const saveToHistory = () => {
  if (!ctx.value || !canvas.value) return
  
  const width = canvas.value.width
  const height = canvas.value.height
  
  // 检查画布尺寸是否有效
  if (width === 0 || height === 0) {
    console.warn('Canvas dimensions are zero, skipping history save')
    return
  }

  try {
    const imageData = ctx.value.getImageData(0, 0, width, height)
    // 只保存最近100个历史记录
    if (historyIndex.value < history.value.length - 1) {
      history.value = history.value.slice(0, historyIndex.value + 1)
    }
    history.value.push(imageData)
    historyIndex.value = history.value.length - 1
    
    if (history.value.length > 100) {
      history.value.shift()
      historyIndex.value = history.value.length - 1
    }
  } catch (error) {
    console.error('Failed to save to history:', error)
  }
}

// 撤销
const undo = () => {
  if (historyIndex.value > 0 && ctx.value) {
    historyIndex.value--
    const imageData = history.value[historyIndex.value]
    // 清空画布
    ctx.value.clearRect(0, 0, canvas.value.width, canvas.value.height)
    // 恢复历史状态
    ctx.value.putImageData(imageData, 0, 0)
  }
}

// 重做
const redo = () => {
  if (historyIndex.value < history.value.length - 1 && ctx.value) {
    historyIndex.value++
    const imageData = history.value[historyIndex.value]
    // 清空画布
    ctx.value.clearRect(0, 0, canvas.value.width, canvas.value.height)
    // 恢复历史状态
    ctx.value.putImageData(imageData, 0, 0)
  }
}

// 清空画布
const clearCanvas = () => {
  if (ctx.value && canvas.value) {
    ctx.value.clearRect(0, 0, canvas.value.width, canvas.value.height)
    // 填充白色背景
    ctx.value.fillStyle = '#ffffff'
    ctx.value.fillRect(0, 0, canvas.value.width, canvas.value.height)
    saveToHistory()
  }
}

// 保存图片
const saveImage = () => {
  if (!canvas.value) return
  
  try {
    const link = document.createElement('a')
    link.download = `whiteboard-${new Date().getTime()}.png`
    link.href = canvas.value.toDataURL('image/png')
    link.click()
  } catch (error) {
    console.error('Failed to save image:', error)
    alert('保存图片失败，请重试')
  }
}

// 触摸事件处理
const handleTouchStart = (e) => {
  e.preventDefault()
  const touch = e.touches[0]
  const mouseEvent = new MouseEvent('mousedown', {
    clientX: touch.clientX,
    clientY: touch.clientY
  })
  canvas.value.dispatchEvent(mouseEvent)
}

const handleTouchMove = (e) => {
  e.preventDefault()
  const touch = e.touches[0]
  const mouseEvent = new MouseEvent('mousemove', {
    clientX: touch.clientX,
    clientY: touch.clientY
  })
  canvas.value.dispatchEvent(mouseEvent)
}

const handleTouchEnd = (e) => {
  e.preventDefault()
  const mouseEvent = new MouseEvent('mouseup', {})
  canvas.value.dispatchEvent(mouseEvent)
}

// 窗口大小改变时重置画布
const handleResize = () => {
  if (canvas.value && ctx.value) {
    // 保存当前内容
    const currentImage = ctx.value.getImageData(0, 0, canvas.value.width, canvas.value.height)
    
    // 获取新的容器尺寸
    const width = canvasContainer.value.offsetWidth
    const height = canvasContainer.value.offsetHeight
    
    // 设置新的画布尺寸
    canvas.value.width = width
    canvas.value.height = height
    
    // 恢复内容
    if (currentImage.width > 0 && currentImage.height > 0) {
      ctx.value.putImageData(currentImage, 0, 0)
    } else {
      // 如果之前没有内容，填充白色背景
      ctx.value.fillStyle = '#ffffff'
      ctx.value.fillRect(0, 0, width, height)
    }
    
    // 保存到历史记录
    saveToHistory()
  }
}

// 使用ResizeObserver监听容器大小变化
let resizeObserver = null

// 生命周期钩子
onMounted(() => {
  initCanvas()
  
  // 使用ResizeObserver监听容器大小变化
  if (canvasContainer.value && typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(canvasContainer.value)
  } else {
    //  fallback
    window.addEventListener('resize', handleResize)
  }
})

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
  } else {
    window.removeEventListener('resize', handleResize)
  }
})

// 监听容器引用变化
watch(canvasContainer, (newContainer) => {
  if (newContainer) {
    initCanvas()
  }
})
</script>

<style scoped>
.whiteboard-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
  flex-wrap: wrap;
  gap: 15px;
}

.tool-group {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.tool-btn {
  padding: 10px;
  border: 2px solid #e0e0e0;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tool-btn:hover {
  border-color: #2196f3;
  background: #f0f8ff;
}

.tool-btn.active {
  border-color: #2196f3;
  background: #2196f3;
  color: white;
}

.tool-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.color-picker {
  display: flex;
  align-items: center;
  gap: 10px;
}

.color-picker input[type="color"] {
  width: 44px;
  height: 44px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  padding: 0;
}

.color-presets {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}

.color-preset {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  cursor: pointer;
  border: 2px solid #e0e0e0;
  transition: transform 0.2s;
}

.color-preset:hover {
  transform: scale(1.2);
}

.brush-size {
  display: flex;
  align-items: center;
  gap: 10px;
}

.brush-size label {
  font-weight: 500;
  color: #666;
}

.brush-size input {
  width: 80px;
}

.brush-size span {
  min-width: 40px;
  text-align: center;
  font-size: 14px;
  color: #666;
}

.canvas-container {
  flex: 1;
  overflow: hidden;
  position: relative;
  min-height: 400px; /* 确保最小高度 */
}

canvas {
  background: white;
  cursor: crosshair;
  display: block;
  width: 100%;
  height: 100%;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.text-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
}

.modal-content h3 {
  margin: 0 0 15px 0;
  color: #333;
}

.modal-content input {
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  margin-bottom: 15px;
}

.modal-content input:focus {
  outline: none;
  border-color: #2196f3;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.btn-primary {
  padding: 10px 20px;
  background: #2196f3;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

.btn-secondary {
  padding: 10px 20px;
  background: #f5f5f5;
  color: #666;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

.btn-primary:hover {
  background: #1976d2;
}

.btn-secondary:hover {
  background: #e0e0e0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .tool-group {
    justify-content: center;
  }
  
  .color-presets {
    justify-content: center;
  }
  
  .brush-size {
    justify-content: center;
  }
  
  .canvas-container {
    min-height: 300px;
  }
}
</style>