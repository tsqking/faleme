import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { useTheme, type ThemeMode } from '../hooks/useTheme'

const Wrapper = styled.div`
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
`

const ThemeBtn = styled.button<{ $active: boolean }>`
  padding: 2px 8px;
  border: 1px solid ${p => p.$active ? 'var(--color-primary)' : 'var(--color-border)'};
  border-radius: 4px;
  background: ${p => p.$active ? 'var(--color-primary)' : 'var(--color-surface)'};
  color: ${p => p.$active ? 'var(--color-on-primary)' : 'var(--color-text-secondary)'};
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  line-height: 1.4;

  &:hover {
    border-color: var(--color-primary);
  }
`

const options: { mode: ThemeMode; icon: string; key: 'light' | 'system' | 'dark' }[] = [
  { mode: 'light', icon: '☀️', key: 'light' },
  { mode: 'system', icon: '🖥️', key: 'system' },
  { mode: 'dark', icon: '🌙', key: 'dark' },
]

export function ThemeToggle() {
  const { t } = useTranslation()
  const { mode, setMode } = useTheme()
  return (
    <Wrapper>
      {options.map(o => (
        <ThemeBtn
          key={o.mode}
          $active={mode === o.mode}
          onClick={() => setMode(o.mode)}
          title={t(`theme.${o.key}`)}
          aria-label={t(`theme.${o.key}`)}
          aria-pressed={mode === o.mode}
        >
          {o.icon}
        </ThemeBtn>
      ))}
    </Wrapper>
  )
}
