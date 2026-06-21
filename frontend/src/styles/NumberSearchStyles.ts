import styled from 'styled-components'

export const SearchInput = styled.input`
  flex: 1;
  padding: 10px 14px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: #1a1a2e;
  }
`

export const SearchButton = styled.button`
  padding: 10px 24px;
  background: #1a1a2e;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.85;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

export const SearchBalls = styled.div`
  display: flex;
  gap: 6px;
  margin-bottom: 12px;
`

export const SearchBall = styled.span<{ $zone: 'front' | 'back'; $size?: 'small' | 'mid' | 'big' }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  background: ${p => {
    if (p.$zone === 'back') return '#4d96ff'
    if (p.$size === 'small') return '#6bcb77'
    if (p.$size === 'mid') return '#f39c12'
    return '#e74c3c'
  }};
`
