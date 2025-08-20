<template>
  <div v-if="props.show" class="json-tool-box">
    <div class="tool-content-box">
      <textarea
        v-model="inputJson"
        placeholder="请输入 JSON 字符串..."
        class="json-input"
        :class="{ error: hasError }"
        @input="formatJson"
      ></textarea>
      <div class="trans-box">
        <img style="width: 24px" src="@/assets/images/icon/trans.svg" />
      </div>
      <div v-if="hasError" class="json-content">
        <h3>❌ JSON 格式错误:</h3>
        <p>{{ errorMessage }}</p>
      </div>
      <div class="json-content">
        <div v-if="formattedJson && !hasError">
          <pre class="json-output" v-html="highlightedJson"></pre>
        </div>
      </div>
    </div>
    <div class="tool-btn-box">
      <button @click="formatJson" :disabled="!inputJson" class="format-btn">
        {{ hasError ? "重新格式化" : "格式化" }}
      </button>
      <button
        @click="copyToClipboard"
        :disabled="!formattedJson || hasError"
        class="copy-btn"
        :class="{ copied: copySuccess }"
      >
        {{ copySuccess ? "✓ 已复制!" : "复制" }}
      </button>
      <button @click="clearAll" class="clear-btn">清空</button>
      <div class="features">
        <label class="indent-control">
          缩进空格数:
          <input
            type="number"
            v-model.number="indent"
            min="2"
            max="8"
            class="indent-input"
            @change="formatJson"
          />
        </label>
      </div>
      <button class="close-btn" @click="emit('update:show', false)">close</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
const props = defineProps({
  show: Boolean,
});
const emit = defineEmits(["update:show"]);
const inputJson = ref("");
const formattedJson = ref("");
const hasError = ref(false);
const errorMessage = ref("");
const indent = ref(2);
const copySuccess = ref(false);

// 语法高亮
const highlightedJson = computed(() => {
  if (!formattedJson.value) return "";

  return formattedJson.value
    .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?)/g, (match) => {
      let cls = "json-string";
      if (match.endsWith(":")) {
        cls = "json-key";
      }
      return `<span class="${cls}">${match}</span>`;
    })
    .replace(/\b(true|false|null)\b/g, '<span class="json-boolean">$1</span>')
    .replace(/\b(\d+)\b/g, '<span class="json-number">$1</span>');
});

// 美化 JSON 函数
const beautifyJson = (jsonString, indentSize = 2) => {
  try {
    const parsed = JSON.parse(jsonString);
    return JSON.stringify(parsed, null, indentSize);
  } catch (error) {
    throw error;
  }
};

// 格式化 JSON
const formatJson = () => {
  copySuccess.value = false;
  if (!inputJson.value.trim()) {
    formattedJson.value = "";
    hasError.value = false;
    return;
  }

  try {
    formattedJson.value = beautifyJson(inputJson.value, indent.value);
    hasError.value = false;
    errorMessage.value = "";
  } catch (error) {
    hasError.value = true;
    errorMessage.value = error.message;
    formattedJson.value = "";
  }
};

// 复制到剪贴板
const copyToClipboard = async () => {
  if (!formattedJson.value || hasError.value) return;

  try {
    await navigator.clipboard.writeText(formattedJson.value);
    copySuccess.value = true;
    setTimeout(() => {
      copySuccess.value = false;
    }, 3000);
  } catch (error) {
    const textArea = document.createElement("textarea");
    textArea.value = formattedJson.value;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand("copy");
      copySuccess.value = true;
      setTimeout(() => {
        copySuccess.value = false;
      }, 3000);
    } catch (fallbackError) {
      alert("复制失败，请手动复制");
    }
    document.body.removeChild(textArea);
  }
};

// 清空所有内容
const clearAll = () => {
  inputJson.value = "";
  formattedJson.value = "";
  hasError.value = false;
  errorMessage.value = "";
  copySuccess.value = false;
};

// 监听缩进设置变化
watch(indent, () => {
  if (inputJson.value) {
    formatJson();
  }
});
</script>

<style lang="less" scoped>
.json-tool-box {
  width: 100%;
  height: 400px;
  border: 1px solid #000;
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  .tool-content-box {
    flex: 1;
    display: flex;
    gap: 24px;
    padding: 10px 10px 0 10px;
    .trans-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .json-input {
      flex: 1;
      padding: 10px;
      border-radius: 8px;
      resize: none;
      height: 320px;
      overflow: auto;
      &.error {
        background-color: #ffebeb;
      }
    }
    .json-content {
      flex: 1;
      border: 1px solid #c4c1c1;
      border-radius: 8px;
      height: 340px;
      overflow: auto;
      & > div {
        pre {
          margin: 0;
        }
      }
    }
  }
  .tool-btn-box {
    margin: 10px;
    display: flex;
    gap: 5px;
    button {
      cursor: pointer;
    }
    .close-btn {
      background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
      color: #fff;
    }
  }
}
.json-input {
  width: 100%;
  min-height: 200px;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
  font-size: 14px;
  line-height: 1.5;
  resize: vertical;
  tab-size: 2;
}

.json-input:focus {
  outline: none;
  border-color: #3498db;
}

.json-input.error {
  border-color: #e74c3c;
}

.json-output {
  height: 100%;
  background-color: #1e1e1e;
  border: 1px solid #333;
  border-radius: 8px;
  overflow-x: auto;
  white-space: pre-wrap;
  font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
  font-size: 14px;
  line-height: 1.5;
  color: #d4d4d4;
  tab-size: 2;
  overflow: auto;
}

/* 语法高亮样式 */
:deep(.json-key) {
  color: #9cdcfe;
  font-weight: bold;
}

:deep(.json-string) {
  color: #ce9178;
}

:deep(.json-number) {
  color: #b5cea8;
}

:deep(.json-boolean) {
  color: #569cd6;
}

.controls {
  margin: 1rem 0;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

button {
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  height: 32px;
}

.format-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.format-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.copy-btn {
  background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
  color: white;
}

.copy-btn.copied {
  background: linear-gradient(135deg, #16a085 0%, #27ae60 100%);
}

.copy-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(78, 205, 196, 0.3);
}

.clear-btn {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
  color: white;
}

.clear-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
}

button:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.error-message {
  background: linear-gradient(135deg, #ff6b6b 0%, #c0392b 100%);
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  color: white;
}

.features {
  border-top: 1px solid #eee;
  text-align: center;
}

.indent-control {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  background: #f8f9fa;
  border-radius: 25px;
}

.indent-input {
  width: 60px;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  text-align: center;
  font-weight: bold;
}
</style>
