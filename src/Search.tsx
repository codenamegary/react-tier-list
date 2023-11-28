import { FormEvent, useState } from "react"
import { useTierList } from "./TierListContext"
import { AddText } from "./AddText"
import { useAnalytics } from "./analytics"

const apiKey = import.meta.env.VITE_GOOGLE_SEARCH_API_KEY
const searchEngineId = import.meta.env.VITE_GOOGLE_SEARCH_ENGINE_ID
const baseUrl = `https://customsearch.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&searchType=image`

export const Search: React.FC = () => {

  const { dragStart } = useTierList()
  const tracker = useAnalytics('search')

  const googleIcon = '/google.svg'

  const [text, setText] = useState("")
  const [images, setImages] = useState<GoogleSearchItem[]>([])
  const [searching, setSearching] = useState(false)
  const [nextSearchUrl, setNextSearchUrl] = useState<string>()
  const [error, setError] = useState<string>()

  const baseSearchUrl = (searchText?: string) => `${baseUrl}&q=${encodeURI(searchText || text)}`

  const insertPlaceholders = () => {
    const existingPlaceHolders = images.filter(i => i.image.thumbnailLink === "/ninja.svg")
    if (existingPlaceHolders.length > 0) return
    const placeholders: GoogleSearchItem[] = Array(10).fill({
      image: {
        thumbnailLink: googleIcon
      }
    } as GoogleSearchItem, 0, 10)
    setImages(prev => [...prev, ...placeholders])
  }

  const removePlaceholders = () => {
    setImages(prev => prev.filter(i => i.image.thumbnailLink !== googleIcon))
  }

  const search = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    tracker("execute", text)
    try {
      setImages([])
      setError("")
      insertPlaceholders()
      setSearching(true)
      const results = await fetch(baseSearchUrl())
      const data = await results.text()
      const response: GoogleSearchResponse = JSON.parse(data)
      removePlaceholders()
      setImages(response.items)
      const nextStart = response.queries.nextPage[0].startIndex
      setNextSearchUrl(`${baseSearchUrl(response.queries.request[0].searchTerms)}&start=${nextStart}`)
      setSearching(false)
    } catch (e) {
      setError("Look like something went wrong. Try that again in a minute.")
      removePlaceholders()
      setSearching(false)
    }
  }

  const searchMore = async () => {
    if (!nextSearchUrl) return
    try {
      insertPlaceholders()
      const results = await fetch(nextSearchUrl)
      const data = await results.text()
      const response: GoogleSearchResponse = JSON.parse(data)
      removePlaceholders()
      setImages(prev => [...prev, ...response.items])
      const nextStart = response.queries.nextPage[0].startIndex
      setNextSearchUrl(`${baseSearchUrl(response.queries.request[0].searchTerms)}&start=${nextStart}`)
    } catch (e) {
      setError("Look like something went wrong. Try that again in a minute.")
      removePlaceholders()
      setSearching(false)
    }
  }

  return (
    <>
      <div style={{ display: "flex", flexDirection: "row" }}>
        <AddText />
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
            {!!error && <p className="search-error">{error}</p>}
          </form>
        </div>
      </div>
      <div>
        <div className='search-results'>
          {searching ? <div style={{ display: "block", width: "100%" }}><span className='loader'></span></div> : <></>}
          {images.map((img, idx) =>
            <img key={`img-search-${idx}`} src={img.image.thumbnailLink} onDragStart={() => dragStart()} crossOrigin='anonymous' />
          )}
          {images.length > 0 ? <span onClick={() => searchMore()} className='search-more'>more</span> : ""}
        </div>
      </div >
    </>
  )
}