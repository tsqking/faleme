import styled from 'styled-components'

export const ChartSection = styled.div`
  background: var(--color-surface);
  border-radius: 12px;
  padding: 20px;
  box-shadow: var(--shadow-card);

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
  border: 1px solid var(--color-border);
  background: ${p => p.$active ? 'var(--color-primary)' : 'var(--color-surface)'};
  color: ${p => p.$active ? 'var(--color-on-primary)' : 'var(--color-text-secondary)'};
  border-color: ${p => p.$active ? 'var(--color-primary)' : 'var(--color-border)'};
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${p => p.$active ? 'var(--color-primary)' : 'var(--color-hover)'};
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
    border: 1px solid var(--color-border);
    background: var(--color-surface);
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
    color: var(--color-text);
    transition: all 0.2s;

    &:hover:not(:disabled) {
      background: var(--color-hover);
    }

    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  }

  span {
    font-size: 13px;
    color: var(--color-text-secondary);
  }
`

export const TotalLabel = styled.span`
  font-size: 13px;
  color: var(--color-text-tertiary);
`

