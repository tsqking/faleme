import { useMemo, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import styled from 'styled-components'
import type { TrendResponse } from '../types'
import { TabGroup, Tab } from '../styles/shared'
import { FullscreenCard } from './FullscreenCard'

interface Props {
  data: TrendResponse
}

type FilterMode = 'none' | 'limit' | 'range'

const COLORS = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#9b59b6', '#e17055', '#00cec9']
const LABELS = ['第1位', '第2位', '第3位', '第4位', '第5位', '后区1', '后区2']

const FilterBar = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 12px;
`

const FilterTab = styled.button<{ $active?: boolean }>`
  padding: 3px 10px;
  border: 1px solid #ddd;
  background: ${p => p.$active ? '#1a1a2e' : '#fff'};
  color: ${p => p.$active ? '#fff' : '#666'};
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${p => p.$active ? '#1a1a2e' : '#f5f5f5'};
  }
`

const FilterInput = styled.input`
  width: 80px;
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 12px;
  outline: none;

  &:focus {
    border-color: #1a1a2e;
  }
`

const CountLabel = styled.span`
  font-size: 12px;
  color: #999;
  margin-left: auto;
`

export function TrendChart({ data }: Props) {
  const [zone, setZone] = useState<'front' | 'back'>('front')
  const [filterMode, setFilterMode] = useState<FilterMode>('none')
  const [limitInput, setLimitInput] = useState('50')
  const [startSeason, setStartSeason] = useState('')
  const [endSeason, setEndSeason] = useState('')

  const positions = zone === 'front' ? ['pos1', 'pos2', 'pos3', 'pos4', 'pos5'] : ['pos6', 'pos7']

  const filteredItems = useMemo(() => {
    let items = data.items
    if (filterMode === 'limit' && limitInput) {
      const n = parseInt(limitInput, 10)
      if (!isNaN(n) && n > 0) {
        items = items.slice(-n)
      }
    }
    if (filterMode === 'range') {
      if (startSeason) items = items.filter(d => d.season >= startSeason)
      if (endSeason) items = items.filter(d => d.season <= endSeason)
    }
    return items
  }, [data, filterMode, limitInput, startSeason, endSeason])

  const chartData = useMemo(() => {
    const step = Math.max(1, Math.floor(filteredItems.length / 200))
    return filteredItems.filter((_, i) => i % step === 0).slice(-200)
  }, [filteredItems])

  const controls = (
    <TabGroup>
      <Tab $active={zone === 'front'} onClick={() => setZone('front')}>前区</Tab>
      <Tab $active={zone === 'back'} onClick={() => setZone('back')}>后区</Tab>
    </TabGroup>
  )

  return (
    <FullscreenCard title="号码走势" controls={controls}>
      <FilterBar>
        <FilterTab $active={filterMode === 'none'} onClick={() => { setFilterMode('none'); setStartSeason(''); setEndSeason(''); setLimitInput('50') }}>全部</FilterTab>
        <FilterTab $active={filterMode === 'limit'} onClick={() => setFilterMode('limit')}>最近N期</FilterTab>
        <FilterTab $active={filterMode === 'range'} onClick={() => setFilterMode('range')}>期号区间</FilterTab>
        {filterMode === 'limit' && (
          <>
            <FilterInput type="number" min={1} value={limitInput} onChange={e => setLimitInput(e.target.value)} />
            <span style={{fontSize: 12, color: '#999'}}>期</span>
          </>
        )}
        {filterMode === 'range' && (
          <>
            <FilterInput placeholder="起始期号" value={startSeason} onChange={e => setStartSeason(e.target.value)} />
            <span style={{fontSize: 12, color: '#999'}}>至</span>
            <FilterInput placeholder="截止期号" value={endSeason} onChange={e => setEndSeason(e.target.value)} />
          </>
        )}
        <CountLabel>共 {filteredItems.length} 期</CountLabel>
      </FilterBar>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis dataKey="season" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
          <YAxis domain={zone === 'front' ? [0, 35] : [0, 12]} tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          {positions.map((pos, i) => (
            <Line
              key={pos}
              type="monotone"
              dataKey={pos}
              stroke={COLORS[i]}
              name={LABELS[+pos.slice(3) - 1]}
              dot={false}
              strokeWidth={1.5}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </FullscreenCard>
  )
}
