<template>
  <div class="food-picker-container">
    <!-- 主界面 -->
    <div class="main-content">
      <h1 class="title">今天吃什么？</h1>
      
      <!-- 结果显示 -->
      <div class="result-display" :class="{ active: selectedFood }">
        <div class="result-text" v-if="selectedFood">
          {{ selectedFood }}
        </div>
        <div class="placeholder" v-else>
          点击开始选择今天的食物
        </div>
      </div>

      <!-- 控制按钮 -->
      <div class="control-buttons">
        <button 
          @click="togglePicker" 
          :class="['btn', isRunning ? 'btn-stop' : 'btn-start']"
          :disabled="allFoods.length === 0"
        >
          <i :class="isRunning ? 'fas fa-pause' : 'fas fa-play'"></i>
          {{ isRunning ? '停止选择' : '开始选择' }}
        </button>
        <button @click="addCustomFood" class="btn btn-add">
          <i class="fas fa-plus"></i>
          添加菜品
        </button>
      </div>

      <!-- 快速选择按钮 -->
      <div class="quick-picks" v-if="!isRunning">
        <button 
          v-for="category in foodCategories" 
          :key="category.name"
          @click="quickPickFromCategory(category.name)"
          class="quick-btn"
          :style="{ backgroundColor: category.color }"
          :disabled="getCategoryCount(category.name) === 0"
        >
          {{ category.name }} ({{ getCategoryCount(category.name) }})
        </button>
      </div>
    </div>

    <!-- 添加菜品模态框 -->
    <div v-if="showAddModal" class="modal-overlay">
      <div class="modal-content">
        <h3>添加自定义菜品</h3>
        <div class="input-group">
          <input
            v-model="newFoodName"
            type="text"
            placeholder="输入菜品名称"
            @keyup.enter="confirmAddFood"
            ref="foodInput"
            class="food-input"
          >
          <select v-model="newFoodCategory" class="category-select">
            <option value="">选择分类</option>
            <option v-for="category in foodCategories" :key="category.name" :value="category.name">
              {{ category.name }}
            </option>
            <option value="custom">自定义分类</option>
          </select>
          <input
            v-if="newFoodCategory === 'custom'"
            v-model="customCategoryName"
            type="text"
            placeholder="输入新分类名称"
            class="category-input"
          >
        </div>
        <div class="modal-actions">
          <button @click="confirmAddFood" class="btn btn-confirm">确认添加</button>
          <button @click="cancelAddFood" class="btn btn-cancel">取消</button>
        </div>
      </div>
    </div>

    <!-- 食物列表 -->
    <div class="food-list-section">
      <h3>菜品库 ({{ allFoods.length }}道)</h3>
      <div class="category-tabs">
        <button
          v-for="category in foodCategories"
          :key="category.name"
          @click="setActiveCategory(category.name)"
          :class="['tab-btn', { active: activeCategory === category.name }]"
        >
          {{ category.name }} ({{ getCategoryCount(category.name) }})
        </button>
        <button
          @click="setActiveCategory('all')"
          :class="['tab-btn', { active: activeCategory === 'all' }]"
        >
          全部菜品
        </button>
      </div>
      
      <div class="food-items">
        <div
          v-for="(food, index) in filteredFoods"
          :key="index"
          class="food-item"
        >
          <span class="food-name">{{ food.name }}</span>
          <span class="food-category">{{ food.category }}</span>
          <button @click="removeFood(index)" class="remove-btn" title="删除">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- 动画效果 - 修复了z-index -->
    <div v-if="isRunning" class="selection-animation">
      <div class="food-card" v-for="n in 3" :key="n" :style="getCardStyle(n)">
        {{ displayedFoods[n - 1] }}
      </div>
      <!-- 半透明遮罩层，点击可以停止 -->
      <div class="animation-overlay" @click="stopPicker"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'

