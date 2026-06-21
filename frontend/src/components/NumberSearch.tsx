import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { Popover } from 'antd'
import type { CheckResult } from '../types'

const SearchRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 16px;
`

const Selector = styled.div`
  flex: 0 0 50%;
  min-width: 200px;
  padding: 10px 14px;
  border: 1px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.2s;

  &:hover {
    border-color: #1a1a2e;
  }
`

const BallRow = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  min-height: 36px;
  align-items: center;
`

const Ball = styled.span<{ $zone: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  background: ${p => p.$zone === 'back' ? '#4d96ff' : '#e74c3c'};
`

const Placeholder = styled.span`
  color: #999;
  font-size: 14px;
  line-height: 36px;
`

const PopContent = styled.div`
  width: 420px;
`

const SectionTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
`

const Grid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 16px;
`

const NumBtn = styled.button<{ $sel?: boolean; $zone: string }>`
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: 1px solid ${p => p.$sel ? (p.$zone === 'back' ? '#4d96ff' : '#e74c3c') : '#ddd'};
  background: ${p => p.$sel ? (p.$zone === 'back' ? '#4d96ff' : '#e74c3c') : '#fff'};
  color: ${p => p.$sel ? '#fff' : '#333'};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;

  &:hover:not(:disabled) {
    border-color: ${p => p.$zone === 'back' ? '#4d96ff' : '#e74c3c'};
  }

  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
`

const Actions = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 8px;
`

const CfmBtn = styled.button`
  padding: 6px 20px;
  background: #1a1a2e;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`

const ClrBtn = styled.button`
  padding: 6px 14px;
  background: #fff;
  color: #e74c3c;
  border: 1px solid #e74c3c;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
`

const CclBtn = styled.button`
  padding: 6px 20px;
  background: #fff;
  color: #666;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
`

const ResultTag = styled.span<{ $hit: boolean }>`
  font-size: 13px;
  padding: 4px 10px;
  border-radius: 6px;
  background: ${p => p.$hit ? '#e8f5e9' : '#fff3e0'};
  border: 1px solid ${p => p.$hit ? '#a5d6a7' : '#ffcc80'};
  white-space: nowrap;
`

const ErrMsg = styled.span`
  color: #e74c3c;
  font-size: 12px;
`

function fmt(f: number[], b: number[]): string {
  return [...f.map(n => String(n).padStart(2, '0')), ...b.map(n => String(n).padStart(2, '0'))].join(' ')
}

export function NumberSearch() {
  const [front, setFront] = useState<number[]>([2, 6, 19, 28, 32])
  const [back, setBack] = useState<number[]>([5, 12])
  const [open, setOpen] = useState(false)
  const [tf, setTf] = useState<number[]>(front)
  const [tb, setTb] = useState<number[]>(back)
  const [result, setResult] = useState<CheckResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => { doSearch(front, back) }, [])

  const doSearch = async (f: number[], b: number[]) => {
    setLoading(true)
    setErr(null)
    try {
      const r = await fetch(`/api/check?numbers=${encodeURIComponent(fmt(f, b))}`)
      if (!r.ok) throw new Error('查询失败')
      const d: CheckResult = await r.json()
      setResult(d)
    } catch (e) {
      setErr(e instanceof Error ? e.message : '查询出错')
    } finally {
      setLoading(false)
    }
  }

  const toggleF = (n: number) => {
    setTf(p => {
      if (p.includes(n)) return p.filter(x => x !== n)
      if (p.length >= 5) return p
      return [...p, n].sort((a, b) => a - b)
    })
  }

  const toggleB = (n: number) => {
    setTb(p => {
      if (p.includes(n)) return p.filter(x => x !== n)
      if (p.length >= 2) return p
      return [...p, n].sort((a, b) => a - b)
    })
  }

  const clear = () => {
    setTf([])
    setTb([])
  }

  const confirm = () => {
    setFront(tf)
    setBack(tb)
    setOpen(false)
    doSearch(tf, tb)
  }

  const cancel = () => {
    setTf(front)
    setTb(back)
    setOpen(false)
  }

  const handleOpen = (v: boolean) => {
    if (v) { setTf(front); setTb(back); setResult(null); setErr(null) }
    setOpen(v)
  }

  const ready = tf.length === 5 && tb.length === 2
  const frontNums = Array.from({ length: 35 }, (_, i) => i + 1)
  const backNums = Array.from({ length: 12 }, (_, i) => i + 1)

  const pop = (
    <PopContent>
      <SectionTitle>前区（选5个）{tf.length}/5</SectionTitle>
      <Grid>
        {frontNums.map(n => (
          <NumBtn key={n} $zone="front" $sel={tf.includes(n)} disabled={!tf.includes(n) && tf.length >= 5} onClick={() => toggleF(n)}>
            {String(n).padStart(2, '0')}
          </NumBtn>
        ))}
      </Grid>
      <SectionTitle>后区（选2个）{tb.length}/2</SectionTitle>
      <Grid>
        {backNums.map(n => (
          <NumBtn key={n} $zone="back" $sel={tb.includes(n)} disabled={!tb.includes(n) && tb.length >= 2} onClick={() => toggleB(n)}>
            {String(n).padStart(2, '0')}
          </NumBtn>
        ))}
      </Grid>
      <Actions>
        <ClrBtn onClick={clear}>清除</ClrBtn>
        <span style={{ display: 'flex', gap: 8 }}>
          <CclBtn onClick={cancel}>取消</CclBtn>
          <CfmBtn disabled={!ready} onClick={confirm}>确认查询</CfmBtn>
        </span>
      </Actions>
    </PopContent>
  )

  return (
    <SearchRow>
      <Popover content={pop} trigger="click" open={open} onOpenChange={handleOpen} placement="bottomLeft">
        <Selector>
          {(open ? (tf.length > 0 || tb.length > 0) : (front.length > 0 || back.length > 0)) ? (
            <BallRow>
              {(open ? tf : front).map(n => <Ball key={n} $zone="front">{String(n).padStart(2, '0')}</Ball>)}
              {(open ? tb : back).map(n => <Ball key={n} $zone="back">{String(n).padStart(2, '0')}</Ball>)}
            </BallRow>
          ) : (
            <Placeholder>点击选择号码</Placeholder>
          )}
        </Selector>
      </Popover>
      {err && <ErrMsg>{err}</ErrMsg>}
      {!loading && result && (
        <ResultTag $hit={result.matched}>
          {result.matched
            ? `中过 ${result.total_matches} 次 — ${result.matches.map(m => m.season).join(', ')}`
            : '该号码从未中过一等奖'}
        </ResultTag>
      )}
    </SearchRow>
  )
}
