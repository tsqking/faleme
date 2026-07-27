import { Component, type ErrorInfo, type ReactNode } from 'react'
import i18n from '../i18n'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  message?: string
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled UI error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 80, textAlign: 'center' }}>
          <h2 style={{ color: 'var(--color-danger)' }}>{i18n.t('common.error')}</h2>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: 8 }}>{this.state.message}</p>
        </div>
      )
    }
    return this.props.children
  }
}
