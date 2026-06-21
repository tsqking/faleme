import { useState } from 'react'
import { useLotteryData } from './hooks/useLotteryData'
import { StatsCards } from './components/StatsCards'
import { TrendChart } from './components/TrendChart'
import { FrequencyChart } from './components/FrequencyChart'
import { HotColdRank } from './components/HotColdRank'
import { HistoryTable } from './components/HistoryTable'
import { NumberSearch } from './components/NumberSearch'
import './App.css'

function App() {
  const [page, setPage] = useState(1)
  const { history, frequency, trend, hotCold, loading, error } = useLotteryData(page)

  if (loading) {
    return (
      <div className="app-container">
        <header className="app-header">
          <h1>大乐透数据看板</h1>
        </header>
        <div className="loading">加载中...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="app-container">
        <header className="app-header">
          <h1>大乐透数据看板</h1>
        </header>
        <div className="error">数据加载失败：{error}</div>
      </div>
    )
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>大乐透数据看板</h1>
      </header>

      {frequency && <StatsCards data={frequency} />}

      <div className="charts-row">
        {trend && <TrendChart data={trend} />}
        {frequency && <FrequencyChart data={frequency} />}
      </div>

      <div className="charts-row">
        {hotCold && <HotColdRank data={hotCold} />}
        {history && <HistoryTable data={history} onPageChange={setPage} />}
      </div>

      <div className="charts-row">
        <NumberSearch />
      </div>
    </div>
  )
}

export default App
