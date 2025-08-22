<template>
  <div class="base64-converter">
    <div class="header">
      <h1><i class="fas fa-exchange-alt"></i> Base64图片转换工具</h1>
      <p>上传图片转换为Base64编码，或将Base64字符串解码为图片</p>
    </div>

    <div class="converter-container">
      <!-- 上传区域 -->
      <div class="upload-section">
        <div 
          class="drop-area" 
          :class="{ 'drag-over': isDragOver }"
          @dragover.prevent="handleDragOver"
          @dragleave="handleDragLeave"
          @drop.prevent="handleDrop"
        >
          <div v-if="!imageSrc" class="upload-placeholder">
            <i class="fas fa-cloud-upload-alt"></i>
            <p>拖放图片到这里或点击上传</p>
            <input 
              type="file" 
              accept="image/*" 
              @change="handleFileSelect" 
              ref="fileInput"
              class="file-input"
            />
          </div>
          <div v-else class="image-preview">
            <img :src="imageSrc" alt="预览图片" />
            <button @click="clearImage" class="clear-btn">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>

        <div class="action-buttons">
          <button @click="triggerFileInput" class="btn primary">
            <i class="fas fa-folder-open"></i> 选择图片
          </button>
          <button @click="encodeToBase64" :disabled="!imageSrc" class="btn success">
            <i class="fas fa-code"></i> 编码为Base64
          </button>
        </div>
      </div>

      <!-- Base64结果区域 -->
      <div class="result-section">
        <div class="section-header">
          <h3>Base64 编码结果</h3>
          <button 
            @click="copyToClipboard" 
            :disabled="!base64Result" 
            class="btn icon"
            :class="{ 'copied': isCopied }"
          >
            <i class="fas" :class="isCopied ? 'fa-check' : 'fa-copy'"></i>
            {{ isCopied ? '已复制!' : '复制' }}
          </button>
        </div>
        
        <textarea 
          v-model="base64Result" 
          placeholder="Base64编码将显示在这里..."
          class="base64-textarea"
          readonly
        ></textarea>

        <div class="decode-section">
          <h3>Base64 解码</h3>
          <textarea 
            v-model="base64Input" 
            placeholder="粘贴Base64字符串进行解码..."
            class="base64-textarea"
          ></textarea>
          <button @click="decodeFromBase64" :disabled="!base64Input" class="btn warning">
            <i class="fas fa-image"></i> 解码为图片
          </button>
        </div>
      </div>
    </div>

    <!-- 信息提示 -->
    <div v-if="message" class="message" :class="messageType">
      {{ message }}
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'Base64ImageConverter',
  setup() {
    const isDragOver = ref(false)
    const imageSrc = ref('')
    const base64Result = ref('')
    const base64Input = ref('')
    const isCopied = ref(false)
    const message = ref('')
    const messageType = ref('')
    const fileInput = ref(null)

    // 触发文件选择
    const triggerFileInput = () => {
      fileInput.value?.click()
    }

    // 处理文件选择
    const handleFileSelect = (event) => {
      const file = event.target.files[0]
      if (file && file.type.startsWith('image/')) {
        processImageFile(file)
      } else {
        showMessage('请选择有效的图片文件', 'error')
      }
    }

    // 处理拖放事件
    const handleDragOver = () => {
      isDragOver.value = true
    }

    const handleDragLeave = () => {
      isDragOver.value = false
    }

    const handleDrop = (event) => {
      isDragOver.value = false
      const file = event.dataTransfer.files[0]
      if (file && file.type.startsWith('image/')) {
        processImageFile(file)
      } else {
        showMessage('请拖放有效的图片文件', 'error')
      }
    }

    // 处理图片文件
    const processImageFile = (file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        imageSrc.value = e.target.result
      }
      reader.readAsDataURL(file)
    }

    // 编码为Base64
    const encodeToBase64 = () => {
      if (imageSrc.value) {
        // 移除data:image/...;base64,前缀（如果需要纯base64）
        const base64Data = imageSrc.value.split(',')[1]
        base64Result.value = base64Data
        showMessage('图片已成功编码为Base64', 'success')
      }
    }

    // 从Base64解码
    const decodeFromBase64 = () => {
      if (base64Input.value) {
        try {
          // 添加适当的前缀（假设是PNG图片，可以根据需要调整）
          imageSrc.value = `data:image/png;base64,${base64Input.value}`
          base64Result.value = '' // 清空结果区域
          showMessage('Base64已成功解码为图片', 'success')
        } catch (error) {
          showMessage('Base64解码失败，请检查格式是否正确', 'error')
        }
      }
    }

    // 复制到剪贴板
    const copyToClipboard = async () => {
      if (base64Result.value) {
        try {
          await navigator.clipboard.writeText(base64Result.value)
          isCopied.value = true
          showMessage('Base64编码已复制到剪贴板', 'success')
          setTimeout(() => {
            isCopied.value = false
          }, 2000)
        } catch (error) {
          showMessage('复制失败，请手动选择文本复制', 'error')
        }
      }
    }

    // 清除图片
    const clearImage = () => {
      imageSrc.value = ''
      base64Result.value = ''
      if (fileInput.value) {
        fileInput.value.value = ''
      }
    }

    // 显示消息
    const showMessage = (text, type) => {
      message.value = text
      messageType.value = type
      setTimeout(() => {
        message.value = ''
      }, 3000)
    }

    return {
      isDragOver,
      imageSrc,
      base64Result,
      base64Input,
      isCopied,
      message,
      messageType,
      fileInput,
      triggerFileInput,
      handleFileSelect,
      handleDragOver,
      handleDragLeave,
      handleDrop,
      encodeToBase64,
      decodeFromBase64,
      copyToClipboard,
      clearImage
    }
  }
}
</script>

<style scoped>
.base64-converter {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.header {
  text-align: center;
  margin-bottom: 30px;
}

.header h1 {
  color: #2c3e50;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.header p {
  color: #7f8c8d;
}

.converter-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

.upload-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.drop-area {
  border: 2px dashed #3498db;
  border-radius: 8px;
  padding: 30px;
  text-align: center;
  transition: all 0.3s ease;
  min-height: 250px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.drop-area.drag-over {
  border-color: #2ecc71;
  background-color: rgba(46, 204, 113, 0.05);
}

.upload-placeholder {
  color: #7f8c8d;
}

.upload-placeholder i {
  font-size: 48px;
  margin-bottom: 15px;
  color: #3498db;
}

.file-input {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  opacity: 0;
  cursor: pointer;
}

.image-preview {
  position: relative;
  max-width: 100%;
}

.image-preview img {
  max-width: 100%;
  max-height: 200px;
  border-radius: 4px;
}

.clear-btn {
  position: absolute;
  top: -10px;
  right: -10px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.result-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.base64-textarea {
  width: 100%;
  min-height: 150px;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-family: monospace;
  resize: vertical;
}

.decode-section {
  margin-top: 20px;
}

.btn {
  padding: 10px 15px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn.primary {
  background: #3498db;
  color: white;
}

.btn.success {
  background: #2ecc71;
  color: white;
}

.btn.warning {
  background: #f39c12;
  color: white;
}

.btn.icon {
  background: transparent;
  color: #7f8c8d;
  padding: 5px 10px;
}

.btn.icon.copied {
  color: #2ecc71;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.message {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 12px 20px;
  border-radius: 6px;
  color: white;
  font-weight: 500;
  animation: slideIn 0.3s ease;
}

.message.success {
  background: #2ecc71;
}

.message.error {
  background: #e74c3c;
}

@keyframes slideIn {
  from {
    transform: translateX(100px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .converter-container {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}
</style>