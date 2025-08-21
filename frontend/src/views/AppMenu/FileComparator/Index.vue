<template>
  <div class="file-comparator">
    <div class="header">
      <h1>文件内容对比工具</h1>
      <p>上传或输入文本内容进行比较，高亮显示差异</p>
    </div>

    <div class="comparator-container">
      <div class="input-methods">
        <div class="input-section">
          <h3>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16h10M7 8h10m-5 6h5M7 12h10" />
            </svg>
            原始内容
          </h3>
          <div class="file-upload" @click="triggerFileUpload('left')">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p>点击上传文件或拖放文件到这里</p>
            <button>选择文件</button>
            <input type="file" ref="leftFileInput" @change="handleFileUpload($event, 'left')" />
          </div>
          <div class="file-name" v-if="leftFileName">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {{ leftFileName }}
          </div>
          <textarea
            class="text-input"
            v-model="leftContent"
            placeholder="输入原始文本内容或上传文件"
            @input="handleContentChange"
          ></textarea>
        </div>

        <div class="input-section">
          <h3>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16h10M7 8h10m-5 6h5M7 12h10" />
            </svg>
            修改后内容
          </h3>
          <div class="file-upload" @click="triggerFileUpload('right')">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p>点击上传文件或拖放文件到这里</p>
            <button>选择文件</button>
            <input type="file" ref="rightFileInput" @change="handleFileUpload($event, 'right')" />
          </div>
          <div class="file-name" v-if="rightFileName">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {{ rightFileName }}
          </div>
          <textarea
            class="text-input"
            v-model="rightContent"
            placeholder="输入修改后的文本内容或上传文件"
            @input="handleContentChange"
          ></textarea>
        </div>
      </div>

      <div class="controls">
        <button class="compare-btn" @click="compareContent">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          比较内容
        </button>
        <button class="clear-btn" @click="clearAll">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          清除所有
        </button>
      </div>

      <div class="view-options" v-if="hasComparison">
        <button 
          class="view-option" 
          :class="{ active: viewMode === 'side-by-side' }"
          @click="viewMode = 'side-by-side'"
        >
          并排视图
        </button>
        <button 
          class="view-option" 
          :class="{ active: viewMode === 'inline' }"
          @click="viewMode = 'inline'"
        >
          行内视图
        </button>
      </div>

      <div class="results" v-if="hasComparison">
        <div class="side-by-side" v-if="viewMode === 'side-by-side'">
          <div class="result-section">
            <div class="result-header">原始内容</div>
            <div class="result-content">
              <div 
                v-for="(line, index) in leftLines" 
                :key="'left-' + index" 
                class="line"
                :class="getLineClass(line, index, 'left')"
              >
                <span class="line-number">{{ index + 1 }}</span>
                <span class="line-content">{{ line }}</span>
              </div>
            </div>
          </div>

          <div class="divider"></div>

          <div class="result-section">
            <div class="result-header">修改后内容</div>
            <div class="result-content">
              <div 
                v-for="(line, index) in rightLines" 
                :key="'right-' + index" 
                class="line"
                :class="getLineClass(line, index, 'right')"
              >
                <span class="line-number">{{ index + 1 }}</span>
                <span class="line-content">{{ line }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="inline-diff" v-if="viewMode === 'inline'">
          <div class="result-section">
            <div class="result-header">差异对比</div>
            <div class="result-content">
              <div 
                v-for="(part, index) in diffResult" 
                :key="index" 
                class="line"
                :class="{ added: part.added, removed: part.removed }"
              >
                <span class="line-content">{{ part.value }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="stats" v-if="hasComparison">
        <div class="stat-item">
          <div class="stat-value">{{ diffStats.added }}</div>
          <div class="stat-label">新增行</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ diffStats.removed }}</div>
          <div class="stat-label">删除行</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ diffStats.modified }}</div>
          <div class="stat-label">修改行</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ diffStats.unchanged }}</div>
          <div class="stat-label">未更改行</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue';
import * as Diff from 'diff';

