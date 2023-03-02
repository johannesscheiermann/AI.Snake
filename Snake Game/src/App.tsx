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
