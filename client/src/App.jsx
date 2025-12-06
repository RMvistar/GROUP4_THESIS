import { useState } from 'react'
import SampleComponent from './components/SampleComponent.jsx'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <SampleComponent />
    </>
  )
}

export default App
