import { useState, useEffect, use } from 'react'
import CreatableSelect from 'react-select/creatable'
import makeAnimated from 'react-select/animated'
import * as ydke from 'ydke'
import Calculator from './Calculator.jsx'
import './App.css'
import Kofi from './assets/support_me_on_kofi_blue.png'
import Logo from './assets/DarkLogo.png'
import GitLogo from './assets/github-mark-white.svg'
import {EXAMPLE_DECK, EXAMPLE_DECK_TAGS, DEFAULT_TAGS, SELECT_STYLES} from './Const.jsx'

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
  const [setupCounter, setSetupCounter] = useState(0)


  //TODO(?): validate tag input
  const handleCreateTag = (inputValue) => {
    const newTag = { value: inputValue, label: inputValue }
    setTags((prevTags) => [...prevTags, newTag])
  }

  function handleEngineChange(num) {
    setNumEngines(num)
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
      //console.log('Imported IDs:', passcodes)
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
      const numCards = newCards.reduce((sum, card) => sum + card.quantity, 0)
      setDeckSize(numCards)
      setMinDeckSize(numCards)
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
    //console.log('Setting up example deck...')
    handleEngineChange(numEngines)
    importYDKE(EXAMPLE_DECK)
  }, [])


  return (
    <>
      <meta name="viewport" content="width=500"></meta>
      <header>
        <img id='Logo' src={Logo} alt="YGO Ratio Visualizer" />
        <span>By <a id="git link" href="https://github.com/gsonkow/" target='_blank'><img id='gitLogo' src={GitLogo} alt="Github Logo" />gsonkow</a>
        &emsp;<a href="https://ko-fi.com/gsonkow" target="_blank"><img id='Ko-fi' src={Kofi} alt="Support me on Ko-fi" /></a></span>
      </header>
      <p id='helper'>-Scroll down to see results!-</p>
      <div id="calculator">
        <button disabled={importing} onClick={() => importYDKE(ydkeURL)}>{importMessage}</button>
        &emsp;<input type="text" style={{ width: '50%' }} placeholder='YDKE URL' value={ydkeURL} onChange={e => setYDKEURL(e.target.value)} />
        <br></br>
        <span id="deckSetting">
          Deck Size: &nbsp;
          <button id='decrement' onClick={() => {
            if (deckSize > minDeckSize) {
              setDeckSize(deckSize - 1)
            }
          }}>-</button>
          <input id="deckSetting" type="number" min={minDeckSize} value={deckSize} style={{ width: '50px' }} onChange={e => setDeckSize(e.target.value)} />
          <button id='increment' onClick={() => { setDeckSize(deckSize + 1) }}>+</button>
          &emsp; {mobileBreak()}

          Number of Engines: &nbsp;
          <button id='decrement' onClick={() => {
            if (numEngines > 1) {
              handleEngineChange(numEngines - 1)
            }
          }}>-</button>
          <input id="deckSetting" type="number" min="1" value={numEngines} style={{ width: '50px' }} onChange={e => {
            handleEngineChange(Number(e.target.value))
          }} />
          <button id='increment' onClick={() => { handleEngineChange(numEngines + 1) }}>+</button>
          &emsp; {mobileBreak()}
          <button onClick={() => {
            setCards([])
            setDeckSize(40)
            handleEngineChange(1)
          }}> Clear Deck </button>
        </span>

        {/* Card input and editor */}
        {cards.map((card, index) => {
          return (
            <div id="card" key={index}>
              <button id="remove" onClick={() => {
                const newCards = [...cards]
                newCards.splice(index, 1)
                setCards(newCards)
                const totalQuantity = newCards.reduce((sum, card) => sum + parseInt(card.quantity || 0, 10), 0)
                setMinDeckSize(totalQuantity)
                if (deckSize < totalQuantity) { setDeckSize(totalQuantity) }
              }}>X</button>
              <input id='name' type="text" placeholder='Card Name' value={card.name} onChange={e => {
                const newCards = [...cards]
                newCards[index].name = e.target.value
                setCards(newCards)
              }} />
              <button id="decrement" onClick={() => {
                const newCards = [...cards]
                if (card.quantity > 0) {
                  newCards[index].quantity = card.quantity - 1
                  setCards(newCards)
                  const totalQuantity = newCards.reduce((sum, card) => sum + parseInt(card.quantity || 0, 10), 0)
                  setMinDeckSize(totalQuantity)
                  if (deckSize < totalQuantity) { setDeckSize(totalQuantity) }
                }
              }}>-</button>
              <input id='quant' type="number" value={card.quantity} min="0" onChange={e => {
                const newCards = [...cards]
                newCards[index].quantity = Number(e.target.value)
                setCards(newCards)
                const totalQuantity = newCards.reduce((sum, card) => sum + parseInt(card.quantity || 0, 10), 0)
                setMinDeckSize(totalQuantity)
                if (deckSize < totalQuantity) { setDeckSize(totalQuantity) }
              }} />
              <button id="increment" onClick={() => {
                const newCards = [...cards]
                newCards[index].quantity = card.quantity + 1
                setCards(newCards)
                const totalQuantity = newCards.reduce((sum, card) => sum + parseInt(card.quantity || 0, 10), 0)
                setMinDeckSize(totalQuantity)
                if (deckSize < totalQuantity) { setDeckSize(totalQuantity) }
              }}>+</button>
              <CreatableSelect
                value={card.tags}
                id='tags'
                styles={SELECT_STYLES}
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
        <span id="deckSetting">
          Deck Size: &nbsp;
          <button id='decrement' onClick={() => {
            if (deckSize > minDeckSize) {
              setDeckSize(deckSize - 1)
            }
          }}>-</button>
          <input id="deckSetting" type="number" min={minDeckSize} value={deckSize} style={{ width: '50px' }} onChange={e => setDeckSize(e.target.value)} />
          <button id='increment' onClick={() => { setDeckSize(deckSize + 1) }}>+</button>
          &emsp; {mobileBreak()}

          Number of Engines: &nbsp;
          <button id='decrement' onClick={() => {
            if (numEngines > 1) {
              handleEngineChange(numEngines - 1)
            }
          }}>-</button>
          <input id="deckSetting" type="number" min="1" value={numEngines} style={{ width: '50px' }} onChange={e => {
            handleEngineChange(Number(e.target.value))
          }} />
          <button id='increment' onClick={() => { handleEngineChange(numEngines + 1) }}>+</button>
          &emsp; {mobileBreak()}

          <button onClick={() => {
            setCards([...cards, { id: cards.length + 1, name: '', quantity: 1, tags: [] }])
            const totalQuantity = [...cards, { id: cards.length + 1, name: '', quantity: 1 }].reduce((sum, card) => sum + parseInt(card.quantity || 0, 10), 0)
            setMinDeckSize(totalQuantity)
            if (deckSize < totalQuantity) { setDeckSize(totalQuantity) }
          }}>Add Card</button>
        </span>

      </div>
      <br></br>
      <div>
        {Calculator(cards, tags, deckSize, numEngines)}
      </div>
      <footer>
        <a href="https://github.com/gsonkow/YGO_RatioVisualizer" target='_blank'><img id='gitLogo' src={GitLogo} alt="Github Logo" />Project</a> built with <a href="https://www.npmjs.com/package/ydke" target='_blank'>ydke.js</a> and <a href='https://ygoprodeck.com/api-guide/' target='_blank'>Yu-Gi-Oh! API by YGOPRODeck</a>
      </footer>
    </>
  )
}

function mobileBreak() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1015);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1015);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return isMobile ? <br></br> : null;
}




export default App
