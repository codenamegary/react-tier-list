import React, { FormEvent, useEffect, useReducer, useState } from 'react'
import { Thing, Tier, TierSchema } from './TierSchema'
import { Op, appReducer } from './AppReducer'
import { v4 as uuidv4 } from 'uuid'
import './theme.css'

const storageId = 'tier-list'

const save = (schema: TierSchema) => {
  localStorage.setItem(storageId, JSON.stringify(schema))
}

const load = (): TierSchema | undefined => {
  const data = localStorage.getItem(storageId)
  if (!data) return undefined
  return JSON.parse(data)
}

const ThingCell: React.FC<{ thing: Thing, remove: (thing: Thing) => void }> = ({ thing, remove }) => {
  return (
    <span
      draggable
      onDragStart={(e) => e.dataTransfer.setData("thingId", thing.id)}
      className='tier-label thing-cell'
    >
      <span className='remove' onClick={() => remove(thing)} title={`Remove ${thing.title} from this list...`}>x</span>
      {thing.title}
    </span>
  )
}

type TierRowProps = {
  tier: Tier,
  things: Thing[],
  move: (thing: Thing, tier: Tier) => void
  remove: (thing: Thing) => void
}

const TierRow: React.FC<TierRowProps> = ({ tier, things, move, remove }) => {

  const [draggingOver, setDraggingOver] = useState(false)

  const filter = (t: Thing) => {
    return t.place?.row === tier.row || t.place === undefined && tier.row === 0
  }

  const rowStyle = (tier: Tier): React.CSSProperties => {
    return {
      background: `${tier.hexColor}`,
      display: 'flex',
      flexDirection: 'row'
    }
  }

  return (
    <div
      style={rowStyle(tier)}
      className={`${draggingOver ? 'dragging-over' : ''}`}
      onDragOver={(e) => {
        e.preventDefault()
        setDraggingOver(true)
      }}
      onDragLeave={(e) => {
        e.preventDefault()
        setDraggingOver(false)
      }}
      onDrop={(e) => {
        setDraggingOver(false)
        const thingId = e.dataTransfer.getData('thingId')
        const thing = things.find(v => v.id === thingId)
        if (!thing) return
        move(thing, tier)
      }}
    >
      <span className='tier-label'>{tier.title}</span>
      {things.filter(filter).map(t => <ThingCell key={`key-thing-${t.title}`} thing={t} remove={remove} />)}
    </div>
  )
}

export const App: React.FC = () => {

  const init = () => {
    const fromStorage = load()
    if (fromStorage) {
      return {
        ...fromStorage,
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
      loading: false
    }
  }
  const [state, dispatch] = useReducer(appReducer, null, init)
  const [text, setText] = useState("")

  useEffect(() => {
    save(state)
  }, [state])

  const move = async (thing: Thing, tier: Tier) => {
    dispatch({ op: Op.PLACE, thing: thing, tier: tier })
  }

  const remove = async (thing: Thing) => {
    dispatch({ op: Op.REMOVE, thing: thing })
  }

  const add = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const text = data.get("add-text")
    if (!text) return
    dispatch({ op: Op.ADD, text: text.toString() })
    setText("")
  }

  return (
    <div style={{ width: "100%" }}>
      {state.tiers.filter(t => t.row > 0)?.sort((t1, t2) => t1.row - t2.row).map(tier =>
        <TierRow
          key={`tier-${tier.row}`}
          tier={tier}
          things={state.things}
          move={move}
          remove={remove}
        />)
      }
      {state.tiers.filter(t => t.row === 0)?.map(tier =>
        <TierRow
          key={`tier-${tier.row}`}
          tier={tier}
          things={state.things}
          move={move}
          remove={remove}
        />)
      }
      <div className='add-form'>
        <form onSubmit={add}>
          <input
            id="add-text"
            name="add-text"
            type="text"
            className='add-thing'
            placeholder='add a thing'
            onChange={(e) => setText(e.target.value)}
            value={text}
          />
        </form>
      </div>
    </div>
  )
}

export default App
