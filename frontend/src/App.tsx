import { useState } from 'react'
import styled from 'styled-components'
import { GlobalStyle } from './styles/GlobalStyle'
import { useLotteryData } from './hooks/useLotteryData'
import { StatsCards } from './components/StatsCards'
import { TrendChart } from './components/TrendChart'
import { FrequencyChart } from './components/FrequencyChart'
import { HotColdRank } from './components/HotColdRank'
import { HistoryTable } from './components/HistoryTable'
import { NumberSearch } from './components/NumberSearch'

const AppContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
`

const AppHeader = styled.header`
  margin-bottom: 24px;

  h1 {
    font-size: 24px;
    font-weight: 700;
    color: #1a1a2e;
  }
`

const ChartsRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 24px;
`

const StatusMessage = styled.div<{ $isError?: boolean }>`
  text-align: center;
  padding: 80px;
  font-size: 18px;
  color: ${p => p.$isError ? '#e74c3c' : '#666'};
`

function App() {
  const [page, setPage] = useState(1)
  const { history, frequency, trend, hotCold, loading, error } = useLotteryData(page)

  return (
    <>
      <GlobalStyle />
      <AppContainer>
        <AppHeader>
          <h1>大乐透数据看板</h1>
        </AppHeader>

        {loading && <StatusMessage>加载中...</StatusMessage>}
        {error && <StatusMessage $isError>数据加载失败：{error}</StatusMessage>}

        {!loading && !error && (
          <>
            <NumberSearch />

            {frequency && <StatsCards data={frequency} latestDraw={history?.items[0]} />}

            <ChartsRow>
              {trend && <TrendChart data={trend} />}
              {frequency && <FrequencyChart data={frequency} />}
            </ChartsRow>

            <ChartsRow>
              {hotCold && <HotColdRank data={hotCold} />}
              {history && <HistoryTable data={history} onPageChange={setPage} />}
            </ChartsRow>
          </>
        )}
      </AppContainer>
    </>
  )
}

export default App
