import React, {createContext, useContext, useReducer} from 'react'
import {noop} from '../util/Functions'
import {SnakeGameAction} from '../game-logic/SnakeGameAction'

const GameActionContext = createContext<SnakeGameAction>(SnakeGameAction.None)
const GameActionDispatchContext = createContext<(gameActionEvent: GameActionEvent) => void>(noop)

export function GameActionProvider(
    props: { children: React.ReactNode }
) {
    const [gameAction, dispatch] = useReducer(
        gameActionReducer,
        SnakeGameAction.None
    )

    return (
        <GameActionContext.Provider value={gameAction}>
            <GameActionDispatchContext.Provider value={dispatch}>
                {props.children}
            </GameActionDispatchContext.Provider>
        </GameActionContext.Provider>
    )
}

export type GameActionEvent = {
    type: 'game_action_reset'
} | {
    type: 'game_action_chosen'
    gameAction: SnakeGameAction
}

function gameActionReducer(
    previousGameAction: SnakeGameAction,
    gameActionEvent: GameActionEvent
): SnakeGameAction {
    switch (gameActionEvent.type) {
        case 'game_action_reset':
            return SnakeGameAction.None
        case 'game_action_chosen':
            return gameActionEvent.gameAction
    }
}

export function useGameAction(): SnakeGameAction {
    return useContext(GameActionContext)
}

export function useGameActionDispatch(): (gameActionEvent: GameActionEvent) => void {
    return useContext(GameActionDispatchContext)
}
