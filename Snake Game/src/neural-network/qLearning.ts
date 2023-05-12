import {Dimensions} from '../models/Dimensions'
import {Random} from '../models/Random'
import {
    Augmented,
    AugmentedState,
    Blickrichtungen,
    DefaultSnakeGameState,
    SnakeGameState
} from '../game-logic/SnakeGameState'
import {SnakeGameAction} from '../game-logic/SnakeGameAction'
import {Direction} from '../game-logic/Direction'
import {Tile} from '../game-logic/BoardState'
import {INeuralNetwork} from './fooReLu'

function sampleMiniBatch<T>(array: T[], batchSize: number): T[] {
    // Shuffle the array using the Fisher-Yates algorithm
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]
    }

    // Take the first batchSize elements as the minibatch
    return array.slice(0, batchSize)
}

function initialGameState(dimensions: Dimensions, random: Random): SnakeGameState {
    return new DefaultSnakeGameState(
        dimensions,
        ({y, x}) => x === 0 || x === dimensions.width - 1 || y === 0 || y === dimensions.height - 1,
        random,
        {
            scorePointsForFood: 1
        }
    )
}

function max<T>(array: T[], fctA: (v: T) => number) {
    return array.reduce((r, a) => (fctA(a) > fctA(r) ? a : r))
}

export function nnInputFor(s: Augmented, a: SnakeGameAction, dim: number) {
    const [freiLeft, tileLeft] = s.wievieleFrei(Blickrichtungen.Left)
    const [freiLeftUp, tileLeftUp] = s.wievieleFrei(Blickrichtungen.LeftUp)
    const [freiUp, tileUp] = s.wievieleFrei(Blickrichtungen.Up)
    const [freiRightUp, tileRightUp] = s.wievieleFrei(Blickrichtungen.RightUp)
    const [freiRight, tileRight] = s.wievieleFrei(Blickrichtungen.Right)
    const [freiRightDown, tileRightDown] = s.wievieleFrei(Blickrichtungen.RightDown)
    const [freiDown, tileDown] = s.wievieleFrei(Blickrichtungen.Down)
    const [freiLeftDown, tileLeftDown] = s.wievieleFrei(Blickrichtungen.LeftDown)


    // console.log("state", {...s.boardState})
    return [
        // In welche Richtung bewege ich nmich ? 4 inputs
        s.boardState.snake.direction === Direction.Left ? 1 : 0,
        s.boardState.snake.direction === Direction.Up ? 1 : 0,
        s.boardState.snake.direction === Direction.Right ? 1 : 0,
        s.boardState.snake.direction === Direction.Down ? 1 : 0,
        // In alle 8 Richtungen, wie viele Blöcke weit ist frei? (normalisieren) 8 inputs
        freiLeft / (dim-2),
        freiLeftUp / (dim-2),
        freiUp / (dim-2),
        freiRightUp / (dim-2),
        freiRight / (dim-2),
        freiRightDown / (dim-2),
        freiDown / (dim-2),
        freiLeftDown / (dim-2),
        // In alle 8 Richtungen, nach dieser Anzahl Blöcken, was finde ich dort? (Wand,Snake,Food) 3*8 Inputs
        tileLeft === Tile.Wall ? 1 : 0,
        tileLeft === Tile.Snake ? 1 : 0,
        tileLeft === Tile.Food ? 1 : 0,

        tileLeftUp === Tile.Wall ? 1 : 0,
        tileLeftUp === Tile.Snake ? 1 : 0,
        tileLeftUp === Tile.Food ? 1 : 0,

        tileUp === Tile.Wall ? 1 : 0,
        tileUp === Tile.Snake ? 1 : 0,
        tileUp === Tile.Food ? 1 : 0,

        tileRightUp === Tile.Wall ? 1 : 0,
        tileRightUp === Tile.Snake ? 1 : 0,
        tileRightUp === Tile.Food ? 1 : 0,

        tileRight === Tile.Wall ? 1 : 0,
        tileRight === Tile.Snake ? 1 : 0,
        tileRight === Tile.Food ? 1 : 0,

        tileRightDown === Tile.Wall ? 1 : 0,
        tileRightDown === Tile.Snake ? 1 : 0,
        tileRightDown === Tile.Food ? 1 : 0,

        tileDown === Tile.Wall ? 1 : 0,
        tileDown === Tile.Snake ? 1 : 0,
        tileDown === Tile.Food ? 1 : 0,

        tileLeftDown === Tile.Wall ? 1 : 0,
        tileLeftDown === Tile.Snake ? 1 : 0,
        tileLeftDown === Tile.Food ? 1 : 0,

        // X von Kopf (normalisiert) 1 Inputs
        (s.boardState.snake.head.x) / (dim - 2),
        // Y von Kopf (normalisiert)1 Inputs
        (s.boardState.snake.head.y) / (dim - 2),
        // X von Food (normalisiert) 1 Inputs
        (s.boardState.food!.x) / (dim - 2),
        // Y von Food (normalisiert)1 Inputs
        (s.boardState.food!.y) / (dim - 2),
        // + 4 inputs für die möglichen 4 actions
        a === SnakeGameAction.Left ? 1 : 0,
        a === SnakeGameAction.Up ? 1 : 0,
        a === SnakeGameAction.Right ? 1 : 0,
        a === SnakeGameAction.Down ? 1 : 0
    ]
}

