import styled from 'styled-components'

export const TableWrapper = styled.div`
  overflow-x: auto;
`

export const HistoryTableStyle = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;

  th {
    background: var(--color-surface-alt);
    padding: 10px 8px;
    text-align: left;
    font-weight: 600;
    border-bottom: 2px solid var(--color-border-light);
    color: var(--color-text);
  }

  th.back-th {
    padding-left: 16px;
  }

  td {
    padding: 8px 6px;
    text-align: left;
    border-bottom: 1px solid var(--color-border-light);
    color: var(--color-text);
  }

  .season-cell {
    font-weight: 600;
    color: var(--color-text-secondary);
    white-space: nowrap;
  }

  .info-cell {
    font-size: 12px;
    color: var(--color-text-secondary);
    white-space: nowrap;
    min-width: 64px;
  }
`

export const SeasonCell = styled.td`
  font-weight: 600;
  color: var(--color-text-secondary);
  white-space: nowrap;
`
