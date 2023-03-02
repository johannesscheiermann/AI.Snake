import {Direction} from './Direction'
import {Coordinate} from './Coordinate'
import {isNumber} from '../util/Types'
import {Random} from '../models/Random'

export interface Snake {
    direction: Direction

    head: Coordinate
    fullBody: Coordinate[]

    move(direction: Direction, includingGrowth: boolean): Snake
}

export class AsSnake implements Snake {

    readonly direction: Direction
    readonly head: Coordinate

    constructor(readonly fullBody: Coordinate[], readonly random: Random, direction?: Direction) {

        if (fullBody.length === 0) {
            throw 'Snake must have a length of at least one'
        }

        this.direction = direction ?? random.randomElementOf(Object.values(Direction).filter(isNumber)) as Direction
        this.head = fullBody[0]
    }

    move(direction: Direction, includingGrowth: boolean): Snake {
        const newHead = this.newHeadAfterMove(direction)

        return new AsSnake(
            [newHead, ...(includingGrowth ? this.fullBody : this.fullBody.slice(0, -1))],
            this.random,
            direction
        )
    }

    private newHeadAfterMove(direction: Direction): Coordinate {
        switch (direction) {
            case Direction.Up:
                return {x: this.head.x, y: this.head.y - 1}
            case Direction.Down:
                return {x: this.head.x, y: this.head.y + 1}
            case Direction.Left:
                return {x: this.head.x - 1, y: this.head.y}
            case Direction.Right:
                return {x: this.head.x + 1, y: this.head.y}
        }
    }
}