// 默认菜品库（120道菜）
const defaultFoods = [
  // 家常菜 (30道)
  { name: '红烧肉', category: '家常菜' },
  { name: '西红柿炒鸡蛋', category: '家常菜' },
  { name: '鱼香肉丝', category: '家常菜' },
  { name: '宫保鸡丁', category: '家常菜' },
  { name: '麻婆豆腐', category: '家常菜' },
  { name: '青椒土豆丝', category: '家常菜' },
  { name: '糖醋里脊', category: '家常菜' },
  { name: '清蒸鱼', category: '家常菜' },
  { name: '红烧排骨', category: '家常菜' },
  { name: '蒜蓉空心菜', category: '家常菜' },
  { name: '可乐鸡翅', category: '家常菜' },
  { name: '地三鲜', category: '家常菜' },
  { name: '回锅肉', category: '家常菜' },
  { name: '水煮肉片', category: '家常菜' },
  { name: '京酱肉丝', category: '家常菜' },
  { name: '木须肉', category: '家常菜' },
  { name: '酸菜鱼', category: '家常菜' },
  { name: '辣子鸡', category: '家常菜' },
  { name: '梅菜扣肉', category: '家常菜' },
  { name: '粉蒸肉', category: '家常菜' },
  { name: '红烧茄子', category: '家常菜' },
  { name: '干煸豆角', category: '家常菜' },
  { name: '蒜苔炒肉', category: '家常菜' },
  { name: '韭菜炒蛋', category: '家常菜' },
  { name: '芹菜炒肉', category: '家常菜' },
  { name: '尖椒炒蛋', category: '家常菜' },
  { name: '香菇炒肉', category: '家常菜' },
  { name: '蚝油生菜', category: '家常菜' },
  { name: '清炒西兰花', category: '家常菜' },
  { name: '醋溜白菜', category: '家常菜' },

  // 面食 (20道)
  { name: '炸酱面', category: '面食' },
  { name: '牛肉面', category: '面食' },
  { name: '西红柿鸡蛋面', category: '面食' },
  { name: '油泼面', category: '面食' },
  { name: '刀削面', category: '面食' },
  { name: '热干面', category: '面食' },
  { name: '葱油拌面', category: '面食' },
  { name: '重庆小面', category: '面食' },
  { name: '担担面', category: '面食' },
  { name: '阳春面', category: '面食' },
  { name: '臊子面', category: '面食' },
  { name: '烩面', category: '面食' },
  { name: '拉面', category: '面食' },
  { name: '炒面', category: '面食' },
  { name: '凉面', category: '面食' },
  { name: '意大利面', category: '面食' },
  { name: '乌冬面', category: '面食' },
  { name: '荞麦面', category: '面食' },
  { name: '云吞面', category: '面食' },
  { name: '拌面', category: '面食' },

  // 米饭 (15道)
  { name: '蛋炒饭', category: '米饭' },
  { name: '扬州炒饭', category: '米饭' },
  { name: '咖喱鸡饭', category: '米饭' },
  { name: '红烧肉盖饭', category: '米饭' },
  { name: '鱼香肉丝盖饭', category: '米饭' },
  { name: '宫保鸡丁盖饭', category: '米饭' },
  { name: '黄焖鸡米饭', category: '米饭' },
  { name: '卤肉饭', category: '米饭' },
  { name: '煲仔饭', category: '米饭' },
  { name: '石锅拌饭', category: '米饭' },
  { name: '手抓饭', category: '米饭' },
  { name: '菠萝饭', category: '米饭' },
  { name: '海鲜炒饭', category: '米饭' },
  { name: '腊味饭', category: '米饭' },
  { name: '香菇滑鸡饭', category: '米饭' },

  // 汤类 (15道)
  { name: '西红柿蛋汤', category: '汤类' },
  { name: '紫菜蛋花汤', category: '汤类' },
  { name: '排骨玉米汤', category: '汤类' },
  { name: '鸡汤', category: '汤类' },
  { name: '鱼头豆腐汤', category: '汤类' },
  { name: '冬瓜排骨汤', category: '汤类' },
  { name: '罗宋汤', category: '汤类' },
  { name: '酸辣汤', category: '汤类' },
  { name: '西湖牛肉羹', category: '汤类' },
  { name: '银耳羹', category: '汤类' },
  { name: '南瓜汤', category: '汤类' },
  { name: '蘑菇汤', category: '汤类' },
  { name: '羊肉汤', category: '汤类' },
  { name: '鸽子汤', category: '汤类' },
  { name: '老鸭汤', category: '汤类' },

  // 小吃 (15道)
  { name: '饺子', category: '小吃' },
  { name: '包子', category: '小吃' },
  { name: '馄饨', category: '小吃' },
  { name: '煎饼果子', category: '小吃' },
  { name: '手抓饼', category: '小吃' },
  { name: '烤冷面', category: '小吃' },
  { name: '肉夹馍', category: '小吃' },
  { name: '煎饺', category: '小吃' },
  { name: '锅贴', category: '小吃' },
  { name: '春卷', category: '小吃' },
  { name: '粽子', category: '小吃' },
  { name: '汤圆', category: '小吃' },
  { name: '月饼', category: '小吃' },
  { name: '豆腐脑', category: '小吃' },
  { name: '油条', category: '小吃' },

  // 健康轻食 (10道)
  { name: '沙拉', category: '健康轻食' },
  { name: '鸡胸肉', category: '健康轻食' },
  { name: '蒸蔬菜', category: '健康轻食' },
  { name: '水果拼盘', category: '健康轻食' },
  { name: '酸奶', category: '健康轻食' },
  { name: '燕麦粥', category: '健康轻食' },
  { name: '蔬菜卷', category: '健康轻食' },
  { name: '烤蔬菜', category: '健康轻食' },
  { name: '水煮鸡胸', category: '健康轻食' },
  { name: '蔬菜汤', category: '健康轻食' },

  // 火锅 (5道)
  { name: '麻辣火锅', category: '火锅' },
  { name: '清汤火锅', category: '火锅' },
  { name: '番茄火锅', category: '火锅' },
  { name: '菌菇火锅', category: '火锅' },
  { name: '鸳鸯火锅', category: '火锅' },

  // 其他 (10道)
  { name: '烧烤', category: '其他' },
  { name: '披萨', category: '其他' },
  { name: '汉堡', category: '其他' },
  { name: '寿司', category: '其他' },
  { name: '刺身', category: '其他' },
  { name: '烤肉', category: '其他' },
  { name: '烤鱼', category: '其他' },
  { name: '麻辣烫', category: '其他' },
  { name: '麻辣香锅', category: '其他' },
  { name: '自助餐', category: '其他' }
]

