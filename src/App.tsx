import React, { FormEvent, useReducer, useState } from 'react'
import { Op, appReducer, init } from './AppReducer'
import { Thing, Tier } from './TierSchema'
import './theme.css'


type ThingCellProps = {
  thing: Thing
  dragStart: (thing: Thing) => void
}

const ThingCell: React.FC<ThingCellProps> = ({ thing, dragStart }) => {
  return (
    <span
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("thingId", thing.id)
        dragStart(thing)
      }}
      className='tier-label thing-cell'
    >
      {thing.title}
    </span>
  )
}

type TierRowProps = {
  tier: Tier
  things: Thing[]
  move: (thing: Thing, tier: Tier) => void
  dragStart: (thing: Thing) => void
  dragEnd: () => void
}

const TierRow: React.FC<TierRowProps> = ({ tier, things, move, dragStart, dragEnd }) => {

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
        dragEnd()
      }}
    >
      <span className='tier-label'>{tier.title}</span>
      {things.filter(filter).map(t => <ThingCell key={`key-thing-${t.title}`} thing={t} dragStart={dragStart} />)}
    </div>
  )
}

export const App: React.FC = () => {

  const [state, dispatch] = useReducer(appReducer, null, init)
  const [text, setText] = useState("")

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

  const dragStart = async (thing: Thing) => {
    dispatch({ op: Op.DRAG_START, thing: thing })
  }

  const dragEnd = () => {
    dispatch({ op: Op.DRAG_END })
  }

  // Just ordering the array so that numbered
  // tiers are at the top and the queue is
  // at the bottom.
  const tiers = [
    ...(state.tiers.filter(t => t.row > 0)?.sort((t1, t2) => t1.row - t2.row)),
    ...(state.tiers.filter(t => t.row === 0))
  ]

  return (
    <div
      className='tier-list'
      style={{ width: "100%" }}
    >
      {tiers.map(tier =>
        <TierRow
          key={`tier-${tier.row}`}
          tier={tier}
          things={state.things}
          move={move}
          dragStart={dragStart}
          dragEnd={dragEnd}
        />)
      }
      <div
        className={`trash${state.dragging ? '' : ' hidden'}`}
        onDragOver={(e) => {
          e.preventDefault()
          e.currentTarget.classList.add('hovering')
        }}
        onDragLeave={(e) => {
          e.preventDefault()
          e.currentTarget.classList.remove('hovering')
        }}
        onDrop={() => {
          const thing = state.dragging
          if (!thing) return
          remove(thing)
          dragEnd()
        }}
      >
        <img src='/trash.svg' />
      </div>
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
