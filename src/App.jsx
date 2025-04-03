import { useState } from 'react'
import './App.css'

const CARDS_OPENED = 5

function App() {
  const [deckSize, setDeckSize] = useState(40)
  // PLACEHOLDER FOR HARD CODED CARD
  const [tempCardQuantity, setTempCardQuantity] = useState(3)

  return (
    <>
      <h1>YGO Ratio Visualizer</h1>
      <div className="calculator">
        Deck Size: <input type="number" value={deckSize} onChange={e => setDeckSize(e.target.value)} />
        <br></br>
        
        <input type="text" placeHolder='Card Name' value='Ash Blossom & Joyous Spring' />
        <input type="number" value={tempCardQuantity} onChange={e => setTempCardQuantity(e.target.value)} />
      </div>
      <div className='result'>
        
      </div>
    </>
  )
}

function calculateProbabilities(deckSize, cardQuantity) {
  
}

function factorial(n){
  return n > 1 ? n * factorial(n - 1) : 1
}

function combination(m, n) {
  return factorial(m) / (factorial(n) * factorial(m - n))
}

function hypergeometric(N, K, n, k) {
  return (combination(K, k) * combination(N - K, n - k)) / combination(N, n)
}

export default App
