<template>
  <div class="category-menu">
    <!-- 左侧区域 -->
    <div class="category-left">
      <!-- 可以放置其他左侧内容 -->
    </div>
    
    <!-- 中间区域 -->
    <div class="category-center">
      <!-- 全部按钮 -->
      <button 
        class="category-item all-category"
        :class="{ active: selectedCategory === 'all' }"
        @click="selectCategory('all')"
      >
        全部
      </button>
      
      <!-- 中间分类选项 -->
      <div class="category-middle">
        <button
          v-for="category in visibleCategories"
          :key="category.id"
          class="category-item"
          :class="{ active: selectedCategory === category.id }"
          @click="selectCategory(category.id)"
        >
          {{ category.name }}
        </button>
      </div>
      
      <!-- 更多按钮及下拉菜单 -->
      <div class="more-category" ref="moreDropdown">
        <button
          class="category-item more-button"
          :class="{ active: isMoreMenuOpen || hasSelectedHiddenCategory }"
          @click="toggleMoreMenu"
        >
          更多
          <span class="dropdown-arrow">▼</span>
        </button>
        
        <div v-if="isMoreMenuOpen" class="dropdown-menu">
          <button
            v-for="category in hiddenCategories"
            :key="category.id"
            class="dropdown-item"
            :class="{ active: selectedCategory === category.id }"
            @click="selectCategory(category.id)"
          >
            {{ category.name }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- 右侧区域 -->
    <div class="category-right">
      <!-- 可以放置其他右侧内容 -->
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

// 定义组件属性
const props = defineProps({
  categories: {
    type: Array,
    default: () => [
      { id: 0, name: '开发类' },
      { id: 1, name: '文本类' },
      { id: 2, name: '运维类' },
      { id: 3, name: '查询类' },
      { id: 4, name: '图像类' },
      { id: 5, name: '设计类' },
    ]
  },
  maxVisible: {
    type: Number,
    default: 7
  }
})

// 响应式状态
const selectedCategory = ref('all')
const isMoreMenuOpen = ref(false)
const menuWidth = ref(0)
const moreDropdown = ref(null)

// 计算属性
const visibleCategories = computed(() => {
  return props.categories.slice(0, props.maxVisible - 1)
})

const hiddenCategories = computed(() => {
  return props.categories.slice(props.maxVisible - 1)
})

const hasSelectedHiddenCategory = computed(() => {
  return hiddenCategories.value.some(cat => cat.id === selectedCategory.value)
})

// 方法
const selectCategory = (categoryId) => {
  selectedCategory.value = categoryId
  isMoreMenuOpen.value = false
  // 触发自定义事件
  emit('categoryChange', categoryId)
}

const toggleMoreMenu = () => {
  isMoreMenuOpen.value = !isMoreMenuOpen.value
}

const handleClickOutside = (event) => {
  if (moreDropdown.value && !moreDropdown.value.contains(event.target)) {
    isMoreMenuOpen.value = false
  }
}

// 生命周期
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// 定义自定义事件
const emit = defineEmits(['categoryChange'])
</script>

<style scoped>
.category-menu {
  display: flex;
  align-items: center;
  background-color: rgba(248, 249, 250, 0.5);
  padding: 10px 15px;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  backdrop-filter: blur(50px);
}

.category-left,
.category-right {
  flex: 1;
  /* 可以根据需要添加内容 */
}

.category-center {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 5px;
}

.category-item {
  padding: 8px 16px;
  border: none;
  background: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  color: #495057;
  white-space: nowrap;
}

.category-item:hover {
  background-color: #e9ecef;
  color: #212529;
}

.category-item.active {
  background-color: #4361ee;
  color: white;
  font-weight: 500;
}

.all-category {
  font-weight: 600;
  margin-right: 10px;
}

.category-middle {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.more-category {
  position: relative;
  margin-left: 10px;
}

.more-button {
  display: flex;
  align-items: center;
  gap: 4px;
}

.dropdown-arrow {
  font-size: 10px;
  transition: transform 0.3s ease;
}

.more-button.active .dropdown-arrow {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 8px 0;
  min-width: 120px;
  z-index: 1000;
  margin-top: 5px;
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: 8px 16px;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  font-size: 14px;
  color: #495057;
  transition: all 0.2s ease;
}

.dropdown-item:hover {
  background-color: #f1f3f5;
  color: #212529;
}

.dropdown-item.active {
  background-color: #e6f0ff;
  color: #4361ee;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .category-center {
    flex-direction: column;
    width: 100%;
  }
  
  .category-middle {
    order: 2;
    width: 100%;
    justify-content: center;
    overflow-x: auto;
    padding: 10px 0;
  }
  
  .all-category {
    order: 1;
    margin-right: 0;
    margin-bottom: 10px;
  }
  
  .more-category {
    order: 3;
    margin-left: 0;
    margin-top: 10px;
  }
}
</style>