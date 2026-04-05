// Netlify Function - 百炼 API 代理
// 解决浏览器直接调用百炼 API 的 CORS 问题

export async function handler(event, context) {
  // 允许 CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  }

  // 处理预检请求
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  // 只允许 POST 请求
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  try {
    const body = JSON.parse(event.body)
    const { endpoint, payload } = body

    // 百炼 API 配置 - 使用 BAILIAN_ 前缀（不带 VITE_）
    const BAILIAN_API_KEY = process.env.BAILIAN_API_KEY || process.env.VITE_BAILIAN_API_KEY
    const BAILIAN_APP_ID = process.env.BAILIAN_APP_ID || process.env.VITE_BAILIAN_APP_ID

    console.log('Function called with:', { endpoint, hasApiKey: !!BAILIAN_API_KEY, hasAppId: !!BAILIAN_APP_ID })

    if (!BAILIAN_API_KEY) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'API Key not configured' })
      }
    }

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

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Bailian API error:', response.status, errorText)
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ error: 'Bailian API error', details: errorText })
      }
    }

    // 流式响应处理
    if (payload.parameters?.incremental_output) {
      // 流式输出 - 直接透传
      const text = await response.text()
      return {
        statusCode: 200,
        headers: {
          ...headers,
          'Content-Type': 'text/event-stream'
        },
        body: text
      }
    } else {
      // 非流式响应
      const data = await response.json()
      return {
        statusCode: 200,
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      }
    }
  } catch (error) {
    console.error('Proxy error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      })
    }
  }
}