import './Calculator.css'

const CARDS_OPENED = 5
const OPENING_CHECKS = 9

export default function Calculator(cards, tags, deckSize, numEngines) {
    const deckTags = tags.map(tag => tag.label)
    const defaultTags = deckTags.slice(0, 8)
    const engineTags = deckTags.slice(8, 8 + numEngines)
    const customTags = deckTags.slice(8 + numEngines)

    //formatted as [# of cards opened]; [0-3] opening n+1 or more cards [4-8] opening exactly n cards
    function standardTag(index) {
        let probs = new Array(OPENING_CHECKS).fill(0)
        for (let i = 1; i <= CARDS_OPENED - 1; i++) {
            probs[i - 1] = hypergeometricAtLeast(deckSize, totalPerTag[index], CARDS_OPENED, i)
        }
        for (let i = 1; i <= CARDS_OPENED; i++) {
            probs[i + 3] = hypergeometric(deckSize, totalPerTag[index], CARDS_OPENED, i)
        }
        return probs
    }

    var startersPerEngine = new Array(numEngines).fill(0)
    for (let i = 0; i < numEngines; i++) {
        for (let cardIndex = 0; cardIndex < cards.length; cardIndex++) {
            if (hasTag(cards[cardIndex].tags, tags[6]) && cards[cardIndex].tags.some(tag => tag.label === engineTags[i])) {
                startersPerEngine[i] += cards[cardIndex].quantity
            }
        }
    }

    //formatted as [Engine][# of starters opened]; [e][0-3] opening n+1 or more starters [e][4-8] opening exactly n starters
    var starterProbabilities = new Array(numEngines).fill(null).map(() => new Array(OPENING_CHECKS).fill(0))
    for (let engine = 0; engine < numEngines; engine++) {
        for (let starters = 1; starters <= CARDS_OPENED - 1; starters++) {
            starterProbabilities[engine][starters - 1] = hypergeometricAtLeast(deckSize, startersPerEngine[engine], CARDS_OPENED, starters)
        }
        for (let starters = 1; starters <= CARDS_OPENED; starters++) {
            starterProbabilities[engine][starters + 3] = hypergeometric(deckSize, startersPerEngine[engine], CARDS_OPENED, starters)
        }
    }
    
    var totalPerTag = new Array(deckTags.length).fill(0)
    for (let i = 0; i < deckTags.length; i++) {
        for (let cardIndex = 0; cardIndex < cards.length; cardIndex++) {
            if (hasTag(cards[cardIndex].tags, tags[i])) {
                totalPerTag[i] += cards[cardIndex].quantity
            }
        }
    }

    var duplicateOPTProbPerTag = new Array(tags.length).fill(0)
    for (let card = 0; card < cards.length; card++) {
        for (let tag = 0; tag < tags.length; tag++) {
            if (hasTag(cards[card].tags, tags[0]) && hasTag(cards[card].tags, tags[tag])) {
                duplicateOPTProbPerTag[tag] += hypergeometricAtLeast(deckSize, cards[card].quantity, CARDS_OPENED, 2)
            }
        }
    }

    return <div id='results'>
    <p id='hoverHelp'>Hover your mouse over any percentage to see the raw calculation.</p>

    {/* Default standard tags are hard coded for easy access to custom explanation text (and ordering too i guess)*/}
    {totalPerTag[6] > 0 ?
    <div id='explain'>
        <h2>Starters</h2>
        <p>Probability of opening the specified number of starters.</p>
    </div> : <></>}
    {standardTagDisplay('Starters', totalPerTag[6], standardTag(6))}

    {startersPerEngine.some(engine => engine > 0) ?
    <>
    <div id='explain'>
        <h2>Starters per Engine</h2>
        <p>Probability of opening the specified number of starters by engine.</p>
    </div>
    <table id='starters'>
        <tbody>
        <tr>
            <th>Engine</th>
            <th>Starters</th>
            {openingRange()}
        </tr>
    {starterProbabilities.map((engine, index) => {
        return (
            <tr key={index}>
                <td>Engine {index + 1}</td>
                <td id='numeric'>{startersPerEngine[index]}</td>
                {engine.map((starters, index) => {return (<td id='numeric' key={index}>{percentage(starters)}</td>)})}
            </tr>
        )
    })}
        </tbody>
    </table> </>: <></> }

    {totalPerTag[7] > 0 ? 
    <div id='explain'>
        <h2>Extenders</h2>
        <p>Probability of opening the specified number of extenders.</p>
    </div> : <></>}
    {standardTagDisplay('Extenders', totalPerTag[7], standardTag(7))}

    {totalPerTag[4] > 0 ? 
    <div id='explain'>
        <h2>Hand Traps</h2>
        <p>Probability of opening the specified number of hand traps.</p>
    </div> : <></>}
    {standardTagDisplay('Hand Traps', totalPerTag[4], standardTag(4))}

    {totalPerTag[5] > 0 ?
    <div id='explain'>
        <h2>Board Breakers</h2>
        <p>Probability of opening the specified number of board breakers.</p>
    </div> : <></>}
    {standardTagDisplay('Board Breakers', totalPerTag[5], standardTag(5))}

    {totalPerTag[0] > 0 ?
    <>
    <div id='explain'>
        <h2>Duplicate 'Hard Once Per Turn' Effects</h2>
        <p>
            Probability of opening 2 or more cards with the same 'hard once per turn' effect in your opening hand. (Shown as a total and per tag)
            <br/>Ideally, this is kept to a <span id='highlight'>minimum</span> to avoid dead cards in your hand.
        </p>
    </div>
    <table id='duplicateOPT'>
        <tbody>
        <tr>
            <th>Total Chance</th>
            {duplicateOPTProbPerTag.map((value, index) => {if (index > 0 && value > 0) {return (<th key={index}>{deckTags[index]}</th>)}})}
        </tr>
        <tr>
            {duplicateOPTProbPerTag.map((value, index) => {if (value > 0) {return (<td id='numeric' key={index}>{percentage(value)}</td>)}})}
        </tr>
        </tbody>
    </table>
    </>: <></> }

    {totalPerTag[1] > 0 ?
    <div id='explain'>
        <h2>Discard Effects</h2>
        <p>
            Probability of opening the specified number of cards with a cost or effect that needs to discard a card.
            <br/>Take note that opening/comboing into a discard cost/effect can <span id='highlight'>reduce the impact</span> of any dead cards in your hand.
        </p>
    </div> : <></>}
    {standardTagDisplay('Discard Costs/Effects', totalPerTag[1], standardTag(1))}

    {totalPerTag[2] > 0 ?
    <div id='explain'>
        <h2>Bad Draws (Going First)</h2>
        <p>Probability of opening the specified number of dead cards going first.</p>
    </div> : <></>}
    {standardTagDisplay('Bad Draws', totalPerTag[2], standardTag(2))}

    {totalPerTag[3] > 0 ?
    <div id='explain'>
        <h2>Bad Draws (Going Second)</h2>
        <p>Probability of opening the specified number of dead cards going second.</p>
    </div> : <></>}
    {standardTagDisplay('Bad Draws', totalPerTag[3], standardTag(3))}

    {deckTags.map((tag, index) => {
        if (customTags.some(customTag => customTag === tag) && totalPerTag[index] > 0) {
            return (
                <>
                <div id='explain' key={index}>
                    <h2>{tag}</h2>
                    <p>Probability of opening the specified number of cards with the {tag} tag.</p>
                </div>
                {standardTagDisplay(tag, totalPerTag[index], standardTag(index))}
                </>
            )
        }
    })}
    </div>
}

