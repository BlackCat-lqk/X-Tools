<template>
  <div class="notebook-container">
    <!-- 顶部工具栏 -->
    <div class="toolbar">
      <button @click="addNote" class="tool-btn" title="新建笔记">
        新建笔记
        <i class="fas fa-plus"></i>
      </button>
      <button @click="deleteNote" class="tool-btn" :disabled="!activeNote" title="删除笔记">
        删除笔记
        <i class="fas fa-trash"></i>
      </button>
      <button @click="toggleFavorite" class="tool-btn" :disabled="!activeNote" title="收藏/取消收藏">
        收藏/取消收藏
        <i class="fas" :class="activeNote?.favorite ? 'fa-star' : 'fa-star-o'"></i>
      </button>
      <div class="search-box">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索笔记..."
          class="search-input"
        />
        <i class="fas fa-search"></i>
      </div>
    </div>

    <div class="notebook-content">
      <!-- 侧边栏笔记列表 -->
      <div class="notes-sidebar">
        <div class="notes-list">
          <div
            v-for="note in filteredNotes"
            :key="note.id"
            class="note-item"
            :class="{ active: activeNote?.id === note.id, favorite: note.favorite }"
            @click="selectNote(note)"
          >
            <div class="note-title">{{ note.title || '无标题' }}</div>
            <div class="note-preview">{{ note.content.substring(0, 30) }}...</div>
            <div class="note-meta">
              <span class="note-date">{{ formatDate(note.updatedAt) }}</span>
              <i v-if="note.favorite" class="fas fa-star favorite-icon"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- 主编辑区域 -->
      <div class="editor-container">
        <div v-if="activeNote" class="editor">
          <input
            v-model="activeNote.title"
            type="text"
            placeholder="输入标题..."
            class="title-input"
          />
          <textarea
            v-model="activeNote.content"
            placeholder="开始写作..."
            class="content-textarea"
            @input="updateNote"
          ></textarea>
          <div class="editor-footer">
            <span class="char-count">字数: {{ activeNote.content.length }}</span>
            <span class="last-saved">最后保存: {{ formatTime(activeNote.updatedAt) }}</span>
          </div>
        </div>
        <div v-else class="empty-state">
          <i class="fas fa-sticky-note"></i>
          <p>选择一篇笔记或创建新笔记</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'

// 笔记数据结构
const notes = ref([])
const activeNote = ref(null)
const searchQuery = ref('')

// 从本地存储加载笔记
const loadNotes = () => {
  const savedNotes = localStorage.getItem('vue-notebook-notes')
  if (savedNotes) {
    notes.value = JSON.parse(savedNotes)
    if (notes.value.length > 0) {
      activeNote.value = notes.value[0]
    }
  }
}

// 保存笔记到本地存储
const saveNotes = () => {
  localStorage.setItem('vue-notebook-notes', JSON.stringify(notes.value))
}

// 添加新笔记
const addNote = () => {
  const newNote = {
    id: Date.now(),
    title: '',
    content: '',
    favorite: false,
    createdAt: new Date(),
    updatedAt: new Date()
  }
  notes.value.unshift(newNote)
  activeNote.value = newNote
  saveNotes()
}

// 删除当前笔记
const deleteNote = () => {
  if (!activeNote.value) return
  
  const index = notes.value.findIndex(note => note.id === activeNote.value.id)
  if (index !== -1) {
    notes.value.splice(index, 1)
    activeNote.value = notes.value.length > 0 ? notes.value[0] : null
    saveNotes()
  }
}

// 切换收藏状态
const toggleFavorite = () => {
  if (!activeNote.value) return
  
  activeNote.value.favorite = !activeNote.value.favorite
  activeNote.value.updatedAt = new Date()
  saveNotes()
}

// 选择笔记
const selectNote = (note) => {
  activeNote.value = note
}

