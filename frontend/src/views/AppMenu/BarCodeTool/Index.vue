<template>
  <div class="barcode-generator">
    <div class="generator-container">
      <h2>条形码生成器</h2>
      
      <div class="input-group">
        <label for="barcode-value">输入内容</label>
        <input
          id="barcode-value"
          v-model="barcodeValue"
          type="text"
          placeholder="请输入要编码的内容"
          @input="generateBarcode"
        >
      </div>
      
      <div class="settings-panel">
        <div class="setting-group">
          <label for="format">条形码格式</label>
          <select id="format" v-model="selectedFormat" @change="generateBarcode">
            <option v-for="format in formats" :key="format" :value="format">
              {{ format }}
            </option>
          </select>
        </div>
        
        <div class="setting-group">
          <label for="width">线条宽度</label>
          <input
            id="width"
            v-model.number="lineWidth"
            type="range"
            min="1"
            max="4"
            step="0.1"
            @change="generateBarcode"
          >
          <span>{{ lineWidth }}px</span>
        </div>
        
        <div class="setting-group">
          <label for="height">条形码高度</label>
          <input
            id="height"
            v-model.number="height"
            type="range"
            min="20"
            max="200"
            step="5"
            @change="generateBarcode"
          >
          <span>{{ height }}px</span>
        </div>
        
        <div class="setting-group color-picker">
          <label for="color">线条颜色</label>
          <input
            id="color"
            v-model="lineColor"
            type="color"
            @change="generateBarcode"
          >
          <span>{{ lineColor }}</span>
        </div>
      </div>
      
      <div class="preview-container">
        <div class="barcode-preview">
          <svg v-if="barcodeValue" ref="barcodeElement" class="barcode"></svg>
          <div v-else class="placeholder">
            <p>请输入内容生成条形码</p>
          </div>
        </div>
        
        <div class="actions" v-if="barcodeValue">
          <button @click="downloadBarcode" class="download-btn">
            下载条形码
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import JsBarcode from 'jsbarcode';

export default {
  name: 'BarcodeGenerator',
  setup() {
    const barcodeValue = ref('');
    const selectedFormat = ref('CODE128');
    const lineWidth = ref(2);
    const height = ref(100);
    const lineColor = ref('#000000');
    const barcodeElement = ref(null);
    
    const formats = [
      'CODE128',
      'CODE128A',
      'CODE128B',
      'CODE128C',
      'EAN',
      'EAN-8',
      'EAN-13',
      'UPC',
      'UPC-A',
      'UPC-E',
      'CODE39',
      'ITF-14',
      'MSI',
      'pharmacode'
    ];
    
    const generateBarcode = () => {
      if (!barcodeValue.value || !barcodeElement.value) return;
      
      try {
        JsBarcode(barcodeElement.value, barcodeValue.value, {
          format: selectedFormat.value,
          width: lineWidth.value,
          height: height.value,
          lineColor: lineColor.value,
          displayValue: true,
          fontOptions: 'bold',
          font: 'monospace',
          textAlign: 'center',
          textPosition: 'bottom',
          textMargin: 6,
          fontSize: 16,
          background: '#ffffff',
          margin: 10
        });
      } catch (error) {
        console.error('生成条形码失败:', error);
      }
    };
    
    const downloadBarcode = () => {
      if (!barcodeElement.value) return;
      
      const svgData = new XMLSerializer().serializeToString(barcodeElement.value);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);
      
      const downloadLink = document.createElement('a');
      downloadLink.href = svgUrl;
      downloadLink.download = `barcode-${barcodeValue.value}.svg`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    };
    
    // 监听值变化
    watch([barcodeValue, selectedFormat, lineWidth, height, lineColor], () => {
      generateBarcode();
    });
    
    onMounted(() => {
      // 初始生成示例条形码
      barcodeValue.value = 'EXAMPLE123';
      setTimeout(generateBarcode, 100);
    });
    
    return {
      barcodeValue,
      selectedFormat,
      lineWidth,
      height,
      lineColor,
      barcodeElement,
      formats,
      generateBarcode,
      downloadBarcode
    };
  }
};
</script>

<style scoped>
.barcode-generator {
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  max-width: 800px;
  margin: 0 auto;
}

.generator-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 24px;
}

h2 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 24px;
  font-weight: 600;
}

.input-group {
  margin-bottom: 20px;
}

.input-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #34495e;
}

.input-group input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.input-group input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.settings-panel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.setting-group {
  display: flex;
  flex-direction: column;
}

.setting-group label {
  margin-bottom: 8px;
  font-weight: 500;
  color: #34495e;
}

.setting-group select,
.setting-group input[type="range"] {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
}

.setting-group span {
  margin-top: 4px;
  font-size: 14px;
  color: #7f8c8d;
}

.color-picker input[type="color"] {
  height: 40px;
  padding: 2px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.preview-container {
  text-align: center;
  padding: 20px;
  border: 1px dashed #ddd;
  border-radius: 8px;
  background: white;
}

.barcode-preview {
  min-height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.barcode {
  max-width: 100%;
  height: auto;
}

.placeholder {
  color: #95a5a6;
  font-style: italic;
}

.actions {
  margin-top: 16px;
}

.download-btn {
  padding: 10px 20px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s;
}

.download-btn:hover {
  background: #2980b9;
}

@media (max-width: 600px) {
  .settings-panel {
    grid-template-columns: 1fr;
  }
  
  .generator-container {
    padding: 16px;
  }
}
</style>