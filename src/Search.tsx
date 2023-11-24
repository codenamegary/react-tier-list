import { FormEvent, useState } from "react"

const apiKey = import.meta.env.VITE_GOOGLE_SEARCH_API_KEY
const searchEngineId = import.meta.env.VITE_GOOGLE_SEARCH_ENGINE_ID
const baseUrl = `https://customsearch.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&searchType=image`

export const Search: React.FC = () => {

  const [text, setText] = useState("")
  const [images, setImages] = useState<GoogleSearchItem[]>([])

  const search = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const url = `${baseUrl}&q=${encodeURI(text)}`
    const results = await fetch(url)
    const data = await results.text()
    const response: GoogleSearchResponse = JSON.parse(data)
    setImages(response.items)
  }

  return (
    <div className='search'>
      <form onSubmit={search}>
        <input
          id="search-text"
          name="search-text"
          type="text"
          className='search-thing'
          placeholder='search for a thing'
          onChange={(e) => setText(e.target.value)}
          value={text}
        />
      </form>
      <div className='search-results'>
        {images.map(img => <div><img src={img.image.thumbnailLink} /></div>)}
      </div>
    </div>
  )
}