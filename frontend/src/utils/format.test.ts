import { describe, it, expect } from 'vitest'
import { formatWan } from './format'

describe('formatWan', () => {
  it('returns dash placeholder for null', () => {
    expect(formatWan(null, '-', '万')).toBe('-')
  })

  it('converts values to 万 units', () => {
    expect(formatWan(10000, '-', '万')).toBe('1万')
    expect(formatWan(12345000, '-', '万')).toBe('1235万')
  })

  it('uses the provided translations', () => {
    expect(formatWan(10000, '-', '0k')).toBe('10k')
  })
})