export default {
  name: 'FileComparator',
  setup() {
    const leftContent = ref('');
    const rightContent = ref('');
    const leftFileName = ref('');
    const rightFileName = ref('');
    const leftFileInput = ref(null);
    const rightFileInput = ref(null);
    const viewMode = ref('side-by-side');
    const diffResult = ref([]);
    const diffLines = ref([]);
    
    const leftLines = computed(() => leftContent.value.split('\n'));
    const rightLines = computed(() => rightContent.value.split('\n'));
    
    const hasComparison = computed(() => diffResult.value.length > 0);
    
    const diffStats = computed(() => {
      const stats = {
        added: 0,
        removed: 0,
        modified: 0,
        unchanged: 0
      };
      
      if (viewMode.value === 'inline') {
        diffResult.value.forEach(part => {
          if (part.added) stats.added++;
          else if (part.removed) stats.removed++;
          else stats.unchanged++;
        });
      } else {
        // 计算并排视图的统计信息
        const diff = Diff.diffLines(leftContent.value, rightContent.value);
        diff.forEach(part => {
          if (part.added) stats.added += part.count;
          else if (part.removed) stats.removed += part.count;
          else stats.unchanged += part.count;
        });
      }
      
      return stats;
    });
    
    const triggerFileUpload = (side) => {
      if (side === 'left') {
        leftFileInput.value.click();
      } else {
        rightFileInput.value.click();
      }
    };
    
    const handleFileUpload = (event, side) => {
      const file = event.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        if (side === 'left') {
          leftContent.value = content;
          leftFileName.value = file.name;
        } else {
          rightContent.value = content;
          rightFileName.value = file.name;
        }
      };
      reader.readAsText(file);
    };
    
    const handleContentChange = () => {
      // 内容变化时重置比较结果
      diffResult.value = [];
    };
    
    const compareContent = () => {
      if (!leftContent.value && !rightContent.value) return;
      
      if (viewMode.value === 'inline') {
        // 行内比较
        diffResult.value = Diff.diffWords(
          leftContent.value, 
          rightContent.value,
          { ignoreCase: true }
        );
      } else {
        // 并排比较
        const diff = Diff.diffLines(leftContent.value, rightContent.value);
        diffLines.value = diff;
      }
    };
    
    const getLineClass = (line, index, side) => {
      if (viewMode.value !== 'side-by-side') return '';
      
      let leftIndex = 0;
      let rightIndex = 0;
      
      for (const part of diffLines.value) {
        if (part.added && side === 'right') {
          if (index >= rightIndex && index < rightIndex + part.count) {
            return 'added';
          }
          rightIndex += part.count;
        } else if (part.removed && side === 'left') {
          if (index >= leftIndex && index < leftIndex + part.count) {
            return 'removed';
          }
          leftIndex += part.count;
        } else if (!part.added && !part.removed) {
          // 未更改的部分
          if (side === 'left' && index >= leftIndex && index < leftIndex + part.count) {
            return '';
          }
          if (side === 'right' && index >= rightIndex && index < rightIndex + part.count) {
            return '';
          }
          leftIndex += part.count;
          rightIndex += part.count;
        }
      }
      
      return '';
    };
    
    const clearAll = () => {
      leftContent.value = '';
      rightContent.value = '';
      leftFileName.value = '';
      rightFileName.value = '';
      diffResult.value = [];
      diffLines.value = [];
    };
    
    // 监听视图模式变化，重新计算差异
    watch(viewMode, compareContent);
    
    return {
      leftContent,
      rightContent,
      leftFileName,
      rightFileName,
      leftFileInput,
      rightFileInput,
      viewMode,
      diffResult,
      leftLines,
      rightLines,
      hasComparison,
      diffStats,
      triggerFileUpload,
      handleFileUpload,
      handleContentChange,
      compareContent,
      getLineClass,
      clearAll
    };
  }
};
</script>

