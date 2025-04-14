import { useState, useEffect } from 'react'
import CreatableSelect from 'react-select/creatable'
import makeAnimated from 'react-select/animated'
import * as ydke from 'ydke'
import './App.css'

const CARDS_OPENED = 5
// OPT currently must be first in this list
const DEFAULT_TAGS = [
  'Once per turn',
  'Bad Draw Going First',
  'Bad Draw Going Second',
  'Hand Trap', 
  'Board Breaker', 
  'Starter',
  'Extender',
]

function App() {
  //Calculator States
  //const [outputMessage, setOutputMessage] = useState('No cards selected')
  const [deckSize, setDeckSize] = useState(40)
  const [minDeckSize, setMinDeckSize] = useState(6)
  const [numOfEngines, setNumOfEngines] = useState(1)
  const [tags, setTags] = useState(DEFAULT_TAGS.map(tag => ({ value: tag, label: tag })))
  const [cards, setCards] = useState([
    {id: 1, name: 'Effect Veiler', quantity: 3., tags: [tags[3]]},
    {id: 2, name: 'Snake-Eye Ash', quantity: 3, tags: [tags[0], tags[5]]},
  ])

  //Importing YDKE States
  const [importing, setImporting] = useState(false)
  const [importMessage, setImportMessage] = useState('Import YDKE URL')
  const [ydkeURL, setYDKEURL] = useState('')
  const [importCardsQuantity, setImportCardsQuantity] = useState(null)
  const [ygoApiData, setYgoApiData] = useState(null)


  //TODO: validate tag input and clean input
  const handleCreateTag = (inputValue) => {
    const newTag = { value: inputValue, label: inputValue }
    setTags((prevTags) => [...prevTags, newTag])
  }

  //TODO: cleanup
  function importYDKE(url) {
    var passcodes = []
    setImporting(true)
    try {
      passcodes = ydke.parseURL(url)['main']
      console.log('IDs:', passcodes)
    } catch (error) {
      console.error('Error parsing YDKE URL:', error)
      setImportMessage('Invalid YDKE URL')
      setImporting(false)
      return
    }
    
    setImportCardsQuantity(Array.from(passcodes.reduce((map, passcode) => {
      map.set(passcode, (map.get(passcode) || 0) + 1)
      return map
    }, new Map())).map(([passcode, quantity]) => ({
      passcode,
      quantity,
    })))

    const uniquePasscodes = [...new Set(passcodes)].join(', ')
    
    setImportMessage('Importing YDKE URL...')
    fetch('https://db.ygoprodeck.com/api/v7/cardinfo.php?id=' + uniquePasscodes)
      .then(response => response.json())
      .then(json => setYgoApiData(json))
      .then(setImporting(false))
      .then(setImportMessage('Import YDKE URL'))
      .catch(error => {
        console.error('Error fetching card data:', error)
        setImportMessage('Sorry!, failed to fetch card data')
      })

  }

  useEffect(() => {
    if (ygoApiData && importCardsQuantity) {
      const newCards = ygoApiData.data.map(card => {
      const importedCard = importCardsQuantity.find(imported => imported.passcode === card.id)
      return {
        id: card.id,
        name: card.name,
        quantity: importedCard ? importedCard.quantity : 1,
        tags: []
      }
      })
      setCards(newCards)
      setDeckSize(newCards.reduce((sum, card) => sum + card.quantity, 0))
    }
  }, [ygoApiData])

  useEffect(() => {
    const engineTags = Array.from({ length: numOfEngines }, (_, i) => ({
      value: `Engine ${i + 1}`,
      label: `Engine ${i + 1}`
    }));
    const customTags = tags.filter(tag => 
      !DEFAULT_TAGS.some(defaultTag => defaultTag === tag.value) &&
      !engineTags.some(engineTag => engineTag.value === tag.value) &&
      !/^Engine \d+$/.test(tag.value)
    );
    setTags([...DEFAULT_TAGS.map(tag => ({ value: tag, label: tag })), ...engineTags, ...customTags]);
  }, [numOfEngines])

  return (
    <>
      <h1>YGO Ratio Visualizer</h1>
      <div id="calculator">
        <button disabled={importing} onClick={() => importYDKE(ydkeURL)}>{importMessage}</button>
        &emsp;<input type="text" placeholder='YDKE URL' value={ydkeURL} onChange={e => setYDKEURL(e.target.value)}/>
        <br></br>
        Deck Size: <input type="number" min={minDeckSize} value={deckSize} style={{width: '50px'}} onChange={e => setDeckSize(e.target.value)} />
        &emsp;
        Number of Engines: <input type="number" min="1" value={numOfEngines} style={{width: '50px'}} onChange={e => setNumOfEngines(e.target.value)} />

        {cards.map((card, index) => {
          return (
            <div id="card" key={index} style={{ display: 'grid', gridTemplateColumns: '1.5fr 50px 1fr', alignItems: 'center'}}>
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
                    width: 'fit-content',
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
          setCards([...cards, {id: cards.length + 1, name: '', quantity: 1, tags: []}])
          const totalQuantity = [...cards, {id: cards.length + 1, name: '', quantity: 1}].reduce((sum, card) => sum + parseInt(card.quantity || 0, 10), 0)
          setMinDeckSize(totalQuantity)
          if (deckSize < totalQuantity) { setDeckSize(totalQuantity) }
          }}>Add Card</button>

      </div>
      <br></br>
      <div id='result'>
        {calculateProbabilities(cards, deckSize, tags)}
      </div>
      <footer>
        Built with <a href="https://www.npmjs.com/package/ydke" target='_blank'>ydke.js</a> and <a href='https://ygoprodeck.com/api-guide/' target='_blank'>Yu-Gi-Oh! API by YGOPRODeck</a> 
      </footer>
    </>
  )
}



function calculateProbabilities(cards, deckSize, tags) {
  var probPerTag = new Array(tags.length).fill(0)
  
  for (let i = 0; i < cards.length; i++) {
    const card = cards[i]
    if (card.tags.includes(tags[0])) {
      probPerTag[0] += hypergeometricAtLeast(deckSize, card.quantity, CARDS_OPENED, 2)
    }
    for (let j = 1; j < tags.length; j++) {
      const tag = tags[j]
      if (card.tags.includes(tag)) {
        probPerTag[j] += hypergeometricAtLeast(deckSize, card.quantity, CARDS_OPENED, 1)
      }
    }
  }
  return (tags.map(tag => tag.label + ': ' + probPerTag[tags.indexOf(tag)])).join("  ")

}

function factorial(n) {
  return n > 1 ? n * factorial(n - 1) : 1
}

function combination(m, n) {
  return factorial(m) / (factorial(n) * factorial(m - n))
}

/*
  Hypergeometric Distribution
    N: The total size of the population.
    K: The total number of "successes" in the population.
    n: The number of draws (samples) taken from the population.
    k: The number of "successes" observed in the sample
*/
function hypergeometric(N, K, n, k) {
  return (combination(K, k) * combination(N - K, n - k)) / combination(N, n)
}

/*
  Hypergeometric Distribution for at least k successes
    N: The total size of the population.
    K: The total number of "successes" in the population.
    n: The number of draws (samples) taken from the population.
    k: The minimum number of "successes" observed in the sample
*/
function hypergeometricAtLeast(N, K, n, k) {
  let probability = 0;
  for (let i = k; i <= Math.min(K, n); i++) {
    probability += hypergeometric(N, K, n, i);
  }
  return probability;
}

export default App
