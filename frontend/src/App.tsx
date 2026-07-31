import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { App as AntdApp, ConfigProvider, theme as antdTheme } from 'antd'
import styled from 'styled-components'
import { GlobalStyle } from './styles/GlobalStyle'
import { useLotteryData } from './hooks/useLotteryData'
import { useTheme } from './hooks/useTheme'
import { StatsCards } from './components/StatsCards'
import { TrendChart } from './components/TrendChart'
import { FrequencyChart } from './components/FrequencyChart'
import { HotColdRank } from './components/HotColdRank'
import { HistoryTable } from './components/HistoryTable'
import { NumberSearch } from './components/NumberSearch'
import { LanguageSwitcher } from './components/LanguageSwitcher'
import { ThemeToggle } from './components/ThemeToggle'

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
    color: var(--color-primary);
  }

  @media (max-width: 768px) {
    flex-wrap: wrap;
    margin-bottom: 16px;

    h1 {
      font-size: 18px;
    }
  }
`

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
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
  color: ${p => p.$isError ? 'var(--color-danger)' : 'var(--color-text-secondary)'};
`

function App() {
  const { t } = useTranslation()
  const { resolved } = useTheme()
  const [page, setPage] = useState(1)
  const [period, setPeriod] = useState(30)
  const { history, frequency, trend, hotCold, loading, error } = useLotteryData(page, 15, period)

  return (
    <ConfigProvider theme={{ algorithm: resolved === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm }}>
      <AntdApp>
        <GlobalStyle />
        <AppContainer>
          <AppHeader>
            <h1>{t('app.title')}</h1>
            <HeaderActions>
              <LanguageSwitcher />
              <ThemeToggle />
            </HeaderActions>
          </AppHeader>

          {loading && <StatusMessage>{t('common.loading')}</StatusMessage>}
          {error && !loading && <StatusMessage $isError>{t('common.error')}{error}</StatusMessage>}

          {!loading && (
            <>
              <NumberSearch />

              {frequency && <StatsCards data={frequency} latestDraw={history?.items[0]} totalDraws={history?.total} />}

              <FullRow>{history && <HistoryTable data={history} onPageChange={setPage} />}</FullRow>
              <FullRow>{trend && <TrendChart data={trend} />}</FullRow>
              <FullRow>{frequency && <FrequencyChart data={frequency} />}</FullRow>
              <FullRow>{hotCold && <HotColdRank data={hotCold} period={period} onPeriodChange={setPeriod} />}</FullRow>
            </>
          )}
        </AppContainer>
      </AntdApp>
    </ConfigProvider>
  )
}

export default App
