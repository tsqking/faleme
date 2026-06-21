import { useTranslation } from 'react-i18next'
import type { FrequencyResponse, DrawItem } from '../types'
import { StatsGrid, StatCard, StatLabel, StatValue, StatDesc } from '../styles/StatsCardsStyles'

interface Props {
  data: FrequencyResponse
  latestDraw?: DrawItem
}

export function StatsCards({ data, latestDraw }: Props) {
  const { t } = useTranslation()

  const fmtMoney = (n: number | null): string => {
    if (n == null) return t('common.dash')
    return (n / 10000).toFixed(0) + t('common.wan')
  }
  const totalFront = data.front.reduce((s, x) => s + x.count, 0)
  const maxFront = [...data.front].sort((a, b) => b.count - a.count)[0]
  const maxBack = [...data.back].sort((a, b) => b.count - a.count)[0]
  const minFront = [...data.front].sort((a, b) => a.count - b.count)[0]
  const minBack = [...data.back].sort((a, b) => a.count - b.count)[0]

  return (
    <StatsGrid>
      <StatCard>
        <StatLabel>{t('statsCards.totalDraws')}</StatLabel>
        <StatValue>{totalFront / 5}</StatValue>
      </StatCard>
      <StatCard>
        <StatLabel>{t('statsCards.frontHottest')}</StatLabel>
        <StatValue $variant="hot">{String(maxFront.number).padStart(2, '0')}</StatValue>
        <StatDesc>{maxFront.count} {t('statsCards.times')}</StatDesc>
      </StatCard>
      <StatCard>
        <StatLabel>{t('statsCards.frontColdest')}</StatLabel>
        <StatValue $variant="cold">{String(minFront.number).padStart(2, '0')}</StatValue>
        <StatDesc>{minFront.count} {t('statsCards.times')}</StatDesc>
      </StatCard>
      <StatCard>
        <StatLabel>{t('statsCards.backHottest')}</StatLabel>
        <StatValue $variant="hot">{String(maxBack.number).padStart(2, '0')}</StatValue>
        <StatDesc>{maxBack.count} {t('statsCards.times')}</StatDesc>
      </StatCard>
      <StatCard>
        <StatLabel>{t('statsCards.backColdest')}</StatLabel>
        <StatValue $variant="cold">{String(minBack.number).padStart(2, '0')}</StatValue>
        <StatDesc>{minBack.count} {t('statsCards.times')}</StatDesc>
      </StatCard>
      {latestDraw && (
        <>
          <StatCard>
            <StatLabel>{t('statsCards.latestDraw')}</StatLabel>
            <StatValue style={{ fontSize: 22 }}>{latestDraw.season}</StatValue>
            <StatDesc>{latestDraw.draw_date ?? t('common.dash')}</StatDesc>
          </StatCard>
          <StatCard>
            <StatLabel>{t('statsCards.poolAmount')}</StatLabel>
            <StatValue style={{ fontSize: 20 }}>{fmtMoney(latestDraw.pool)}</StatValue>
          </StatCard>
          <StatCard>
            <StatLabel>{t('statsCards.totalBets')}</StatLabel>
            <StatValue style={{ fontSize: 20 }}>{fmtMoney(latestDraw.total_bets)}</StatValue>
          </StatCard>
        </>
      )}
    </StatsGrid>
  )
}
