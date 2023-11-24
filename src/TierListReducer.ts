import { Reducer } from "react"
import { Thing, Tier, TierSchema } from "./TierSchema"
import { v4 as uuidv4 } from 'uuid'

const storageId = 'tier-list'

export interface TierState extends TierSchema {
  loading: boolean
  dragging: Thing | null
}

export enum Op {
  PLACE,
  REMOVE,
  ADD,
  DRAG_START,
  DRAG_END
}

type DragStartAction = { op: Op.DRAG_START, thing: Thing }
type DragEndAction = { op: Op.DRAG_END }
type PlaceAction = { op: Op.PLACE, thing: Thing, tier: Tier }
type RemoveAction = { op: Op.REMOVE, thing: Thing }
type AddAction = { op: Op.ADD, text: string }
export type Action =
  | PlaceAction
  | RemoveAction
  | AddAction
  | DragStartAction
  | DragEndAction

const transitions = {
  [Op.PLACE]: (state: TierState, action: PlaceAction) => {
    const newThings = [...state.things]
    const index = newThings.findIndex(t => t.id === action.thing.id)
    if (index === -1) return { ...state }
    newThings[index].place = {
      row: action.tier.row,
      order: 0
    }
    return save({
      ...state,
      things: [...newThings]
    })
  },
  [Op.REMOVE]: (state: TierState, action: RemoveAction) => {
    const newThings = [...state.things]
    const index = newThings.findIndex(t => t.id === action.thing.id)
    if (index === -1) return { ...state }
    return save({
      ...state,
      things: newThings.filter((_t, idx) => idx !== index)
    })
  },
  [Op.ADD]: (state: TierState, action: AddAction) => {
    return save({
      ...state,
      things: [...state.things, {
        id: uuidv4(),
        title: action.text.trim()
      }]
    })
  },
  [Op.DRAG_START]: (state: TierState, action: DragStartAction) => {
    return {
      ...state,
      dragging: action.thing
    }
  },
  [Op.DRAG_END]: (state: TierState) => {
    return {
      ...state,
      dragging: null
    }
  }
}

const save = (state: TierState): TierState => {
  const schema: TierSchema = { ...state }
  localStorage.setItem(storageId, JSON.stringify(schema))
  return { ...state }
}

const load = (): TierSchema | undefined => {
  const data = localStorage.getItem(storageId)
  if (!data) return undefined
  return JSON.parse(data)
}

export const init = (): TierState => {
  const fromStorage = load()
  if (fromStorage) {
    return {
      ...fromStorage,
      loading: false,
      dragging: null
    }
  }
  const queue: Tier = {
    id: uuidv4(),
    title: "*",
    row: 0,
    hexColor: "#999999"
  }
  const schema: TierSchema = {
    tiers: [
      { id: uuidv4(), row: 1, title: "S", hexColor: "#7eff80" },
      { id: uuidv4(), row: 2, title: "A", hexColor: "#beff7f" },
      { id: uuidv4(), row: 3, title: "B", hexColor: "#feff7f" },
      { id: uuidv4(), row: 5, title: "F", hexColor: "#ff7f7e" },
      { id: uuidv4(), row: 4, title: "C", hexColor: "#ffdf80" },
    ],
    things: [
      { id: uuidv4(), title: "Typescript" },
      { id: uuidv4(), title: "Lambda" },
      { id: uuidv4(), title: "Serverless" },
      { id: uuidv4(), title: "DynamoDB" }
    ]
  }
  schema.tiers.push(queue)
  return {
    ...schema,
    loading: false,
    dragging: null
  }
}

export const tierListReducer: Reducer<TierState, Action> = (state: TierState, action: Action): TierState => {
  switch (action.op) {
    case Op.PLACE:
      return transitions[action.op](state, action)
    case Op.REMOVE:
      return transitions[action.op](state, action)
    case Op.ADD:
      return transitions[action.op](state, action)
    case Op.DRAG_START:
      return transitions[action.op](state, action)
    case Op.DRAG_END:
      return transitions[action.op](state)
  }
}