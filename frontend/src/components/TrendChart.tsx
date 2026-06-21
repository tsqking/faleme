import { useMemo, useState, useRef, useEffect } from 'react'
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

// --- SeasonSelect autocomplete ---

const SeasonWrapper = styled.div`
  position: relative;
`

const SeasonInput = styled.input`
  width: 120px;
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 12px;
  outline: none;

  &:focus {
    border-color: #1a1a2e;
  }
`

const Dropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 10;
  background: #fff;
  border: 1px solid #ddd;
  border-top: none;
  border-radius: 0 0 4px 4px;
  max-height: 240px;
  overflow-y: auto;
  box-shadow: 0 4px 8px rgba(0,0,0,0.08);
`

const Option = styled.div<{ $active?: boolean }>`
  padding: 4px 8px;
  font-size: 12px;
  cursor: pointer;
  background: ${p => p.$active ? '#1a1a2e' : '#fff'};
  color: ${p => p.$active ? '#fff' : '#333'};

  &:hover {
    background: ${p => p.$active ? '#1a1a2e' : '#f0f0f0'};
  }
`

const Empty = styled.div`
  padding: 8px;
  font-size: 12px;
  color: #999;
  text-align: center;
`

interface SeasonSelectProps {
  placeholder: string
  value: string
  seasons: string[]
  onChange: (v: string) => void
}

function SeasonSelect({ placeholder, value, seasons, onChange }: SeasonSelectProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState(value)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setQuery(value)
  }, [value])

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const filtered = useMemo(() => {
    if (!query) return seasons.slice(0, 200)
    const q = query.toLowerCase()
    return seasons.filter(s => s.toLowerCase().includes(q)).slice(0, 200)
  }, [seasons, query])

  const handleSelect = (s: string) => {
    onChange(s)
    setQuery(s)
    setOpen(false)
  }

  return (
    <SeasonWrapper ref={wrapperRef}>
      <SeasonInput
        value={open ? query : value}
        onChange={e => { setQuery(e.target.value); setOpen(true) }}
        onFocus={() => { setQuery(value); setOpen(true) }}
        placeholder={placeholder}
      />
      {open && (
        <Dropdown>
          {filtered.map(s => (
            <Option key={s} $active={s === value} onClick={() => handleSelect(s)}>
              {s}
            </Option>
          ))}
          {filtered.length === 0 && <Empty>无匹配</Empty>}
        </Dropdown>
      )}
    </SeasonWrapper>
  )
}

export function TrendChart({ data }: Props) {
  const [zone, setZone] = useState<'front' | 'back'>('front')
  const [filterMode, setFilterMode] = useState<FilterMode>('none')
  const [limitInput, setLimitInput] = useState('50')
  const [startSeason, setStartSeason] = useState('')
  const [endSeason, setEndSeason] = useState('')

  const positions = zone === 'front' ? ['pos1', 'pos2', 'pos3', 'pos4', 'pos5'] : ['pos6', 'pos7']

  const seasons = useMemo(() => {
    const set = new Set<string>()
    for (const d of data.items) set.add(d.season)
    return Array.from(set).sort().reverse()
  }, [data])

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
            <SeasonSelect placeholder="起始期号" value={startSeason} seasons={seasons} onChange={setStartSeason} />
            <span style={{fontSize: 12, color: '#999'}}>至</span>
            <SeasonSelect placeholder="截止期号" value={endSeason} seasons={seasons} onChange={setEndSeason} />
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
