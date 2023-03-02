import React, {createContext, useContext, useReducer} from 'react'
import {noop} from '../util/Functions'
import {Random} from '../models/Random'
import {DefaultSnakeGameState, SnakeGameState} from '../game-logic/SnakeGameState'
import {Dimensions} from '../models/Dimensions'
import {SnakeGameAction} from '../game-logic/SnakeGameAction'

const GameStateContext = createContext<SnakeGameState | undefined>(undefined)
const GameStateDispatchContext = createContext<(gameStateEvent: GameStateEvent) => void>(noop)

export function GameStateProvider(
    props: { children: React.ReactNode; dimensions: Dimensions; random: Random }
) {
    const [gameState, dispatch] = useReducer(
        (previousGameState: SnakeGameState, gameStateEvent: GameStateEvent) => gameStateReducer(
            props.dimensions,
            props.random,
            previousGameState,
            gameStateEvent
        ),
        initialGameState(props.dimensions, props.random)
    )

    return (
        <GameStateContext.Provider value={gameState}>
            <GameStateDispatchContext.Provider value={dispatch}>
                {props.children}
            </GameStateDispatchContext.Provider>
        </GameStateContext.Provider>
    )
}

export type GameStateEvent = {
    type: 'game_state_reset'
} | {
    type: 'game_action_performed'
    gameAction: SnakeGameAction
}

function gameStateReducer(
    dimensions: Dimensions,
    random: Random,
    previousGameState: SnakeGameState,
    gameStateEvent: GameStateEvent
): SnakeGameState {
    switch (gameStateEvent.type) {
        case 'game_state_reset':
            return initialGameState(dimensions, random)
        case 'game_action_performed':
            return previousGameState.performAction(gameStateEvent.gameAction)
    }
}

function initialGameState(dimensions: Dimensions, random: Random): SnakeGameState {
    return new DefaultSnakeGameState(
        dimensions,
        ({y, x}) => x === 0 || x === dimensions.width - 1 || y === 0 || y === dimensions.height - 1,
        random,
        {
            scorePointsForFood: 1
        }
    )
}

export function useGameState(): SnakeGameState | undefined {
    return useContext(GameStateContext)
}

export function useGameStateDispatch(): (gameStateEvent: GameStateEvent) => void {
    return useContext(GameStateDispatchContext)
}
