import { Reducer } from "react"
import { NewThing, Thing, Tier, TierSchema } from "./TierSchema"
import { v4 as uuidv4 } from 'uuid'

const storageId = 'tier-list'

export interface TierState extends TierSchema {
  draggedThing: Thing | null
  dragging: boolean
  loading: boolean
}

export enum Op {
  PLACE,
  REMOVE,
  ADD,
  DRAG_START,
  DRAG_END,
  DELETE_ALL_THINGS,
  LOAD,
  LOADING_START,
  LOADING_END
}

type LoadAction = { op: Op.LOAD, schemaJson: string }
type LoadStartAction = { op: Op.LOADING_START }
type LoadEndAction = { op: Op.LOADING_END }
type DragStartAction = { op: Op.DRAG_START, thing?: Thing }
type DragEndAction = { op: Op.DRAG_END }
type PlaceAction = { op: Op.PLACE, thing: Thing, tier: Tier }
type RemoveAction = { op: Op.REMOVE, thing: Thing }
type AddAction = { op: Op.ADD, thing: NewThing, tier?: Tier }
type DeleteAllThingsAction = { op: Op.DELETE_ALL_THINGS }
export type Action =
  | PlaceAction
  | RemoveAction
  | AddAction
  | DragStartAction
  | DragEndAction
  | DeleteAllThingsAction
  | LoadAction
  | LoadStartAction
  | LoadEndAction

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
        ...action.thing,
        id: uuidv4(),
        place: action.tier ? {
          row: action.tier.row,
          order: 0
        } : undefined
      }]
    })
  },
  [Op.DRAG_START]: (state: TierState, action: DragStartAction) => {
    return {
      ...state,
      dragging: true,
      draggedThing: action.thing || null
    }
  },
  [Op.DRAG_END]: (state: TierState) => {
    return {
      ...state,
      dragging: false,
      draggedThing: null
    }
  },
  [Op.DELETE_ALL_THINGS]: (state: TierState) => {
    return save({
      ...state,
      things: []
    })
  },
  [Op.LOAD]: (state: TierState, action: LoadAction) => {
    const schema: TierSchema = JSON.parse(action.schemaJson)
    return save({
      ...state,
      things: schema.things,
      tiers: schema.tiers,
      draggedThing: null,
      dragging: false,
      loading: false
    })
  },
  [Op.LOADING_START]: (state: TierState) => {
    return {
      ...state,
      loading: true
    }
  },
  [Op.LOADING_END]: (state: TierState) => {
    return {
      ...state,
      loading: false
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
  return JSON.parse(data) as TierSchema
}

export const init = (): TierState => {
  const fromStorage = load()
  if (fromStorage) {
    return {
      ...fromStorage,
      draggedThing: null,
      dragging: false,
      loading: false
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
      { id: uuidv4(), row: 1, title: "S", hexColor: "#ff7f7e" },
      { id: uuidv4(), row: 2, title: "A", hexColor: "#ffdf80" },
      { id: uuidv4(), row: 3, title: "B", hexColor: "#feff7f" },
      { id: uuidv4(), row: 4, title: "C", hexColor: "#beff7f" },
      { id: uuidv4(), row: 5, title: "F", hexColor: "#7eff80" }
    ],
    things: []
  }
  schema.tiers.push(queue)
  return {
    ...schema,
    draggedThing: null,
    dragging: false,
    loading: false
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
    case Op.LOAD:
      return transitions[action.op](state, action)
    case Op.DRAG_START:
      return transitions[action.op](state, action)
    case Op.DRAG_END:
      return transitions[action.op](state)
    case Op.DELETE_ALL_THINGS:
      return transitions[action.op](state)
    case Op.LOADING_START:
      return transitions[action.op](state)
    case Op.LOADING_END:
      return transitions[action.op](state)
  }
}