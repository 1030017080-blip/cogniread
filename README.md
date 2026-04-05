# CogniRead - 认知阅读助手

让AI记住你的认知边界，让阅读真正被读懂。

## 核心创新

**三重验证机制** - 判断用户是否真正理解：

- 通俗举例验证（30%）：你能举例吗？
- 知识迁移验证（30%）：你能迁移吗？
- 向量相似度验证（40%）：你说对了吗？

## 技术栈

- Vue 3 + TypeScript + Vite
- Pinia 状态管理
- Tailwind CSS
- ECharts 图谱可视化
- 阿里云百炼 API

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建
npm run build
```

## 配置

创建 `.env` 文件：

```
VITE_BAILIAN_APP_ID=你的App_ID
VITE_BAILIAN_API_KEY=你的API_Key
```

## 功能模块

| 模块 | 状态 | 说明 |
|------|------|------|
| AI对话 | ✅ | 苏格拉底式/思维碰撞式 |
| 三重验证 | ✅ | 核心创新功能 |
| 知识图谱 | ✅ | 学习进度可视化 |
| 书籍管理 | ✅ | 多书籍支持 |
| RAG检索 | ✅ | 基于书籍内容问答 |

## 项目结构

```
src/
├── api/          # API封装
├── components/   # Vue组件
├── stores/       # Pinia状态管理
├── types/        # TypeScript类型
├── views/        # 页面视图
└── data/         # 静态数据
```

## License

MIT