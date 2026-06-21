import type { HistoryResponse } from '../types'

interface Props {
  data: HistoryResponse
  onPageChange: (page: number) => void
}

export function HistoryTable({ data, onPageChange }: Props) {
  return (
    <div className="chart-section">
      <div className="chart-header">
        <h3>开奖历史</h3>
        <span className="total-label">共 {data.total} 期</span>
      </div>
      <div className="table-wrapper">
        <table className="history-table">
          <thead>
            <tr>
              <th className="season-th">期号</th>
              <th colSpan={5} className="front-th">前区号码</th>
              <th colSpan={2} className="back-th">后区号码</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map(item => (
              <tr key={item.season}>
                <td className="season-cell">{item.season}</td>
                {item.front.map((n, i) => (
                  <td key={i} className={`ball front-ball ${n >= 25 ? 'big' : n >= 15 ? 'mid' : 'small'}`}>
                    {String(n).padStart(2, '0')}
                  </td>
                ))}
                {item.back.map((n, i) => (
                  <td key={i} className="ball back-ball">{String(n).padStart(2, '0')}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="pagination">
        <button disabled={data.page <= 1} onClick={() => onPageChange(data.page - 1)}>上一页</button>
        <span>第 {data.page} / {data.total_pages} 页</span>
        <button disabled={data.page >= data.total_pages} onClick={() => onPageChange(data.page + 1)}>下一页</button>
      </div>
    </div>
  )
}
