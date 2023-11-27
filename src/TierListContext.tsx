import { ReactNode, createContext, useContext, useReducer } from "react"
import { NewThing, Thing, Tier } from "./TierSchema"
import { Op, init, tierListReducer } from "./TierListReducer"

const loaderTime = 1000;

type TierListContextType = {
  tiers: Tier[]
  things: Thing[]
  loading: boolean
  dragging: boolean
  draggedThing: Thing | null
  place: (thing: Thing, tier: Tier) => Promise<void>
  add: (thing: NewThing, tier?: Tier) => Promise<void>
  remove: (thing: Thing) => Promise<void>
  dragStart: (thing?: Thing) => Promise<void>
  dragEnd: () => Promise<void>
  deleteAllThings: () => Promise<void>
  load: (f: File) => Promise<void>
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
  const load = async (f: File) => {
    dispatch({ op: Op.LOADING_START })
    const reader = new FileReader()
    reader.onloadend = () => {
      const raw = reader.result as string
      setTimeout(() => {
        dispatch({ op: Op.LOAD, schemaJson: raw })
      }, loaderTime)
    }
    reader.readAsText(f)
  }

  return (
    <TierListContext.Provider value={{
      ...state,
      load, place, add, remove, dragStart, dragEnd, deleteAllThings
    }}>
      {children}
    </TierListContext.Provider>
  )
}

export const useTierList = () => useContext(TierListContext)