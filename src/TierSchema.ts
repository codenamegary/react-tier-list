interface Place {
  row: number
  order: number
}

export type ThingType = "text" | "image"

export interface Thing {
  id: string
  title: string
  dataUrl?: string
  type: ThingType
  place?: Place
}

export type NewThing = Omit<Thing, "id">

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