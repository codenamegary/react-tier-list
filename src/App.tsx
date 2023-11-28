import React, { useEffect } from 'react'
import { TierList } from './TierList'
import { Search } from './Search'
import './theme.css'
import { TierListProvider } from './TierListContext'
import { analyticsInit, pageview } from './analytics'

const App: React.FC = () => {

  useEffect(() => {
    analyticsInit()
    pageview("/", "Home")
  }, [])

  return (
    <div>
      <TierListProvider>
        <TierList />
        <Search />
      </TierListProvider>
    </div>
  )
}

export default App