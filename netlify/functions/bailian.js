// Netlify Function - 百炼 API 代理
// 使用 CommonJS 格式确保兼容性

exports.handler = async function(event, context) {
  console.log('bailian function called, method:', event.httpMethod)
  
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
    const body = JSON.parse(event.body || '{}')
    const { endpoint, payload } = body

    console.log('Request:', { endpoint, hasPayload: !!payload })

    // 百炼 API 配置
    const BAILIAN_API_KEY = process.env.BAILIAN_API_KEY || process.env.VITE_BAILIAN_API_KEY

    if (!BAILIAN_API_KEY) {
      console.error('API Key not configured!')
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'API Key not configured',
          hint: 'Please set BAILIAN_API_KEY in Netlify environment variables'
        })
      }
    }

    // API URLs
    const urls = {
      chat: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
      embedding: 'https://dashscope.aliyuncs.com/api/v1/services/embeddings/text-embedding/text-embedding'
    }

    const apiUrl = urls[endpoint] || urls.chat
    console.log('Calling:', apiUrl)

    // 调用百炼 API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${BAILIAN_API_KEY}`
      },
      body: JSON.stringify(payload)
    })

    console.log('Response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('API error:', errorText)
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ error: 'Bailian API error', details: errorText })
      }
    }

    // 返回响应
    const text = await response.text()
    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': payload?.parameters?.incremental_output ? 'text/event-stream' : 'application/json'
      },
      body: text
    }
  } catch (error) {
    console.error('Error:', error.message)
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