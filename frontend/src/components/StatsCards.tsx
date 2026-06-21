import type { FrequencyResponse } from '../types'

interface Props {
  data: FrequencyResponse
}

export function StatsCards({ data }: Props) {
  const totalFront = data.front.reduce((s, x) => s + x.count, 0)
  const maxFront = [...data.front].sort((a, b) => b.count - a.count)[0]
  const maxBack = [...data.back].sort((a, b) => b.count - a.count)[0]
  const minFront = [...data.front].sort((a, b) => a.count - b.count)[0]
  const minBack = [...data.back].sort((a, b) => a.count - b.count)[0]

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <span className="stat-label">总开奖期数</span>
        <span className="stat-value">{totalFront / 5}</span>
      </div>
      <div className="stat-card hot">
        <span className="stat-label">前区最热</span>
        <span className="stat-value">{String(maxFront.number).padStart(2, '0')}</span>
        <span className="stat-desc">{maxFront.count} 次</span>
      </div>
      <div className="stat-card cold">
        <span className="stat-label">前区最冷</span>
        <span className="stat-value">{String(minFront.number).padStart(2, '0')}</span>
        <span className="stat-desc">{minFront.count} 次</span>
      </div>
      <div className="stat-card hot">
        <span className="stat-label">后区最热</span>
        <span className="stat-value">{String(maxBack.number).padStart(2, '0')}</span>
        <span className="stat-desc">{maxBack.count} 次</span>
      </div>
      <div className="stat-card cold">
        <span className="stat-label">后区最冷</span>
        <span className="stat-value">{String(minBack.number).padStart(2, '0')}</span>
        <span className="stat-desc">{minBack.count} 次</span>
      </div>
    </div>
  )
}
