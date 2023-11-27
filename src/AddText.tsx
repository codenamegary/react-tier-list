import { FormEvent, useState } from "react"
import { NewThing } from "./TierSchema"
import { useTierList } from "./TierListContext"

export const AddText: React.FC = () => {

  const { add } = useTierList()
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

  return (
    <div className='add-form'>
      <form onSubmit={addText}>
        <input
          id="add-text"
          name="add-text"
          type="text"
          className='add-thing'
          placeholder='add a text thing'
          onChange={(e) => setText(e.target.value)}
          value={text}
        />
      </form>
    </div>
  )
}