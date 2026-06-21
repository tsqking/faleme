import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const Wrapper = styled.div`
  display: flex;
  gap: 4px;
`

const LangBtn = styled.button<{ $active: boolean }>`
  padding: 2px 8px;
  border: 1px solid ${p => p.$active ? '#1a1a2e' : '#ddd'};
  border-radius: 4px;
  background: ${p => p.$active ? '#1a1a2e' : '#fff'};
  color: ${p => p.$active ? '#fff' : '#666'};
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #1a1a2e;
  }
`

const langs = [
  { code: 'zh', label: '中文' },
  { code: 'en', label: 'EN' },
  { code: 'ja', label: '日' },
  { code: 'ko', label: '한' },
  { code: 'ru', label: 'RU' },
  { code: 'th', label: 'TH' },
  { code: 'fr', label: 'FR' },
]

export function LanguageSwitcher() {
  const { i18n } = useTranslation()
  return (
    <Wrapper>
      {langs.map(l => (
        <LangBtn key={l.code} $active={i18n.language.startsWith(l.code)} onClick={() => i18n.changeLanguage(l.code)}>
          {l.label}
        </LangBtn>
      ))}
    </Wrapper>
  )
}
