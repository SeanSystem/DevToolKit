<template>
  <div class="json-format">
    <el-card class="format-card">
      <div slot="header" class="card-header">
        <span class="title">JSON 格式化工具</span>
        <el-button-group>
          <el-button type="primary" size="small" @click="formatJson">
            <i class="el-icon-magic-stick"></i> 格式化
          </el-button>
          <el-button type="success" size="small" @click="compressJson">
            <i class="el-icon-compress"></i> 压缩
          </el-button>
          <el-button type="primary" size="small" @click="unescapeJson">
            <i class="el-icon-refresh-right"></i> 去除转义
          </el-button>
          <el-button type="warning" size="small" @click="clearContent">
            <i class="el-icon-delete"></i> 清空
          </el-button>
          <el-button type="info" size="small" @click="copyContent">
            <i class="el-icon-document-copy"></i> 复制
          </el-button>
        </el-button-group>
      </div>
      
      <div class="editor-container">
        <div class="input-panel">
          <div class="panel-header">
            <span>输入 JSON</span>
            <el-button type="text" @click="loadSample">加载示例</el-button>
          </div>
          <el-input
            type="textarea"
            v-model="inputJson"
            :rows="20"
            resize="none"
            placeholder="请输入要格式化的 JSON 字符串"
            @input="handleInput"
          ></el-input>
        </div>
        
        <div class="output-panel">
          <div class="panel-header">
            <span>格式化结果</span>
            <div class="format-options">
              <el-button 
                type="text" 
                size="small"
                @click="toggleEdit"
              >
                <i :class="isEditing ? 'el-icon-check' : 'el-icon-edit'"></i>
                {{ isEditing ? '保存' : '编辑' }}
              </el-button>
              <el-button
                v-if="isEditing"
                type="text"
                size="small"
                @click="cancelEdit"
              >
                <i class="el-icon-close"></i>
                取消
              </el-button>
              <el-switch
                v-model="expandAll"
                active-text="展开全部"
                inactive-text="收起全部"
                @change="handleExpandChange"
              ></el-switch>
            </div>
          </div>
          <div v-if="!hasError && parsedJson" class="output-content">
            <template v-if="isEditing">
              <el-input
                type="textarea"
                v-model="editingContent"
                :rows="20"
                resize="none"
                @input="handleEditInput"
              ></el-input>
            </template>
            <template v-else>
              <json-viewer
                :value="parsedJson"
                ref="jsonViewer"
                :show-length="true"
                :show-double-quotes="true"
                :indent="indentSize"
                :expand-depth="expandDepth"
                copyable
                sort
                :class="{ 'has-error': hasError }"
              ></json-viewer>
            </template>
          </div>
          <div v-else-if="hasError" class="output-content has-error">
            <pre class="error-message">{{ outputJson }}</pre>
          </div>
          <div v-else class="output-content">
            <pre>{{ outputJson }}</pre>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import JsonViewer from 'vue-json-viewer'
import 'vue-json-viewer/style.css'

