type GoogleSearchRequest = {
  title: string
  totalResults: string
  searchTerms: string
  count: number
  startIndex: number
  inputEncoding: string
  outputEncoding: string
  safe: "on" | "off"
  cx: string
  searchType: string
}

type GoogleSearchQuery = {
  request: GoogleSearchRequest[]
  nextPage: GoogleSearchRequest[]
}

type GoogleSearchUrl = {
  type: string
  template: string
}

type GoogleSearchContext = {
  title: string
}

type GoogleSearchInformation = {
  searchTime: number
  formattedSearchTime: string
  totalResults: string
  formattedTotalResults: string
}

type GoogleSearchItemImage = {
  contextLink: string
  height: number
  width: number
  byteSize: number
  thumbnailLink: string
  thumbnailHeight: number
  thumbnailWidth: number
}

type GoogleSearchItem = {
  kind: string
  title: string
  htmlTitle: string
  link: string
  displayLink: string
  snippet: string
  htmlSnippet: string
  mime: string
  fileFormat: string
  image: GoogleSearchItemImage
}

type GoogleSearchResponse = {
  kind: string
  url: GoogleSearchUrl
  queries: GoogleSearchQuery
  context: GoogleSearchContext
  searchInformation: GoogleSearchInformation
  items: GoogleSearchItem[]
}