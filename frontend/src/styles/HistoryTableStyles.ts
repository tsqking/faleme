import styled from 'styled-components'

export const TableWrapper = styled.div`
  overflow-x: auto;
`

export const HistoryTableStyle = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;

  th {
    background: #f8f9fa;
    padding: 10px 8px;
    text-align: left;
    font-weight: 600;
    border-bottom: 2px solid #eee;
  }

  th.back-th {
    padding-left: 16px;
  }

  td {
    padding: 8px 6px;
    text-align: left;
    border-bottom: 1px solid #f0f0f0;
  }

  .season-cell {
    font-weight: 600;
    color: #666;
    white-space: nowrap;
  }

  .info-cell {
    font-size: 12px;
    color: #666;
    white-space: nowrap;
    min-width: 64px;
  }
`

export const SeasonCell = styled.td`
  font-weight: 600;
  color: #666;
  white-space: nowrap;
`
