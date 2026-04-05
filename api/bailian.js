// Vercel Serverless Function - 百炼 API 代理
// 硬编码 API Key 作为备用
const FALLBACK_API_KEY = 'sk-75e7457a58b24fae8dbab4971a5d98cc'

export default async function handler(req, res) {
  // 允许 CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // 只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // 获取 API Key
    const BAILIAN_API_KEY = process.env.VITE_BAILIAN_API_KEY || 
                             process.env.BAILIAN_API_KEY || 
                             FALLBACK_API_KEY

    const { endpoint, payload } = req.body

    console.log('Request:', { endpoint, hasPayload: !!payload })

    // API URLs
    const urls = {
      chat: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
      embedding: 'https://dashscope.aliyuncs.com/api/v1/services/embeddings/text-embedding/text-embedding'
    }

    const apiUrl = urls[endpoint] || urls.chat

    // 调用百炼 API
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
      return res.status(response.status).json({ 
        error: 'Bailian API error', 
        details: errorText 
      })
    }

    // 返回响应
    const responseText = await response.text()
    res.setHeader('Content-Type', payload?.parameters?.incremental_output 
      ? 'text/event-stream' 
      : 'application/json')
    return res.status(200).send(responseText)

  } catch (error) {
    console.error('Error:', error.message)
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    })
  }
}