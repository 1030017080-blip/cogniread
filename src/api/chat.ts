// 阿里云百炼对话 API

import { BAILIAN_CONFIG, SYSTEM_PROMPTS } from './config'

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ChatChunk {
  content: string
  done: boolean
  sessionId?: string
}

export interface ChatOptions {
  mode: 'socratic' | 'collision'
  history?: ChatMessage[]
  onChunk?: (chunk: ChatChunk) => void
}

/**
 * 百炼对话 API - 流式输出
 */
export async function* chatWithBailian(
  message: string,
  options: ChatOptions
): AsyncGenerator<ChatChunk> {
  const systemPrompt = options.mode === 'socratic' 
    ? SYSTEM_PROMPTS.socratic 
    : SYSTEM_PROMPTS.collision

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...(options.history || []),
    { role: 'user', content: message }
  ]

  const payload = {
    model: BAILIAN_CONFIG.models.chat,
    input: {
      messages: messages
    },
    parameters: {
      result_format: 'message',
      incremental_output: true, // 流式输出
    }
  }

  // 生产环境使用代理
  let response: Response
  
  if (BAILIAN_CONFIG.useProxy) {
    // 通过 Netlify Function 代理
    response = await fetch(BAILIAN_CONFIG.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        endpoint: 'chat',
        payload: payload
      })
    })
  } else {
    // 开发环境直连
    response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${BAILIAN_CONFIG.apiKey}`,
      },
      body: JSON.stringify(payload)
    })
  }

  if (!response.ok) {
    throw new Error(`百炼API错误: ${response.status}`)
  }

  const reader = response.body?.getReader()
  if (!reader) {
    throw new Error('无法读取响应流')
  }

  const decoder = new TextDecoder()
  let buffer = ''
  let fullContent = ''

  while (true) {
    const { done, value } = await reader.read()
    
    if (done) {
      yield { content: '', done: true }
      break
    }

    buffer += decoder.decode(value, { stream: true })
    
    // 解析 SSE 数据
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      if (line.startsWith('data:')) {
        const data = line.slice(5).trim()
        if (data === '[DONE]') {
          yield { content: '', done: true }
          return
        }

        try {
          const json = JSON.parse(data)
          const content = json.output?.choices?.[0]?.message?.content || ''
          
          if (content) {
            fullContent += content
            yield { content, done: false }
          }
        } catch (e) {
          // 忽略解析错误
        }
      }
    }
  }
}

/**
 * 百炼对话 API - 非流式
 */
export async function chatWithBailianSync(
  message: string,
  options: ChatOptions
): Promise<string> {
  const chunks: string[] = []
  
  for await (const chunk of chatWithBailian(message, options)) {
    if (chunk.content) {
      chunks.push(chunk.content)
    }
  }
  
  return chunks.join('')
}

/**
 * 生成对话标题
 */
export async function generateTitle(firstMessage: string): Promise<string> {
  const payload = {
    model: BAILIAN_CONFIG.models.chatTurbo,
    input: {
      messages: [
        { role: 'system', content: '根据用户的第一条消息，生成一个简短的对话标题（最多10个字）。只返回标题，不要其他内容。' },
        { role: 'user', content: firstMessage }
      ]
    },
    parameters: {
      result_format: 'message',
    }
  }

  let response: Response
  
  if (BAILIAN_CONFIG.useProxy) {
    response = await fetch(BAILIAN_CONFIG.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint: 'chat', payload })
    })
  } else {
    response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${BAILIAN_CONFIG.apiKey}`,
      },
      body: JSON.stringify(payload)
    })
  }

  const data = await response.json()
  return data.output?.choices?.[0]?.message?.content || '新对话'
}