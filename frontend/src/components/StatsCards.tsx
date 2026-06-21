import type { FrequencyResponse } from '../types'
import { StatsGrid, StatCard, StatLabel, StatValue, StatDesc } from '../styles/StatsCardsStyles'

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
    <StatsGrid>
      <StatCard>
        <StatLabel>总开奖期数</StatLabel>
        <StatValue>{totalFront / 5}</StatValue>
      </StatCard>
      <StatCard>
        <StatLabel>前区最热</StatLabel>
        <StatValue $variant="hot">{String(maxFront.number).padStart(2, '0')}</StatValue>
        <StatDesc>{maxFront.count} 次</StatDesc>
      </StatCard>
      <StatCard>
        <StatLabel>前区最冷</StatLabel>
        <StatValue $variant="cold">{String(minFront.number).padStart(2, '0')}</StatValue>
        <StatDesc>{minFront.count} 次</StatDesc>
      </StatCard>
      <StatCard>
        <StatLabel>后区最热</StatLabel>
        <StatValue $variant="hot">{String(maxBack.number).padStart(2, '0')}</StatValue>
        <StatDesc>{maxBack.count} 次</StatDesc>
      </StatCard>
      <StatCard>
        <StatLabel>后区最冷</StatLabel>
        <StatValue $variant="cold">{String(minBack.number).padStart(2, '0')}</StatValue>
        <StatDesc>{minBack.count} 次</StatDesc>
      </StatCard>
    </StatsGrid>
  )
}
