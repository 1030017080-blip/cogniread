// Netlify Function - 百炼 API 代理
// 解决浏览器直接调用百炼 API 的 CORS 问题

export async function handler(event, context) {
  // 只允许 POST 请求
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  try {
    const body = JSON.parse(event.body)
    const { endpoint, payload } = body

    // 百炼 API 配置
    const BAILIAN_API_KEY = process.env.VITE_BAILIAN_API_KEY
    const BAILIAN_APP_ID = process.env.VITE_BAILIAN_APP_ID

    // 根据endpoint选择URL
    const urls = {
      chat: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
      embedding: 'https://dashscope.aliyuncs.com/api/v1/services/embeddings/text-embedding/text-embedding'
    }

    const apiUrl = urls[endpoint] || urls.chat

    // 转发请求到百炼 API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${BAILIAN_API_KEY}`
      },
      body: JSON.stringify(payload)
    })

    // 流式响应处理
    if (payload.parameters?.incremental_output) {
      // 流式输出
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      
      let result = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        result += decoder.decode(value, { stream: true })
      }

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'text/event-stream'
        },
        body: result
      }
    } else {
      // 非流式响应
      const data = await response.json()
      
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      }
    }
  } catch (error) {
    console.error('Proxy error:', error)
    
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      })
    }
  }
}