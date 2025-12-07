import { useState } from 'react'
import SampleComponent from './components/SampleComponent.jsx'
import NavigationBar from './components/NavigationBar.jsx'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <NavigationBar />
      <div className="body-container">
        
      </div>
    </>
  )
}

export default App
