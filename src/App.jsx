import { useState, useEffect, use } from 'react'
import CreatableSelect from 'react-select/creatable'
import makeAnimated from 'react-select/animated'
import * as ydke from 'ydke'
import Calculator from './Calculator.jsx'
import './App.css'
import Kofi from './assets/support_me_on_kofi_blue.png'

const EXAMPLE_DECK = "ydke://o6lXBaOpVwWvI94AryPeAK8j3gCglAQC6czIBenMyAXpzMgFsjLMBbIyzAVS94oDIkiZACJImQAiSJkAMdwRATHcEQEx3BEBqniTAooMdAEqlWUBKpVlATUHgwI1B4MCNQeDAhNWxAMTVsQDE1bEAyH2uwF0OV4DdDleA3Q5XgO1dg4BR7x9AEe8fQBHvH0AYmqzAwGvyQQBr8kEAa/JBA==!Vi0OBeYwAgI10JADNdCQA92drgDNQlcFg/jHA5a6cwGBnV4DsUmeBcoavwECXIICAlyCAkjTkAHrqosF!!"
const EXAMPLE_DECK_TAGS = [
  [0, 4],
  [2, 3],
  [0, 4, 7],
  [0, 4],
  [4],
  [0, 4],
  [4],
  [0, 6, 8],
  [3],
  [2, 3],
  [0, 4],
  [2, 4],
  [0, 6, 9],
  [2, 3],
  [0, 6, 9],
  [7],
  [0, 6, 8],
  [2, 3],
  [0, 1, 6, 8]
]

const DEFAULT_TAGS = [
  'Once per turn',
  'Discard Cost/Effect',
  'Bad Draw Going First',
  'Bad Draw Going Second',
  'Hand Trap', 
  'Board Breaker', 
  'Starter',
  'Extender',
]

function App() {
  //Calculator States
  const [deckSize, setDeckSize] = useState(40)
  const [minDeckSize, setMinDeckSize] = useState(40)
  const [numEngines, setNumEngines] = useState(2)
  const [tags, setTags] = useState(DEFAULT_TAGS.map(tag => ({ value: tag, label: tag })))
  const [cards, setCards] = useState([])

  //Importing YDKE States
  const [importing, setImporting] = useState(false)
  const [importMessage, setImportMessage] = useState('Import YDKE URL')
  const [ydkeURL, setYDKEURL] = useState('')
  const [importCardsQuantity, setImportCardsQuantity] = useState(null)
  const [ygoApiData, setYgoApiData] = useState(null)

  //Setup Example deck
  const [setupCounter , setSetupCounter] = useState(0)


  //TODO: validate tag input and clean input
  const handleCreateTag = (inputValue) => {
    const newTag = { value: inputValue, label: inputValue }
    setTags((prevTags) => [...prevTags, newTag])
  }

  function handleEngineChange(num) {
    const engineTags = Array.from({ length: num }, (_, i) => ({
      value: `Engine ${i + 1}`,
      label: `Engine ${i + 1}`
    }));
    const customTags = tags.filter(tag => 
      !DEFAULT_TAGS.some(defaultTag => defaultTag === tag.value) &&
      !engineTags.some(engineTag => engineTag.value === tag.value) &&
      !/^Engine \d+$/.test(tag.value)
    );
    setTags([...DEFAULT_TAGS.map(tag => ({ value: tag, label: tag })), ...engineTags, ...customTags]);
  }

  
  function importYDKE(url) {
    var passcodes = []
    setImporting(true)
    try {
      passcodes = ydke.parseURL(url)['main']
      console.log('Imported IDs:', passcodes)
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
    
    setSetupCounter(setupCounter + 1)

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

  // Api data is used to set cards
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
      if (setupCounter === 1) {
        setCards(newCards.map((card, index) => ({
          ...card,
          tags: EXAMPLE_DECK_TAGS[index].map(tagIndex => tags[tagIndex])
        })))
      }
    }
  }, [ygoApiData])

  // Sets up example deck
  useEffect(() => {
    console.log('Setting up example deck...')
    handleEngineChange(numEngines)
    importYDKE(EXAMPLE_DECK) 
  }, [])


  return (
    <>
      <h1>YGO Ratio Visualizer</h1>
      <a id="Ko-fi" href="https://ko-fi.com/gsonkow" target="_blank"><img src={Kofi} alt="Support Me on Ko-fi"/></a>
      <div id="calculator">
        <button disabled={importing} onClick={() => importYDKE(ydkeURL)}>{importMessage}</button>
        &emsp;<input type="text" style={{width: '50%'}} placeholder='YDKE URL' value={ydkeURL} onChange={e => setYDKEURL(e.target.value)}/>
        <br></br>
        Deck Size: <input type="number" min={minDeckSize} value={deckSize} style={{width: '50px'}} onChange={e => setDeckSize(e.target.value)} />
        &emsp;
        Number of Engines: <input type="number" min="1" value={numEngines} style={{width: '50px'}} onChange={e => {
          setNumEngines(Number(e.target.value))
          handleEngineChange(Number(e.target.value))
          }} />
        &emsp;
        <button onClick={() => {
          setCards([])
          setDeckSize(40)
        }}> Clear Deck </button>

        {/* Card input and editor */}
        {cards.map((card, index) => {
          return (
            <div id="card" key={index} style={{ display: 'grid', gridTemplateColumns: '44px 1.5fr 50px 1fr', alignItems: 'center'}}>
              <button  id="remove" onClick={() => {
                const newCards = [...cards]
                newCards.splice(index, 1)
                setCards(newCards)
                const totalQuantity = newCards.reduce((sum, card) => sum + parseInt(card.quantity || 0, 10), 0)
                setMinDeckSize(totalQuantity)
                if (deckSize < totalQuantity) { setDeckSize(totalQuantity) }
              }}>X</button>
              <input type="text" placeholder='Card Name' value={card.name} onChange={e => {
                const newCards = [...cards]
                newCards[index].name = e.target.value
                setCards(newCards)
              }} />
              <input type="number" value={card.quantity} min="0" onChange={e => {
                const newCards = [...cards]
                newCards[index].quantity = Number(e.target.value)
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
                    paggidng: '0',
                    margin: '0',
                    border: '1px solid #ccc',
                    borderRadius: '0',
                    color: 'white',
                    boxShadow: 'none',
                    '&:hover': {
                      border: '1px solid #ccc',
                    }
                  }),
                  input: (base) => ({
                    ...base,
                    color: 'white',
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
      <div>
        {Calculator(cards, tags, deckSize, numEngines)}
      </div>
      <footer>
        Built with <a href="https://www.npmjs.com/package/ydke" target='_blank'>ydke.js</a> and <a href='https://ygoprodeck.com/api-guide/' target='_blank'>Yu-Gi-Oh! API by YGOPRODeck</a> 
      </footer>
    </>
  )
}



export default App