// 更新笔记内容
const updateNote = () => {
  if (!activeNote.value) return
  
  activeNote.value.updatedAt = new Date()
  
  // 防抖保存
  clearTimeout(updateNote.timeout)
  updateNote.timeout = setTimeout(() => {
    saveNotes()
  }, 1000)
}

// 格式化日期
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// 格式化时间
const formatTime = (date) => {
  return new Date(date).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 过滤笔记（搜索功能）
const filteredNotes = computed(() => {
  if (!searchQuery.value) {
    return notes.value.sort((a, b) => {
      // 收藏的笔记排在前面，然后按更新时间排序
      if (a.favorite && !b.favorite) return -1
      if (!a.favorite && b.favorite) return 1
      return new Date(b.updatedAt) - new Date(a.updatedAt)
    })
  }
  
  const query = searchQuery.value.toLowerCase()
  return notes.value.filter(note => 
    note.title.toLowerCase().includes(query) || 
    note.content.toLowerCase().includes(query)
  ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
})

// 初始化
onMounted(() => {
  loadNotes()
  if (notes.value.length === 0) {
    addNote()
  }
})

// 监听搜索查询变化
watch(searchQuery, () => {
  if (filteredNotes.value.length > 0 && !activeNote.value) {
    activeNote.value = filteredNotes.value[0]
  }
})
</script>

<style scoped>
.notebook-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f8f9fa;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.toolbar {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  background: white;
  border-bottom: 1px solid #e9ecef;
  gap: 10px;
}

.tool-btn {
  padding: 8px 12px;
  border: none;
  background: #f8f9fa;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  color: #495057;
}

.tool-btn:hover:not(:disabled) {
  background: #e9ecef;
  color: #000;
}

.tool-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.search-box {
  position: relative;
  margin-left: auto;
}

.search-input {
  padding: 8px 12px 8px 35px;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  width: 200px;
  font-size: 14px;
}

.search-box .fa-search {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
}

.notebook-content {
  display: flex;
  flex: 1;
  height: calc(100% - 60px);
}

.notes-sidebar {
  width: 300px;
  background: white;
  border-right: 1px solid #e9ecef;
  overflow-y: auto;
}

.notes-list {
  padding: 10px;
}

.note-item {
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid #e9ecef;
}

.note-item:hover {
  background: #f8f9fa;
  border-color: #dee2e6;
}

.note-item.active {
  background: #e3f2fd;
  border-color: #2196f3;
}

.note-item.favorite {
  border-left: 4px solid #ffc107;
}

.note-title {
  font-weight: 600;
  color: #212529;
  margin-bottom: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.note-preview {
  color: #6c757d;
  font-size: 13px;
  margin-bottom: 8px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.note-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #adb5bd;
}

.favorite-icon {
  color: #ffc107;
}

.editor-container {
  flex: 1;
  padding: 20px;
  background: white;
  overflow-y: auto;
}

.editor {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.title-input {
  font-size: 24px;
  font-weight: 600;
  border: none;
  padding: 10px 0;
  margin-bottom: 20px;
  border-bottom: 2px solid #e9ecef;
  outline: none;
  color: #212529;
}

.title-input:focus {
  border-bottom-color: #2196f3;
}

.content-textarea {
  flex: 1;
  border: none;
  outline: none;
  resize: none;
  font-size: 16px;
  line-height: 1.6;
  color: #495057;
  font-family: inherit;
  padding: 0;
}

.editor-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 15px;
  border-top: 1px solid #e9ecef;
  margin-top: 15px;
  font-size: 12px;
  color: #6c757d;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #adb5bd;
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 15px;
}

.empty-state p {
  font-size: 16px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .notebook-content {
    flex-direction: column;
  }
  
  .notes-sidebar {
    width: 100%;
    height: 200px;
    border-right: none;
    border-bottom: 1px solid #e9ecef;
  }
  
  .search-input {
    width: 150px;
  }
}
</style>