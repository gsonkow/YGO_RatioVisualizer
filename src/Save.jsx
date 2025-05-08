import { useState } from 'react'
import Select from 'react-select'
import { SELECT_STYLES } from './Const'

export function Save(cards, deckSize, minDeckSize, numEngines, setLoadNames) {
    if (typeof (Storage) !== 'undefined') {
        // console.log(localStorage.getItem('test'))
        // console.log(localStorage.test)
        // console.log(localStorage.length)
        return <span id="saveContainer">
            <button onClick={() => {
                const saveName = prompt("Enter a name for the deck:")
                if (saveName === null || saveName === "") {
                    return
                } else {
                    const deck = {
                        cards: cards,
                        deckSize: deckSize,
                        minDeckSize: minDeckSize,
                        numEngines: numEngines
                    }
                    localStorage.setItem(saveName, JSON.stringify(deck))
                    setLoadNames((prev) => { return [...prev, { value: saveName, label: saveName }] })
                }
            }}>Save</button>
        </span>
    } else {
        return <div>Your browser does not support web storage!</div>
    }
}


//TODO: random yelllow errors (probably from mapping with no ids either here or in setup Effect)
//TODO: grid or flex for load and save
export function Load(setCards, setDeckSize, setMinDeckSize, setNumEngines, loadNames) {
    if (typeof (Storage) !== 'undefined') {
        const [selectedOption, setSelectedOption] = useState(null)

        return <span id="loadContainer">
            <Select
                styles={SELECT_STYLES}
                value={selectedOption}
                onChange={setSelectedOption}
                options={loadNames}
                placeholder="Load Deck"
                isSearchable={true}
            />
            <button disabled={selectedOption === null} onClick={() => {
                if (selectedOption === null) {
                    return
                }
                const deck = JSON.parse(localStorage.getItem(selectedOption.value))
                if (deck) {
                    setCards(deck.cards)
                    setDeckSize(deck.deckSize)
                    setMinDeckSize(deck.minDeckSize)
                    setNumEngines(deck.numEngines)
                } else {
                    alert("Deck not found")
                }
            }}>Load</button>
        </span>
    } else {
        return <div>Your browser does not support web storage!</div>
    }
}