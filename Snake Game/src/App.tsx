import {Agent} from './agents/Agent'
import {KeyboardAgent} from './agents/KeyboardAgent'
import GameConfiguration from './components/GameConfiguration'
import {GameStateProvider} from './contexts/GameStateContext'
import {MathRandom, Random} from './models/Random'
import {Dimensions} from './models/Dimensions'
import {RandomPossibleActionAgent} from './agents/RandomPossibleActionAgent'
import styled, {createGlobalStyle} from 'styled-components'
import {Lazy} from './util/Lazy'
import GamePanel from './components/GamePanel'
import {GameAgentProvider} from './contexts/GameAgentContext'
import Game from './components/game/Game'
import {AgentOption} from './models/AgentOption'
import {GameActionProvider} from './contexts/GameActionContext'
import {NeuralNetwork} from './neural-network/foo'

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

function App() {
    const dimensions: Dimensions = {width: 16, height: 16}
    const random: Random = new MathRandom()
    const agentOptions: AgentOption[] = [
        {
            id: 0,
            name: 'RandomPossibleActionAgent',
            lazyInstance: new Lazy<Agent>(() => new RandomPossibleActionAgent(dimensions, random))
        },
        {
            id: 1,
            name: 'KeyboardAgent',
            lazyInstance: new Lazy<Agent>(() => new KeyboardAgent())
        }
    ]

    return <StyledApp>
        <GlobalStyle/>
        <h1>AI.Snake</h1>
        <button onClick={() => {
            // const trainingData = {input: [[0, 0], [0, 1], [1, 0], [1, 1]], output: [[0], [1], [1], [0]]}
            //
            // // Create the neural network
            // const net = new NeuralNetwork(2, [2], 1)
            //
            // // Train the network on the training data
            // for (let i = 0; i < 15000; i++) {
            //     net.train(trainingData.input, trainingData.output, 0.5)
            // }
            //
            // // Test the network on some new data
            // console.log(net.predict([0, 0]).map(it => it > .5 ? 1 : 0)) // Should output [0]
            // console.log(net.predict([0, 1]).map(it => it > .5 ? 1 : 0)) // Should output [1]
            // console.log(net.predict([1, 0]).map(it => it > .5 ? 1 : 0)) // Should output [1]
            // console.log(net.predict([1, 1]).map(it => it > .5 ? 1 : 0)) // Should output [0]



//             const trainingData = {
//                 input: [
//                     [0, 0],
//                     [0, 1],
//                     [1, 0],
//                     [1, 1]
//                 ],
//                 output: [
//                     [0, 0],
//                     [1, 0],
//                     [1, 0],
//                     [0, 1]
//                 ]
//             }
//
// // Create the neural network
//             const net = new NeuralNetwork(2, [3], 2)
//
// // Train the network on the training data
//             for (let i = 0; i < 10000; i++) {
//                 net.train(trainingData.input, trainingData.output, 0.5)
//             }
//
// // Test the network on some new data
//             console.log(net.predict([0, 0])) // Should output [0, 0]
//             console.log(net.predict([0, 1])) // Should output [1, 0]
//             console.log(net.predict([1, 0])) // Should output [1, 0]
//             console.log(net.predict([1, 1])) // Should output [0, 1]



            const trainingData = {
                input: [
                    [0, 0],
                    [0, 1],
                    [1, 0],
                    [1, 1]
                ],
                output: [
                    [0],
                    [1],
                    [1],
                    [1]
                ]
            }

// Create the neural network
            const net = new NeuralNetwork(2, [2], 1)

// Train the network on the training data
            for (let i = 0; i < 10000; i++) {
                net.train(trainingData.input, trainingData.output, 0.5)
            }

// Test the network on some new data
            console.log(net.predict([0, 0])) // Should output [0]
            console.log(net.predict([0, 1])) // Should output [1]
            console.log(net.predict([1, 0])) // Should output [1]
            console.log(net.predict([1, 1])) // Should output [1]




        }
        }>hu
        </button>
        <GameAgentProvider>
            <GameConfiguration agentOptions={agentOptions}/>
            <GameStateProvider dimensions={dimensions} random={random}>
                <GameActionProvider>
                    <Game moveTimeMilliseconds={500}/>
                    <GamePanel/>
                </GameActionProvider>
            </GameStateProvider>
        </GameAgentProvider>
    </StyledApp>
}

export default App
