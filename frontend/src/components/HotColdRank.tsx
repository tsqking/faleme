import { useState } from 'react'
import type { HotColdResponse } from '../types'

interface Props {
  data: HotColdResponse
}

export function HotColdRank({ data }: Props) {
  const [zone, setZone] = useState<'front' | 'back'>('front')
  const items = zone === 'front' ? data.front : data.back

  const hot = items.slice(0, 10)
  const cold = [...items].reverse().slice(0, 10)

  const maxCount = items[0]?.count ?? 1

  return (
    <div className="chart-section">
      <div className="chart-header">
        <h3>冷热号分析 (近{data.period}期)</h3>
        <div className="tab-group">
          <button className={`tab ${zone === 'front' ? 'active' : ''}`} onClick={() => setZone('front')}>前区</button>
          <button className={`tab ${zone === 'back' ? 'active' : ''}`} onClick={() => setZone('back')}>后区</button>
        </div>
      </div>
      <div className="hot-cold-grid">
        <div>
          <h4 className="hot-title">热号 Top 10</h4>
          {hot.map(item => (
            <div key={item.number} className="rank-row">
              <span className="rank-num">{String(item.number).padStart(2, '0')}</span>
              <div className="rank-bar-bg">
                <div className="rank-bar hot" style={{ width: `${(item.count / maxCount) * 100}%` }} />
              </div>
              <span className="rank-count">{item.count}</span>
            </div>
          ))}
        </div>
        <div>
          <h4 className="cold-title">冷号 Top 10</h4>
          {cold.map(item => (
            <div key={item.number} className="rank-row">
              <span className="rank-num">{String(item.number).padStart(2, '0')}</span>
              <div className="rank-bar-bg">
                <div className="rank-bar cold" style={{ width: `${(item.count / maxCount) * 100}%` }} />
              </div>
              <span className="rank-count">{item.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
