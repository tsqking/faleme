import styled from 'styled-components'
import type { HistoryResponse } from '../types'
import { TotalLabel, Pagination } from '../styles/shared'
import { FullscreenCard } from './FullscreenCard'
import { TableWrapper, HistoryTableStyle } from '../styles/HistoryTableStyles'

interface Props {
  data: HistoryResponse
  onPageChange: (page: number) => void
}

function fmtMoney(n: number | null): string {
  if (n == null) return '-'
  return (n / 10000).toFixed(0) + '万'
}

export function HistoryTable({ data, onPageChange }: Props) {
  return (
    <FullscreenCard title="开奖历史" controls={<TotalLabel>共 {data.total} 期</TotalLabel>}>
      <TableWrapper>
        <HistoryTableStyle>
          <thead>
            <tr>
              <th>期号</th>
              <th colSpan={5}>前区号码</th>
              <th colSpan={2} className="back-th">后区号码</th>
              <th>日期</th>
              <th>奖池</th>
              <th>一等注数</th>
              <th>一等奖金</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map(item => (
              <tr key={item.season}>
                <td className="season-cell">{item.season}</td>
                {item.front.map((n, i) => (
                  <td key={i}>
                    <Ball $zone="front" $size={n >= 25 ? 'big' : n >= 15 ? 'mid' : 'small'}>
                      {String(n).padStart(2, '0')}
                    </Ball>
                  </td>
                ))}
                {item.back.map((n, i) => (
                  <td key={i}>
                    <Ball $zone="back">
                      {String(n).padStart(2, '0')}
                    </Ball>
                  </td>
                ))}
                <td className="info-cell">{item.draw_date ?? '-'}</td>
                <td className="info-cell">{fmtMoney(item.pool)}</td>
                <td className="info-cell">{item.first_prize_count ?? '-'}</td>
                <td className="info-cell">{fmtMoney(item.first_prize_amount)}</td>
              </tr>
            ))}
          </tbody>
        </HistoryTableStyle>
      </TableWrapper>
      <Pagination>
        <button disabled={data.page <= 1} onClick={() => onPageChange(data.page - 1)}>上一页</button>
        <span>第 {data.page} / {data.total_pages} 页</span>
        <button disabled={data.page >= data.total_pages} onClick={() => onPageChange(data.page + 1)}>下一页</button>
      </Pagination>
    </FullscreenCard>
  )
}

const Ball = styled.span<{ $zone: 'front' | 'back'; $size?: 'small' | 'mid' | 'big' }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 13px;
  font-weight: 600;
  flex-shrink: 0;
  color: #fff;
  background: ${p => {
    if (p.$zone === 'back') return '#4d96ff'
    if (p.$size === 'small') return '#6bcb77'
    if (p.$size === 'mid') return '#f39c12'
    return '#e74c3c'
  }};
`
