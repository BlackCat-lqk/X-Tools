<template>
  <div class="holiday-viewer">
    <div class="header">
      <h1><i class="fas fa-calendar-alt"></i> 节假日查看工具</h1>
      <p>查询中国法定节假日及调休安排</p>
    </div>
    
    <div class="controls">
      <div class="year-selector">
        <button @click="prevYear" class="nav-btn">
          <i class="fas fa-chevron-left"></i>
        </button>
        <h2>{{ year }}年</h2>
        <button @click="nextYear" class="nav-btn">
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
      
      <div class="view-options">
        <button 
          :class="['view-btn', {active: viewMode === 'year'}]" 
          @click="viewMode = 'year'"
        >
          <i class="fas fa-calendar"></i> 年度视图
        </button>
        <button 
          :class="['view-btn', {active: viewMode === 'month'}]" 
          @click="viewMode = 'month'"
        >
          <i class="fas fa-calendar-day"></i> 月度视图
        </button>
      </div>
    </div>
    
    <div class="filter-section">
      <div class="search-box">
        <input 
          v-model="searchTerm" 
          placeholder="搜索节假日名称..." 
          type="text"
        >
        <i class="fas fa-search"></i>
      </div>
      
      <div class="filter-options">
        <label class="filter-checkbox">
          <input type="checkbox" v-model="showWorkDays"> 显示调休工作日
        </label>
        <label class="filter-checkbox">
          <input type="checkbox" v-model="showHolidays" checked> 显示节假日
        </label>
      </div>
    </div>
    
    <div v-if="viewMode === 'year'" class="year-view">
      <div class="year-stats">
        <div class="stat-card">
          <div class="stat-value">{{ totalHolidays }}</div>
          <div class="stat-label">总放假天数</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ longWeekends }}</div>
          <div class="stat-label">小长假数量</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ workDaysCount }}</div>
          <div class="stat-label">调休工作日</div>
        </div>
      </div>
      
      <div class="holiday-list">
        <h3>{{ year }}年节假日安排</h3>
        
        <div v-for="holiday in filteredHolidays" :key="holiday.name" class="holiday-item">
          <div class="holiday-header">
            <div class="holiday-name">{{ holiday.name }}</div>
            <div class="holiday-duration">
              {{ formatDate(holiday.start) }} - {{ formatDate(holiday.end) }}
              <span class="day-count">(共{{ holiday.days }}天)</span>
            </div>
          </div>
          
          <div class="holiday-details">
            <div class="date-list">
              <span 
                v-for="date in holiday.dates" 
                :key="date.date"
                :class="['date-tag', {workday: date.isWorkday}]"
              >
                {{ formatDay(date.date) }}
                <span v-if="date.isWorkday" class="work-indicator">班</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="viewMode === 'month'" class="month-view">
      <div class="month-selector">
        <select v-model="selectedMonth">
          <option v-for="month in 12" :key="month" :value="month">
            {{ month }}月
          </option>
        </select>
      </div>
      
      <div class="calendar">
        <div class="calendar-header">
          <div v-for="day in weekDays" :key="day" class="week-day">{{ day }}</div>
        </div>
        
        <div class="calendar-body">
          <div 
            v-for="day in calendarDays" 
            :key="day.date"
            :class="[
              'calendar-day', 
              { 
                'other-month': !day.isCurrentMonth,
                'weekend': day.isWeekend,
                'holiday': day.isHoliday,
                'workday': day.isWorkday
              }
            ]"
          >
            <div class="day-number">{{ day.day }}</div>
            <div v-if="day.holiday" class="holiday-label">{{ day.holiday }}</div>
            <div v-if="day.isWorkday" class="work-label">班</div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="legend">
      <div class="legend-item">
        <div class="color-box holiday"></div>
        <span>节假日</span>
      </div>
      <div class="legend-item">
        <div class="color-box workday"></div>
        <span>调休工作日</span>
      </div>
      <div class="legend-item">
        <div class="color-box weekend"></div>
        <span>周末</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// 响应式数据
const year = ref(new Date().getFullYear())
const viewMode = ref('year')
const selectedMonth = ref(new Date().getMonth() + 1)
const searchTerm = ref('')
const showWorkDays = ref(true)
const showHolidays = ref(true)

// 周几名称
const weekDays = ['日', '一', '二', '三', '四', '五', '六']

