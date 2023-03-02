import {SnakeGameState} from '../game-logic/SnakeGameState'
import {SnakeGameAction} from '../game-logic/SnakeGameAction'

export interface Agent {
    updateNextGameAction(gameState: SnakeGameState, updateGameAction: (gameAction: SnakeGameAction) => void): (() => void) | void
}
