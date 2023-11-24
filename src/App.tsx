import React from 'react'
import { TierList } from './TierList'
import { Search } from './Search'
import './theme.css'

const App: React.FC = () => {
  return (
    <div>
      <TierList />
      <Search />
    </div>
  )
}

export default App