export default {
  name: 'JsonFormat',
  components: {
    JsonViewer
  },
  data() {
    return {
      inputJson: '',
      outputJson: '',
      indentSize: 2,
      hasError: false,
      expandAll: true,
      parsedJson: null,
      expandDepth: 5,
      sampleJson: {
        name: "JSON格式化工具",
        version: "1.0.0",
        features: ["格式化", "压缩", "语法检查"],
        settings: {
          indent: 2,
          theme: "light",
          autoFormat: true
        },
        author: {
          name: "开发者",
          email: "developer@example.com"
        }
      },
      isEditing: false,
      editingContent: ''
    }
  },
  methods: {
    formatJson() {
      try {
        const obj = JSON.parse(this.inputJson.trim() || '{}')
        this.outputJson = JSON.stringify(obj, null, this.indentSize)
        this.parsedJson = obj
        this.hasError = false
        this.expandDepth = this.expandAll ? 5 : 1
      } catch (error) {
        this.outputJson = `错误: ${error.message}`
        this.parsedJson = null
        this.hasError = true
      }
    },
    
    compressJson() {
      try {
        const obj = JSON.parse(this.inputJson.trim() || '{}')
        this.outputJson = JSON.stringify(obj)
        this.parsedJson = obj
        this.hasError = false
      } catch (error) {
        this.outputJson = `错误: ${error.message}`
        this.parsedJson = null
        this.hasError = true
      }
    },
    
    clearContent() {
      this.$confirm('确定要清空内容吗', '提示', {
        type: 'warning'
      }).then(() => {
        this.inputJson = ''
        this.outputJson = ''
        this.parsedJson = null
        this.hasError = false
      })
    },
    
    handleExpandChange(val) {
      this.expandAll = val
      this.expandDepth = val ? 5 : 1
      if (this.parsedJson) {
        const temp = this.parsedJson
        this.parsedJson = null
        this.$nextTick(() => {
          this.parsedJson = temp
        })
      }
    },
    
    copyContent() {
      if (!this.outputJson) {
        this.$message.warning('没有可复制的内容')
        return
      }
      
      const textContent = this.outputJson
      navigator.clipboard.writeText(textContent)
        .then(() => {
          this.$message.success('复制成功')
        }).catch(() => {
          this.$message.error('复制失败，请手动复制')
        })
    },
    
    loadSample() {
      this.inputJson = JSON.stringify(this.sampleJson)
      this.formatJson()
    },
    
    handleInput() {
      if (!this.inputJson.trim()) {
        this.outputJson = ''
        this.parsedJson = null
        this.hasError = false
      }
    },
    
    unescapeJson() {
      if (!this.inputJson.trim()) {
        this.$message.warning('请输入要处理的 JSON 字符串')
        return
      }
      
      try {
        // 处理特殊情况：如果内容被引号包裹，先去掉引号
        let content = this.inputJson.trim()
        
        /* eslint-disable no-useless-escape */
        if (content.startsWith('{\\\"') || content.startsWith('{\\"')) {
          // 将所有 \\\" 或 \\" 替换为 "
          content = content
            .replace(/\\\\"/g, '"')  // 理 \\\"
            .replace(/\\"/g, '"')    // 处理 \"
            .replace(/\\\\/g, '\\')  // 处理 \\
            .replace(/\\n/g, '\n')   // 理 \n
            .replace(/\\r/g, '\r')   // 处理 \r
            .replace(/\\t/g, '\t')   // 处理 \t
            .replace(/\\b/g, '\b')   // 处理 \b
            .replace(/\\f/g, '\f')   // 处理 \f
        } else {
          // 普通转义处理
          content = content
            .replace(/\\"/g, '"')
            .replace(/\\\\/g, '\\')
            .replace(/\\n/g, '\n')
            .replace(/\\r/g, '\r')
            .replace(/\\t/g, '\t')
            .replace(/\\b/g, '\b')
            .replace(/\\f/g, '\f')
        }
        /* eslint-enable no-useless-escape */
        
        // 尝试格式化结果
        const obj = JSON.parse(content)
        this.inputJson = JSON.stringify(obj, null, this.indentSize)
        this.outputJson = JSON.stringify(obj, null, this.indentSize)
        this.parsedJson = obj
        this.hasError = false
        this.expandDepth = this.expandAll ? 5 : 1
        
        this.$message.success('转义符已去除')
      } catch (error) {
        // 如果解析失败，尝试另一种方式
        try {
          // 尝试先解析为字符串，解析为JSON
          const jsonStr = JSON.parse(`"${this.inputJson.trim()}"`)
          const obj = JSON.parse(jsonStr)
          this.inputJson = JSON.stringify(obj, null, this.indentSize)
          this.outputJson = JSON.stringify(obj, null, this.indentSize)
          this.parsedJson = obj
          this.hasError = false
          this.expandDepth = this.expandAll ? 5 : 1
          this.$message.success('转义符已去除')
        } catch (e) {
          this.$message.error('处理失败：' + error.message)
          this.outputJson = `错误: ${error.message}`
          this.parsedJson = null
          this.hasError = true
        }
      }
    },
    
    toggleEdit() {
      if (this.isEditing) {
        // 保存编辑
        try {
          const obj = JSON.parse(this.editingContent)
          this.parsedJson = obj
          this.inputJson = JSON.stringify(obj, null, this.indentSize)
          this.outputJson = JSON.stringify(obj, null, this.indentSize)
          this.hasError = false
          this.isEditing = false
          this.$message.success('保存成功')
        } catch (error) {
          this.$message.error('JSON 格式错误：' + error.message)
        }
      } else {
        // 进入编辑模式
        this.editingContent = JSON.stringify(this.parsedJson, null, this.indentSize)
        this.isEditing = true
      }
    },
    
    cancelEdit() {
      this.$confirm('确定要取消编辑吗？未保存的修改将会丢失', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.isEditing = false
        this.editingContent = ''
        this.hasError = false
        this.$message({
          type: 'info',
          message: '已取消编辑'
        })
      }).catch(() => {
        // 用户点击取消，继续编辑
      })
    },
    
    handleEditInput(value) {
      try {
        JSON.parse(value)
        this.hasError = false
      } catch (error) {
        this.hasError = true
      }
    }
  }
}
</script>

<style scoped>
.json-format {
  padding: 15px 20px;
  min-height: calc(100vh - 120px);
}

.format-card {
  max-width: 1200px;
  margin: 0 auto;
  height: 100%;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.format-card:hover {
  box-shadow: 0 4px 20px 0 rgba(0,0,0,0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  border-bottom: 1px solid #ebeef5;
}

.title {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 8px;
}

.title i {
  font-size: 20px;
  color: #409EFF;
}

.editor-container {
  display: flex;
  gap: 20px;
  padding: 15px;
  min-height: calc(100vh - 190px);
  height: calc(100vh - 190px);
}

.input-panel,
.output-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 4px;
  padding: 12px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
  height: 100%;
  min-width: 0;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  padding: 0 8px 8px;
  border-bottom: 1px solid #ebeef5;
  flex-shrink: 0;
}

.panel-header span {
  font-size: 15px;
  font-weight: 500;
  color: #606266;
}

.format-options {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: nowrap;
  white-space: nowrap;
}

.el-button-group {
  margin-left: 0;
  display: flex;
  flex-wrap: nowrap;
}

.el-button-group .el-button {
  margin-left: 0;
  white-space: nowrap;
  padding: 7px 12px;
}

.el-button [class*="el-icon-"] + span {
  margin-left: 4px;
}

.output-content {
  flex: 1;
  min-height: 450px;
  overflow: auto;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 8px;
  background-color: #fff;
  font-family: Consolas, Monaco, monospace;
  transition: all 0.3s ease;
}

.output-content:hover {
  border-color: #409EFF;
}

.output-content pre {
  margin: 0;
  font-family: Consolas, Monaco, monospace;
  font-size: 14px;
  line-height: 1.5;
  color: #444;
}

.output-content.has-error {
  color: #f56c6c;
  background-color: #fef0f0;
  border-color: #f56c6c;
}

.error-message {
  color: #f56c6c;
  white-space: pre-wrap;
  font-size: 14px;
  line-height: 1.6;
}

/* 自定义滚动条样式 */
.output-content::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.output-content::-webkit-scrollbar-track {
  background: #f5f5f5;
  border-radius: 4px;
}

.output-content::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.output-content::-webkit-scrollbar-thumb:hover {
  background: #909399;
}

/* 自定义 JSON Viewer 样式 */
:deep(.jv-container) {
  background: none !important;
  border: none !important;
  font-size: 14px !important;
}

:deep(.jv-container.jv-light) {
  color: #444;
  line-height: 1.6;
}

:deep(.jv-key) {
  color: #881391 !important;
  font-weight: 500 !important;
}

:deep(.jv-item.jv-string) {
  color: #c41a16 !important;
}

:deep(.jv-item.jv-number) {
  color: #1c00cf !important;
}

:deep(.jv-item.jv-boolean) {
  color: #0000ff !important;
}

:deep(.jv-item.jv-null) {
  color: #808080 !important;
}

@media screen and (max-width: 768px) {
  .editor-container {
    flex-direction: column;
    gap: 30px;
    padding: 15px;
    height: auto;
  }
  
  .input-panel,
  .output-panel {
    width: 100%;
    height: auto;
  }
  
  .format-options {
    flex-wrap: wrap;
    gap: 8px;
    justify-content: flex-end;
  }
  
  .el-button-group {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .output-content,
  .input-panel .el-textarea >>> .el-textarea__inner,
  .el-textarea >>> .el-textarea__inner {
    min-height: 300px;
    height: 300px !important;
  }
}

/* 编辑模式样式 */
:deep(.jv-container.jv-light .jv-node.jv-object.active,
      .jv-container.jv-light .jv-node.jv-array.active) {
  background-color: #e6f7ff;
  border-radius: 3px;
}

:deep(.jv-container.jv-light .jv-node .jv-edit-button) {
  opacity: 0;
  transition: opacity 0.2s;
}

:deep(.jv-container.jv-light .jv-node:hover .jv-edit-button) {
  opacity: 1;
}

:deep(.jv-container.jv-light .jv-edit-popup) {
  background-color: #fff;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
  border-radius: 4px;
  padding: 12px;
}

:deep(.jv-container.jv-light .jv-edit-popup .jv-edit-textarea) {
  min-width: 200px;
  min-height: 80px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 8px;
  font-family: Consolas, Monaco, monospace;
  margin-bottom: 8px;
}

.output-content .el-textarea {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.output-content .el-textarea >>> .el-textarea__inner {
  flex: 1;
  min-height: 450px;
  height: 100% !important;
  resize: none;
  font-family: Consolas, Monaco, monospace;
  font-size: 14px;
  line-height: 1.5;
}

.output-content .el-textarea.is-error >>> .el-textarea__inner {
  border-color: #f56c6c;
  background-color: #fef0f0;
}

/* 输入框样式 */
.input-panel .el-textarea {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.input-panel .el-textarea >>> .el-textarea__inner {
  flex: 1;
  min-height: 450px;
  height: 100% !important;
  resize: none;
  font-family: Consolas, Monaco, monospace;
  font-size: 14px;
  line-height: 1.5;
  color: #444;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.input-panel .el-textarea >>> .el-textarea__inner:hover,
.input-panel .el-textarea >>> .el-textarea__inner:focus {
  border-color: #409EFF;
}
</style> 