// Netlify Function - 百炼 API 代理
console.log('bailian.js function loaded')

export async function handler(event, context) {
  console.log('handler called, method:', event.httpMethod)
  console.log('body preview:', event.body?.substring(0, 200))

  // 允许 CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  }

  // 处理预检请求
  if (event.httpMethod === 'OPTIONS') {
    console.log('OPTIONS request, returning 200')
    return { statusCode: 200, headers, body: '' }
  }

  // 只允许 POST 请求
  if (event.httpMethod !== 'POST') {
    console.log('Method not allowed:', event.httpMethod)
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  try {
    const body = JSON.parse(event.body || '{}')
    const { endpoint, payload } = body

    console.log('Parsed body:', { endpoint, payloadKeys: payload ? Object.keys(payload) : [] })

    // 百炼 API 配置
    const BAILIAN_API_KEY = process.env.BAILIAN_API_KEY || process.env.VITE_BAILIAN_API_KEY
    const BAILIAN_APP_ID = process.env.BAILIAN_APP_ID || process.env.VITE_BAILIAN_APP_ID

    console.log('Env vars check:', { 
      hasApiKey: !!BAILIAN_API_KEY, 
      apiKeyLength: BAILIAN_API_KEY?.length,
      hasAppId: !!BAILIAN_APP_ID 
    })

    if (!BAILIAN_API_KEY) {
      console.error('API Key not configured!')
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'API Key not configured. Please set BAILIAN_API_KEY in environment variables.' })
      }
    }

    // 根据endpoint选择URL
    const urls = {
      chat: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
      embedding: 'https://dashscope.aliyuncs.com/api/v1/services/embeddings/text-embedding/text-embedding'
    }

    const apiUrl = urls[endpoint] || urls.chat
    console.log('Calling Bailian API:', apiUrl)

    // 转发请求到百炼 API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${BAILIAN_API_KEY}`
      },
      body: JSON.stringify(payload)
    })

    console.log('Bailian response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Bailian API error:', response.status, errorText)
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ error: 'Bailian API error', status: response.status, details: errorText })
      }
    }

    // 流式响应处理
    if (payload?.parameters?.incremental_output) {
      console.log('Handling streaming response')
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
      console.log('Handling JSON response')
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
    console.error('Handler error:', error.message, error.stack)
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