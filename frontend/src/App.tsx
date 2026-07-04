import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { GlobalStyle } from './styles/GlobalStyle'
import { useLotteryData } from './hooks/useLotteryData'
import { StatsCards } from './components/StatsCards'
import { TrendChart } from './components/TrendChart'
import { FrequencyChart } from './components/FrequencyChart'
import { HotColdRank } from './components/HotColdRank'
import { HistoryTable } from './components/HistoryTable'
import { NumberSearch } from './components/NumberSearch'
import { LanguageSwitcher } from './components/LanguageSwitcher'

const AppContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;

  @media (max-width: 768px) {
    padding: 12px;
  }
`

const AppHeader = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  gap: 12px;

  h1 {
    font-size: 24px;
    font-weight: 700;
    color: #1a1a2e;
  }

  @media (max-width: 768px) {
    flex-wrap: wrap;
    margin-bottom: 16px;

    h1 {
      font-size: 18px;
    }
  }
`

const FullRow = styled.div`
  margin-bottom: 24px;

  @media (max-width: 768px) {
    margin-bottom: 16px;
  }
`

const StatusMessage = styled.div<{ $isError?: boolean }>`
  text-align: center;
  padding: 80px;
  font-size: 18px;
  color: ${p => p.$isError ? '#e74c3c' : '#666'};
`

function App() {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const [period, setPeriod] = useState(30)
  const { history, frequency, trend, hotCold, loading, error } = useLotteryData(page, 15, period)

  return (
    <>
      <GlobalStyle />
      <AppContainer>
        <AppHeader>
          <h1>{t('app.title')}</h1>
          <LanguageSwitcher />
        </AppHeader>

        {loading && <StatusMessage>{t('common.loading')}</StatusMessage>}
        {error && !loading && <StatusMessage $isError>{t('common.error')}{error}</StatusMessage>}

        {!loading && (
          <>
            <NumberSearch />

            {frequency && <StatsCards data={frequency} latestDraw={history?.items[0]} />}

            <FullRow>{history && <HistoryTable data={history} onPageChange={setPage} />}</FullRow>
            <FullRow>{trend && <TrendChart data={trend} />}</FullRow>
            <FullRow>{frequency && <FrequencyChart data={frequency} />}</FullRow>
            <FullRow>{hotCold && <HotColdRank data={hotCold} period={period} onPeriodChange={setPeriod} />}</FullRow>
          </>
        )}
      </AppContainer>
    </>
  )
}

export default App
