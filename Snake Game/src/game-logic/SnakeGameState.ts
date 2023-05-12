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

export enum Blickrichtungen {
    Left,
    LeftUp,
    Up,
    RightUp,
    Right,
    RightDown,
    Down,
    LeftDown
}

export interface Augmented extends SnakeGameState {
    wievieleFrei(richtung: Blickrichtungen): [number, Tile]
}

export class AugmentedState implements SnakeGameState, Augmented {

    constructor(private gs: SnakeGameState) {
        this.boardState = gs.boardState
        this.dimensions = gs.dimensions
        this.gameOver = gs.gameOver
        this.gameStarted = gs.gameStarted
        this.score = gs.score
    }

    boardState: BoardState
    dimensions: Dimensions
    gameOver: boolean
    gameStarted: boolean
    score: number

    performAction(action: SnakeGameAction): SnakeGameState {
        return this.gs.performAction(action)
    }

    wievieleFrei(richtung: Blickrichtungen): [number, Tile] {
        return this.wievieleFreiTemp(richtung, 0, this.boardState.snake.head)
    }

    private wievieleFreiTemp(richtung: Blickrichtungen, acc: number, coord: Coordinate): [number, Tile] {
        const nextCoord = this.nextCoordinateFor(richtung)(coord)

        if (
            nextCoord.x < 0
            || nextCoord.y < 0
            || nextCoord.x >= this.dimensions.width
            || nextCoord.y >= this.dimensions.height
        ) {
            return [acc - 1, this.boardState.tileAt(coord)]
        }else if (this.boardState.tileAt(nextCoord) !== Tile.FreeSpace){
            return [acc,this.boardState.tileAt(nextCoord)]
        }

        return this.wievieleFreiTemp(
            richtung,
            acc + 1,
            nextCoord
        )

    }

    private nextCoordinateFor(blickrichtung: Blickrichtungen): (c: Coordinate) => Coordinate {
        switch (blickrichtung) {
            case Blickrichtungen.Left:
                return ({x, y}) => ({x: x - 1, y})
            case Blickrichtungen.LeftUp:
                return ({x, y}) => ({x: x - 1, y: y - 1})
            case Blickrichtungen.Up:
                return ({x, y}) => ({x, y: y - 1})
            case Blickrichtungen.RightUp:
                return ({x, y}) => ({x: x + 1, y: y - 1})
            case Blickrichtungen.Right:
                return ({x, y}) => ({x: x + 1, y})
            case Blickrichtungen.RightDown:
                return ({x, y}) => ({x: x + 1, y: y + 1})
            case Blickrichtungen.Down:
                return ({x, y}) => ({x, y: y + 1})
            case Blickrichtungen.LeftDown:
                return ({x, y}) => ({x: x - 1, y: y + 1})
        }
    }

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
