// Netlify Function - 百炼 API 代理
// 使用 CommonJS 格式

// 硬编码 API Key 作为备用（仅用于调试）
const FALLBACK_API_KEY = 'sk-75e7457a58b24fae8dbab4971a5d98cc'

exports.handler = async function(event, context) {
  console.log('=== Bailian Function Started ===')
  console.log('Method:', event.httpMethod)
  console.log('Headers:', JSON.stringify(event.headers))
  
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
    // 检查环境变量
    const envApiKey = process.env.VITE_BAILIAN_API_KEY || process.env.BAILIAN_API_KEY
    const BAILIAN_API_KEY = envApiKey || FALLBACK_API_KEY
    
    console.log('Environment check:')
    console.log('- VITE_BAILIAN_API_KEY:', process.env.VITE_BAILIAN_API_KEY ? 'SET' : 'NOT SET')
    console.log('- BAILIAN_API_KEY:', process.env.BAILIAN_API_KEY ? 'SET' : 'NOT SET')
    console.log('- Using fallback:', !envApiKey ? 'YES' : 'NO')

    if (!BAILIAN_API_KEY) {
      console.error('No API Key available!')
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'API Key not configured',
          hint: 'Set VITE_BAILIAN_API_KEY in Netlify environment variables'
        })
      }
    }

    const body = JSON.parse(event.body || '{}')
    const { endpoint, payload } = body

    console.log('Request:', { 
      endpoint, 
      hasPayload: !!payload,
      payloadPreview: JSON.stringify(payload).substring(0, 200)
    })

    // API URLs
    const urls = {
      chat: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
      embedding: 'https://dashscope.aliyuncs.com/api/v1/services/embeddings/text-embedding/text-embedding'
    }

    const apiUrl = urls[endpoint] || urls.chat
    console.log('Calling Bailian API:', apiUrl)

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
    console.log('Response headers:', JSON.stringify([...response.headers.entries()]))

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Bailian API error:', response.status, errorText)
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ 
          error: 'Bailian API error', 
          status: response.status,
          details: errorText.substring(0, 500)
        })
      }
    }

    // 返回响应
    const responseText = await response.text()
    console.log('Response length:', responseText.length)
    
    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': payload?.parameters?.incremental_output 
          ? 'text/event-stream' 
          : 'application/json'
      },
      body: responseText
    }
  } catch (error) {
    console.error('=== Function Error ===')
    console.error('Message:', error.message)
    console.error('Stack:', error.stack)
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message,
        type: error.constructor.name
      })
    }
  }
}