<!-- eslint-disable -->
<template>
  <div id="app">
    <el-container>
      <el-header>
        <div class="logo">DevToolKit</div>
        <el-menu 
          :router="true"
          mode="horizontal"
          :default-active="$route.path">
          <el-menu-item index="/json-format">
            <i class="el-icon-document"></i>
            JSON格式化
          </el-menu-item>
          <el-menu-item index="/timestamp">
            <i class="el-icon-time"></i>
            时间戳转换
          </el-menu-item>
          <el-menu-item index="/network-test">
            <i class="el-icon-connection"></i>
            网络测试工具
          </el-menu-item>
        </el-menu>
      </el-header>
      
      <el-main>
        <router-view></router-view>
      </el-main>
      
      <el-footer>
        <p>© 2024 DevToolKit - 开发者工具箱</p>
      </el-footer>
    </el-container>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
#app {
  font-family: Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

.el-header {
  padding: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
}

.el-main {
  min-height: calc(100vh - 120px);
  background-color: #f5f7fa;
}

.el-footer {
  text-align: center;
  color: #909399;
  height: 60px !important;
  line-height: 60px;
  border-top: 1px solid #e6e6e6;
}

.logo {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
  margin-right: 20px;
}
</style> 