// 响应式数据
const allFoods = ref([])
const isRunning = ref(false)
const selectedFood = ref('')
const showAddModal = ref(false)
const newFoodName = ref('')
const newFoodCategory = ref('')
const customCategoryName = ref('')
const activeCategory = ref('all')
const displayedFoods = ref(['', '', ''])
const animationInterval = ref(null)

// 分类配置
const foodCategories = ref([
  { name: '家常菜', color: '#ff6b6b' },
  { name: '面食', color: '#4ecdc4' },
  { name: '米饭', color: '#45b7d1' },
  { name: '汤类', color: '#f9ca24' },
  { name: '小吃', color: '#6c5ce7' },
  { name: '健康轻食', color: '#00b894' },
  { name: '火锅', color: '#e17055' },
  { name: '其他', color: '#a29bfe' }
])

// 计算属性
const filteredFoods = computed(() => {
  if (activeCategory.value === 'all') {
    return allFoods.value
  }
  return allFoods.value.filter(food => food.category === activeCategory.value)
})

// 初始化
const initFoods = () => {
  const savedFoods = localStorage.getItem('foodPickerFoods')
  if (savedFoods) {
    allFoods.value = JSON.parse(savedFoods)
  } else {
    allFoods.value = [...defaultFoods]
    saveFoods()
  }
}

