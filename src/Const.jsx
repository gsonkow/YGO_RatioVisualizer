export const DEFAULT_TAGS = [
    'Once per turn',
    'Discard Cost/Effect',
    'Bad Draw Going First',
    'Bad Draw Going Second',
    'Hand Trap',
    'Board Breaker',
    'Starter',
    'Extender',
]

export const SELECT_STYLES = {
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
        },
        '@media (max-width: 1015px)': {
            fontSize: '0.9rem',
        },
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
    singleValue: (base) => ({
        ...base,
        color: 'white',
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
}

export const EXAMPLE_DECK = "ydke://o6lXBaOpVwWvI94AryPeAK8j3gCglAQC6czIBenMyAXpzMgFsjLMBbIyzAVS94oDIkiZACJImQAiSJkAMdwRATHcEQEx3BEBqniTAooMdAEqlWUBKpVlATUHgwI1B4MCNQeDAhNWxAMTVsQDE1bEAyH2uwF0OV4DdDleA3Q5XgO1dg4BR7x9AEe8fQBHvH0AYmqzAwGvyQQBr8kEAa/JBA==!Vi0OBeYwAgI10JADNdCQA92drgDNQlcFg/jHA5a6cwGBnV4DsUmeBcoavwECXIICAlyCAkjTkAHrqosF!!"
export const EXAMPLE_DECK_TAGS = [
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
    [5],
    [0, 6, 9],
    [7],
    [0, 6, 8],
    [2, 3],
    [0, 1, 6, 8]
]