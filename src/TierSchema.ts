interface Place {
  row: number
  order: number
}

export interface Thing {
  id: string
  title: string
  place?: Place
}

export interface Tier {
  id: string
  title: string
  row: number
  hexColor?: React.CSSProperties["color"]
}

export interface TierSchema {
  tiers: Tier[]
  things: Thing[]
}