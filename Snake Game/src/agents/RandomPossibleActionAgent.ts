import {Agent} from './Agent'
import {SnakeGameState} from '../game-logic/SnakeGameState'
import {Dimensions} from '../game-logic/Dimensions'
import {Tile} from '../game-logic/BoardState'
import {Direction} from '../game-logic/Direction'
import {SnakeGameAction} from '../game-logic/SnakeGameAction'
import {Random} from '../game-logic/Random'

export class RandomPossibleActionAgent implements Agent {
    constructor(private readonly dimensions: Dimensions, private readonly random: Random) {
    }

    updateNextGameAction(gameState: SnakeGameState, updateGameAction: (gameAction: SnakeGameAction) => void): (() => void) | void {
        const possibleGameActions = this.possibleGameActionsFor(gameState)

        if (possibleGameActions.length > 0) {
            updateGameAction(this.random.randomElementOf(possibleGameActions))
        }
    }

    private possibleGameActionsFor(gameState: SnakeGameState): SnakeGameAction[] {

        const {direction, head} = gameState.boardState.snake

        const possibleGameActions: SnakeGameAction[] = []

        const tilesToAvoid = [Tile.Wall, Tile.Snake]

        if (
            direction !== Direction.Down &&
            head.y > 0 &&
            !(gameState.boardState.tileAt({
                y: head.y - 1,
                x: head.x
            }) in tilesToAvoid)
        ) {
            possibleGameActions.push(SnakeGameAction.Up)
        }

        if (
            direction !== Direction.Up &&
            head.y < this.dimensions.height - 1 &&
            !(gameState.boardState.tileAt({
                y: head.y + 1,
                x: head.x
            }) in tilesToAvoid)
        ) {
            possibleGameActions.push(SnakeGameAction.Down)
        }

        if (
            direction !== Direction.Right &&
            head.x > 0 &&
            !(gameState.boardState.tileAt({
                y: head.y,
                x: head.x - 1
            }) in tilesToAvoid)
        ) {
            possibleGameActions.push(SnakeGameAction.Left)
        }

        if (
            direction !== Direction.Left &&
            head.x < this.dimensions.width - 1 &&
            !(gameState.boardState.tileAt({
                y: head.y,
                x: head.x + 1
            }) in tilesToAvoid)
        ) {
            possibleGameActions.push(SnakeGameAction.Right)
        }

        return possibleGameActions
    }
}
