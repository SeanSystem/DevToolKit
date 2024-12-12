<!-- eslint-disable -->
<template>
  <div id="app">
    <el-container>
      <!-- 顶部导航 -->
      <el-header height="60px" class="header">
        <div class="header-left">
          <i class="el-icon-s-tools logo-icon"></i>
          <span class="logo-text">DevToolKit</span>
        </div>
        <div class="header-center">
          <el-menu mode="horizontal" :router="true" :default-active="$route.path">
            <el-menu-item index="/cron">
              <i class="el-icon-time"></i>
              <span>Cron表达式生成器</span>
            </el-menu-item>
            <el-menu-item index="/timestamp">
              <i class="el-icon-date"></i>
              <span>时间戳转换</span>
            </el-menu-item>
            <el-menu-item index="/json">
              <i class="el-icon-document"></i>
              <span>JSON格式化</span>
            </el-menu-item>
            <!-- 暂时隐藏网络测试工具 -->
            <!-- <el-menu-item index="/network">
              <i class="el-icon-connection"></i>
              <span>网络测试</span>
            </el-menu-item> -->
          </el-menu>
        </div>
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
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  background-color: #f5f7fa;
}

#app {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.el-container {
  height: 100%;
}

/* 顶部导航样式 */
.header {
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  padding: 0 20px;
  position: fixed;
  width: 100%;
  top: 0;
  z-index: 1000;
}

.header-left {
  display: flex;
  align-items: center;
  min-width: 200px;
}

.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.logo-icon {
  font-size: 24px;
  color: #409EFF;
  margin-right: 10px;
}

.logo-text {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  letter-spacing: 0.5px;
}

/* 导航菜单样式 */
.el-menu.el-menu--horizontal {
  border-bottom: none;
  display: flex;
  justify-content: center;
  
  .el-menu-item {
    height: 60px;
    line-height: 60px;
    font-size: 14px;
    padding: 0 25px;
    
    &:hover, &:focus {
      background-color: #f5f7fa;
    }
    
    &.is-active {
      color: #409EFF;
      border-bottom: 2px solid #409EFF;
      font-weight: 500;
    }
    
    i {
      margin-right: 5px;
      font-size: 16px;
    }
  }
}

/* 主要内容区样式 */
.el-main {
  margin-top: 60px;
  padding: 0;
  min-height: calc(100vh - 100px);
  background-color: #f5f7fa;
}

/* 页脚样式 */
.el-footer {
  background-color: #fff;
  border-top: 1px solid #e8e8e8;
  padding: 15px 0;
  text-align: center;
  color: #909399;
  font-size: 14px;
}

/* 响应式布局优化 */
@media screen and (max-width: 768px) {
  .header {
    padding: 0 10px;
  }
  
  .header-left {
    min-width: auto;
  }
  
  .logo-text {
    display: none;
  }
  
  .el-menu-item {
    padding: 0 15px !important;
    
    span {
      display: none;
    }
    
    i {
      margin-right: 0;
      font-size: 20px;
    }
  }
}

/* 添加过渡动画 */
.el-menu-item {
  transition: all 0.3s ease;
}

.el-menu-item:hover {
  transform: translateY(-2px);
}

/* 全局样式优化 */
.el-card {
  border-radius: 8px;
  border: none;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  
  .el-card__header {
    padding: 15px 20px;
    border-bottom: 1px solid #f0f0f0;
    font-weight: 500;
  }
}

.el-form-item__label {
  font-weight: 500;
}

.el-button {
  border-radius: 4px;
  padding: 10px 20px;
  
  &--primary {
    background-color: #409EFF;
    border-color: #409EFF;
    
    &:hover, &:focus {
      background-color: #66b1ff;
      border-color: #66b1ff;
    }
  }
}

.el-input {
  .el-input__inner {
    border-radius: 4px;
  }
}
</style> 