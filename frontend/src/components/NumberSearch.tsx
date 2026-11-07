import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { App as AntdApp } from 'antd'
import { InfoCircleOutlined, CheckCircleOutlined } from '@ant-design/icons'
import type { CheckResult, PrizeResult } from '../types'
import { Ball } from './Ball'
import { NumberSelector } from './NumberSelector'
import { formatPrize } from '../utils/format'

const SearchRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 16px;
`

const QueryBtn = styled.button`
  padding: 17px 24px;
  background: var(--color-primary);
  color: var(--color-on-primary);
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  line-height: 1;
  cursor: pointer;

  &:hover {
    opacity: 0.85;
  }
`

const ResultArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1 1 100%;
`

const ResultTag = styled.span<{ $hit: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  padding: 6px 12px;
  border-radius: 8px;
  background: ${p => p.$hit ? 'var(--color-success-bg)' : 'var(--color-neutral-bg)'};
  border: 1px solid ${p => p.$hit ? 'var(--color-success-border)' : 'var(--color-neutral-border)'};
  color: ${p => p.$hit ? 'var(--color-success-text)' : 'var(--color-neutral-text)'};
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  white-space: nowrap;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;

  &:hover {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
  }

  @media (max-width: 768px) {
    white-space: normal;
    font-size: 12px;
    width: 100%;
  }
`

const Amount = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: var(--color-primary);
`

const Winning = styled.div`
  border-top: 1px dashed var(--color-border);
  padding-top: 10px;
`

const WinLabel = styled.div`
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-bottom: 6px;
`

const BallRow = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  align-items: center;
`

const ErrMsg = styled.span`
  color: var(--color-danger);
  font-size: 12px;
`

function fmt(f: number[], b: number[]): string {
  return [...f.map(n => String(n).padStart(2, '0')), ...b.map(n => String(n).padStart(2, '0'))].join(' ')
}

export function NumberSearch() {
  const [front, setFront] = useState<number[]>([2, 6, 19, 28, 32])
  const [back, setBack] = useState<number[]>([5, 12])
  const [history, setHistory] = useState<CheckResult | null>(null)
  const [prize, setPrize] = useState<PrizeResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const { t } = useTranslation()
  const { message } = AntdApp.useApp()
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    return () => abortRef.current?.abort()
  }, [])

  const doSearch = async (f: number[], b: number[]) => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    setLoading(true)
    setErr(null)
    setHistory(null)
    setPrize(null)
    try {
      const [rh, rp] = await Promise.all([
        fetch(`/api/check?numbers=${encodeURIComponent(fmt(f, b))}`, { signal: controller.signal }),
        fetch(`/api/check-prize?numbers=${encodeURIComponent(fmt(f, b))}`, { signal: controller.signal }),
      ])
      if (!rh.ok || !rp.ok) throw new Error(t('numberSearch.queryFailed'))
      setHistory((await rh.json()) as CheckResult)
      setPrize((await rp.json()) as PrizeResult)
    } catch (e) {
      if (controller.signal.aborted) return
      setErr(e instanceof Error ? e.message : t('numberSearch.queryError'))
    } finally {
      if (!controller.signal.aborted) setLoading(false)
    }
  }

  const doQuery = () => {
    if (front.length === 5 && back.length === 2) {
      doSearch(front, back)
    } else {
      message.warning(t('numberSearch.selectHint', { front: 5 - front.length, back: 2 - back.length }))
    }
  }

  return (
    <SearchRow>
      <NumberSelector front={front} back={back} onChange={(f, b) => { setFront(f); setBack(b) }} />
      <QueryBtn onClick={doQuery}>{t('numberSearch.query')}</QueryBtn>
      {err && <ErrMsg>{err}</ErrMsg>}
      {!loading && history && (
        <ResultArea>
          <ResultTag $hit={history.matched}>
            {history.matched ? <CheckCircleOutlined /> : <InfoCircleOutlined />}
            {history.matched
              ? t('numberSearch.matched', { count: history.total_matches, seasons: history.matches.map(m => m.season).join(', ') })
              : t('numberSearch.neverMatched')}
          </ResultTag>
          {prize && (
            <ResultTag $hit={prize.matched}>
              {prize.matched ? <CheckCircleOutlined /> : <InfoCircleOutlined />}
              {t(`prizeCheck.tier${prize.tier}`)}
              {prize.matched && <> · {t('prizeCheck.winPattern', { f: prize.front_hit, b: prize.back_hit })}</>}
            </ResultTag>
          )}
          {prize?.matched && (
            <Amount>
              {t('prizeCheck.amount')}：{formatPrize(prize.amount, prize.is_float, prize.amount_missing, t)}
            </Amount>
          )}
          {prize && prize.winning && (
            <Winning>
              <WinLabel>
                {t('prizeCheck.winningTitle')}（{t('prizeCheck.season')} {prize.winning.season} · {prize.winning.draw_date ?? t('common.dash')}）
              </WinLabel>
              <BallRow>
                {prize.winning.front.map(n => <Ball key={'f' + n} value={n} zone="front" compact />)}
                {prize.winning.back.map(n => <Ball key={'b' + n} value={n} zone="back" compact />)}
              </BallRow>
            </Winning>
          )}
        </ResultArea>
      )}
    </SearchRow>
  )
}
