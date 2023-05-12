import React, {useState} from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import GameConfiguration from './components/GameConfiguration'
import {GameActionProvider} from './contexts/GameActionContext'
import {GameAgentProvider} from './contexts/GameAgentContext'
import {GameStateProvider} from './contexts/GameStateContext'
import {AgentOption} from './models/AgentOption'
import {Lazy} from './util/Lazy'
import {Agent} from './agents/Agent'
import {RandomPossibleActionAgent} from './agents/RandomPossibleActionAgent'
import {KeyboardAgent} from './agents/KeyboardAgent'
import {MathRandom} from './models/Random'

const agentOptions = [
    {
        id: 0,
        name: 'RandomPossibleActionAgent',
        lazyInstance: new Lazy<Agent>(() => new RandomPossibleActionAgent({width:5,height:5}, new MathRandom()))
    },
    {
        id: 1,
        name: 'KeyboardAgent',
        lazyInstance: new Lazy<Agent>(() => new KeyboardAgent())
    }
]

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <GameAgentProvider>
            <GameConfiguration agentOptions={agentOptions}/>
            <GameStateProvider dimensions={{width:5,height:5}} random={new MathRandom()}>
                <GameActionProvider>
                    <App/>
                </GameActionProvider>
            </GameStateProvider>
        </GameAgentProvider>
    </React.StrictMode>
)
