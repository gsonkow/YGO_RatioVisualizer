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
            if (hasTag(cards[cardIndex].tags, tags[6]) && hasTag(cards[cardIndex].tags, engineTag(i + 1, tags))) {
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
    
    //TODO: put results in grid/ table format
    return <div style={{textAlign: 'left'}}>
    {starterProbabilities.map((engine, index) => {
        return (
            <div>Engine {index + 1}: 
            <br></br>
            Number of starters: {startersPerEngine[index]}
            <br></br>
            Opening 1 or more starters: {Math.round(engine[0] * 100000) / 1000}%
            {engine.map((starters, index) => {if (index > 0) {return (<div>Opening {index} starter(s): {Math.round(starters * 100000) / 1000}%</div>)}})}
            <br></br>
            </div>
        )
    })}
    </div>
}

function hasTag(cardTags, targetTag) {
    return cardTags.some(tag => tag.value === targetTag.value && tag.label === targetTag.label)
}

function engineTag(num, tags) {
    try {
        return tags[num + 7]
    }
    catch (error) {
        console.error('Error getting engine tag:', error)
        return tags[8]
    }
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