import React from 'react'
import { TierList } from './TierList'
import { Search } from './Search'
import './theme.css'
import { TierListProvider } from './TierListContext'

const App: React.FC = () => {
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