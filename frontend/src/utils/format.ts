import type { TFunction } from 'i18next'

export function formatWan(value: number | null, dash: string, wan: string): string {
  if (value == null) return dash
  return (value / 10000).toFixed(0) + wan
}

export function formatPrize(amount: number, isFloat: boolean, amountMissing: boolean, t: TFunction): string {
  if (isFloat && amountMissing) return t('prizeCheck.floatMissing')
  if (amount >= 10000) return '¥' + (amount / 10000).toFixed(2) + t('common.wan')
  return '¥' + amount + t('prizeCheck.yuan')
}
