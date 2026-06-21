import { useState } from 'react'
import type { HotColdResponse } from '../types'
import { ChartSection, ChartHeader, TabGroup, Tab } from '../styles/shared'
import { HotColdGrid, HotTitle, ColdTitle, RankRow, RankNum, RankBarBg, RankBar, RankCount } from '../styles/HotColdStyles'

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
    <ChartSection>
      <ChartHeader>
        <h3>冷热号分析 (近{data.period}期)</h3>
        <TabGroup>
          <Tab $active={zone === 'front'} onClick={() => setZone('front')}>前区</Tab>
          <Tab $active={zone === 'back'} onClick={() => setZone('back')}>后区</Tab>
        </TabGroup>
      </ChartHeader>
      <HotColdGrid>
        <div>
          <HotTitle>热号 Top 10</HotTitle>
          {hot.map(item => (
            <RankRow key={item.number}>
              <RankNum>{String(item.number).padStart(2, '0')}</RankNum>
              <RankBarBg>
                <RankBar $variant="hot" style={{ width: `${(item.count / maxCount) * 100}%` }} />
              </RankBarBg>
              <RankCount>{item.count}</RankCount>
            </RankRow>
          ))}
        </div>
        <div>
          <ColdTitle>冷号 Top 10</ColdTitle>
          {cold.map(item => (
            <RankRow key={item.number}>
              <RankNum>{String(item.number).padStart(2, '0')}</RankNum>
              <RankBarBg>
                <RankBar $variant="cold" style={{ width: `${(item.count / maxCount) * 100}%` }} />
              </RankBarBg>
              <RankCount>{item.count}</RankCount>
            </RankRow>
          ))}
        </div>
      </HotColdGrid>
    </ChartSection>
  )
}
