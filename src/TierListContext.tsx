import { ReactNode, createContext, useContext, useReducer } from "react"
import { NewThing, Thing, Tier } from "./TierSchema"
import { Op, init, tierListReducer } from "./TierListReducer"

type TierListContextType = {
  tiers: Tier[]
  things: Thing[]
  dragging: boolean
  draggedThing: Thing | null
  place: (thing: Thing, tier: Tier) => Promise<void>
  add: (thing: NewThing, tier?: Tier) => Promise<void>
  remove: (thing: Thing) => Promise<void>
  dragStart: (thing?: Thing) => Promise<void>
  dragEnd: () => Promise<void>
  deleteAllThings: () => Promise<void>
}

const TierListContext = createContext<TierListContextType>(null!)

export const TierListProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

  const [state, dispatch] = useReducer(tierListReducer, null, init)

  const place = async (thing: Thing, tier: Tier) => dispatch({ op: Op.PLACE, thing: thing, tier: tier })
  const add = async (thing: NewThing, tier?: Tier) => dispatch({ op: Op.ADD, thing: thing, tier })
  const remove = async (thing: Thing) => dispatch({ op: Op.REMOVE, thing: thing })
  const dragStart = async (thing?: Thing) => dispatch({ op: Op.DRAG_START, thing: thing })
  const dragEnd = async () => dispatch({ op: Op.DRAG_END })
  const deleteAllThings = async () => dispatch({ op: Op.DELETE_ALL_THINGS })

  return (
    <TierListContext.Provider value={{
      tiers: state.tiers,
      things: state.things,
      dragging: state.dragging,
      draggedThing: state.draggedThing,
      place, add, remove, dragStart, dragEnd, deleteAllThings
    }}>
      {children}
    </TierListContext.Provider>
  )
}

export const useTierList = () => useContext(TierListContext)