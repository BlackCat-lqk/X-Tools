<template>
  <div class="name-generator">
    <div class="header">
      <h1><i class="fas fa-signature"></i> 智能取名工具</h1>
      <p>为您生成优美且富有含义的中文名字</p>
    </div>
    
    <div class="container">
      <div class="sidebar">
        <div class="control-group">
          <h3><i class="fas fa-sliders-h"></i> 名字设置</h3>
          <div class="filters">
            <div class="filter-item">
              <label>性别</label>
              <select v-model="filters.gender">
                <option value="any">任何性别</option>
                <option value="male">男孩名字</option>
                <option value="female">女孩名字</option>
              </select>
            </div>
            
            <div class="filter-item">
              <label>字数</label>
              <select v-model="filters.length">
                <option value="2">两个字</option>
                <option value="3">三个字</option>
              </select>
            </div>
            
            <div class="filter-item">
              <label>风格</label>
              <select v-model="filters.style">
                <option value="elegant">优雅型</option>
                <option value="strong">大气型</option>
                <option value="classic">古典型</option>
                <option value="modern">现代型</option>
              </select>
            </div>
            
            <div class="filter-item">
              <label>生成数量</label>
              <input type="number" min="1" max="10" v-model="filters.count" placeholder="生成数量">
            </div>
          </div>
        </div>
        
        <button class="generate-btn" @click="generateNames">
          <i class="fas fa-magic"></i> 生成名字
        </button>
        
        <div class="control-group">
          <h3><i class="fas fa-history"></i> 历史记录</h3>
          <div class="history-list">
            <div v-for="(name, index) in history" :key="index" class="history-item">
              {{ name }}
            </div>
            <div v-if="history.length === 0" class="empty-history">
              暂无历史记录
            </div>
          </div>
        </div>
      </div>
      
      <div class="main-content">
        <div class="tabs">
          <div 
            class="tab" 
            :class="{active: activeTab === 'generate'}" 
            @click="activeTab = 'generate'"
          >
            名字生成
          </div>
          <div 
            class="tab" 
            :class="{active: activeTab === 'analyze'}" 
            @click="activeTab = 'analyze'"
          >
            名字解析
          </div>
          <div 
            class="tab" 
            :class="{active: activeTab === 'favorites'}" 
            @click="activeTab = 'favorites'"
          >
            我的收藏
          </div>
        </div>
        
        <div v-if="activeTab === 'generate'" class="results-section">
          <div class="results-header">
            <h2>生成结果 ({{ generatedNames.length }})</h2>
            <button @click="saveAll" class="save-btn">
              <i class="fas fa-download"></i> 保存全部
            </button>
          </div>
          
          <div v-if="generatedNames.length > 0" class="results-grid">
            <div 
              v-for="(name, index) in generatedNames" 
              :key="index" 
              class="name-card" 
              @click="showDetails(name)"
            >
              <div class="name">{{ name.chinese }}</div>
              <div class="pinyin">{{ name.pinyin }}</div>
              <div class="meaning">{{ name.meaning }}</div>
              <button 
                class="favorite-btn" 
                :class="{active: isFavorite(name)}" 
                @click.stop="toggleFavorite(name)"
              >
                <i class="fas fa-heart"></i>
              </button>
            </div>
          </div>
          
          <div v-else class="empty-state">
            <i class="fas fa-search"></i>
            <p>点击"生成名字"按钮开始生成名字</p>
          </div>
        </div>
        
        <div v-if="activeTab === 'analyze'" class="analyze-section">
          <h2>名字解析</h2>
          <div class="analyze-form">
            <input 
              type="text" 
              v-model="analyzeName" 
              placeholder="输入要解析的名字"
              @keyup.enter="analyzeCurrentName"
            >
            <button @click="analyzeCurrentName" class="analyze-btn">
              <i class="fas fa-search"></i> 解析
            </button>
          </div>
          
          <div v-if="currentAnalysis" class="name-details">
            <h3>解析结果: {{ currentAnalysis.name }}</h3>
            <div class="detail-item">
              <label>拼音:</label>
              <span>{{ currentAnalysis.pinyin }}</span>
            </div>
            <div class="detail-item">
              <label>含义:</label>
              <span>{{ currentAnalysis.meaning }}</span>
            </div>
            <div class="detail-item">
              <label>评分:</label>
              <span>{{ currentAnalysis.score }}/100</span>
            </div>
          </div>
        </div>
        
        <div v-if="activeTab === 'favorites'" class="favorites-section">
          <h2>收藏的名字 ({{ favorites.length }})</h2>
          
          <div v-if="favorites.length === 0" class="empty-state">
            <i class="fas fa-heart"></i>
            <p>您还没有收藏任何名字</p>
          </div>
          
          <div v-else class="results-grid">
            <div 
              v-for="(name, index) in favorites" 
              :key="index" 
              class="name-card"
            >
              <div class="name">{{ name.chinese }}</div>
              <div class="pinyin">{{ name.pinyin }}</div>
              <div class="meaning">{{ name.meaning }}</div>
              <button 
                class="favorite-btn active" 
                @click="toggleFavorite(name)"
              >
                <i class="fas fa-heart"></i>
              </button>
            </div>
          </div>
        </div>
        
        <div v-if="selectedName" class="name-details">
          <h3>名字详情: {{ selectedName.chinese }}</h3>
          <div class="detail-item">
            <label>拼音:</label>
            <span>{{ selectedName.pinyin }}</span>
          </div>
          <div class="detail-item">
            <label>含义:</label>
            <span>{{ selectedName.meaning }}</span>
          </div>
          <div class="detail-item">
            <label>性别:</label>
            <span>{{ selectedName.gender === 'male' ? '男性' : '女性' }}</span>
          </div>
          <div class="detail-item">
            <label>风格:</label>
            <span>{{ getStyleName(selectedName.style) }}</span>
          </div>
          <div class="detail-item">
            <label>评分:</label>
            <span>{{ selectedName.score }}/100</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'

