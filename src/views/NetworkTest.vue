<template>
  <div class="network-test">
    <el-card class="network-info-card" shadow="hover">
      <el-row :gutter="20">
        <el-col :span="8">
          <div class="info-item">
            <div class="info-label">运营商</div>
            <div class="info-value">{{ networkInfo.isp || '获取中...' }}</div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="info-item">
            <div class="info-label">IP地址</div>
            <div class="info-value">{{ networkInfo.ip || '获取中...' }}</div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="info-item">
            <div class="info-label">地理位置</div>
            <div class="info-value">{{ networkInfo.location || '获取中...' }}</div>
          </div>
        </el-col>
      </el-row>
      <el-button type="text" class="refresh-btn" @click="fetchNetworkInfo">
        <i class="el-icon-refresh" :class="{ 'is-loading': isRefreshingInfo }"></i>
        刷新
      </el-button>
    </el-card>
    
    <el-card class="test-card">
      <div slot="header" class="card-header">
        <span class="title">网络测试工具</span>
        <el-button-group>
          <el-button type="text" @click="showHistory">
            <i class="el-icon-time"></i> 历史记录
          </el-button>
          <el-button type="text" @click="clearHistory">
            <i class="el-icon-delete"></i> 清除历史
          </el-button>
        </el-button-group>
      </div>
      
      <el-tabs v-model="activeTab">
        <el-tab-pane label="Ping测试" name="ping">
          <div class="ping-test">
            <el-input
              v-model="pingHost"
              placeholder="请输入要测试的域名或IP"
              class="input-with-button">
              <el-button slot="append" 
                         @click="startPingTest"
                         :disabled="pingLoading">
                <i v-if="pingLoading" class="el-icon-loading"></i>
                开始测试
              </el-button>
            </el-input>
            
            <div class="result-area" v-if="pingResults.length">
              <el-table :data="pingResults" stripe>
                <el-table-column prop="sequence" label="序号" width="80"/>
                <el-table-column prop="time" label="响应时间(ms)" width="120"/>
                <el-table-column prop="status" label="状态"/>
              </el-table>
            </div>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="网速测试" name="speed">
          <div class="speed-test">
            <div class="test-options">
              <el-select v-model="speedTestSize" 
                        placeholder="选择测试文件大小" 
                        class="test-size-select"
                        :disabled="speedLoading">
                <el-option label="10MB" :value="10"></el-option>
                <el-option label="50MB" :value="50"></el-option>
                <el-option label="100MB" :value="100"></el-option>
              </el-select>
              
              <el-button type="primary" 
                       @click="startSpeedTest"
                       :disabled="speedLoading">
                <i v-if="speedLoading" class="el-icon-loading"></i>
                <i v-else class="el-icon-video-play"></i>
                {{ speedLoading ? '测试中...' : '开始测速' }}
              </el-button>
            </div>
            
            <div class="speed-content">
              <div class="speed-chart-container" v-show="speedLoading">
                <v-chart :option="realtimeChartOption" autoresize></v-chart>
              </div>
              
              <div class="speed-result-container" v-show="speedResult.download">
                <div class="speed-result">
                  <el-row :gutter="20">
                    <el-col :span="12">
                      <el-card shadow="hover">
                        <div slot="header" class="result-header">
                          <i class="el-icon-download"></i> 下载速度
                        </div>
                        <div class="speed-value">
                          {{ speedResult.download }}
                          <span class="unit">Mbps</span>
                        </div>
                        <div class="speed-details">
                          <el-tag size="small">延迟: {{ speedResult.latency }}ms</el-tag>
                        </div>
                      </el-card>
                    </el-col>
                    <el-col :span="12">
                      <el-card shadow="hover">
                        <div slot="header" class="result-header">
                          <i class="el-icon-upload2"></i> 上传速度
                        </div>
                        <div class="speed-value">
                          {{ speedResult.upload }}
                          <span class="unit">Mbps</span>
                        </div>
                        <div class="speed-details">
                          <el-tag size="small" type="success">抖动: {{ speedResult.jitter }}ms</el-tag>
                        </div>
                      </el-card>
                    </el-col>
                  </el-row>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    
    <el-dialog title="测速历史记录" :visible.sync="historyDialogVisible" width="80%">
      <div class="history-charts" v-if="historyDialogVisible">
        <v-chart 
          class="chart" 
          :options="historyChartOption"
          :autoresize="true"
          ref="speedChart">
        </v-chart>
      </div>
      <el-table 
        :data="paginatedHistory" 
        stripe 
        class="history-table"
        :header-cell-style="{
          background: '#f5f7fa',
          color: '#606266',
          fontWeight: 'bold'
        }"
        >
        <el-table-column prop="date" label="测试时间" width="180"/>
        <el-table-column prop="download" label="下载速度(Mbps)" min-width="150" align="center"/>
        <el-table-column prop="upload" label="上传速度(Mbps)" min-width="150" align="center"/>
        <el-table-column prop="latency" label="延迟(ms)" min-width="120" align="center"/>
        <el-table-column prop="jitter" label="抖动(ms)" min-width="120" align="center"/>
      </el-table>
      <div class="pagination-container">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[5, 10, 20, 50]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="speedHistory.length">
        </el-pagination>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'NetworkTest',
  data() {
    return {
      activeTab: 'ping',
      pingHost: '',
      pingLoading: false,
      pingResults: [],
      speedTestSize: 10,
      testProgress: 0,
      currentSpeed: 0,
      speedLoading: false,
      speedResult: {
        download: null,
        upload: null,
        latency: null,
        jitter: null
      },
      speedHistory: [],
      historyDialogVisible: false,
      speedPoints: [],
      realtimeChartOption: {
        title: {
          text: '实时速度监测',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          data: []
        },
        yAxis: {
          type: 'value',
          name: 'Mbps'
        },
        series: [{
          data: [],
          type: 'line',
          smooth: true,
          areaStyle: {
            opacity: 0.3
          },
          lineStyle: {
            width: 3
          }
        }]
      },
      historyChartOption: {
        title: {
          text: '历史速度趋势',
          left: 'center',
          textStyle: {
            fontSize: 16,
            fontWeight: 'normal'
          }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross'
          }
        },
        legend: {
          data: ['下载速度', '上传速度'],
          top: 30,
          textStyle: {
            fontSize: 12
          }
        },
        xAxis: {
          type: 'category',
          data: [],
          axisLabel: {
            rotate: 45,
            interval: 0,
            fontSize: 12
          }
        },
        yAxis: {
          type: 'value',
          name: 'Mbps',
          nameTextStyle: {
            fontSize: 12
          },
          splitLine: {
            show: true,
            lineStyle: {
              type: 'dashed'
            }
          }
        },
        series: [
          {
            name: '下载速度',
            type: 'line',
            data: [],
            smooth: true,
            symbolSize: 8,
            lineStyle: {
              width: 2
            },
            itemStyle: {
              color: '#409EFF'
            },
            areaStyle: {
              opacity: 0.1
            }
          },
          {
            name: '上传速度',
            type: 'line',
            data: [],
            smooth: true,
            symbolSize: 8,
            lineStyle: {
              width: 2
            },
            itemStyle: {
              color: '#67C23A'
            },
            areaStyle: {
              opacity: 0.1
            }
          }
        ],
        grid: {
          top: 80,
          bottom: 60,
          left: 60,
          right: 40,
          containLabel: true
        }
      },
      networkInfo: {
        ip: '',
        isp: '',
        location: '',
        connectionType: ''
      },
      isRefreshingInfo: false,
      currentPage: 1,
      pageSize: 10
    }
  },
  computed: {
    paginatedHistory() {
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return this.speedHistory.slice(start, end)
    }
  },
  methods: {
    async startPingTest() {
      if (!this.pingHost) {
        this.$message.warning('请输入要测试的域名或IP')
        return
      }
      
      this.pingLoading = true
      this.pingResults = []
      
      try {
        // 这里模拟ping测试，项目中需要调用后端API
        for (let i = 1; i <= 4; i++) {
          await new Promise(resolve => setTimeout(resolve, 1000))
          const time = Math.floor(Math.random() * 100) + 20
          this.pingResults.push({
            sequence: i,
            time: time,
            status: time < 100 ? '正常' : '延迟较高'
          })
        }
      } catch (error) {
        this.$message.error('测试失败：' + error.message)
      } finally {
        this.pingLoading = false
      }
    },
    
    progressFormat(percentage) {
      return percentage === 100 ? '完成' : `${percentage}%`
    },
    
    async startSpeedTest() {
      this.speedLoading = true
      this.testProgress = 0
      this.currentSpeed = 0
      this.speedResult = {
        download: null,
        upload: null,
        latency: null,
        jitter: null
      }
      
      try {
        await this.testLatency()
        await this.testDownloadSpeed()
        await this.testUploadSpeed()
        this.saveTestResult()
      } catch (error) {
        this.$message.error('测试失败��' + error.message)
      } finally {
        this.speedLoading = false
      }
    },
    
    async testLatency() {
      // eslint-disable-next-line no-unused-vars
      const startTime = performance.now()
      const latencies = []
      
      // 进行多次延迟测试
      for (let i = 0; i < 5; i++) {
        const start = performance.now()
        await fetch('/ping', { method: 'HEAD' })
        const end = performance.now()
        latencies.push(end - start)
      }
      
      // 算平均延迟和抖动
      this.speedResult.latency = Math.round(latencies.reduce((a, b) => a + b) / latencies.length)
      this.speedResult.jitter = Math.round(Math.max(...latencies) - Math.min(...latencies))
    },
    
    async testDownloadSpeed() {
      const fileSize = this.speedTestSize * 1024 * 1024 // 转换为字节
      const startTime = performance.now()
      let downloaded = 0
      
      const response = await fetch(`/speedtest/download?size=${this.speedTestSize}`)
      const reader = response.body.getReader()
      
      while(!reader.closed) {
        const {done, value} = await reader.read()
        if (done) break
        
        downloaded += value.length
        const currentTime = performance.now()
        const duration = (currentTime - startTime) / 1000 // 转换为秒
        
        // 计算当前速度（Mbps）
        this.currentSpeed = ((downloaded * 8) / (1024 * 1024) / duration).toFixed(2)
        
        // 更新进度
        this.testProgress = Math.round((downloaded / fileSize) * 100)
      }
      
      const endTime = performance.now()
      const duration = (endTime - startTime) / 1000 // 秒
      
      // 计算最终下载速度（Mbps）
      this.speedResult.download = ((fileSize * 8) / (1024 * 1024) / duration).toFixed(2)
    },
    
    async testUploadSpeed() {
      const fileSize = this.speedTestSize * 1024 * 1024 // 转换为字节
      const data = new ArrayBuffer(fileSize)
      const startTime = performance.now()
      
      await fetch('/speedtest/upload', {
        method: 'POST',
        body: data,
        onUploadProgress: (progressEvent) => {
          const uploaded = progressEvent.loaded
          const currentTime = performance.now()
          const duration = (currentTime - startTime) / 1000
          
          // 计算当前速度（Mbps）
          this.currentSpeed = ((uploaded * 8) / (1024 * 1024) / duration).toFixed(2)
          
          // 更新进度
          this.testProgress = Math.round((uploaded / fileSize) * 100)
        }
      })
      
      const endTime = performance.now()
      const duration = (endTime - startTime) / 1000
      
      // 计算最终上传速度（Mbps）
      this.speedResult.upload = ((fileSize * 8) / (1024 * 1024) / duration).toFixed(2)
    },
    
    updateRealtimeChart(speed) {
      const now = new Date()
      const timeStr = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`
      
      this.speedPoints.push({
        time: timeStr,
        speed: parseFloat(speed)
      })
      
      // 保持最近30个点
      if (this.speedPoints.length > 30) {
        this.speedPoints.shift()
      }
      
      this.realtimeChartOption = {
        ...this.realtimeChartOption,
        xAxis: {
          data: this.speedPoints.map(point => point.time)
        },
        series: [{
          data: this.speedPoints.map(point => point.speed),
          type: 'line',
          smooth: true,
          areaStyle: {
            opacity: 0.3
          }
        }]
      }
    },
    
    saveTestResult() {
      const result = {
        date: new Date().toLocaleString(),
        ...this.speedResult
      }
      this.speedHistory.unshift(result)
      localStorage.setItem('speedHistory', JSON.stringify(this.speedHistory))
      this.updateHistoryChart()
    },
    
    updateHistoryChart() {
      if (!this.speedHistory.length) {
        return
      }
      
      const recentHistory = this.speedHistory.slice().reverse()
      const dates = recentHistory.map(item => {
        const [date, time] = item.date.split(' ')
        return { time, fullDate: `${date} ${time}` }
      })
      const downloads = recentHistory.map(item => parseFloat(item.download))
      const uploads = recentHistory.map(item => parseFloat(item.upload))
      
      this.historyChartOption = {
        ...this.historyChartOption,
        xAxis: {
          type: 'category',
          data: dates.map(d => d.time),
          axisLabel: {
            rotate: 45,
            interval: 0
          }
        },
        series: [
          {
            name: '下载速度',
            type: 'line',
            smooth: true,
            data: downloads,
            symbolSize: 8,
            lineStyle: {
              width: 2
            },
            itemStyle: {
              color: '#409EFF'
            },
            areaStyle: {
              opacity: 0.1
            }
          },
          {
            name: '上传速度',
            type: 'line',
            smooth: true,
            data: uploads,
            symbolSize: 8,
            lineStyle: {
              width: 2
            },
            itemStyle: {
              color: '#67C23A'
            },
            areaStyle: {
              opacity: 0.1
            }
          }
        ]
      }
      this.$nextTick(() => {
        if (this.$refs.speedChart) {
          this.$refs.speedChart.setOption(this.historyChartOption, true)
        }
      })
    },
    
    showHistory() {
      this.historyDialogVisible = true
      this.$nextTick(() => {
        setTimeout(() => {
          this.updateHistoryChart()
        }, 100)
      })
    },
    
    clearHistory() {
      this.$confirm('确定要清除所有历史记录吗？', '提示', {
        type: 'warning'
      }).then(() => {
        this.speedHistory = []
        this.currentPage = 1  // 重置页码
        localStorage.removeItem('speedHistory')
        this.$message.success('历史记录已清除')
      })
    },
    
    async fetchNetworkInfo() {
      this.isRefreshingInfo = true
      try {
        // 使用 ipapi.co 的免费 API 获取 IP 信息
        const response = await fetch('https://ipapi.co/json/')
        const data = await response.json()
        
        this.networkInfo = {
          ip: data.ip,
          isp: data.org,
          location: `${data.city}, ${data.region}, ${data.country_name}`,
          connectionType: await this.getConnectionType()
        }
      } catch (error) {
        this.$message.error('获取网络信息失败：' + error.message)
      } finally {
        this.isRefreshingInfo = false
      }
    },
    
    async getConnectionType() {
      if ('connection' in navigator) {
        const connection = navigator.connection
        return connection.effectiveType || connection.type || '未知'
      }
      return '未知'
    },
    
    handleSizeChange(val) {
      this.pageSize = val
      // 当页大小改变时，可能需要调整当前页码
      const maxPage = Math.ceil(this.speedHistory.length / this.pageSize)
      if (this.currentPage > maxPage) {
        this.currentPage = maxPage || 1
      }
    },
    
    handleCurrentChange(val) {
      this.currentPage = val
    }
  },
  mounted() {
    // 页面加载时获取网络信息
    this.fetchNetworkInfo()
    
    // 加载历史记录
    const history = localStorage.getItem('speedHistory')
    if (history) {
      this.speedHistory = JSON.parse(history)
    }
  }
}
</script>

<style scoped>
.network-test {
  padding: 20px;
}

.test-card {
  max-width: 800px;
  margin: 0 auto;
}

.input-with-button {
  margin-bottom: 20px;
}

.result-area {
  margin-top: 20px;
}

.speed-result {
  margin-top: 20px;
}

.speed-value {
  font-size: 24px;
  text-align: center;
  color: #409EFF;
  padding: 20px 0;
}

.test-options {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.test-size-select {
  width: 150px;
}

.speed-progress {
  margin: 20px 0;
}

.real-time-speed {
  text-align: center;
  margin-top: 10px;
  color: #409EFF;
  font-size: 16px;
}

.speed-details {
  text-align: center;
  color: #909399;
  font-size: 14px;
  margin-top: 10px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-size: 18px;
  font-weight: bold;
}

.speed-chart {
  height: 100%;
  width: 100%;
}

.history-charts {
  height: 400px;
  margin: 20px 0;
  background-color: #fff;
  border-radius: 4px;
  padding: 20px;
  position: relative;
}

.result-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: bold;
}

.speed-value {
  font-size: 36px;
  text-align: center;
  color: #409EFF;
  padding: 20px 0;
}

.unit {
  font-size: 16px;
  color: #909399;
}

.speed-details {
  text-align: center;
  margin: 10px 0;
}

.el-card {
  transition: all 0.3s;
  margin-bottom: 5px;
}

.el-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0,0,0,0.1);
}

.speed-content {
  min-height: 400px;
  position: relative;
}

.speed-chart-container {
  height: 300px;
  margin: 20px 0;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  z-index: 1;
}

.speed-result-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  z-index: 2;
}

.speed-chart-container,
.speed-result-container {
  transition: opacity 0.3s ease-in-out;
  opacity: 1;
}

.speed-chart-container:not([style*="display: none"]),
.speed-result-container:not([style*="display: none"]) {
  opacity: 1;
}

.speed-chart-container[style*="display: none"],
.speed-result-container[style*="display: none"] {
  opacity: 0;
}

.network-info-card {
  max-width: 800px;
  margin: 0 auto 20px;
  position: relative;
}

.info-item {
  text-align: center;
  padding: 10px;
}

.info-label {
  color: #909399;
  font-size: 14px;
  margin-bottom: 5px;
}

.info-value {
  color: #303133;
  font-size: 16px;
  font-weight: bold;
}

.refresh-btn {
  position: absolute;
  top: 10px;
  right: 10px;
}

.is-loading {
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.el-icon-loading {
  margin-right: 5px;
  display: inline-block;
  animation: rotating 1s linear infinite;
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.el-button.is-disabled {
  cursor: not-allowed;
  opacity: 0.8;
}

.el-button.is-disabled .el-icon-loading {
  color: inherit;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  padding: 10px 0;
  background-color: #fff;
  border-radius: 4px;
}

.el-pagination {
  padding: 0;
  margin: 0;
}

/* 优化页器在小屏幕上的显示 */
@media screen and (max-width: 768px) {
  .el-pagination {
    .el-pagination__sizes {
      display: none;
    }
  }
}

.chart {
  width: 100%;
  height: 100%;
}

.history-table {
  width: 100%;
  margin-top: 20px;
}

.history-table ::v-deep .el-table__header-wrapper {
  border-radius: 4px 4px 0 0;
  overflow: hidden;
}

.history-table ::v-deep .el-table__body-wrapper {
  border-radius: 0 0 4px 4px;
  overflow: hidden;
}

.history-table ::v-deep .el-table__row {
  transition: background-color 0.3s;
}

.history-table ::v-deep .el-table__row:hover {
  background-color: #f5f7fa !important;
}
</style> 