// 模拟节假日数据（实际应用中应该从API获取）
const holidaysData = [
  {
    name: '元旦',
    year: 2023,
    start: '2023-12-30',
    end: '2024-01-01',
    days: 3,
    dates: [
      { date: '2023-12-30', isWorkday: false },
      { date: '2023-12-31', isWorkday: false },
      { date: '2024-01-01', isWorkday: false }
    ]
  },
  {
    name: '春节',
    year: 2024,
    start: '2024-02-10',
    end: '2024-02-17',
    days: 8,
    dates: [
      { date: '2024-02-10', isWorkday: false },
      { date: '2024-02-11', isWorkday: false },
      { date: '2024-02-12', isWorkday: false },
      { date: '2024-02-13', isWorkday: false },
      { date: '2024-02-14', isWorkday: false },
      { date: '2024-02-15', isWorkday: false },
      { date: '2024-02-16', isWorkday: false },
      { date: '2024-02-17', isWorkday: false },
      { date: '2024-02-04', isWorkday: true },
      { date: '2024-02-18', isWorkday: true }
    ]
  },
  {
    name: '清明节',
    year: 2024,
    start: '2024-04-04',
    end: '2024-04-06',
    days: 3,
    dates: [
      { date: '2024-04-04', isWorkday: false },
      { date: '2024-04-05', isWorkday: false },
      { date: '2024-04-06', isWorkday: false },
      { date: '2024-04-07', isWorkday: true }
    ]
  },
  {
    name: '劳动节',
    year: 2024,
    start: '2024-05-01',
    end: '2024-05-05',
    days: 5,
    dates: [
      { date: '2024-05-01', isWorkday: false },
      { date: '2024-05-02', isWorkday: false },
      { date: '2024-05-03', isWorkday: false },
      { date: '2024-05-04', isWorkday: false },
      { date: '2024-05-05', isWorkday: false },
      { date: '2024-04-28', isWorkday: true },
      { date: '2024-05-11', isWorkday: true }
    ]
  },
  {
    name: '端午节',
    year: 2024,
    start: '2024-06-08',
    end: '2024-06-10',
    days: 3,
    dates: [
      { date: '2024-06-08', isWorkday: false },
      { date: '2024-06-09', isWorkday: false },
      { date: '2024-06-10', isWorkday: false },
      { date: '2024-06-11', isWorkday: true }
    ]
  },
  {
    name: '中秋节',
    year: 2024,
    start: '2024-09-15',
    end: '2024-09-17',
    days: 3,
    dates: [
      { date: '2024-09-15', isWorkday: false },
      { date: '2024-09-16', isWorkday: false },
      { date: '2024-09-17', isWorkday: false },
      { date: '2024-09-14', isWorkday: true }
    ]
  },
  {
    name: '国庆节',
    year: 2024,
    start: '2024-10-01',
    end: '2024-10-07',
    days: 7,
    dates: [
      { date: '2024-10-01', isWorkday: false },
      { date: '2024-10-02', isWorkday: false },
      { date: '2024-10-03', isWorkday: false },
      { date: '2024-10-04', isWorkday: false },
      { date: '2024-10-05', isWorkday: false },
      { date: '2024-10-06', isWorkday: false },
      { date: '2024-10-07', isWorkday: false },
      { date: '2024-09-29', isWorkday: true },
      { date: '2024-10-12', isWorkday: true }
    ]
  }
]

// 计算属性
const filteredHolidays = computed(() => {
  return holidaysData
    .filter(holiday => holiday.year === year.value)
    .filter(holiday => 
      holiday.name.toLowerCase().includes(searchTerm.value.toLowerCase())
    )
    .filter(holiday => {
      if (showHolidays.value && showWorkDays.value) return true
      if (showHolidays.value) return holiday.dates.some(d => !d.isWorkday)
      if (showWorkDays.value) return holiday.dates.some(d => d.isWorkday)
      return false
    })
})

const totalHolidays = computed(() => {
  return filteredHolidays.value.reduce((total, holiday) => {
    return total + holiday.dates.filter(d => !d.isWorkday).length
  }, 0)
})

const workDaysCount = computed(() => {
  return filteredHolidays.value.reduce((total, holiday) => {
    return total + holiday.dates.filter(d => d.isWorkday).length
  }, 0)
})

const longWeekends = computed(() => {
  return filteredHolidays.value.filter(holiday => holiday.days >= 3).length
})

const calendarDays = computed(() => {
  const days = []
  const date = new Date(year.value, selectedMonth.value - 1, 1)
  
  // 上个月的最后几天
  const firstDay = date.getDay()
  for (let i = firstDay - 1; i >= 0; i--) {
    const prevDate = new Date(date)
    prevDate.setDate(-i)
    days.push(createDayObject(prevDate, false))
  }
  
  // 当前月的所有天
  while (date.getMonth() === selectedMonth.value - 1) {
    days.push(createDayObject(new Date(date), true))
    date.setDate(date.getDate() + 1)
  }
  
  // 下个月的前几天（补齐日历）
  const lastDay = new Date(year.value, selectedMonth.value - 1, 0).getDay()
  for (let i = 1; i < 7 - lastDay; i++) {
    const nextDate = new Date(year.value, selectedMonth.value, i)
    days.push(createDayObject(nextDate, false))
  }
  
  return days
})

// 方法
const prevYear = () => {
  year.value--
}

const nextYear = () => {
  year.value++
}

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