// 响应式数据
const activeTab = ref('generate')
const analyzeName = ref('')
const selectedName = ref(null)
const currentAnalysis = ref(null)

const filters = reactive({
  gender: 'any',
  length: '2',
  style: 'elegant',
  count: 5
})

const generatedNames = ref([])
const favorites = ref([])
const history = ref([])

// 示例名字数据
const nameDatabase = [
  { chinese: '浩然', pinyin: 'Hào rán', meaning: '胸怀广阔，正气凛然', gender: 'male', style: 'strong', score: 92 },
  { chinese: '婉清', pinyin: 'Wǎn qīng', meaning: '温柔清澈', gender: 'female', style: 'elegant', score: 88 },
  { chinese: '子轩', pinyin: 'Zǐ xuān', meaning: '气宇轩昂', gender: 'male', style: 'modern', score: 85 },
  { chinese: '诗涵', pinyin: 'Shī hán', meaning: '有文采且有内涵', gender: 'female', style: 'elegant', score: 90 },
  { chinese: '博文', pinyin: 'Bó wén', meaning: '博学多才', gender: 'male', style: 'classic', score: 87 },
  { chinese: '梦琪', pinyin: 'Mèng qí', meaning: '如梦般美妙的女孩', gender: 'female', style: 'elegant', score: 89 },
  { chinese: '明辉', pinyin: 'Míng huī', meaning: '光明照耀', gender: 'male', style: 'strong', score: 86 },
  { chinese: '雅静', pinyin: 'Yǎ jìng', meaning: '优雅文静', gender: 'female', style: 'classic', score: 91 },
  { chinese: '俊熙', pinyin: 'Jùn xī', meaning: '英俊光明', gender: 'male', style: 'modern', score: 84 },
  { chinese: '慧妍', pinyin: 'Huì yán', meaning: '聪明美丽', gender: 'female', style: 'elegant', score: 93 },
  { chinese: '天佑', pinyin: 'Tiān yòu', meaning: '上天庇佑', gender: 'male', style: 'strong', score: 89 },
  { chinese: '思涵', pinyin: 'Sī hán', meaning: '思维广阔有涵养', gender: 'female', style: 'elegant', score: 88 }
]

// 计算属性
const styleNames = {
  elegant: '优雅型',
  strong: '大气型',
  classic: '古典型',
  modern: '现代型'
}

// 方法
const generateNames = () => {
  let count = parseInt(filters.count) || 5
  if (count > 10) count = 10
  if (count < 1) count = 1
  
  // 过滤名字
  const filteredNames = nameDatabase.filter(name => {
    if (filters.gender !== 'any' && name.gender !== filters.gender) return false
    if (name.chinese.length !== parseInt(filters.length)) return false
    if (filters.style !== 'any' && name.style !== filters.style) return false
    return true
  })
  
  // 随机选择名字
  const result = []
  const usedIndices = new Set()
  
  while (result.length < count && usedIndices.size < filteredNames.length) {
    const randomIndex = Math.floor(Math.random() * filteredNames.length)
    if (!usedIndices.has(randomIndex)) {
      result.push(filteredNames[randomIndex])
      usedIndices.add(randomIndex)
    }
  }
  
  generatedNames.value = result
  
  // 添加到历史记录
  result.forEach(name => {
    if (!history.value.includes(name.chinese)) {
      history.value.unshift(name.chinese)
      if (history.value.length > 10) history.value.pop()
    }
  })
}

const showDetails = (name) => {
  selectedName.value = name
}

const toggleFavorite = (name) => {
  const index = favorites.value.findIndex(fav => fav.chinese === name.chinese)
  if (index === -1) {
    favorites.value.push(name)
  } else {
    favorites.value.splice(index, 1)
  }
  
  // 保存到localStorage
  localStorage.setItem('nameFavorites', JSON.stringify(favorites.value))
}

const isFavorite = (name) => {
  return favorites.value.some(fav => fav.chinese === name.chinese)
}

