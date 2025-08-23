<template>
  <div class="pomodoro-container">
    <!-- 时钟显示区域 -->
    <div class="clock-display">
      <div class="timer-circle">
        <svg class="progress-ring" width="300" height="300">
          <circle
            class="progress-ring-background"
            stroke="#e0e0e0"
            stroke-width="12"
            fill="transparent"
            r="140"
            cx="150"
            cy="150"
          />
          <circle
            class="progress-ring-circle"
            :stroke="progressColor"
            stroke-width="12"
            fill="transparent"
            r="140"
            cx="150"
            cy="150"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="strokeDashoffset"
            stroke-linecap="round"
            transform="rotate(-90 150 150)"
          />
        </svg>
        <div class="timer-text">
          <div class="time-display">{{ formattedTime }}</div>
          <div class="timer-status">{{ statusText }}</div>
        </div>
      </div>
    </div>

    <!-- 控制按钮 -->
    <div class="control-buttons">
      <button @click="startTimer" :disabled="isRunning" class="btn btn-start">
        <i class="fas fa-play"></i> 开始
      </button>
      <button @click="pauseTimer" :disabled="!isRunning" class="btn btn-pause">
        <i class="fas fa-pause"></i> 暂停
      </button>
      <button @click="resetTimer" class="btn btn-reset">
        <i class="fas fa-redo"></i> 重置
      </button>
      <button @click="skipSession" :disabled="!isRunning" class="btn btn-skip">
        <i class="fas fa-forward"></i> 跳过
      </button>
    </div>

    <!-- 设置区域 -->
    <div class="settings-panel">
      <div class="setting-group">
        <label>专注时间 (分钟):</label>
        <input
          type="number"
          v-model.number="focusTime"
          min="1"
          max="60"
          :disabled="isRunning"
        />
      </div>
      <div class="setting-group">
        <label>休息时间 (分钟):</label>
        <input
          type="number"
          v-model.number="breakTime"
          min="1"
          max="30"
          :disabled="isRunning"
        />
      </div>
      <div class="setting-group">
        <label>长休息时间 (分钟):</label>
        <input
          type="number"
          v-model.number="longBreakTime"
          min="1"
          max="45"
          :disabled="isRunning"
        />
      </div>
      <div class="setting-group">
        <label>长休息间隔:</label>
        <input
          type="number"
          v-model.number="sessionsBeforeLongBreak"
          min="1"
          max="8"
          :disabled="isRunning"
        />
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="stats-panel">
      <div class="stat-item">
        <span class="stat-label">已完成番茄:</span>
        <span class="stat-value">{{ completedSessions }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">当前阶段:</span>
        <span class="stat-value">{{ isBreak ? '休息' : '专注' }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">下一个长休息:</span>
        <span class="stat-value">{{ sessionsBeforeLongBreak - (completedSessions % sessionsBeforeLongBreak) }}</span>
      </div>
    </div>

    <!-- 通知和声音 -->
    <audio ref="completeSound" src="https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3" preload="auto"></audio>
    <audio ref="tickSound" src="https://assets.mixkit.co/sfx/preview/mixkit-clock-countdown-bleeps-916.mp3" preload="auto"></audio>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

// 定时器状态
const isRunning = ref(false)
const isBreak = ref(false)
const timeLeft = ref(0)
const completedSessions = ref(0)
const timerInterval = ref(null)

// 设置参数
const focusTime = ref(25)
const breakTime = ref(5)
const longBreakTime = ref(15)
const sessionsBeforeLongBreak = ref(4)

// 音频引用
const completeSound = ref(null)
const tickSound = ref(null)

// 计算属性
const formattedTime = computed(() => {
  const minutes = Math.floor(timeLeft.value / 60)
  const seconds = timeLeft.value % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

const statusText = computed(() => {
  if (isRunning.value) {
    return isBreak.value ? '休息中' : '专注中'
  }
  return isBreak.value ? '休息时间' : '准备专注'
})

const progressColor = computed(() => {
  return isBreak.value ? '#4CAF50' : '#FF5252'
})

const circumference = computed(() => 2 * Math.PI * 140)
const strokeDashoffset = computed(() => {
  const totalTime = isBreak.value ? 
    (completedSessions.value % sessionsBeforeLongBreak.value === 0 ? longBreakTime.value : breakTime.value) * 60 
    : focusTime.value * 60
  const progress = (totalTime - timeLeft.value) / totalTime
  return circumference.value * (1 - progress)
})

// 初始化计时器
const initializeTimer = () => {
  timeLeft.value = isBreak.value ? 
    (completedSessions.value % sessionsBeforeLongBreak.value === 0 ? longBreakTime.value : breakTime.value) * 60 
    : focusTime.value * 60
}

// 开始计时器
const startTimer = () => {
  if (timeLeft.value === 0) {
    initializeTimer()
  }
  isRunning.value = true
  
  timerInterval.value = setInterval(() => {
    timeLeft.value--
    
    // 播放滴答声（最后10秒）
    if (timeLeft.value <= 10 && timeLeft.value > 0) {
      playTickSound()
    }
    
    if (timeLeft.value <= 0) {
      completeSession()
    }
  }, 1000)
}

// 暂停计时器
const pauseTimer = () => {
  isRunning.value = false
  clearInterval(timerInterval.value)
}

// 重置计时器
const resetTimer = () => {
  pauseTimer()
  initializeTimer()
}

// 跳过当前阶段
const skipSession = () => {
  pauseTimer()
  completeSession()
}

// 完成当前阶段
const completeSession = () => {
  pauseTimer()
  playCompleteSound()
  
  if (!isBreak.value) {
    // 完成一个专注阶段
    completedSessions.value++
  }
  
  // 切换阶段
  isBreak.value = !isBreak.value
  initializeTimer()
  
  // 发送浏览器通知
  if (Notification.permission === 'granted') {
    new Notification(isBreak.value ? '休息时间到!' : '专注时间开始!', {
      body: isBreak.value ? '该休息一下了' : '开始新的专注阶段',
      icon: '/favicon.ico'
    })
  }
}

// 播放声音
const playCompleteSound = () => {
  if (completeSound.value) {
    completeSound.value.currentTime = 0
    completeSound.value.play()
  }
}

const playTickSound = () => {
  if (tickSound.value && timeLeft.value > 0) {
    tickSound.value.currentTime = 0
    tickSound.value.play()
  }
}

// 请求通知权限
const requestNotificationPermission = () => {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission()
  }
}

// 监听设置变化
watch([focusTime, breakTime, longBreakTime], () => {
  if (!isRunning.value) {
    initializeTimer()
  }
})

// 生命周期钩子
onMounted(() => {
  initializeTimer()
  requestNotificationPermission()
})

onUnmounted(() => {
  pauseTimer()
})
</script>

<style scoped>
.pomodoro-container {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.clock-display {
  margin-bottom: 30px;
}

.timer-circle {
  position: relative;
  width: 300px;
  height: 300px;
  margin: 0 auto;
}

.progress-ring {
  position: absolute;
  top: 0;
  left: 0;
}

.progress-ring-circle {
  transition: stroke-dashoffset 1s linear;
}

.timer-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.time-display {
  font-size: 48px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
  font-family: 'Courier New', monospace;
}

.timer-status {
  font-size: 16px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.control-buttons {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.btn {
  padding: 12px 20px;
  border: none;
  border-radius: 25px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 80px;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-start {
  background: #4CAF50;
  color: white;
}

.btn-start:hover:not(:disabled) {
  background: #45a049;
  transform: translateY(-2px);
}

.btn-pause {
  background: #FF9800;
  color: white;
}

.btn-pause:hover:not(:disabled) {
  background: #f57c00;
  transform: translateY(-2px);
}

.btn-reset {
  background: #f44336;
  color: white;
}

.btn-reset:hover:not(:disabled) {
  background: #da190b;
  transform: translateY(-2px);
}

.btn-skip {
  background: #2196F3;
  color: white;
}

.btn-skip:hover:not(:disabled) {
  background: #0b7dda;
  transform: translateY(-2px);
}

.settings-panel {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 25px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 15px;
}

.setting-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.setting-group label {
  font-size: 12px;
  color: #666;
  font-weight: 600;
}

.setting-group input {
  padding: 8px 12px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.setting-group input:focus {
  outline: none;
  border-color: #2196F3;
}

.setting-group input:disabled {
  background: #f1f3f4;
  cursor: not-allowed;
}

.stats-panel {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  padding: 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 15px;
  color: white;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.stat-label {
  font-size: 12px;
  opacity: 0.9;
}

.stat-value {
  font-size: 18px;
  font-weight: bold;
}

/* 响应式设计 */
@media (max-width: 600px) {
  .pomodoro-container {
    padding: 15px;
    margin: 10px;
  }
  
  .timer-circle {
    width: 250px;
    height: 250px;
  }
  
  .progress-ring {
    width: 250px;
    height: 250px;
  }
  
  .progress-ring circle {
    r: 115;
    cx: 125;
    cy: 125;
  }
  
  .time-display {
    font-size: 36px;
  }
  
  .settings-panel {
    grid-template-columns: 1fr;
  }
  
  .stats-panel {
    grid-template-columns: 1fr;
  }
  
  .control-buttons {
    gap: 8px;
  }
  
  .btn {
    padding: 10px 16px;
    font-size: 12px;
    min-width: 70px;
  }
}
</style>