const formatDay = (dateStr) => {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

const createDayObject = (date, isCurrentMonth) => {
  const dateStr = date.toISOString().split('T')[0]
  const day = date.getDate()
  const isWeekend = date.getDay() === 0 || date.getDay() === 6
  
  // 检查是否是节假日或调休
  let isHoliday = false
  let isWorkday = false
  let holidayName = ''
  
  for (const holiday of holidaysData) {
    const holidayDate = holiday.dates.find(d => d.date === dateStr)
    if (holidayDate) {
      if (holidayDate.isWorkday) {
        isWorkday = true
      } else {
        isHoliday = true
        holidayName = holiday.name
      }
      break
    }
  }
  
  return {
    date: dateStr,
    day,
    isCurrentMonth,
    isWeekend,
    isHoliday,
    isWorkday,
    holiday: holidayName
  }
}

// 生命周期
onMounted(() => {
  selectedMonth.value = new Date().getMonth() + 1
})
</script>

<style scoped>
.holiday-viewer {
  max-width: 1000px;
  margin: 0 auto;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.header {
  background: linear-gradient(120deg, #4facfe 0%, #00f2fe 100%);
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

.controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #eaeaea;
}

.year-selector {
  display: flex;
  align-items: center;
  gap: 15px;
}

.year-selector h2 {
  color: #2c3e50;
  font-size: 1.8rem;
  min-width: 100px;
  text-align: center;
}

.nav-btn {
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.nav-btn:hover {
  background: #4facfe;
  color: white;
  border-color: #4facfe;
}

.view-options {
  display: flex;
  gap: 10px;
}

.view-btn {
  padding: 10px 16px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s;
}

.view-btn.active, .view-btn:hover {
  background: #4facfe;
  color: white;
  border-color: #4facfe;
}

.filter-section {
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  border-bottom: 1px solid #eaeaea;
}

.search-box {
  position: relative;
  width: 250px;
}

.search-box input {
  width: 100%;
  padding: 10px 15px 10px 40px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
}

.search-box i {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
}

.filter-options {
  display: flex;
  gap: 20px;
}

.filter-checkbox {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.year-view, .month-view {
  padding: 20px;
}

.year-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  border: 1px solid #eaeaea;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: bold;
  color: #4facfe;
  margin-bottom: 5px;
}

.stat-label {
  color: #6c757d;
  font-size: 0.9rem;
}

.holiday-list h3 {
  color: #2c3e50;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #4facfe;
}

.holiday-item {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  border: 1px solid #eaeaea;
}

.holiday-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.holiday-name {
  font-size: 1.4rem;
  font-weight: bold;
  color: #2c3e50;
}

.holiday-duration {
  color: #6c757d;
}

.day-count {
  color: #4facfe;
  font-weight: 500;
}

.date-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.date-tag {
  padding: 6px 12px;
  background: #f8f9fa;
  border-radius: 20px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 5px;
}

.date-tag.workday {
  background: #fff5f5;
  color: #e53e3e;
}

.work-indicator {
  background: #e53e3e;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
}

.month-selector {
  margin-bottom: 20px;
}

.month-selector select {
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
}

.calendar {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  border: 1px solid #eaeaea;
}

.calendar-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: #4facfe;
  color: white;
  font-weight: bold;
}

.week-day {
  padding: 15px;
  text-align: center;
}

.calendar-body {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.calendar-day {
  min-height: 80px;
  border: 1px solid #eaeaea;
  padding: 8px;
  position: relative;
}

.calendar-day.other-month {
  background: #f8f9fa;
  color: #6c757d;
}

.calendar-day.weekend {
  background: #f8f9fa;
}

.calendar-day.holiday {
  background: #e6f7ff;
}

.calendar-day.workday {
  background: #fff5f5;
}

.day-number {
  font-size: 1.1rem;
  font-weight: 500;
}

.holiday-label {
  font-size: 0.8rem;
  color: #1890ff;
  margin-top: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.work-label {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #e53e3e;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
}

.legend {
  display: flex;
  justify-content: center;
  gap: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-top: 1px solid #eaeaea;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-box {
  width: 20px;
  height: 20px;
  border-radius: 4px;
}

.color-box.holiday {
  background: #e6f7ff;
  border: 1px solid #1890ff;
}

.color-box.workday {
  background: #fff5f5;
  border: 1px solid #e53e3e;
}

.color-box.weekend {
  background: #f8f9fa;
  border: 1px solid #6c757d;
}

@media (max-width: 768px) {
  .controls {
    flex-direction: column;
    gap: 15px;
  }
  
  .filter-section {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }
  
  .search-box {
    width: 100%;
  }
  
  .year-stats {
    grid-template-columns: 1fr;
  }
  
  .holiday-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .calendar-day {
    min-height: 60px;
  }
  
  .holiday-label {
    font-size: 0.7rem;
  }
}
</style>