// 保存到本地存储
const saveFoods = () => {
  localStorage.setItem('foodPickerFoods', JSON.stringify(allFoods.value))
}

// 开始/停止选择
const togglePicker = () => {
  if (isRunning.value) {
    stopPicker()
  } else {
    startPicker()
  }
}

// 开始选择
const startPicker = () => {
  if (allFoods.value.length === 0) {
    alert('请先添加一些菜品！')
    return
  }
  
  isRunning.value = true
  selectedFood.value = ''
  
  // 启动动画
  animationInterval.value = setInterval(() => {
    displayedFoods.value = [
      getRandomFood().name,
      getRandomFood().name,
      getRandomFood().name
    ]
  }, 100)
}

// 停止选择
const stopPicker = () => {
  isRunning.value = false
  clearInterval(animationInterval.value)
  
  // 随机选择最终结果
  selectedFood.value = getRandomFood().name
  
  // 添加一点动画效果
  setTimeout(() => {
    const resultElement = document.querySelector('.result-text')
    if (resultElement) {
      resultElement.classList.add('animate')
      setTimeout(() => resultElement.classList.remove('animate'), 1000)
    }
  }, 100)
}

// 获取随机菜品
const getRandomFood = () => {
  const randomIndex = Math.floor(Math.random() * allFoods.value.length)
  return allFoods.value[randomIndex]
}

// 快速选择分类
const quickPickFromCategory = (category) => {
  const categoryFoods = allFoods.value.filter(food => food.category === category)
  if (categoryFoods.length === 0) {
    alert('该分类下没有菜品！')
    return
  }
  
  const randomIndex = Math.floor(Math.random() * categoryFoods.length)
  selectedFood.value = categoryFoods[randomIndex].name
}

// 添加自定义菜品
const addCustomFood = () => {
  showAddModal.value = true
  newFoodName.value = ''
  newFoodCategory.value = ''
  customCategoryName.value = ''
  
  nextTick(() => {
    document.querySelector('.food-input')?.focus()
  })
}

// 确认添加菜品
const confirmAddFood = () => {
  if (!newFoodName.value.trim()) {
    alert('请输入菜品名称！')
    return
  }

  let category = newFoodCategory.value
  if (category === 'custom') {
    if (!customCategoryName.value.trim()) {
      alert('请输入分类名称！')
      return
    }
    category = customCategoryName.value.trim()
    
    // 添加新分类
    if (!foodCategories.value.find(c => c.name === category)) {
      foodCategories.value.push({
        name: category,
        color: getRandomColor()
      })
    }
  } else if (!category) {
    category = '其他'
  }

  allFoods.value.push({
    name: newFoodName.value.trim(),
    category: category
  })
  
  saveFoods()
  showAddModal.value = false
  activeCategory.value = category
}

// 取消添加
const cancelAddFood = () => {
  showAddModal.value = false
}

// 删除菜品
const removeFood = (index) => {
  if (confirm('确定要删除这个菜品吗？')) {
    allFoods.value.splice(index, 1)
    saveFoods()
  }
}

// 设置激活分类
const setActiveCategory = (category) => {
  activeCategory.value = category
}

// 获取分类数量
const getCategoryCount = (category) => {
  return allFoods.value.filter(food => food.category === category).length
}

// 获取随机颜色
const getRandomColor = () => {
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7', '#00b894', '#e17055', '#a29bfe']
  return colors[Math.floor(Math.random() * colors.length)]
}

// 获取卡片样式
const getCardStyle = (index) => {
  const delay = (index - 1) * 100
  return {
    animationDelay: `${delay}ms`,
    transform: `translateY(${(index - 1) * 10}px)`
  }
}

// 生命周期
onMounted(() => {
  initFoods()
})
</script>

<style scoped>
.food-picker-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  position: relative;
}

.main-content {
  text-align: center;
  margin-bottom: 40px;
  position: relative;
  z-index: 1;
}

.title {
  color: #2c3e50;
  margin-bottom: 30px;
  font-size: 2.5em;
  font-weight: 300;
}

