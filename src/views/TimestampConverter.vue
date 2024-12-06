<template>
  <div class="timestamp-converter">
    <el-card class="converter-card">
      <div slot="header" class="card-header">
        <span class="title">时间戳转换工具</span>
        <el-button-group>
          <el-button type="primary" size="small" @click="getCurrentTimestamp">
            <i class="el-icon-time"></i> 当前时间
          </el-button>
          <el-button type="warning" size="small" @click="clearContent">
            <i class="el-icon-delete"></i> 清空
          </el-button>
        </el-button-group>
      </div>
      
      <div class="converter-container">
        <div class="timestamp-section">
          <div class="section-header">
            <span>Unix 时间戳</span>
            <el-radio-group v-model="timestampUnit" size="small">
              <el-radio-button label="seconds">秒</el-radio-button>
              <el-radio-button label="milliseconds">毫秒</el-radio-button>
            </el-radio-group>
          </div>
          <el-input
            v-model="timestamp"
            placeholder="请输入时间戳"
            @input="handleTimestampInput"
          >
            <el-button slot="append" @click="copyTimestamp">
              <i class="el-icon-document-copy"></i> 复制
            </el-button>
          </el-input>
        </div>
        
        <div class="datetime-section">
          <div class="section-header">
            <span>日期时间</span>
            <el-select v-model="timezone" size="small" placeholder="选择时区">
              <el-option label="UTC" value="UTC"></el-option>
              <el-option label="本地时间" value="local"></el-option>
            </el-select>
          </div>
          <el-date-picker
            v-model="datetime"
            type="datetime"
            placeholder="选择日期时间"
            @change="handleDatetimeChange"
            value-format="timestamp"
            :clearable="false"
            style="width: 100%"
          ></el-date-picker>
        </div>
        
        <div class="format-section">
          <div class="section-header">
            <span>格式化结果</span>
            <el-select v-model="selectedFormat" size="small" placeholder="选择格式">
              <el-option
                v-for="format in formats"
                :key="format.value"
                :label="format.label"
                :value="format.value"
              ></el-option>
            </el-select>
          </div>
          <el-input
            :value="formattedDatetime"
            readonly
          >
            <el-button slot="append" @click="copyFormatted">
              <i class="el-icon-document-copy"></i> 复制
            </el-button>
          </el-input>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import customParseFormat from 'dayjs/plugin/customParseFormat'

dayjs.extend(utc)
dayjs.extend(customParseFormat)

export default {
  name: 'TimestampConverter',
  data() {
    return {
      timestamp: '',
      datetime: '',
      timestampUnit: 'seconds',
      timezone: 'local',
      selectedFormat: 'YYYY-MM-DD HH:mm:ss',
      formats: [
        { label: 'YYYY-MM-DD HH:mm:ss', value: 'YYYY-MM-DD HH:mm:ss' },
        { label: 'YYYY/MM/DD HH:mm:ss', value: 'YYYY/MM/DD HH:mm:ss' },
        { label: 'YYYY年MM月DD日 HH:mm:ss', value: 'YYYY年MM月DD日 HH:mm:ss' },
        { label: 'MM/DD/YYYY HH:mm:ss', value: 'MM/DD/YYYY HH:mm:ss' },
        { label: 'DD/MM/YYYY HH:mm:ss', value: 'DD/MM/YYYY HH:mm:ss' },
        { label: 'ISO 8601', value: 'ISO' }
      ]
    }
  },
  computed: {
    formattedDatetime() {
      if (!this.datetime) return ''
      
      const date = dayjs(parseInt(this.datetime))
      if (this.selectedFormat === 'ISO') {
        return this.timezone === 'UTC' ? date.utc().toISOString() : date.toISOString()
      }
      
      return this.timezone === 'UTC' 
        ? date.utc().format(this.selectedFormat)
        : date.format(this.selectedFormat)
    }
  },
  methods: {
    handleTimestampInput(value) {
      if (!value) {
        this.datetime = ''
        return
      }
      
      try {
        const timestamp = parseInt(value)
        if (isNaN(timestamp)) return
        
        this.datetime = this.timestampUnit === 'seconds' 
          ? timestamp * 1000 
          : timestamp
      } catch (error) {
        this.$message.error('无效的时间戳')
      }
    },
    
    handleDatetimeChange(value) {
      if (!value) return
      
      const timestamp = parseInt(value)
      this.timestamp = this.timestampUnit === 'seconds' 
        ? Math.floor(timestamp / 1000)
        : timestamp
    },
    
    getCurrentTimestamp() {
      const now = Date.now()
      this.timestamp = this.timestampUnit === 'seconds' 
        ? Math.floor(now / 1000)
        : now
      this.datetime = now
    },
    
    clearContent() {
      this.$confirm('确定要清空内容吗？', '提示', {
        type: 'warning'
      }).then(() => {
        this.timestamp = ''
        this.datetime = ''
      })
    },
    
    copyTimestamp() {
      if (!this.timestamp) {
        this.$message.warning('没有可复制的内容')
        return
      }
      
      navigator.clipboard.writeText(this.timestamp)
        .then(() => {
          this.$message.success('复制成功')
        })
        .catch(() => {
          this.$message.error('复制失败，请手动复制')
        })
    },
    
    copyFormatted() {
      if (!this.formattedDatetime) {
        this.$message.warning('没有可复制的内容')
        return
      }
      
      navigator.clipboard.writeText(this.formattedDatetime)
        .then(() => {
          this.$message.success('复制成功')
        })
        .catch(() => {
          this.$message.error('复制失败，请手动复制')
        })
    }
  },
  mounted() {
    this.getCurrentTimestamp()
  }
}
</script>

<style scoped>
.timestamp-converter {
  padding: 20px;
}

.converter-card {
  max-width: 800px;
  margin: 0 auto;
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

.converter-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.timestamp-section,
.datetime-section,
.format-section {
  width: 100%;
}

@media screen and (max-width: 768px) {
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .el-select {
    width: 100%;
  }
}
</style> 