const saveAll = () => {
  const namesText = generatedNames.value.map(name => 
    `${name.chinese} (${name.pinyin}): ${name.meaning}`
  ).join('\n')
  
  const blob = new Blob([namesText], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = '名字列表.txt'
  a.click()
  URL.revokeObjectURL(url)
}

const analyzeCurrentName = () => {
  if (!analyzeName.value.trim()) return
  
  // 在实际应用中，这里应该调用API进行名字解析
  const foundName = nameDatabase.find(name => 
    name.chinese === analyzeName.value.trim()
  )
  
  if (foundName) {
    currentAnalysis.value = {
      name: foundName.chinese,
      pinyin: foundName.pinyin,
      meaning: foundName.meaning,
      score: foundName.score
    }
  } else {
    currentAnalysis.value = {
      name: analyzeName.value,
      pinyin: '未知',
      meaning: '未找到该名字的解析',
      score: 0
    }
  }
}

const getStyleName = (styleKey) => {
  return styleNames[styleKey] || styleKey
}

// 生命周期钩子
onMounted(() => {
  // 从localStorage加载收藏
  const savedFavorites = localStorage.getItem('nameFavorites')
  if (savedFavorites) {
    favorites.value = JSON.parse(savedFavorites)
  }
  
  // 初始生成一些名字
  generateNames()
})
</script>

<style scoped>
.name-generator {
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.header {
  background: linear-gradient(120deg, #6a11cb 0%, #2575fc 100%);
  color: white;
  padding: 30px;
  text-align: center;
}

.header h1 {
  font-size: 2.5rem;
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

.container {
  display: flex;
  min-height: 600px;
}

.sidebar {
  width: 280px;
  background: #f8f9fa;
  padding: 25px 20px;
  border-right: 1px solid #eaeaea;
  display: flex;
  flex-direction: column;
}

.control-group {
  margin-bottom: 25px;
}

.control-group h3 {
  margin-bottom: 15px;
  color: #2c3e50;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.filters {
  display: grid;
  gap: 15px;
}

.filter-item {
  display: flex;
  flex-direction: column;
}

.filter-item label {
  font-weight: 600;
  margin-bottom: 5px;
  color: #495057;
}

select, input {
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  background: white;
}

.generate-btn {
  background: #ff6b6b;
  color: white;
  border: none;
  padding: 14px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 25px;
}

.generate-btn:hover {
  background: #ee5a5a;
  transform: translateY(-2px);
}

.history-list {
  max-height: 200px;
  overflow-y: auto;
}

.history-item {
  padding: 10px 12px;
  background: white;
  border-radius: 6px;
  margin-bottom: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  font-size: 15px;
}

.empty-history {
  padding: 10px 12px;
  color: #6c757d;
  font-style: italic;
}

.main-content {
  flex: 1;
  padding: 25px;
  display: flex;
  flex-direction: column;
}

.tabs {
  display: flex;
  background: #f8f9fa;
  border-radius: 12px;
  padding: 5px;
  margin-bottom: 25px;
}

.tab {
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  text-align: center;
  flex: 1;
  transition: all 0.3s;
  font-weight: 500;
}

.tab.active {
  background: white;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
  font-weight: 600;
  color: #4e54c8;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.results-header h2 {
  color: #2c3e50;
}

.save-btn {
  background: #4e54c8;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s;
}

.save-btn:hover {
  background: #3f43a7;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 20px;
  margin-bottom: 25px;
}

.name-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
  border: 2px solid transparent;
  cursor: pointer;
  position: relative;
}

.name-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  border-color: #4e54c8;
}

.name-card .name {
  font-size: 1.8rem;
  margin-bottom: 8px;
  color: #2c3e50;
  font-weight: 600;
}

.name-card .pinyin {
  color: #7f8c8d;
  font-size: 0.9rem;
  margin-bottom: 10px;
}

.name-card .meaning {
  color: #34495e;
  font-size: 0.95rem;
  line-height: 1.4;
}

.favorite-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  color: #ddd;
  border: none;
  padding: 5px;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s;
}

.favorite-btn.active {
  color: #ff6b6b;
}

.favorite-btn:hover {
  transform: scale(1.2);
}

.empty-state {
  text-align: center;
  padding: 40px 0;
  color: #6c757d;
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 15px;
  color: #dee2e6;
}

.analyze-section h2 {
  color: #2c3e50;
  margin-bottom: 20px;
}

.analyze-form {
  display: flex;
  gap: 12px;
  margin-bottom: 25px;
}

.analyze-form input {
  flex: 1;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
}

.analyze-btn {
  background: #4e54c8;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
}

.analyze-btn:hover {
  background: #3f43a7;
}

.name-details {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 25px;
  margin-top: 20px;
}

.name-details h3 {
  margin-bottom: 15px;
  color: #2c3e50;
}

.detail-item {
  margin-bottom: 10px;
  display: flex;
}

.detail-item label {
  font-weight: 600;
  width: 80px;
  color: #7f8c8d;
}

.favorites-section h2 {
  color: #2c3e50;
  margin-bottom: 20px;
}

@media (max-width: 900px) {
  .container {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #eaeaea;
  }
  
  .results-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }
}

@media (max-width: 600px) {
  .header {
    padding: 20px;
  }
  
  .header h1 {
    font-size: 2rem;
  }
  
  .tabs {
    flex-direction: column;
  }
  
  .analyze-form {
    flex-direction: column;
  }
  
  .results-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
}
</style>