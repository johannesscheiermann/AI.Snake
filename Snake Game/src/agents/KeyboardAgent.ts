import {Agent} from './Agent'
import {SnakeGameState} from '../game-logic/SnakeGameState'
import {SnakeGameAction} from '../game-logic/SnakeGameAction'

export class KeyboardAgent implements Agent {
    updateNextGameAction(gameState: SnakeGameState, updateGameAction: (gameAction: SnakeGameAction) => void): (() => void) | void {
        const updateGameActionForKeyboardEvent = (keyboardEvent: KeyboardEvent) => updateGameAction(
            this.gameActionFor(keyboardEvent)
        )

        document.addEventListener('keyup', updateGameActionForKeyboardEvent)
        return () => document.removeEventListener('keyup', updateGameActionForKeyboardEvent)
    }

    private gameActionFor(event: KeyboardEvent): SnakeGameAction {
        return event.key === 'ArrowLeft' ? SnakeGameAction.Left :
            event.key === 'ArrowRight' ? SnakeGameAction.Right :
                event.key === 'ArrowUp' ? SnakeGameAction.Up :
                    event.key === 'ArrowDown' ? SnakeGameAction.Down :
                        SnakeGameAction.None
    }
}
