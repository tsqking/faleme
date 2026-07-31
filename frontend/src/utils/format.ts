export function formatWan(value: number | null, dash: string, wan: string): string {
  if (value == null) return dash
  return (value / 10000).toFixed(0) + wan
}
