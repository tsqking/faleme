import styled, { css } from 'styled-components'

export const ChartSection = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);

  @media (max-width: 768px) {
    padding: 14px 12px;
    border-radius: 8px;
  }
`

export const ChartHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  gap: 8px;

  h3 {
    font-size: 16px;
    font-weight: 600;
  }

  @media (max-width: 768px) {
    flex-wrap: wrap;
    margin-bottom: 12px;

    h3 {
      font-size: 14px;
    }
  }
`

export const TabGroup = styled.div`
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
`

export const Tab = styled.button<{ $active?: boolean }>`
  padding: 4px 12px;
  border: 1px solid #ddd;
  background: ${p => p.$active ? '#1a1a2e' : '#fff'};
  color: ${p => p.$active ? '#fff' : '#666'};
  border-color: ${p => p.$active ? '#1a1a2e' : '#ddd'};
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${p => p.$active ? '#1a1a2e' : '#f5f5f5'};
  }
`

export const Pagination = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 16px;

  button {
    padding: 6px 16px;
    border: 1px solid #ddd;
    background: #fff;
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
    transition: all 0.2s;

    &:hover:not(:disabled) {
      background: #f5f5f5;
    }

    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  }

  span {
    font-size: 13px;
    color: #666;
  }
`

export const TotalLabel = styled.span`
  font-size: 13px;
  color: #999;
`

export const Ball = styled.span<{ $zone?: 'front' | 'back'; $size?: 'small' | 'mid' | 'big' }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 13px;
  font-weight: 600;
  text-align: center;
  flex-shrink: 0;
  color: #fff;

  ${p => p.$zone === 'back' && css`
    background: #4d96ff;
  `}

  ${p => p.$zone === 'front' && p.$size === 'small' && css`
    background: #6bcb77;
  `}

  ${p => p.$zone === 'front' && p.$size === 'mid' && css`
    background: #f39c12;
  `}

  ${p => p.$zone === 'front' && p.$size === 'big' && css`
    background: #e74c3c;
  `}
`
