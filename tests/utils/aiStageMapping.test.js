/**
 * AI 阶段映射工具测试
 * 测试后端 stage 值到前端进度阶段的映射逻辑
 */
import { describe, it, expect } from 'vitest'
import {
  mapBackendStage,
  isValidBackendStage,
  isHeartbeatEvent,
} from '@/utils/aiStageMapping'

describe('mapBackendStage', () => {
  it('应将 preparing 映射到 connecting', () => {
    expect(mapBackendStage('preparing')).toBe('connecting')
  })

  it('应将 connecting 映射到 connecting', () => {
    expect(mapBackendStage('connecting')).toBe('connecting')
  })

  it('应将 analyzing 映射到 analyzing', () => {
    expect(mapBackendStage('analyzing')).toBe('analyzing')
  })

  it('应将 generating 映射到 generating', () => {
    expect(mapBackendStage('generating')).toBe('generating')
  })

  it('应将 optimizing 映射到 optimizing', () => {
    expect(mapBackendStage('optimizing')).toBe('optimizing')
  })

  it('应将 validating 映射到 optimizing', () => {
    expect(mapBackendStage('validating')).toBe('optimizing')
  })

  it('应将 completed 映射到 completed', () => {
    expect(mapBackendStage('completed')).toBe('completed')
  })

  describe('extracting 阶段的任务类型区分', () => {
    it('在 recognize 任务中应映射到 generating', () => {
      expect(mapBackendStage('extracting', 'recognize')).toBe('generating')
    })

    it('在 generate 任务中应映射到 analyzing', () => {
      expect(mapBackendStage('extracting', 'generate')).toBe('analyzing')
    })

    it('在 optimize 任务中应映射到 analyzing', () => {
      expect(mapBackendStage('extracting', 'optimize')).toBe('analyzing')
    })

    it('在 jd-optimize 任务中应映射到 analyzing', () => {
      expect(mapBackendStage('extracting', 'jd-optimize')).toBe('analyzing')
    })
  })

  describe('边界情况', () => {
    it('未知 stage 值应原样返回', () => {
      expect(mapBackendStage('unknown_stage')).toBe('unknown_stage')
    })

    it('空字符串应返回 connecting', () => {
      expect(mapBackendStage('')).toBe('connecting')
    })

    it('null 应返回 connecting', () => {
      expect(mapBackendStage(null)).toBe('connecting')
    })

    it('undefined 应返回 connecting', () => {
      expect(mapBackendStage(undefined)).toBe('connecting')
    })
  })
})

describe('isValidBackendStage', () => {
  it('应识别所有有效的后端 stage 值', () => {
    const validStages = [
      'preparing',
      'connecting',
      'analyzing',
      'generating',
      'optimizing',
      'extracting',
      'validating',
      'completed',
    ]
    validStages.forEach((stage) => {
      expect(isValidBackendStage(stage)).toBe(true)
    })
  })

  it('应拒绝无效的 stage 值', () => {
    expect(isValidBackendStage('unknown')).toBe(false)
    expect(isValidBackendStage('')).toBe(false)
    expect(isValidBackendStage(null)).toBe(false)
    expect(isValidBackendStage(undefined)).toBe(false)
  })
})

describe('isHeartbeatEvent', () => {
  it('应识别心跳事件', () => {
    expect(isHeartbeatEvent({ type: 'heartbeat' })).toBe(true)
    expect(isHeartbeatEvent({ type: 'heartbeat', timestamp: 123456 })).toBe(true)
  })

  it('应拒绝非心跳事件', () => {
    expect(isHeartbeatEvent({ type: 'status' })).toBe(false)
    expect(isHeartbeatEvent({ type: 'chunk' })).toBe(false)
    expect(isHeartbeatEvent({ status: 'processing' })).toBe(false)
    expect(isHeartbeatEvent({})).toBe(false)
    expect(isHeartbeatEvent(null)).toBe(false)
    expect(isHeartbeatEvent(undefined)).toBe(false)
  })
})
