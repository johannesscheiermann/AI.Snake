import {Agent} from './agents/Agent'
import {KeyboardAgent} from './agents/KeyboardAgent'
import GameConfiguration from './components/GameConfiguration'
import {GameStateProvider, initialGameState, useGameState} from './contexts/GameStateContext'
import {MathRandom, Random} from './models/Random'
import {Dimensions} from './models/Dimensions'
import {RandomPossibleActionAgent} from './agents/RandomPossibleActionAgent'
import styled, {createGlobalStyle} from 'styled-components'
import {Lazy} from './util/Lazy'
import GamePanel from './components/GamePanel'
import {GameAgentProvider} from './contexts/GameAgentContext'
import Game from './components/game/Game'
import {AgentOption} from './models/AgentOption'
import {GameActionProvider, useGameAction} from './contexts/GameActionContext'
import {NeuralNetwork} from './neural-network/foo'
import {nnInputFor, QLearning} from './neural-network/qLearning'
import {useState} from 'react'
import {INeuralNetwork} from './neural-network/fooReLu'
import {AugmentedState} from './game-logic/SnakeGameState'

const StyledApp = styled.div`
  height: 100vh;
  width: 100vw;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 50px;
  padding: 50px;
`

const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
`

export function xd(nnInputFor1: (number)[]): string {
    return JSON.stringify({
        'Bewegung nach': {
            'Left': nnInputFor1[0],
            'Up': nnInputFor1[1],
            'Right': nnInputFor1[2],
            'Down': nnInputFor1[3]
        },
        'Frei in Richtung': {
            'Left': nnInputFor1[4],
            'Left up': nnInputFor1[5],
            'Up': nnInputFor1[6],
            'Right up': nnInputFor1[7],
            'Right': nnInputFor1[8],
            'Right down': nnInputFor1[9],
            'Down': nnInputFor1[10],
            'Left down': nnInputFor1[11]
        },
        'Nächstes nicht freie Feld': {
            'Left': {
                'Wall': nnInputFor1[12],
                'Snake': nnInputFor1[13],
                'Food': nnInputFor1[14]
            },
            'Left up': {
                'Wall': nnInputFor1[15],
                'Snake': nnInputFor1[16],
                'Food': nnInputFor1[17]
            },
            'Up': {
                'Wall': nnInputFor1[18],
                'Snake': nnInputFor1[19],
                'Food': nnInputFor1[20]
            },
            'Right up': {
                'Wall': nnInputFor1[21],
                'Snake': nnInputFor1[22],
                'Food': nnInputFor1[23]
            },
            'Right': {
                'Wall': nnInputFor1[24],
                'Snake': nnInputFor1[25],
                'Food': nnInputFor1[26]
            },
            'Right down': {
                'Wall': nnInputFor1[27],
                'Snake': nnInputFor1[28],
                'Food': nnInputFor1[29]
            },
            'Down': {
                'Wall': nnInputFor1[30],
                'Snake': nnInputFor1[31],
                'Food': nnInputFor1[32]
            },
            'Left down': {
                'Wall': nnInputFor1[33],
                'Snake': nnInputFor1[34],
                'Food': nnInputFor1[35]
            }
        },
        'Kopf': {
            'X': nnInputFor1[36],
            'Y,': nnInputFor1[37]
        },
        'Food': {
            'X': nnInputFor1[38],
            'Y': nnInputFor1[39]
        },
        // + 4 inputs für die möglichen 4 actions
        'next Action': {
            'Left': nnInputFor1[40],
            'Up': nnInputFor1[41],
            'Right': nnInputFor1[42],
            'Down': nnInputFor1[43]
        }
    }, null, 2)
}

function GameStateInput(props: { dim: number }) {
    const gameState = useGameState()!
    const aaa = useGameAction()

    return <div>{
        xd(nnInputFor(new AugmentedState(gameState), aaa, props.dim))
    }
    </div>
}

function App() {
    const [Q, setQ] = useState<INeuralNetwork>(new NeuralNetwork(
        44,
        [128, 64],
        1
    ))

    const dimensions: Dimensions = {width: 5, height: 5}
    const random: Random = new MathRandom()

    const statestate = useGameState()

    return <StyledApp>
        <GlobalStyle/>
        <h1>AI.Snake</h1>
        <button onClick={() => {
            // Create element with <a> tag
            const link = document.createElement('a')

            // Create a blog object with the file content which you want to add to the file
            // @ts-ignore
            const file = new Blob([JSON.stringify(
                {
                    inputLayerSize: Q.inputLayerSize!,
                    hiddenLayerSizes: Q.hiddenLayerSizes!,
                    outputLayerSize: Q.outputLayerSize!,
                    weights: Q.weights!,
                    biases: Q.biases!
                }
            )], {type: 'text/plain'})

// Add file content in the object URL
            link.href = URL.createObjectURL(file)

// Add file name
            link.download = 'sample.txt'

// Add click event to <a> tag to save file.
            link.click()
            URL.revokeObjectURL(link.href)

        }
        }>hus
        </button>
        <button onClick={() => {

            const qLearnign = new QLearning(statestate!)

            const newQ = qLearnign.foo(
                Q,
                .2,//learningRate: number,
                1000,//num_episodes: number,
                300,//max_steps_per_episode: number,
                1,//epsilon: number,
                new MathRandom(),//random: Random,
                .95,//discountFactor: number = .75,
                -50,//rewardForLosingMove: number = -2,
                1,//rewardForSurvivingMove: number = 1 / 225,
                50,//rewardForEatingFood: number = 1,
                (100000 - 10000) / 2,//replayBufferSize: number = 10000,
                (128 - 32) / 2 * Math.pow(2,1),//miniBatchSize: number = 64,
                250,//updateQPrimeAfterSteps: number = 25
                dimensions.height
            )
            setQ(newQ)
            // setAgentOptions(old => [...old, {
            //     id: old.length,
            //     name: 'New Q',
            //     lazyInstance: new Lazy<Agent>(() => new QAgent(newQ,dimensions.height))
            // }
            // ])


            console.log('end')
        }
        }>
            Q-Learning
        </button>

                    <Game moveTimeMilliseconds={500}/>
                    <GamePanel/>
    </StyledApp>
}

export default App
