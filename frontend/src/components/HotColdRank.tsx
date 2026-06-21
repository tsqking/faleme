import { useState } from 'react'
import type { HotColdResponse } from '../types'
import { TabGroup, Tab } from '../styles/shared'
import { FullscreenCard } from './FullscreenCard'
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

  const controls = (
    <TabGroup>
      <Tab $active={zone === 'front'} onClick={() => setZone('front')}>前区</Tab>
      <Tab $active={zone === 'back'} onClick={() => setZone('back')}>后区</Tab>
    </TabGroup>
  )

  return (
    <FullscreenCard title={`冷热号分析 (近${data.period}期)`} controls={controls}>
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
    </FullscreenCard>
  )
}
