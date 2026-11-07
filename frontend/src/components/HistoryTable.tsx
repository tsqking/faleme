import { useTranslation } from 'react-i18next'
import type { HistoryResponse } from '../types'
import { TotalLabel, Pagination } from '../styles/shared'
import { FullscreenCard } from './FullscreenCard'
import { TableWrapper, HistoryTableStyle } from '../styles/HistoryTableStyles'
import { Ball } from './Ball'
import { formatWan } from '../utils/format'

interface Props {
  data: HistoryResponse
  onPageChange: (page: number) => void
}

export function HistoryTable({ data, onPageChange }: Props) {
  const { t } = useTranslation()
  const fmtMoney = (n: number | null): string => formatWan(n, t('common.dash'), t('common.wan'))
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
                {item.front.map((n) => (
                  <td key={`f${n}`}>
                    <Ball value={n} zone="front" tier={n >= 25 ? 'big' : n >= 15 ? 'mid' : 'small'} />
                  </td>
                ))}
                {item.back.map((n) => (
                  <td key={`b${n}`}>
                    <Ball value={n} zone="back" />
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
