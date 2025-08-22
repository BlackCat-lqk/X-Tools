<template>
  <div class="whois-lookup">
    <h2>WHOIS 查询工具</h2>
    <div class="search-section">
      <div class="input-group">
        <input
          v-model="domain"
          type="text"
          placeholder="输入域名（例如：example.com）"
          @keyup.enter="lookupWhois"
          class="domain-input"
        />
        <button @click="lookupWhois" :disabled="loading" class="search-btn">
          {{ loading ? '查询中...' : '查询' }}
        </button>
      </div>
      <div v-if="error" class="error-message">{{ error }}</div>
    </div>

    <div v-if="loading" class="loading">正在查询，请稍候...</div>

    <div v-if="whoisData" class="results-section">
      <h3>查询结果: {{ domain }}</h3>
      <div class="whois-data">
        <pre>{{ whoisData }}</pre>
      </div>
      <div class="actions">
        <button @click="copyToClipboard" class="copy-btn">复制结果</button>
        <button @click="clearResults" class="clear-btn">清除结果</button>
      </div>
    </div>

    <div class="info-section">
      <h4>关于WHOIS查询</h4>
      <p>WHOIS是一种用于查询域名注册信息的协议。通过WHOIS查询，您可以获取域名的注册商、注册日期、到期日期、域名服务器等信息。</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const domain = ref('');
const whoisData = ref(null);
const loading = ref(false);
const error = ref('');

// WHOIS查询函数
const lookupWhois = async () => {
  if (!domain.value) {
    error.value = '请输入要查询的域名';
    return;
  }

  // 简单的域名格式验证
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
  if (!domainRegex.test(domain.value)) {
    error.value = '请输入有效的域名格式（如：example.com）';
    return;
  }

  loading.value = true;
  error.value = '';
  whoisData.value = null;

  try {
    // 在实际应用中，您应该使用自己的后端API来代理WHOIS查询
    // 这里使用一个模拟的WHOIS服务作为示例
    const response = await fetch(`https://jsonwhoisapi.com/api/v1/whois?identifier=${domain.value}`, {
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY' // 需要替换为实际的API密钥
      }
    });

    if (!response.ok) {
      throw new Error('WHOIS查询失败，请稍后重试');
    }

    const data = await response.json();
    
    // 格式化WHOIS数据
    whoisData.value = formatWhoisData(data);
  } catch (err) {
    error.value = err.message || '查询过程中发生错误';
    
    // 模拟数据（在实际应用中应删除）
    whoisData.value = `Domain Name: ${domain.value}
Registrar: Example Registrar, Inc.
Creation Date: 2020-01-01T00:00:00Z
Expiration Date: 2025-01-01T00:00:00Z
Updated Date: 2023-06-15T10:30:00Z
Name Servers:
  ns1.example.com
  ns2.example.com
Registrant:
  Name: John Doe
  Organization: Example Inc.
  Email: contact@example.com
Status: clientTransferProhibited
此数据仅为演示用途，实际WHOIS查询需要有效的API密钥。`;
  } finally {
    loading.value = false;
  }
};

// 格式化WHOIS数据
const formatWhoisData = (data) => {
  // 这里可以根据实际的API响应结构进行格式化
  // 示例实现：
  let formatted = '';
  
  if (data.domain_name) formatted += `Domain Name: ${data.domain_name}\n`;
  if (data.registrar) formatted += `Registrar: ${data.registrar}\n`;
  if (data.creation_date) formatted += `Creation Date: ${data.creation_date}\n`;
  if (data.expiration_date) formatted += `Expiration Date: ${data.expiration_date}\n`;
  if (data.updated_date) formatted += `Updated Date: ${data.updated_date}\n`;
  
  if (data.name_servers && data.name_servers.length) {
    formatted += 'Name Servers:\n';
    data.name_servers.forEach(ns => {
      formatted += `  ${ns}\n`;
    });
  }
  
  if (data.registrant) {
    formatted += 'Registrant:\n';
    if (data.registrant.name) formatted += `  Name: ${data.registrant.name}\n`;
    if (data.registrant.organization) formatted += `  Organization: ${data.registrant.organization}\n`;
    if (data.registrant.email) formatted += `  Email: ${data.registrant.email}\n`;
  }
  
  if (data.status) formatted += `Status: ${data.status}\n`;
  
  return formatted;
};

// 复制到剪贴板
const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(whoisData.value);
    alert('WHOIS信息已复制到剪贴板');
  } catch (err) {
    console.error('复制失败:', err);
  }
};

// 清除结果
const clearResults = () => {
  whoisData.value = null;
  domain.value = '';
  error.value = '';
};
</script>

<style scoped>
.whois-lookup {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Arial', sans-serif;
}

h2 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 25px;
}

.input-group {
  display: flex;
  margin-bottom: 15px;
}

.domain-input {
  flex: 1;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 4px 0 0 4px;
  font-size: 16px;
}

.search-btn {
  padding: 12px 20px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

.search-btn:hover:not(:disabled) {
  background-color: #2980b9;
}

.search-btn:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
}

.error-message {
  color: #e74c3c;
  margin-top: 10px;
}

.loading {
  text-align: center;
  padding: 20px;
  color: #7f8c8d;
}

.results-section {
  margin-top: 30px;
}

.results-section h3 {
  color: #2c3e50;
  margin-bottom: 15px;
}

.whois-data {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 20px;
  overflow-x: auto;
}

.whois-data pre {
  white-space: pre-wrap;
  font-family: 'Courier New', monospace;
  line-height: 1.5;
  margin: 0;
}

.actions {
  display: flex;
  gap: 10px;
}

.copy-btn, .clear-btn {
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.copy-btn {
  background-color: #2ecc71;
  color: white;
}

.copy-btn:hover {
  background-color: #27ae60;
}

.clear-btn {
  background-color: #e74c3c;
  color: white;
}

.clear-btn:hover {
  background-color: #c0392b;
}

.info-section {
  margin-top: 30px;
  padding: 15px;
  background-color: #f1f8ff;
  border-radius: 4px;
}

.info-section h4 {
  color: #3498db;
  margin-bottom: 10px;
}

.info-section p {
  color: #7f8c8d;
  line-height: 1.6;
  margin: 0;
}

@media (max-width: 600px) {
  .input-group {
    flex-direction: column;
  }
  
  .domain-input {
    border-radius: 4px;
    margin-bottom: 10px;
  }
  
  .search-btn {
    border-radius: 4px;
  }
  
  .actions {
    flex-direction: column;
  }
}
</style>