export class QLearning {
    constructor(private readonly initGameState : SnakeGameState) {
    }

    foo(Q: INeuralNetwork,
        learningRate: number,
        num_episodes: number,
        max_steps_per_episode: number,
        epsilon: number,
        random: Random,
        discountFactor: number = .75,
        rewardForLosingMove: number = -2,
        rewardForSurvivingMove: number = 1 / 225,
        rewardForEatingFood: number = 1,
        replayBufferSize: number = 10000,
        miniBatchSize: number = 64,
        updateQPrimeAfterSteps: number = 25,
        dim: number
    ) {
        let totaltotal = 0
        let totalScore = 0
        const replayBuffer: [Augmented, SnakeGameAction, number, Augmented][] = []
        let countOfQPrimeUpdates = 0
        let totalSteps = 0
        epsilon = 1
        const epsilon_min = 0.01 // minimum exploration rate
        const epsilon_decay = 0.99 // exploration rate decay factor

        const QPrime = Q.copy()
        for (let episode = 1; episode <= num_episodes; episode++) {
            let s: Augmented = new AugmentedState(
                this.initGameState    // initialGameState({height: dim, width: dim}, random)
            )
            let total_reward = 0

            let stepsOfEpisode = 0
            for (let t = 1; t <= max_steps_per_episode; t++) {
                totalSteps++
                const randomNumber = random.random()


                const a = randomNumber >= 1 - epsilon ?
                    random.randomElementOf([SnakeGameAction.Left, SnakeGameAction.Right, SnakeGameAction.Up, SnakeGameAction.Down]) :
                    max(
                        [SnakeGameAction.Left, SnakeGameAction.Right, SnakeGameAction.Up, SnakeGameAction.Down],
                        (a) => Q.predict(nnInputFor(s, a, dim))[0]
                    )

                const sPrime = new AugmentedState(s.performAction(a))
                const r = sPrime.gameOver ? rewardForLosingMove :
                    sPrime.score === s.score ? rewardForSurvivingMove :
                        rewardForEatingFood//TODO: sPrime.score - s.score
                // console.log(sPrime.gameOver ? "Game Over" : sPrime.score === s.score ? "Survived" : "Ate Food", "reward",r)
                // console.log("Episode",episode,"Reward",r)
                replayBuffer.push(
                    [s, a, r, (sPrime)]
                )
                if (replayBuffer.length > replayBufferSize) {
                    const _ = replayBuffer.shift()
                }
                total_reward += r

                const minibatch = sampleMiniBatch(replayBuffer, miniBatchSize)

                // const yisOld = minibatch.map(([si, ai, ri, siPrime]) => [ri + discountFactor * Math.max(
                //     ...[SnakeGameAction.Left, SnakeGameAction.Up, SnakeGameAction.Right, SnakeGameAction.Down].flatMap(sga => QPrime.predict(nnInputFor(siPrime, sga))[0])
                // )])
                // const delta = yi - Q.predict(nnInputFor(s, a))[0]

                const yis : number[][] = []
                const inputs : number[][] = []


                for (let transitionIndex = 0; transitionIndex < minibatch.length; transitionIndex++) {
                    const [si, ai, ri, siPrime] = minibatch[transitionIndex]
                    yis.push([ri + discountFactor * Math.max(
                        ...[SnakeGameAction.Left, SnakeGameAction.Up, SnakeGameAction.Right, SnakeGameAction.Down].flatMap(sga => QPrime.predict(nnInputFor(siPrime, sga, dim))[0])
                    )])
                    inputs.push(
                        nnInputFor(si, ai, dim)
                    )
                }

                const [sifoo, aifoo, rifoo, siPrimefoo] = minibatch[0]
                console.log(QPrime.predict(nnInputFor(sifoo, SnakeGameAction.Down, dim))[0],"Down",SnakeGameAction.Down === aifoo)
                console.log(QPrime.predict(nnInputFor(sifoo, SnakeGameAction.Left, dim))[0],"Left",SnakeGameAction.Left === aifoo)
                console.log(QPrime.predict(nnInputFor(sifoo, SnakeGameAction.Up, dim))[0],"Up",SnakeGameAction.Up === aifoo)
                console.log(QPrime.predict(nnInputFor(sifoo, SnakeGameAction.Right, dim))[0],"Right",SnakeGameAction.Right === aifoo)

                console.log("inputs",inputs,"trainings goals",yis,"reward was ",rifoo,"state before",sifoo,"state after",siPrimefoo)


                QPrime.train(
                    inputs,
                    // minibatch.map(
                    //     ([si, ai, ri, siPrime])=>
                    //         nnInputFor(si, ai)
                    // ),
                    yis,
                    learningRate
                )

                console.log(QPrime.predict(nnInputFor(sifoo, SnakeGameAction.Down, dim))[0],"Down",SnakeGameAction.Down === aifoo)
                console.log(QPrime.predict(nnInputFor(sifoo, SnakeGameAction.Left, dim))[0],"Left",SnakeGameAction.Left === aifoo)
                console.log(QPrime.predict(nnInputFor(sifoo, SnakeGameAction.Up, dim))[0],"Up",SnakeGameAction.Up === aifoo)
                console.log(QPrime.predict(nnInputFor(sifoo, SnakeGameAction.Right, dim))[0],"Right",SnakeGameAction.Right === aifoo)
                //
                return QPrime.copy()

                if (totalSteps % updateQPrimeAfterSteps === 0 || episode === num_episodes && t ===max_steps_per_episode) {
                    Q.takeWeightsFrom(QPrime)
                    countOfQPrimeUpdates++
                    console.log('\t\t\t>>>>>>> Updated Q weights >>>>>>>>>>', countOfQPrimeUpdates)
                }


                // }
                // console.log("dumbo")

                if (sPrime.gameOver) break



                s = sPrime
                stepsOfEpisode = t
            }



            console.log('Episode', episode, 'Total Reward', total_reward, 'Score', s.score, "Steps",stepsOfEpisode, "Total steps",totalSteps % updateQPrimeAfterSteps,"/",updateQPrimeAfterSteps, "Epsilon",epsilon,
                'Durchschnitt Reward bisher', totaltotal / episode,
            'Durchschnitt Score bisher', totalScore / episode
                )
            totaltotal += total_reward
            totalScore += s.score


            epsilon = Math.max(epsilon_min, epsilon * epsilon_decay)
        }

        console.log('Durchschnitt Reward pro Episode', totaltotal / num_episodes)
        console.log('Durchschnitt Score pro Episode', totalScore / num_episodes)

        return Q.copy()
    }
}
