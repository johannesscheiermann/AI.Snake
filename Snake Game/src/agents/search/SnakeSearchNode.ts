import {SearchNode} from './SearchNode'
import {SnakeGameState} from '../../game-logic/SnakeGameState'
import {SnakeGameAction} from '../../game-logic/SnakeGameAction'
import {Lazy} from '../../util/Lazy'

export class SnakeSearchNode implements SearchNode<SnakeGameState, SnakeGameAction> {

    private readonly _lazySuccessors: Lazy<SearchNode<SnakeGameState, SnakeGameAction>[]>

    constructor(
        readonly state: SnakeGameState,
        readonly depth: number,
        readonly pathCost: number,
        readonly previousAction: SnakeGameAction | undefined,
        readonly predecessor: SearchNode<SnakeGameState, SnakeGameAction> | undefined,
        actionCostFor: (action: SnakeGameAction) => number
    ) {
        if ((predecessor === undefined) !== (previousAction === undefined)) {
            throw 'Violated: "predecessor" is undefined iff "previousAction" is undefined'
        }

        this._lazySuccessors = new Lazy<SearchNode<SnakeGameState, SnakeGameAction>[]>(
            () => this.isLeaf ? [] : [
                SnakeGameAction.Left,
                SnakeGameAction.Up,
                SnakeGameAction.Right,
                SnakeGameAction.Down
            ].map(action => new SnakeSearchNode(
                state.performAction(action),
                depth + 1,
                pathCost + actionCostFor(action),
                action,
                this,
                actionCostFor
            ))
        )
    }

    get successors(): SearchNode<SnakeGameState, SnakeGameAction>[] {
        return this._lazySuccessors.value
    }

    get isExpanded(): boolean {
        return this._lazySuccessors.hasComputedValue
    }

    get isLeaf(): boolean {
        return this.state.gameOver
    }
}