<style scoped>
.file-comparator {
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.header {
  background: linear-gradient(135deg, #4b6cb7 0%, #182848 100%);
  color: white;
  padding: 24px 32px;
  text-align: center;
}

.header h1 {
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 28px;
}

.header p {
  opacity: 0.9;
  font-size: 16px;
}

.comparator-container {
  padding: 24px;
}

.input-methods {
  display: flex;
  gap: 20px;
  margin-bottom: 24px;
}

.input-section {
  flex: 1;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
}

.input-section h3 {
  margin-bottom: 16px;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 8px;
}

.input-section h3 svg {
  width: 20px;
  height: 20px;
}

.file-upload {
  border: 2px dashed #a0aec0;
  border-radius: 6px;
  padding: 20px;
  text-align: center;
  margin-bottom: 16px;
  transition: all 0.3s;
  cursor: pointer;
}

.file-upload:hover {
  border-color: #4b6cb7;
  background-color: rgba(75, 108, 183, 0.05);
}

.file-upload svg {
  width: 40px;
  height: 40px;
  margin-bottom: 12px;
  color: #4b6cb7;
}

.file-upload p {
  color: #718096;
  margin-bottom: 12px;
}

.file-upload input {
  display: none;
}

.file-upload button {
  padding: 8px 16px;
  background: #4b6cb7;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.text-input {
  width: 100%;
  min-height: 150px;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  resize: vertical;
  font-family: monospace;
  font-size: 14px;
}

.text-input:focus {
  outline: none;
  border-color: #4b6cb7;
  box-shadow: 0 0 0 2px rgba(75, 108, 183, 0.2);
}

.file-name {
  margin-top: 8px;
  font-size: 14px;
  color: #4a5568;
  display: flex;
  align-items: center;
  gap: 6px;
}

.file-name svg {
  width: 16px;
  height: 16px;
}

.controls {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin: 24px 0;
}

.compare-btn {
  padding: 12px 28px;
  background: linear-gradient(135deg, #4b6cb7 0%, #182848 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
}

.compare-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(75, 108, 183, 0.3);
}

.compare-btn:active {
  transform: translateY(0);
}

.clear-btn {
  padding: 12px 28px;
  background: #e2e8f0;
  color: #4a5568;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
}

.clear-btn:hover {
  background: #cbd5e0;
}

.view-options {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
  gap: 12px;
}

.view-option {
  padding: 8px 16px;
  background: #edf2f7;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.view-option.active {
  background: #4b6cb7;
  color: white;
}

.results {
  display: flex;
  gap: 20px;
  margin-top: 20px;
}

.side-by-side {
  display: flex;
  flex: 1;
  gap: 20px;
}

.inline-diff {
  flex: 1;
}

.result-section {
  flex: 1;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.result-header {
  background: #f7fafc;
  padding: 12px 16px;
  border-bottom: 1px solid #e2e8f0;
  font-weight: 600;
  color: #2d3748;
}

.result-content {
  padding: 0;
  font-family: monospace;
  font-size: 14px;
  line-height: 1.5;
  max-height: 500px;
  overflow: auto;
}

.line {
  padding: 2px 16px;
  display: flex;
}

.line-number {
  width: 40px;
  color: #a0aec0;
  user-select: none;
  padding-right: 12px;
  text-align: right;
}

.line-content {
  flex: 1;
  white-space: pre-wrap;
  word-break: break-all;
}

.added {
  background-color: rgba(72, 187, 120, 0.15);
}

.added .line-content {
  color: #22543d;
}

.removed {
  background-color: rgba(245, 101, 101, 0.15);
}

.removed .line-content {
  color: #742a2a;
  text-decoration: line-through;
}

.modified {
  background-color: rgba(237, 137, 54, 0.15);
}

.inline-line {
  display: flex;
  margin-bottom: 4px;
}

.inline-left, .inline-right {
  flex: 1;
  padding: 4px 8px;
}

.divider {
  width: 1px;
  background: #e2e8f0;
  margin: 0 16px;
}

.stats {
  margin-top: 24px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  display: flex;
  justify-content: space-around;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #4b6cb7;
}

.stat-label {
  font-size: 14px;
  color: #718096;
}

@media (max-width: 768px) {
  .input-methods {
    flex-direction: column;
  }
  
  .side-by-side {
    flex-direction: column;
  }
  
  .stats {
    flex-wrap: wrap;
    gap: 16px;
  }
  
  .stat-item {
    flex: 1 0 40%;
  }
}
</style>