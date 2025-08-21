<template>
  <div class="ip-query-container">
    <div class="header">
      <h2><i class="fas fa-search-location"></i> IP地址查询工具</h2>
      <p>输入IP地址查询其地理位置和网络信息</p>
    </div>
    
    <div class="search-box">
      <div class="input-group">
        <input 
          v-model="ipAddress" 
          @keyup.enter="queryIpInfo"
          placeholder="请输入IP地址（默认查询本机IP）" 
          type="text"
        >
        <button @click="queryIpInfo" :disabled="loading">
          <span v-if="!loading">查询</span>
          <span v-else>查询中...</span>
          <i class="fas" :class="loading ? 'fa-spinner fa-spin' : 'fa-search'"></i>
        </button>
      </div>
      
      <div class="actions">
        <button @click="queryMyIp" class="btn-secondary">
          <i class="fas fa-location-arrow"></i> 查询本机IP
        </button>
        <button @click="clearResults" class="btn-secondary">
          <i class="fas fa-trash"></i> 清除结果
        </button>
      </div>
    </div>
    
    <div v-if="error" class="error-message">
      <i class="fas fa-exclamation-circle"></i>
      {{ error }}
    </div>
    
    <div v-if="ipInfo && !loading" class="results-container">
      <div class="results-card">
        <h3>查询结果</h3>
        
        <div class="info-grid">
          <div class="info-item">
            <label>IP地址</label>
            <div class="value">{{ ipInfo.query || ipInfo.ip }}</div>
          </div>
          <div class="info-item">
            <label>国家</label>
            <div class="value">{{ ipInfo.country }}</div>
          </div>
          <div class="info-item">
            <label>地区/省份</label>
            <div class="value">{{ ipInfo.regionName }}</div>
          </div>
          <div class="info-item">
            <label>城市</label>
            <div class="value">{{ ipInfo.city }}</div>
          </div>
          <div class="info-item">
            <label>邮政编码</label>
            <div class="value">{{ ipInfo.zip || '未知' }}</div>
          </div>
          <div class="info-item">
            <label>经纬度</label>
            <div class="value">{{ ipInfo.lat }}, {{ ipInfo.lon }}</div>
          </div>
          <div class="info-item">
            <label>时区</label>
            <div class="value">{{ ipInfo.timezone }}</div>
          </div>
          <div class="info-item">
            <label>ISP提供商</label>
            <div class="value">{{ ipInfo.isp }}</div>
          </div>
          <div class="info-item">
            <label>组织</label>
            <div class="value">{{ ipInfo.org || '未知' }}</div>
          </div>
        </div>
        
        <div class="map-container" v-if="ipInfo.lat && ipInfo.lon">
          <p>地理位置预览</p>
          <div class="map-placeholder">
            <i class="fas fa-map-marked-alt"></i>
            <span>地图坐标: {{ ipInfo.lat }}, {{ ipInfo.lon }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>正在查询IP信息...</p>
    </div>
    
    <div class="footer">
      <p>本工具使用第三方API获取IP地理位置信息</p>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  name: 'IpAddressQuery',
  setup() {
    const ipAddress = ref('');
    const ipInfo = ref(null);
    const loading = ref(false);
    const error = ref('');
    
    // 查询IP信息
    const queryIpInfo = async () => {
      if (loading.value) return;
      
      loading.value = true;
      error.value = '';
      
      try {
        // 使用ip-api.com的免费API
        const query = ipAddress.value || '';
        const response = await fetch(`http://ip-api.com/json/${query}?lang=zh-CN&fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query`);
        const data = await response.json();
        
        if (data.status === 'success') {
          ipInfo.value = data;
        } else {
          error.value = data.message || '查询失败，请检查IP地址格式';
        }
      } catch (err) {
        error.value = '网络错误，无法获取IP信息';
        console.error('IP查询错误:', err);
      } finally {
        loading.value = false;
      }
    };
    
    // 查询本机IP
    const queryMyIp = () => {
      ipAddress.value = '';
      queryIpInfo();
    };
    
    // 清除结果
    const clearResults = () => {
      ipInfo.value = null;
      error.value = '';
    };
    
    return {
      ipAddress,
      ipInfo,
      loading,
      error,
      queryIpInfo,
      queryMyIp,
      clearResults
    };
  }
};
</script>

<style scoped>
.ip-query-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
}

.header {
  text-align: center;
  margin-bottom: 30px;
}

.header h2 {
  color: #2c3e50;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.header p {
  color: #7f8c8d;
  font-size: 16px;
}

.search-box {
  background: #f8f9fa;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
  margin-bottom: 25px;
}

.input-group {
  display: flex;
  margin-bottom: 15px;
}

.input-group input {
  flex: 1;
  padding: 14px 16px;
  border: 2px solid #ddd;
  border-radius: 8px 0 0 8px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.input-group input:focus {
  outline: none;
  border-color: #3498db;
}

.input-group button {
  padding: 0 24px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 0 8px 8px 0;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 0.3s;
}

.input-group button:hover:not(:disabled) {
  background: #2980b9;
}

.input-group button:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.actions {
  display: flex;
  gap: 12px;
}

.btn-secondary {
  padding: 10px 16px;
  background: #ecf0f1;
  border: 1px solid #bdc3c7;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s;
}

.btn-secondary:hover {
  background: #dfe6e9;
}

.error-message {
  background: #ffecec;
  color: #e74c3c;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.results-container {
  animation: fadeIn 0.5s ease;
}

.results-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.07);
  padding: 25px;
  margin-bottom: 25px;
}

.results-card h3 {
  color: #2c3e50;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 25px;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.info-item label {
  font-weight: 600;
  color: #7f8c8d;
  font-size: 14px;
  margin-bottom: 5px;
}

.info-item .value {
  font-size: 16px;
  color: #2c3e50;
  word-break: break-all;
}

.map-container p {
  font-weight: 600;
  margin-bottom: 12px;
  color: #7f8c8d;
}

.map-placeholder {
  background: #f1f2f6;
  border-radius: 8px;
  padding: 30px;
  text-align: center;
  color: #7f8c8d;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.map-placeholder i {
  font-size: 32px;
  color: #3498db;
}

.loading-container {
  text-align: center;
  padding: 40px 0;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

.footer {
  text-align: center;
  margin-top: 30px;
  color: #95a5a6;
  font-size: 14px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 响应式设计 */
@media (max-width: 600px) {
  .ip-query-container {
    padding: 15px;
  }
  
  .input-group {
    flex-direction: column;
  }
  
  .input-group input {
    border-radius: 8px;
    margin-bottom: 10px;
  }
  
  .input-group button {
    border-radius: 8px;
    justify-content: center;
  }
  
  .actions {
    flex-direction: column;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>