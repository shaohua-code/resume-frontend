/**
 * SSE 解析逻辑测试
 * 测试心跳事件处理和各类事件解析
 */
import { describe, it, expect, vi } from 'vitest'

/**
 * 模拟 SSE 行解析逻辑（从 src/api/resume.js 中提取的核心逻辑）
 * 用于单元测试而不需要完整的 ReadableStream 环境
 */
function createSSELineParser(handlers = {}) {
  const { onChunk, onDone, onError, onStatus, onQuestion } = handlers
  let finalData = null
  let completed = false

  function handleLine(line) {
    const trimmed = line.trim()
    if (!trimmed.startsWith('data:')) return { type: 'ignored' }
    
    let event
    try {
      event = JSON.parse(trimmed.slice(5).trim())
    } catch {
      return { type: 'parse_error' }
    }
    
    // 忽略心跳事件
    if (event.type === 'heartbeat') {
      return { type: 'heartbeat', event }
    }
    
    // 状态事件
    if (event.status) {
      onStatus?.(event.status, event.stage)
      return { type: 'status', event }
    }
    
    // 内容块
    if (event.chunk) {
      onChunk?.(event.chunk)
      return { type: 'chunk', event }
    }
    
    // 问题事件
    if (event.question) {
      onQuestion?.(event.question, event.index)
      return { type: 'question', event }
    }
    
    // 错误事件
    if (event.error) {
      const streamError = new Error(event.error)
      streamError.code = event.code || ''
      onError?.(streamError)
      return { type: 'error', event, error: streamError }
    }
    
    // 完成事件
    if (event.done && Object.prototype.hasOwnProperty.call(event, 'data')) {
      completed = true
      finalData = event.data
      onDone?.(event.data)
      return { type: 'done', event }
    }
    
    return { type: 'unknown', event }
  }

  return {
    handleLine,
    getState: () => ({ finalData, completed }),
  }
}

describe('SSE 行解析器', () => {
  describe('心跳事件处理', () => {
    it('应忽略心跳事件，不触发任何回调', () => {
      const onChunk = vi.fn()
      const onStatus = vi.fn()
      const onDone = vi.fn()
      const onError = vi.fn()

      const parser = createSSELineParser({ onChunk, onStatus, onDone, onError })
      
      const result = parser.handleLine('data: {"type":"heartbeat","timestamp":1699123456789}')
      
      expect(result.type).toBe('heartbeat')
      expect(onChunk).not.toHaveBeenCalled()
      expect(onStatus).not.toHaveBeenCalled()
      expect(onDone).not.toHaveBeenCalled()
      expect(onError).not.toHaveBeenCalled()
    })

    it('心跳事件不应影响最终数据和完成状态', () => {
      const parser = createSSELineParser({})
      
      // 发送心跳
      parser.handleLine('data: {"type":"heartbeat"}')
      
      let state = parser.getState()
      expect(state.completed).toBe(false)
      expect(state.finalData).toBe(null)
      
      // 发送完成事件
      parser.handleLine('data: {"done":true,"data":{"name":"测试"}}')
      
      state = parser.getState()
      expect(state.completed).toBe(true)
      expect(state.finalData).toEqual({ name: '测试' })
    })

    it('心跳事件穿插在正常事件中不应干扰流程', () => {
      const chunks = []
      const statuses = []
      
      const parser = createSSELineParser({
        onChunk: (chunk) => chunks.push(chunk),
        onStatus: (status, stage) => statuses.push({ status, stage }),
      })
      
      // 模拟真实的事件序列
      parser.handleLine('data: {"status":"开始处理","stage":"connecting"}')
      parser.handleLine('data: {"type":"heartbeat","timestamp":1}')
      parser.handleLine('data: {"status":"分析中","stage":"analyzing"}')
      parser.handleLine('data: {"chunk":"你好"}')
      parser.handleLine('data: {"type":"heartbeat","timestamp":2}')
      parser.handleLine('data: {"chunk":"世界"}')
      parser.handleLine('data: {"type":"heartbeat","timestamp":3}')
      parser.handleLine('data: {"done":true,"data":{"content":"你好世界"}}')
      
      expect(chunks).toEqual(['你好', '世界'])
      expect(statuses).toEqual([
        { status: '开始处理', stage: 'connecting' },
        { status: '分析中', stage: 'analyzing' },
      ])
    })
  })

  describe('状态事件处理', () => {
    it('应正确解析带 stage 的状态事件', () => {
      const statuses = []
      const parser = createSSELineParser({
        onStatus: (status, stage) => statuses.push({ status, stage }),
      })
      
      parser.handleLine('data: {"status":"正在生成","stage":"generating"}')
      
      expect(statuses).toEqual([{ status: '正在生成', stage: 'generating' }])
    })

    it('应正确解析不带 stage 的状态事件', () => {
      const statuses = []
      const parser = createSSELineParser({
        onStatus: (status, stage) => statuses.push({ status, stage }),
      })
      
      parser.handleLine('data: {"status":"处理中"}')
      
      expect(statuses).toEqual([{ status: '处理中', stage: undefined }])
    })
  })

  describe('内容块处理', () => {
    it('应正确累积内容块', () => {
      const chunks = []
      const parser = createSSELineParser({
        onChunk: (chunk) => chunks.push(chunk),
      })
      
      parser.handleLine('data: {"chunk":"第一段"}')
      parser.handleLine('data: {"chunk":"第二段"}')
      parser.handleLine('data: {"chunk":"第三段"}')
      
      expect(chunks).toEqual(['第一段', '第二段', '第三段'])
    })
  })

  describe('错误处理', () => {
    it('应正确处理错误事件', () => {
      const errors = []
      const parser = createSSELineParser({
        onError: (error) => errors.push(error),
      })
      
      const result = parser.handleLine('data: {"error":"生成失败","code":"AI_ERROR"}')
      
      expect(result.type).toBe('error')
      expect(errors.length).toBe(1)
      expect(errors[0].message).toBe('生成失败')
      expect(errors[0].code).toBe('AI_ERROR')
    })
  })

  describe('完成事件处理', () => {
    it('应正确处理完成事件', () => {
      let doneData = null
      const parser = createSSELineParser({
        onDone: (data) => { doneData = data },
      })
      
      parser.handleLine('data: {"done":true,"data":{"resume":{"name":"张三"}}}')
      
      const state = parser.getState()
      expect(state.completed).toBe(true)
      expect(doneData).toEqual({ resume: { name: '张三' } })
    })
  })

  describe('边界情况', () => {
    it('应忽略非 data: 开头的行', () => {
      const parser = createSSELineParser({})
      
      expect(parser.handleLine('event: status').type).toBe('ignored')
      expect(parser.handleLine('id: 123').type).toBe('ignored')
      expect(parser.handleLine('').type).toBe('ignored')
      expect(parser.handleLine('   ').type).toBe('ignored')
    })

    it('应处理 JSON 解析错误', () => {
      const parser = createSSELineParser({})
      
      const result = parser.handleLine('data: {invalid json}')
      expect(result.type).toBe('parse_error')
    })
  })
})
