// 阿里云百炼 API 配置

// 检测是否在生产环境（Netlify）
const isProduction = import.meta.env.PROD

export const BAILIAN_CONFIG = {
  // API 地址 - 生产环境使用代理，开发环境直连
  baseUrl: isProduction 
    ? '/.netlify/functions/bailian'  // Netlify Function 代理
    : 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
  
  embeddingUrl: isProduction
    ? '/.netlify/functions/bailian'
    : 'https://dashscope.aliyuncs.com/api/v1/services/embeddings/text-embedding/text-embedding',
  
  // 模型配置
  models: {
    chat: 'qwen-plus',           // 对话模型
    chatTurbo: 'qwen-turbo',     // 快速对话
    embedding: 'text-embedding-v2', // 向量嵌入
  },
  
  // App ID（从环境变量或配置获取）
  appId: import.meta.env.VITE_BAILIAN_APP_ID || '',
  apiKey: import.meta.env.VITE_BAILIAN_API_KEY || '',
  
  // 是否使用代理
  useProxy: isProduction
}

// 系统提示词
export const SYSTEM_PROMPTS = {
  socratic: `你是一位苏格拉底式的导师。你的任务是通过提问引导学生自己发现答案。
规则：
1. 不要直接给出答案
2. 通过问题引导学生思考
3. 每次只问一个问题
4. 鼓励学生用自己的话解释概念
5. 如果学生理解有误，用反问引导他们发现问题`,

  collision: `你是一位思维碰撞式的导师。你的任务是通过挑战和辩论帮助学生深入理解。
规则：
1. 主动提出不同观点
2. 挑战学生的假设
3. 用反例测试学生的理解
4. 鼓励学生反驳你的观点
5. 在辩论中共同探索真理`,

  verification: {
    example: `判断用户回答是否包含生活场景举例。
如果包含具体的生活例子、日常场景、实际应用，返回高分。
只返回JSON: {"score": 0-1, "reason": "判断理由"}`,
    
    transfer: `判断用户回答是否展示了知识迁移能力。
如果用户能将概念应用到其他领域、场景或问题，返回高分。
只返回JSON: {"score": 0-1, "reason": "判断理由"}`,
  }
}