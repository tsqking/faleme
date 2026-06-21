import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useTranslation } from 'react-i18next'
import type { FrequencyResponse } from '../types'
import { TabGroup, Tab } from '../styles/shared'
import { FullscreenCard } from './FullscreenCard'

interface Props {
  data: FrequencyResponse
}

const HOT_COLOR = '#ff6b6b'
const COLD_COLOR = '#74b9ff'
const MID_COLOR = '#dfe6e9'

export function FrequencyChart({ data }: Props) {
  const { t } = useTranslation()
  const [zone, setZone] = useState<'front' | 'back'>('front')
  const items = zone === 'front' ? data.front : data.back
  const maxCount = Math.max(...items.map(x => x.count))

  const controls = (
    <TabGroup>
      <Tab $active={zone === 'front'} onClick={() => setZone('front')}>{t('frequencyChart.front')}</Tab>
      <Tab $active={zone === 'back'} onClick={() => setZone('back')}>{t('frequencyChart.back')}</Tab>
    </TabGroup>
  )

  return (
    <FullscreenCard title={t('frequencyChart.title')} controls={controls}>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={items} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis dataKey="number" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip formatter={(value) => [t('frequencyChart.times', { count: Number(value) }), t('frequencyChart.appearCount')]} />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {items.map((entry) => (
              <Cell
                key={entry.number}
                fill={entry.count >= maxCount * 0.8 ? HOT_COLOR : entry.count <= maxCount * 0.2 ? COLD_COLOR : MID_COLOR}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </FullscreenCard>
  )
}
