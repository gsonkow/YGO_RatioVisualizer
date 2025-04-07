import { useState } from 'react'
import CreatableSelect from 'react-select/creatable'
import makeAnimated from 'react-select/animated'
import './App.css'

const CARDS_OPENED = 5
const DEFAULT_TAGS = ['Hand Trap', 'Starter', 'Extender', 'Brick']

function App() {
  const [deckSize, setDeckSize] = useState(40)
  const [minDeckSize, setMinDeckSize] = useState(6)
  const [tags, setTags] = useState(DEFAULT_TAGS.map(tag => ({ value: tag, label: tag })))
  const [cards, setCards] = useState([
    {id: 1, name: 'Ash Blossom & Joyous Spring', quantity: 3., tags: [tags[0]]},
    {id: 2, name: 'Snake-Eye Ash', quantity: 3, tags: [tags[1]]}
  ])

  //TODO: validate tag input and clean input
  const handleCreateTag = (inputValue) => {
    const newTag = { value: inputValue, label: inputValue }
    setTags((prevTags) => [...prevTags, newTag])
  }

  return (
    <>
      <h1>YGO Ratio Visualizer</h1>
      <div id="calculator">
        {/*TODO: add ydke functionality*/}
        <button>Import YDKE url</button>
        &emsp;<input type="text" placeholder='YDKE url' />
        <br></br>
        Deck Size: <input type="number" min={minDeckSize} value={deckSize} onChange={e => setDeckSize(e.target.value)} />
        <br></br>

        {cards.map((card, index) => {
          return (
            <div id="card" key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 50px 1fr', alignItems: 'center'}}>
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
              <CreatableSelect 
                value={card.tags} 
                styles={{
                  control: (base) => ({
                    ...base,
                    backgroundColor: '#2b2a33',
                    fontSize: '1rem',
                    paggidng: '0.5rem',
                    margin: '0.5rem 0',
                    border: '1px solid #ccc',
                    color: 'white',
                    boxShadow: 'none',
                    '&:hover': {
                      border: '1px solid #ccc',
                    }
                  }),
                  option: (base, state) => ({
                    ...base,
                    margin: '0',
                    padding: 0,
                    backgroundColor: state.isFocused ? '#494759' : '#2b2a33',
                    color: 'white',
                    cursor: 'pointer',
                  }),
                  menu: (base) => ({
                    ...base,
                    margin: '0',
                    backgroundColor: '#2b2a33',
                    color: 'white'
                  }),
                  multiValue: (base) => ({
                    ...base,
                    backgroundColor: '#494759',
                    color: 'white'
                  }),
                  multiValueLabel: (base) => ({
                    ...base,
                    color: 'white'
                  }),
                }}
                isClearable
                isMulti 
                options={tags} 
                closeMenuOnSelect={false} 
                components={makeAnimated()}
                onCreateOption={handleCreateTag}
                onChange={newValue => {
                  const newCards = [...cards]
                  newCards[index].tags = newValue
                  setCards(newCards)
                }}
                placeholder='Tags'
              />
            </div>
          )
        })}
        <br></br>
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



function calculateProbabilities(deckSize, cardQuantity) {
  //TODO
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
