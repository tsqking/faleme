import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import type { HistoryResponse } from '../types'
import { TotalLabel, Pagination } from '../styles/shared'
import { FullscreenCard } from './FullscreenCard'
import { TableWrapper, HistoryTableStyle } from '../styles/HistoryTableStyles'

interface Props {
  data: HistoryResponse
  onPageChange: (page: number) => void
}

export function HistoryTable({ data, onPageChange }: Props) {
  const { t } = useTranslation()
  const fmtMoney = (n: number | null): string => {
    if (n == null) return t('common.dash')
    return (n / 10000).toFixed(0) + t('common.wan')
  }
  return (
    <FullscreenCard title={t('historyTable.title')} controls={<TotalLabel>{t('historyTable.total', { count: data.total })}</TotalLabel>}>
      <TableWrapper>
        <HistoryTableStyle>
          <thead>
            <tr>
              <th>{t('historyTable.season')}</th>
              <th colSpan={5}>{t('historyTable.frontNumbers')}</th>
              <th colSpan={2} className="back-th">{t('historyTable.backNumbers')}</th>
              <th>{t('historyTable.date')}</th>
              <th>{t('historyTable.pool')}</th>
              <th>{t('historyTable.firstPrizeCount')}</th>
              <th>{t('historyTable.firstPrizeAmount')}</th>
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
                <td className="info-cell">{item.draw_date ?? t('common.dash')}</td>
                <td className="info-cell">{fmtMoney(item.pool)}</td>
                <td className="info-cell">{item.first_prize_count ?? t('common.dash')}</td>
                <td className="info-cell">{fmtMoney(item.first_prize_amount)}</td>
              </tr>
            ))}
          </tbody>
        </HistoryTableStyle>
      </TableWrapper>
      <Pagination>
        <button disabled={data.page <= 1} onClick={() => onPageChange(data.page - 1)}>{t('historyTable.prevPage')}</button>
        <span>{t('historyTable.pageInfo', { page: data.page, total: data.total_pages })}</span>
        <button disabled={data.page >= data.total_pages} onClick={() => onPageChange(data.page + 1)}>{t('historyTable.nextPage')}</button>
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
