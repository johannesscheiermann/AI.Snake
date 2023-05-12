import {Agent} from './Agent'
import {AugmentedState, SnakeGameState} from '../game-logic/SnakeGameState'
import {SnakeGameAction} from '../game-logic/SnakeGameAction'
import {NeuralNetwork} from '../neural-network/foo'
import {nnInputFor} from '../neural-network/qLearning'
import {INeuralNetwork} from '../neural-network/fooReLu'

function max<T>(array: T[], fctA: (v: T) => number) {
    return array.reduce((r, a) => (fctA(a) > fctA(r) ? a : r))
}
export class QAgent implements Agent {
    constructor(private readonly Q:INeuralNetwork, private readonly dim:number) {
    }

    updateNextGameAction(gameState: SnakeGameState, updateGameAction: (gameAction: SnakeGameAction) => void): (() => void) | void {
        console.log("hallo")
        updateGameAction(
            max([
                SnakeGameAction.Left,
                SnakeGameAction.Up,
                SnakeGameAction.Right,
                SnakeGameAction.Down
            ],it=> {
                console.log(it)
                return this.Q.predict(
                    nnInputFor(new AugmentedState(gameState), it,this.dim)
                )[0]
            })

        )
        console.log("updated game action")

    }
}