function openingRange () {
    return (
        <>
            <th id='numeric'>1+</th>
            <th id='numeric'>2+</th>
            <th id='numeric'>3+</th>
            <th id='numeric'>4+</th>
            <th id='numeric'>1</th>
            <th id='numeric'>2</th>
            <th id='numeric'>3</th>
            <th id='numeric'>4</th>
            <th id='numeric'>5</th>
        </>
    )
}

function percentage(value) {
    //return Math.round(value * 100000) / 1000
    return <div id ='percentage'>
        <div id='rounded'>{Math.round(value * 10000) / 100}%</div>
        <div id='raw'>{value === 0 ? '0.00' : value }</div> 
    </div>
}

function standardTagDisplay(name, total, probs) {
    if (total === 0) {
        return <></>
    }
    return (
        <table id='standardTagDisplay'>
        <tbody>
        <tr>
            <th>{name}</th>
            {openingRange()}
        </tr>
        <tr>
            <td id='numeric'>{total}</td>
            {probs.map((value, index) => {return (<td id='numeric' key={index}>{percentage(value)}</td>)})}
        </tr>
        </tbody>
    </table>
    )
}

function hasTag(cardTags, targetTag) {
    return cardTags.some(tag => tag.value === targetTag.value && tag.label === targetTag.label)
}

function factorial(n) {
    return n > 1 ? n * factorial(n - 1) : 1
}
  
function combination(m, n) {
    if (m < n) return 0
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
    let probability = 0
    for (let i = k; i <= Math.min(K, n); i++) {
      probability += hypergeometric(N, K, n, i)
    }
    return probability
}