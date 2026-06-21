import { useMemo, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { TrendResponse } from '../types'
import { ChartSection, ChartHeader, TabGroup, Tab } from '../styles/shared'

interface Props {
  data: TrendResponse
}

const COLORS = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#9b59b6', '#e17055', '#00cec9']
const LABELS = ['第1位', '第2位', '第3位', '第4位', '第5位', '后区1', '后区2']

export function TrendChart({ data }: Props) {
  const [zone, setZone] = useState<'front' | 'back'>('front')
  const positions = zone === 'front' ? ['pos1', 'pos2', 'pos3', 'pos4', 'pos5'] : ['pos6', 'pos7']

  const chartData = useMemo(() => {
    const step = Math.max(1, Math.floor(data.items.length / 200))
    return data.items.filter((_, i) => i % step === 0).slice(-200)
  }, [data])

  return (
    <ChartSection>
      <ChartHeader>
        <h3>号码走势</h3>
        <TabGroup>
          <Tab $active={zone === 'front'} onClick={() => setZone('front')}>前区</Tab>
          <Tab $active={zone === 'back'} onClick={() => setZone('back')}>后区</Tab>
        </TabGroup>
      </ChartHeader>
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
    </ChartSection>
  )
}
