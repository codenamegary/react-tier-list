import { Reducer } from "react"
import { Thing, Tier, TierSchema } from "./TierSchema"
import { v4 as uuidv4 } from 'uuid'

interface TierState extends TierSchema {
  loading: boolean
}

export enum Op {
  PLACE,
  REMOVE,
  ADD
}

type PlaceAction = { op: Op.PLACE, thing: Thing, tier: Tier }
type RemoveAction = { op: Op.REMOVE, thing: Thing }
type AddAction = { op: Op.ADD, text: string }
type Action = PlaceAction | RemoveAction | AddAction

const transitions = {
  [Op.PLACE]: (state: TierState, action: PlaceAction) => {
    const newThings = [...state.things]
    const index = newThings.findIndex(t => t.id === action.thing.id)
    if (index === -1) return { ...state }
    newThings[index].place = {
      row: action.tier.row,
      order: 0
    }
    return {
      ...state,
      things: [...newThings]
    }
  },
  [Op.REMOVE]: (state: TierState, action: RemoveAction) => {
    const newThings = [...state.things]
    const index = newThings.findIndex(t => t.id === action.thing.id)
    if (index === -1) return { ...state }
    return {
      ...state,
      things: newThings.filter((_t, idx) => idx !== index)
    }
  },
  [Op.ADD]: (state: TierState, action: AddAction) => {
    return {
      ...state,
      things: [...state.things, {
        id: uuidv4(),
        title: action.text.trim()
      }]
    }
  }
}

export const appReducer: Reducer<TierState, Action> = (state: TierState, action: Action): TierState => {
  switch (action.op) {
    case Op.PLACE:
      return transitions[action.op](state, action)
    case Op.REMOVE:
      return transitions[action.op](state, action)
    case Op.ADD:
      return transitions[action.op](state, action)
  }
}