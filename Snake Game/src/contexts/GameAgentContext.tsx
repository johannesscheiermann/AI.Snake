import React, {createContext, useContext, useReducer} from 'react'
import {noop} from '../util/Functions'
import {AgentOption} from '../models/AgentOption'

const GameAgentContext = createContext<AgentOption | undefined>(undefined)
const GameAgentDispatchContext = createContext<(gameAgentEvent: GameAgentEvent) => void>(noop)

export function GameAgentProvider(
    props: { children: React.ReactNode }
) {
    const [gameAgent, dispatch] = useReducer(
        gameAgentReducer,
        undefined
    )

    return (
        <GameAgentContext.Provider value={gameAgent}>
            <GameAgentDispatchContext.Provider value={dispatch}>
                {props.children}
            </GameAgentDispatchContext.Provider>
        </GameAgentContext.Provider>
    )
}

export type GameAgentEvent = {
    type: 'game_agent_chosen',
    agent: AgentOption | undefined
}

function gameAgentReducer(
    previousGameAgent: AgentOption | undefined,
    gameAgentEvent: GameAgentEvent
): AgentOption | undefined {
    switch (gameAgentEvent.type) {
        case 'game_agent_chosen':
            return gameAgentEvent.agent
    }
}

export function useGameAgent(): AgentOption | undefined {
    return useContext(GameAgentContext)
}

export function useGameAgentDispatch(): (gameAgentEvent: GameAgentEvent) => void {
    return useContext(GameAgentDispatchContext)
}
