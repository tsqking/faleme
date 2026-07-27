import { createGlobalStyle } from 'styled-components'

export const GlobalStyle = createGlobalStyle`
  :root {
    --color-bg: #f0f2f5;
    --color-surface: #fff;
    --color-surface-alt: #f8f9fa;
    --color-input-bg: #fff;
    --color-border: #ddd;
    --color-border-light: #eee;
    --color-text: #333;
    --color-text-secondary: #666;
    --color-text-tertiary: #999;
    --color-primary: #1a1a2e;
    --color-on-primary: #fff;
    --color-hover: #f5f5f5;
    --color-track: #f0f0f0;
    --shadow-card: 0 2px 8px rgba(0,0,0,0.06);
    --color-success-bg: #f0fdf4;
    --color-success-border: #bbf7d0;
    --color-success-text: #166534;
    --color-neutral-bg: #f8fafc;
    --color-neutral-border: #e2e8f0;
    --color-neutral-text: #475569;
    --color-danger: #e74c3c;
    --color-hot: #e74c3c;
    --color-cold: #3498db;
  }

  html[data-theme="dark"] {
    --color-bg: #14141f;
    --color-surface: #1e1e2e;
    --color-surface-alt: #262638;
    --color-input-bg: #1e1e2e;
    --color-border: #3a3a4f;
    --color-border-light: #2e2e40;
    --color-text: #e4e4e7;
    --color-text-secondary: #a1a1aa;
    --color-text-tertiary: #71717a;
    --color-primary: #6366f1;
    --color-on-primary: #fff;
    --color-hover: #2a2a3e;
    --color-track: #2e2e40;
    --shadow-card: 0 2px 8px rgba(0,0,0,0.3);
    --color-success-bg: #052e16;
    --color-success-border: #14532d;
    --color-success-text: #86efac;
    --color-neutral-bg: #1a1a2a;
    --color-neutral-border: #3f3f52;
    --color-neutral-text: #d4d4d8;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    line-height: 1.5;
    font-weight: 400;
    color: var(--color-text);
    background: var(--color-bg);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    margin: 0;
    min-width: 320px;
    min-height: 100vh;
    overflow-x: hidden;
  }

  #root {
    width: 100%;
  }
`
