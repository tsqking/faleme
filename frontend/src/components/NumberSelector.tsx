import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { Popover } from 'antd'
import { Ball } from './Ball'

const Selector = styled.div`
  flex: 1 1 200px;
  min-width: 0;
  padding: 8px 14px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.2s;

  &:hover {
    border-color: var(--color-primary);
  }
`

const BallRow = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  min-height: 32px;
  align-items: center;
`

const Placeholder = styled.span`
  color: var(--color-text-tertiary);
  font-size: 13px;
  line-height: 32px;
`

const PopContent = styled.div`
  max-width: 420px;
  width: calc(100vw - 32px);
`

const SectionTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--color-text);
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
  border: 1px solid ${p => p.$sel ? (p.$zone === 'back' ? 'var(--color-ball-back)' : 'var(--color-ball-front-big)') : 'var(--color-border)'};
  background: ${p => p.$sel ? (p.$zone === 'back' ? 'var(--color-ball-back)' : 'var(--color-ball-front-big)') : 'var(--color-surface)'};
  color: ${p => p.$sel ? '#fff' : 'var(--color-text)'};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;

  &:hover:not(:disabled) {
    border-color: ${p => p.$zone === 'back' ? 'var(--color-ball-back)' : 'var(--color-ball-front-big)'};
  }

  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    width: 38px;
    height: 38px;
    font-size: 13px;
  }
`

const Actions = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 8px;
`

const CfmBtn = styled.button`
  padding: 6px 20px;
  background: var(--color-primary);
  color: var(--color-on-primary);
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
  background: var(--color-surface);
  color: var(--color-danger);
  border: 1px solid var(--color-danger);
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
`

const CclBtn = styled.button`
  padding: 6px 20px;
  background: var(--color-surface);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
`

interface Props {
  front: number[]
  back: number[]
  onChange: (front: number[], back: number[]) => void
  placeholder?: string
}

const frontNums = Array.from({ length: 35 }, (_, i) => i + 1)
const backNums = Array.from({ length: 12 }, (_, i) => i + 1)

export function NumberSelector({ front, back, onChange, placeholder }: Props) {
  const [open, setOpen] = useState(false)
  const [tf, setTf] = useState<number[]>(front)
  const [tb, setTb] = useState<number[]>(back)
  const { t } = useTranslation()

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

  const clear = () => { setTf([]); setTb([]) }

  const cancel = () => { setTf(front); setTb(back); setOpen(false) }

  const confirm = () => { onChange(tf, tb); setOpen(false) }

  const handleOpen = (v: boolean) => {
    if (v) { setTf(front); setTb(back) }
    setOpen(v)
  }

  const ready = tf.length === 5 && tb.length === 2

  const pop = (
    <PopContent>
      <SectionTitle>{t('numberSearch.frontTitle')}{tf.length}/5</SectionTitle>
      <Grid>
        {frontNums.map(n => (
          <NumBtn key={n} $zone="front" $sel={tf.includes(n)} disabled={!tf.includes(n) && tf.length >= 5} onClick={() => toggleF(n)}>
            {String(n).padStart(2, '0')}
          </NumBtn>
        ))}
      </Grid>
      <SectionTitle>{t('numberSearch.backTitle')}{tb.length}/2</SectionTitle>
      <Grid>
        {backNums.map(n => (
          <NumBtn key={n} $zone="back" $sel={tb.includes(n)} disabled={!tb.includes(n) && tb.length >= 2} onClick={() => toggleB(n)}>
            {String(n).padStart(2, '0')}
          </NumBtn>
        ))}
      </Grid>
      <Actions>
        <ClrBtn onClick={clear}>{t('numberSearch.clear')}</ClrBtn>
        <span style={{ display: 'flex', gap: 8 }}>
          <CclBtn onClick={cancel}>{t('numberSearch.cancel')}</CclBtn>
          <CfmBtn disabled={!ready} onClick={confirm}>{t('numberSearch.confirm')}</CfmBtn>
        </span>
      </Actions>
    </PopContent>
  )

  const hasValue = front.length > 0 || back.length > 0

  return (
    <Popover content={pop} trigger="click" open={open} onOpenChange={handleOpen} placement="bottomLeft">
      <Selector>
        {hasValue ? (
          <BallRow>
            {front.map(n => <Ball key={n} value={n} zone="front" compact />)}
            {back.map(n => <Ball key={n} value={n} zone="back" compact />)}
          </BallRow>
        ) : (
          <Placeholder>{placeholder ?? t('numberSearch.placeholder')}</Placeholder>
        )}
      </Selector>
    </Popover>
  )
}
