export interface DrawItem {
  season: string
  front: number[]
  back: number[]
}

export interface HistoryResponse {
  total: number
  page: number
  page_size: number
  total_pages: number
  items: DrawItem[]
}

export interface FrequencyItem {
  number: number
  count: number
}

export interface FrequencyResponse {
  front: FrequencyItem[]
  back: FrequencyItem[]
}

export interface TrendItem {
  season: string
  pos1: number
  pos2: number
  pos3: number
  pos4: number
  pos5: number
  pos6: number
  pos7: number
}

export interface TrendResponse {
  items: TrendItem[]
  total: number
}

export interface HotColdItem {
  number: number
  count: number
}

export interface HotColdResponse {
  period: number
  front: HotColdItem[]
  back: HotColdItem[]
}

export interface CheckResult {
  numbers: string
  matched: boolean
  matches: { season: string; number: string }[]
  total_matches: number
}
