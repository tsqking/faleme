import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { HotColdResponse } from '../types';
import { TabGroup, Tab } from '../styles/shared';
import { FullscreenCard } from './FullscreenCard';
import { useDebounce } from '../hooks/useDebounce';
import {
  HotColdGrid,
  HotTitle,
  ColdTitle,
  RankRow,
  RankNum,
  RankBarBg,
  RankBar,
  RankCount,
} from '../styles/HotColdStyles';

interface Props {
  data: HotColdResponse;
  period: number;
  onPeriodChange: (v: number) => void;
}

export function HotColdRank({ data, period, onPeriodChange }: Props) {
  const { t } = useTranslation();
  const [zone, setZone] = useState<'front' | 'back'>('front');
  const [inputValue, setInputValue] = useState(String(period));
  const debouncedValue = useDebounce(inputValue, 300);

  useEffect(() => {
    const n = parseInt(debouncedValue, 10);
    if (!isNaN(n) && n >= 1 && n !== period) {
      onPeriodChange(n);
    }
  }, [debouncedValue, onPeriodChange, period]);

  const items = zone === 'front' ? data.front : data.back;

  const hot = items.slice(0, 10);
  const cold = [...items].reverse().slice(0, 10);

  const maxCount = items[0]?.count ?? 1;

  const controls = (
    <TabGroup>
      <Tab $active={zone === 'front'} onClick={() => setZone('front')}>
        {t('hotCold.front')}
      </Tab>
      <Tab $active={zone === 'back'} onClick={() => setZone('back')}>
        {t('hotCold.back')}
      </Tab>
      <span
        style={{
          marginLeft: 12,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <span style={{ fontSize: 13, color: '#666' }}>
          {t('hotCold.recent')}
        </span>
        <input
          type='number'
          min={1}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          style={{
            width: 60,
            padding: '4px 8px',
            border: '1px solid #ddd',
            borderRadius: 4,
            fontSize: 13,
          }}
        />
        <span style={{ fontSize: 13, color: '#666' }}>
          {t('hotCold.draws')}
        </span>
      </span>
    </TabGroup>
  );

  return (
    <FullscreenCard
      title={t('hotCold.title', { period: data.period })}
      controls={controls}
    >
      <HotColdGrid>
        <div>
          <HotTitle>{t('hotCold.hotTop10')}</HotTitle>
          {hot.map((item) => (
            <RankRow key={item.number}>
              <RankNum>{String(item.number).padStart(2, '0')}</RankNum>
              <RankBarBg>
                <RankBar
                  $variant='hot'
                  style={{ width: `${(item.count / maxCount) * 100}%` }}
                />
              </RankBarBg>
              <RankCount>{item.count}</RankCount>
            </RankRow>
          ))}
        </div>
        <div>
          <ColdTitle>{t('hotCold.coldTop10')}</ColdTitle>
          {cold.map((item) => (
            <RankRow key={item.number}>
              <RankNum>{String(item.number).padStart(2, '0')}</RankNum>
              <RankBarBg>
                <RankBar
                  $variant='cold'
                  style={{ width: `${(item.count / maxCount) * 100}%` }}
                />
              </RankBarBg>
              <RankCount>{item.count}</RankCount>
            </RankRow>
          ))}
        </div>
      </HotColdGrid>
    </FullscreenCard>
  );
}
