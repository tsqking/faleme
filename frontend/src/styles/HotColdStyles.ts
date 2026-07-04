import styled from 'styled-components'

export const HotColdGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`

export const HotTitle = styled.h4`
  color: #e74c3c;
  margin-bottom: 12px;
  font-size: 14px;
`

export const ColdTitle = styled.h4`
  color: #3498db;
  margin-bottom: 12px;
  font-size: 14px;
`

export const RankRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
`

export const RankNum = styled.span`
  width: 28px;
  font-size: 13px;
  font-weight: 600;
  text-align: right;
`

export const RankBarBg = styled.div`
  flex: 1;
  height: 18px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
`

export const RankBar = styled.div<{ $variant: 'hot' | 'cold' }>`
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s;
  min-width: 4px;
  background: ${p => p.$variant === 'hot'
    ? 'linear-gradient(90deg, #ff6b6b, #e74c3c)'
    : 'linear-gradient(90deg, #74b9ff, #3498db)'};
`

export const RankCount = styled.span`
  width: 28px;
  font-size: 12px;
  color: #999;
  text-align: left;
`
