import {Coordinate} from './Coordinate'
import {AsSnake, Snake} from './Snake'
import {Direction} from './Direction'
import {Lazy} from '../util/Lazy'
import {Random} from '../models/Random'
import {Dimensions} from '../models/Dimensions'

export enum Tile {
    Wall,
    Snake,
    Food,
    FreeSpace
}

export interface BoardState {
    snake: Snake

    tileAt(coordinate: Coordinate): Tile

    move(direction: Direction): { boardState: BoardState; enteredTile: Tile }
}

export class AsBoardState implements BoardState {

    private readonly lazySnake: Lazy<Snake>
    private readonly lazyTiles: Lazy<Tile[][]>
    private food?: Coordinate

    constructor(
        private readonly dimensions: Dimensions,
        private readonly placeWall: (coordinate: Coordinate) => boolean,
        private readonly random: Random,
        food?: Coordinate,
        snake?: Snake
    ) {
        this.lazySnake = new Lazy<Snake>(snake ? () => snake : () => this.snakeAtFreePosition(
            dimensions,
            coordinate => placeWall(coordinate) || (coordinate.x === food?.x && coordinate.y === food.y),
            random
        ))

        this.lazyTiles = new Lazy<Tile[][]>(() => {
                const tiles = Array.from({length: dimensions.height}, (row, y) =>
                    Array.from({length: dimensions.width}, (col, x) =>
                        placeWall({x, y}) ? Tile.Wall :
                            this.snake.fullBody.some(
                                ({
                                     x: snakeX,
                                     y: snakeY
                                 }) => snakeX === x && snakeY === y) ? Tile.Snake :
                                x === food?.x && y === food?.y ? Tile.Food :
                                    Tile.FreeSpace
                    )
                )

                if (food) {
                    this.food = food
                } else {
                    const randomFreeSpaceCoordinate =
                        random.randomElementOf(
                            tiles.reduce(
                                (acc1, row, y) =>
                                    [
                                        ...acc1,
                                        ...row.reduce(
                                            (acc2, tile, x) =>
                                                tile === Tile.FreeSpace ? [...acc2, {x, y}] : acc2,
                                            [] as Coordinate[]
                                        )
                                    ],
                                [] as Coordinate[]
                            )
                        )

                    this.food = randomFreeSpaceCoordinate
                    tiles[randomFreeSpaceCoordinate.y][randomFreeSpaceCoordinate.x] = Tile.Food
                }

                return tiles
            }
        )
    }

    public get snake(): Snake {
        return this.lazySnake.value
    }

    tileAt(coordinate: Coordinate): Tile {
        return this.lazyTiles.value[coordinate.y][coordinate.x]
    }

    move(direction: Direction): { boardState: BoardState; enteredTile: Tile } {
        const nextTile = this.tileAt(this.snake.move(direction, true).head)

        return {
            boardState: new AsBoardState(
                this.dimensions,
                this.placeWall,
                this.random,
                nextTile === Tile.Food ? undefined : this.food,
                this.snake.move(direction, nextTile === Tile.Food)
            ),
            enteredTile: nextTile
        }
    }

    private snakeAtFreePosition(dimensions: Dimensions, isWallOrFood: (coordinate: Coordinate) => boolean, random: Random): Snake {
        const randomCoordinate = () => ({
            x: Math.floor(random.random() * dimensions.width),
            y: Math.floor(random.random() * dimensions.height)
        })

        let coordinate: Coordinate = randomCoordinate()

        while (isWallOrFood(coordinate)) {
            coordinate = randomCoordinate()
        }

        return new AsSnake([coordinate], random)
    }
}
