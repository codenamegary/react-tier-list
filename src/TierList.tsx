import React, { FormEvent, ReactNode, useReducer, useState } from 'react'
import { Op, tierListReducer, init } from './TierListReducer'
import { NewThing, Thing, Tier } from './TierSchema'
import { newThingsFromFileList } from './files'

const ThingDisplayImage: React.FC<{ thing: Thing }> = ({ thing }) => {
  return <img src={thing.dataUrl} />
}

const ThingDisplayText: React.FC<{ thing: Thing }> = ({ thing }) => {
  return <span>{thing.title}</span>
}

const getThingDisplay = (thing: Thing): ReactNode => {
  switch (thing.type) {
    case 'text':
      return ThingDisplayText({ thing })
    case 'image':
      return ThingDisplayImage({ thing })
  }
}

type ThingCellProps = {
  thing: Thing
  dragStart: (thing: Thing) => void
}

const ThingCell: React.FC<ThingCellProps> = ({ thing, dragStart }) => {

  const display = getThingDisplay(thing)

  return (
    <span
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("thingId", thing.id)
        dragStart(thing)
      }}
      className='tier-label thing-cell'
    >
      {display}
    </span>
  )
}

type TierRowProps = {
  tier: Tier
  things: Thing[]
  move: (thing: Thing, tier: Tier) => void
  add: (thing: NewThing, tier: Tier) => void
  dragStart: (thing: Thing) => void
  dragEnd: () => void
}

const TierRow: React.FC<TierRowProps> = ({ tier, things, move, add, dragStart, dragEnd }) => {

  const [draggingOver, setDraggingOver] = useState(false)

  const filter = (t: Thing) =>
    t.place?.row === tier.row
    || t.place === undefined
    && tier.row === 0

  return (
    <div
      style={{ background: `${tier.hexColor}` }}
      className={`tier-row${draggingOver ? ' dragging-over' : ''}`}
      onDragOver={(e) => {
        e.preventDefault()
        setDraggingOver(true)
      }}
      onDragLeave={(e) => {
        e.preventDefault()
        setDraggingOver(false)
      }}
      onDrop={async (e) => {
        setDraggingOver(false)
        const thingId = e.dataTransfer.getData('thingId')
        const thing = things.find(v => v.id === thingId)
        if (thing) {
          move(thing, tier)
          dragEnd()
          return
        }
        const fileThings = await newThingsFromFileList(e.dataTransfer.files)
        await Promise.all(fileThings.map(async (t) => {
          add(t, tier)
        }))
        dragEnd()
      }}
    >
      <span className='tier-label'>{tier.title}</span>
      {things.filter(filter).map(t => <ThingCell key={`key-thing-${t.id}`} thing={t} dragStart={dragStart} />)}
    </div>
  )
}

export const TierList: React.FC = () => {

  const [state, dispatch] = useReducer(tierListReducer, null, init)
  const [text, setText] = useState("")

  const move = async (thing: Thing, tier: Tier) => {
    dispatch({ op: Op.PLACE, thing: thing, tier: tier })
  }

  const remove = async (thing: Thing) => {
    dispatch({ op: Op.REMOVE, thing: thing })
  }

  const addThing = async (thing: NewThing, tier: Tier) => {
    dispatch({ op: Op.ADD, thing: thing, tier: tier })
  }

  const add = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const text = data.get("add-text")
    if (!text) return
    const thing: NewThing = {
      title: text.toString().trim(),
      type: "text"
    }
    dispatch({ op: Op.ADD, thing: thing })
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

  const destroy = () => {
    dispatch({ op: Op.RESET_THINGS })
  }

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
          add={addThing}
          dragStart={dragStart}
          dragEnd={dragEnd}
        />)
      }
      <div
        className={`top-right trash${state.dragging ? '' : ' hidden'}`}
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
      <div
        className={`top-right settings${state.dragging ? ' hidden' : ''}`}
      >
        <img src="/ninja.svg" title="Settings" />
        <img src="/destroy.svg" title="Delete all the things! \o/" onClick={destroy} />
        <input type="text" placeholder='name this list' />
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
