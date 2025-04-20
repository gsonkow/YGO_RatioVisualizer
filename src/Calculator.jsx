import './Calculator.css'

const CARDS_OPENED = 5

export default function Calculator(cards, tags, deckSize, numEngines) {
    const deckTags = tags.map(tag => tag.label)
    const defaultTags = deckTags.slice(0, 8)
    const engineTags = deckTags.slice(8, 8 + numEngines)
    const customTags = deckTags.slice(8 + numEngines)


    // tags[6] is the starter tag
    var startersPerEngine = new Array(numEngines).fill(0)
    for (let i = 0; i < numEngines; i++) {
        for (let cardIndex = 0; cardIndex < cards.length; cardIndex++) {
            if (hasTag(cards[cardIndex].tags, tags[6]) && cards[cardIndex].tags.some(tag => tag.label === engineTags[i])) {
                startersPerEngine[i] += cards[cardIndex].quantity
            }
        }
    }

    console.log('Starter cards per engine:', startersPerEngine)

    //formatted as [Engine][# of starters opened] [n][0] is exception: it is one or more starters opened
    var starterProbabilities = new Array(numEngines).fill(null).map(() => new Array(CARDS_OPENED + 1).fill(0))
    for (let engine = 0; engine < numEngines; engine++) {
        starterProbabilities[engine][0] = hypergeometricAtLeast(deckSize, startersPerEngine[engine], CARDS_OPENED, 1)
        for (let starters = 1; starters <= CARDS_OPENED; starters++) {
            starterProbabilities[engine][starters] = hypergeometric(deckSize, startersPerEngine[engine], CARDS_OPENED, starters)
        }
    }
    
    console.log('Starter probabilities:', starterProbabilities)

    var totalPerTag = new Array(deckTags.length).fill(0)
    for (let i = 0; i < deckTags.length; i++) {
        for (let cardIndex = 0; cardIndex < cards.length; cardIndex++) {
            if (hasTag(cards[cardIndex].tags, tags[i])) {
                totalPerTag[i] += cards[cardIndex].quantity
            }
        }
    }



    var percentagePerTag = new Array(deckTags.length).fill(0)
    for (let i = 0; i < deckTags.length; i++) {
        percentagePerTag[i] = hypergeometricAtLeast(deckSize, totalPerTag[i], CARDS_OPENED, 1)
    }

    //TODO: put results in grid/ table format
    return <div id='results'>
    <p>Hover your mouse over any percentage to see the raw calculation.</p>
    <div id='explainStarters'>
        <h2>Starters per Engine</h2>
        <p>Probability of opening the specified number of starters by engine.</p>
    </div>
    <table id='starters'>
        <tr>
            <th>Engine</th>
            <th>Starters</th>
            <th id='numeric'>1+</th>
            <th id='numeric'>1</th>
            <th id='numeric'>2</th>
            <th id='numeric'>3</th>
            <th id='numeric'>4</th>
            <th id='numeric'>5</th>
        </tr>
    {starterProbabilities.map((engine, index) => {
        return (
            <tr>
                <td>Engine {index + 1}</td>
                <td id='numeric'>{startersPerEngine[index]}</td>
                <td id='numeric'>{percentage(engine[0])}</td>
            {engine.map((starters, index) => {if (index > 0) {return (<td id='numeric'>{percentage(starters)}</td>)}})}
            </tr>
        )
    })}
    </table>

    {/* maybe limit this to custom tags only */}
    <div id='explainAllTags'>
        <h2>All Tags</h2>
        <p>Probability of opening at least one card with the tag in your opening hand. ({CARDS_OPENED} cards)</p>
    </div>
    <table id='allTags'>
        <tr>
            {percentagePerTag.map((value, index) => {if (index > 0 && value > 0) {return (<th>{deckTags[index]}</th>)}})}
        </tr>
        <tr>
            {percentagePerTag.map((value, index) => {if (index > 0 && value > 0) {return (<td>{percentage(value)}</td>)}})}
        </tr>
        
    </table>
    </div>
}

function percentage(value) {
    //return Math.round(value * 100000) / 1000
    return <div id ='percentage'>
        <div id='rounded'>{Math.round(value * 10000) / 100}%</div>
        <div id='raw'>{value}</div> 
    </div>
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