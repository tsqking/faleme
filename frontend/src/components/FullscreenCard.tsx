import { useState, useEffect, useCallback, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { ChartSection, ChartHeader } from '../styles/shared'

interface Props {
  title: string
  controls?: ReactNode
  children: ReactNode
}

export function FullscreenCard({ title, controls, children }: Props) {
  const { t } = useTranslation()
  const [fs, setFs] = useState(false)

  const onKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') setFs(false)
  }, [])

  useEffect(() => {
    if (fs) {
      document.addEventListener('keydown', onKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [fs, onKeyDown])

  return (
    <>
      {fs && (
        <Overlay>
          <OverlayHeader>
            <h2>{title}</h2>
            <CloseButton onClick={() => setFs(false)} title={t('fullscreenCard.restore')}>✕</CloseButton>
          </OverlayHeader>
          <OverlayBody>{children}</OverlayBody>
        </Overlay>
      )}
      <ChartSection>
        <ChartHeader>
          <h3>{title}</h3>
          <HeaderRight>
            {controls}
            <ExpandButton onClick={() => setFs(true)} title={t('fullscreenCard.fullscreen')}>⛶</ExpandButton>
          </HeaderRight>
        </ChartHeader>
        {children}
      </ChartSection>
    </>
  )
}

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const ExpandButton = styled.button`
  background: none;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  padding: 2px 6px;
  font-size: 14px;
  color: #999;
  transition: all 0.2s;
  line-height: 1;

  &:hover {
    color: #1a1a2e;
    border-color: #1a1a2e;
  }
`

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: #fff;
  display: flex;
  flex-direction: column;
`

const OverlayHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid #eee;

  h2 {
    font-size: 18px;
    font-weight: 600;
    color: #1a1a2e;
  }
`

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #666;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s;

  &:hover {
    background: #f5f5f5;
    color: #333;
  }
`

const OverlayBody = styled.div`
  flex: 1;
  padding: 24px;
  overflow: auto;
`