.result-display {
  background: white;
  padding: 40px;
  border-radius: 20px;
  margin: 30px 0;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
}

.result-display.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  transform: scale(1.02);
}

.result-text {
  font-size: 2em;
  font-weight: bold;
  transition: all 0.3s ease;
}

.result-text.animate {
  animation: bounce 0.5s ease;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-20px);
  }
  60% {
    transform: translateY(-10px);
  }
}

.placeholder {
  color: #aaa;
  font-size: 1.2em;
}

.control-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  position: relative;
  z-index: 1;
}

.btn {
  padding: 15px 30px;
  border: none;
  border-radius: 50px;
  font-size: 1.1em;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 10px;
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

.btn-stop {
  background: #f44336;
  color: white;
}

.btn-stop:hover:not(:disabled) {
  background: #da190b;
  transform: translateY(-2px);
}

.btn-add {
  background: #2196F3;
  color: white;
}

.btn-add:hover:not(:disabled) {
  background: #0b7dda;
  transform: translateY(-2px);
}

.quick-picks {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  margin-top: 20px;
  position: relative;
  z-index: 1;
}

.quick-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 25px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.quick-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quick-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.modal-overlay {
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
  padding: 30px;
  border-radius: 15px;
  width: 90%;
  max-width: 400px;
}

.modal-content h3 {
  margin: 0 0 20px 0;
  color: #333;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
}

.food-input,
.category-select,
.category-input {
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
}

.food-input:focus,
.category-select:focus,
.category-input:focus {
  outline: none;
  border-color: #2196F3;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.btn-confirm {
  background: #4CAF50;
  color: white;
  padding: 10px 20px;
}

.btn-cancel {
  background: #f44336;
  color: white;
  padding: 10px 20px;
}

.food-list-section {
  background: white;
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1;
}

.food-list-section h3 {
  color: #2c3e50;
  margin-bottom: 15px;
}

.category-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.tab-btn {
  padding: 8px 16px;
  border: 2px solid #e0e0e0;
  background: white;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-btn.active {
  background: #2196F3;
  color: white;
  border-color: #2196F3;
}

.food-items {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 10px;
}

.food-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.food-item:hover {
  background: #e9ecef;
  transform: translateX(5px);
}

.food-name {
  font-weight: 500;
  color: #2c3e50;
}

.food-category {
  font-size: 0.9em;
  color: #6c757d;
  background: #e9ecef;
  padding: 2px 8px;
  border-radius: 12px;
}

.remove-btn {
  background: none;
  border: none;
  color: #dc3545;
  cursor: pointer;
  padding: 5px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.remove-btn:hover {
  background: #dc3545;
  color: white;
}

/* 动画效果 - 修复版 */
.selection-animation {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 999;
  background: rgba(0, 0, 0, 0.7);
}

.food-card {
  background: white;
  padding: 30px 50px;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  font-size: 2em;
  font-weight: bold;
  color: #2c3e50;
  animation: slideUp 0.5s ease infinite alternate;
  margin: 10px 0;
  min-width: 300px;
  text-align: center;
  z-index: 1000;
}

.animation-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  cursor: pointer;
}

@keyframes slideUp {
  from {
    transform: translateY(0) scale(0.9);
    opacity: 0.7;
  }
  to {
    transform: translateY(-30px) scale(1);
    opacity: 1;
  }
}

/* 响应式设计 */
@media (max-width: 600px) {
  .food-picker-container {
    padding: 15px;
  }
  
  .title {
    font-size: 2em;
  }
  
  .result-text {
    font-size: 1.5em;
  }
  
  .control-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .btn {
    width: 100%;
    max-width: 250px;
    justify-content: center;
  }
  
  .food-items {
    grid-template-columns: 1fr;
  }
  
  .category-tabs {
    justify-content: center;
  }
  
  .food-card {
    font-size: 1.5em;
    padding: 20px 30px;
    min-width: 250px;
  }
}
</style>