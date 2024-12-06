const express = require('express')
const app = express()

// Ping测试接口
app.head('/ping', (req, res) => {
  res.sendStatus(200)
})

// 下载测试接口
app.get('/speedtest/download', (req, res) => {
  const size = parseInt(req.query.size) * 1024 * 1024 // 转换为字节
  const buffer = Buffer.alloc(size)
  res.send(buffer)
})

// 上传测试接口
app.post('/speedtest/upload', express.raw({limit: '200mb'}), (req, res) => {
  res.sendStatus(200)
}) 