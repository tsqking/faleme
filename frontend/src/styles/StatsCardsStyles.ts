import styled from 'styled-components'

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    margin-bottom: 16px;
  }
`

export const StatCard = styled.div<{ $variant?: 'hot' | 'cold' }>`
  background: var(--color-surface);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  box-shadow: var(--shadow-card);

  @media (max-width: 768px) {
    padding: 12px 8px;
    border-radius: 8px;
  }
`

export const StatLabel = styled.span`
  display: block;
  font-size: 13px;
  color: var(--color-text-tertiary);
  margin-bottom: 8px;
`

export const StatValue = styled.span<{ $variant?: 'hot' | 'cold' }>`
  display: block;
  font-size: 32px;
  font-weight: 700;
  color: ${p => p.$variant === 'hot' ? 'var(--color-hot)' : p.$variant === 'cold' ? 'var(--color-cold)' : 'var(--color-primary)'};

  @media (max-width: 768px) {
    font-size: 24px;
  }
`

export const StatDesc = styled.span`
  display: block;
  font-size: 12px;
  color: var(--color-text-tertiary);
  margin-top: 4px;
`
