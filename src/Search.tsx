import { FormEvent, useState } from "react"

const apiKey = import.meta.env.VITE_GOOGLE_SEARCH_API_KEY
const searchEngineId = import.meta.env.VITE_GOOGLE_SEARCH_ENGINE_ID
const baseUrl = `https://customsearch.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&searchType=image`

export const Search: React.FC = () => {

  const [text, setText] = useState("")
  const [images, setImages] = useState<GoogleSearchItem[]>([])
  const [searching, setSearching] = useState(false)
  const [nextSearchUrl, setNextSearchUrl] = useState<string>()

  const baseSearchUrl = () => `${baseUrl}&q=${encodeURI(text)}`

  const search = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setImages([])
    setSearching(true)
    const results = await fetch(baseSearchUrl())
    const data = await results.text()
    const response: GoogleSearchResponse = JSON.parse(data)
    setImages(response.items)
    const nextStart = response.queries.nextPage[0].startIndex
    setNextSearchUrl(`${baseSearchUrl()}&start=${nextStart}`)
    setSearching(false)
  }

  const searchMore = async () => {
    if (!nextSearchUrl) return
    const results = await fetch(nextSearchUrl)
    const data = await results.text()
    const response: GoogleSearchResponse = JSON.parse(data)
    setImages(prev => [...prev, ...response.items])
    const nextStart = response.queries.nextPage[0].startIndex
    setNextSearchUrl(`${baseSearchUrl()}&start=${nextStart}`)
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
        {searching ? <span className='loader'></span> : <></>}
        {!searching ? images.map(img =>
          <img key={`img-search-${img.image.thumbnailLink}`} src={img.image.thumbnailLink} crossOrigin='anonymous' />
        ) : <></>}
        {images.length > 0 ? <span onClick={() => searchMore()} className='search-more'>more</span> : ""}
      </div>
    </div >
  )
}