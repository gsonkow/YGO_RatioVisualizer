import { useState } from 'react'
import './App.css'

const CARDS_OPENED = 5
const DEFAULT_TAGS = ['Hand Trap', 'Starter', 'Extender', 'Brick']

function App() {
  const [deckSize, setDeckSize] = useState(40)
  const [minDeckSize, setMinDeckSize] = useState(6)
  const [cards, setCards] = useState([
    {id: 1, name: 'Ash Blossom & Joyous Spring', quantity: 3., tags: [DEFAULT_TAGS[0]]},
    {id: 2, name: 'Snake-Eye Ash', quantity: 3, tags: [DEFAULT_TAGS[1]]}
  ])

  return (
    <>
      <h1>YGO Ratio Visualizer</h1>
      <div id="calculator">
        Deck Size: <input type="number" min={minDeckSize} value={deckSize} onChange={e => setDeckSize(e.target.value)} />
        <br></br>

        {cards.map((card, index) => {
          return (
            <div id="card" key={index}>
              <input type="text" placeholder='Card Name' value={card.name} onChange={e => {
                const newCards = [...cards]
                newCards[index].name = e.target.value
                setCards(newCards)
              }} />
              <input type="number" value={card.quantity} min="0" onChange={e => {
                const newCards = [...cards]
                newCards[index].quantity = e.target.value
                setCards(newCards)
                const totalQuantity = newCards.reduce((sum, card) => sum + parseInt(card.quantity || 0, 10), 0)
                setMinDeckSize(totalQuantity)
                if (deckSize < totalQuantity) { setDeckSize(totalQuantity) }
              }} />
              <select value={card.tags} onChange={e => {
                const newCards = [...cards]
                newCards[index].tags = e.target.value
                setCards(newCards)
              }
              }>
                <option value="Hand Trap">Hand Trap</option>
                <option value="Starter">Starter</option>
                <option value="Extender">Extender</option>
                <option value="Brick">Brick</option>
              </select>
            </div>
          )
        })}

        <button onClick={() => {
          setCards([...cards, {id: cards.length + 1, name: '', quantity: 1}])
          const totalQuantity = [...cards, {id: cards.length + 1, name: '', quantity: 1}].reduce((sum, card) => sum + parseInt(card.quantity || 0, 10), 0)
          setMinDeckSize(totalQuantity)
          if (deckSize < totalQuantity) { setDeckSize(totalQuantity) }
          }}>Add Card</button>

      </div>
      <div id='result'>
        
      </div>
    </>
  )
}

// TODO: add ydke functionality

function calculateProbabilities(deckSize, cardQuantity) {
  
}

function factorial(n) {
  return n > 1 ? n * factorial(n - 1) : 1
}

function combination(m, n) {
  return factorial(m) / (factorial(n) * factorial(m - n))
}

function hypergeometric(N, K, n, k) {
  return (combination(K, k) * combination(N - K, n - k)) / combination(N, n)
}

export default App
