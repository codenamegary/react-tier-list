import React, { ChangeEvent, ReactNode, useRef, useState } from 'react'
import { newThingsFromFileList } from './files'
import { useTierList } from './TierListContext'
import { Thing, Tier } from './TierSchema'

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

  const { tiers, things, dragging, draggedThing, loading, load, remove, dragEnd, deleteAllThings } = useTierList()

  const fileInput = useRef<HTMLInputElement>(null)

  // Just ordering the array so that numbered
  // tiers are at the top and the queue is
  // at the bottom.
  const sortedTiers = [
    ...(tiers.filter(t => t.row > 0)?.sort((t1, t2) => t1.row - t2.row)),
    ...(tiers.filter(t => t.row === 0))
  ]

  const download = () => {
    const data = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify({ tiers: tiers, things: things }))}`
    const elem = document.createElement('a')
    elem.href = data
    elem.download = "tier-list.json"
    document.body.appendChild(elem)
    elem.click()
    document.body.removeChild(elem)
  }

  const open = () => {
    if (!fileInput.current) return
    fileInput.current.click()
  }

  const openFile = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length <= 0) return
    const f = e.target.files[0]
    load(f)
  }

  return (
    <>
      <div
        className={`tier-list${dragging ? ' dragging' : ''}${loading ? ' loading' : ''}`}
        style={{ width: "100%" }}
      >
        <div className={`loading-text`}>
          <span className='loader'></span>
          Loading...
        </div>
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
          <img src="/die.svg" title="Delete all the things! \o/" onClick={deleteAllThings} className='destroy' />
          <img src="/json.svg" title="Download" onClick={download} className='download' />
          <img src="/import.svg" title="Import" onClick={open} className='load' />
          <input
            type="file"
            style={{ visibility: "hidden" }}
            ref={fileInput}
            accept='.json,application/json,text/json'
            onChange={openFile}
          />
          {/* <input type="text" placeholder='name this list' /> */}
        </div>
      </div>
    </>
  )
}
