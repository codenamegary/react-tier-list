import React, { FormEvent, ReactNode, useState } from 'react'
import { NewThing, Thing, Tier } from './TierSchema'
import { newThingsFromFileList } from './files'
import { useTierList } from './TierListContext'

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
}

const ThingCell: React.FC<ThingCellProps> = ({ thing }) => {

  const { dragStart } = useTierList()
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
}

const TierRow: React.FC<TierRowProps> = ({ tier }) => {

  const { things, place, dragEnd, add } = useTierList()
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
          place(thing, tier)
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
      {things.filter(filter).map(t => <ThingCell key={`key-thing-${t.id}`} thing={t} />)}
    </div>
  )
}

export const TierList: React.FC = () => {

  const { tiers, dragging, draggedThing, remove, add, dragEnd, deleteAllThings } = useTierList()
  const [text, setText] = useState("")

  const addText = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const text = data.get("add-text")
    if (!text) return
    const thing: NewThing = {
      title: text.toString().trim(),
      type: "text"
    }
    add(thing)
    setText("")
  }

  // Just ordering the array so that numbered
  // tiers are at the top and the queue is
  // at the bottom.
  const sortedTiers = [
    ...(tiers.filter(t => t.row > 0)?.sort((t1, t2) => t1.row - t2.row)),
    ...(tiers.filter(t => t.row === 0))
  ]

  return (
    <>
      <div
        className={`tier-list${dragging ? ' dragging' : ''}`}
        style={{ width: "100%" }}
      >
        {sortedTiers.map(tier =>
          <TierRow
            key={`tier-${tier.row}`}
            tier={tier}
          />)
        }
        <div
          className={`top-right trash${dragging ? '' : ' hidden'}`}
          onDragOver={(e) => {
            e.preventDefault()
            e.currentTarget.classList.add('hovering')
          }}
          onDragLeave={(e) => {
            e.preventDefault()
            e.currentTarget.classList.remove('hovering')
          }}
          onDrop={() => {
            if (draggedThing) remove(draggedThing)
            dragEnd()
          }}
        >
          <img src='/trash.svg' />
        </div>
        <div
          className={`top-right settings${dragging ? ' hidden' : ''}`}
        >
          <img src="/ninja.svg" title="Settings" />
          <img src="/destroy.svg" title="Delete all the things! \o/" onClick={deleteAllThings} className='destroy' />
          {/* <input type="text" placeholder='name this list' /> */}
        </div>
      </div>
      <div className='add-form'>
        <form onSubmit={addText}>
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
    </>
  )
}
