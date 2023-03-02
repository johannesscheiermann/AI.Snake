import {AsBoardState, BoardState, Tile} from './BoardState'
import {SnakeGameAction} from './SnakeGameAction'
import {Direction} from './Direction'
import {Coordinate} from './Coordinate'
import {Random} from '../models/Random'
import {Dimensions} from '../models/Dimensions'

export interface SnakeGameConfiguration {
    scorePointsForFood: number
}

export interface SnakeGameState {
    dimensions: Dimensions
    boardState: BoardState
    gameStarted: boolean
    gameOver: boolean
    score: number

    performAction(action: SnakeGameAction): SnakeGameState
}

export class DefaultSnakeGameState implements SnakeGameState {

    readonly boardState: BoardState

    constructor(
        readonly dimensions: Dimensions,
        readonly placeWall: (coordinate: Coordinate) => boolean,
        readonly random: Random,
        readonly snakeGameConfiguration: SnakeGameConfiguration,
        readonly gameStarted: boolean = false,
        readonly gameOver: boolean = false,
        readonly score: number = 0,
        boardState?: BoardState
    ) {
        this.boardState = boardState ?? new AsBoardState(dimensions, placeWall, random)
    }

    performAction(action: SnakeGameAction): SnakeGameState {

        if (!this.gameStarted && action === SnakeGameAction.None || this.gameOver) return this

        const {
            boardState,
            enteredTile
        } = this.boardState.move(action === null ? this.boardState.snake.direction : this.moveDirectionFor(action))

        const gameOver = enteredTile in [Tile.Wall, Tile.Snake]

        return new DefaultSnakeGameState(
            this.dimensions,
            this.placeWall,
            this.random,
            this.snakeGameConfiguration,
            true,
            gameOver,
            this.score + (enteredTile === Tile.Food ? this.snakeGameConfiguration.scorePointsForFood : 0),
            gameOver ? this.boardState : boardState
        )
    }

    private moveDirectionFor(action: SnakeGameAction): Direction {
        return action === SnakeGameAction.Down && (this.boardState.snake.fullBody.length === 1 || this.boardState.snake.direction !== Direction.Up) ? Direction.Down :
            action === SnakeGameAction.Up && (this.boardState.snake.fullBody.length === 1 || this.boardState.snake.direction !== Direction.Down) ? Direction.Up :
                action === SnakeGameAction.Left && (this.boardState.snake.fullBody.length === 1 || this.boardState.snake.direction !== Direction.Right) ? Direction.Left :
                    action === SnakeGameAction.Right && (this.boardState.snake.fullBody.length === 1 || this.boardState.snake.direction !== Direction.Left) ? Direction.Right :
                        this.boardState.snake.direction
    }
}
