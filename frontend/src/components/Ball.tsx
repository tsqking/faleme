import styled from 'styled-components'

export type BallZone = 'front' | 'back'
export type BallTier = 'small' | 'mid' | 'big'

interface BallProps {
  value: number
  zone: BallZone
  tier?: BallTier
  compact?: boolean
}

export function Ball({ value, zone, tier, compact }: BallProps) {
  return (
    <BallStyled $zone={zone} $tier={tier} $compact={compact}>
      {String(value).padStart(2, '0')}
    </BallStyled>
  )
}

const BallStyled = styled.span<{ $zone: BallZone; $tier?: BallTier; $compact?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${p => (p.$compact ? '30px' : '32px')};
  height: ${p => (p.$compact ? '30px' : '32px')};
  border-radius: 50%;
  font-size: 13px;
  font-weight: 600;
  flex-shrink: 0;
  color: #fff;
  background: ${p => {
    if (p.$zone === 'back') return 'var(--color-ball-back)'
    if (p.$tier === 'small') return 'var(--color-ball-front-small)'
    if (p.$tier === 'mid') return 'var(--color-ball-front-mid)'
    return 'var(--color-ball-front-big)'
  }};
`
