import {describe, expect, test} from '@jest/globals';
import {sum} from './sum';
import {QLearning} from '../neural-network/qLearning'
import {AsBoardState, Tile} from '../game-logic/BoardState'
import {initialGameState} from '../contexts/GameStateContext'
import {MathRandom} from '../models/Random'
import {NeuralNetwork} from '../neural-network/foo'
import {QAgent} from '../agents/QAgent'
import {INeuralNetwork} from '../neural-network/fooReLu'

describe('sum module', () => {
    test('adds 1 + 2 to equal 3', () => {
        expect(sum(1, 2)).toBe(3);
    });
});

// import { SnakeDQNAgent, SnakeGame } from "./snake";

describe("SnakeDQNAgent", () => {
    // describe("neural network", () => {
    //     it("should have the correct number of layers", () => {
    //         const agent = new QLearning();
    //         expect(agent.model.layers.length).toEqual(3);
    //     });
    //
    //     it("should have the correct input shape", () => {
    //         const agent = new SnakeDQNAgent();
    //         const inputShape = agent.model.layers[0].inputShape;
    //         expect(inputShape).toEqual([null, 11]);
    //     });
    //
    //     it("should have the correct output shape", () => {
    //         const agent = new SnakeDQNAgent();
    //         const outputShape = agent.model.layers[2].outputShape;
    //         expect(outputShape).toEqual([null, 4]);
    //     });
    // });

    describe("learning algorithm", () => {
        it("should improve over time", () => {
            const agent = new QLearning();
            const gameState = initialGameState({width:5,height:5},new MathRandom())
            let Q : INeuralNetwork = new NeuralNetwork(
                44,
                [128, 64],
                1
            )
            const QAgentr = new QAgent(Q,5)
            let state = gameState
            while(!state.gameOver){
                QAgentr.updateNextGameAction(
                    state,
                    na => {state = state.performAction(na)}
                )
            }
            const initialScore = state.score

            // Train for 10 episodes
            for (let i = 0; i < 10; i++) {
                Q = agent.foo(
                    Q,
                    .02,//learningRate: number,
                    400,//num_episodes: number,
                    300,//max_steps_per_episode: number,
                    1,//epsilon: number,
                    new MathRandom(),//random: Random,
                    .75,//discountFactor: number = .75,
                    -50,//rewardForLosingMove: number = -2,
                    0,//rewardForSurvivingMove: number = 1 / 225,
                    50,//rewardForEatingFood: number = 1,
                    (100000 - 10000) / 2,//replayBufferSize: number = 10000,
                    (128 - 32) / 2 * Math.pow(2,2),//miniBatchSize: number = 64,
                    250,//updateQPrimeAfterSteps: number = 25
                    5
                )
            }

            // Play a game with the trained agent
            const AfterQAgent = new QAgent(Q,5)
            state = gameState
            while(!state.gameOver){
                AfterQAgent.updateNextGameAction(
                    state,
                    na => {state = state.performAction(na)}
                )
            }

            expect(state.score).toBeGreaterThan(initialScore);
        });
    });

    // describe("gameplay", () => {
    //     it("should be able to play the game of Snake", () => {
    //         const agent = new SnakeDQNAgent();
    //         const game = new SnakeGame(10, 10);
    //         const initialState = game.getState();
    //
    //         // Play a game with the trained agent
    //         game.reset();
    //         while (!game.isOver()) {
    //             const state = game.getState();
    //             const action = agent.act(state);
    //             game.step(action);
    //         }
    //
    //         const finalState = game.getState();
    //
    //         expect(initialState.snake).not.toEqual(finalState.snake);
    //         expect(initialState.food).not.toEqual(finalState.food);
    //         expect(initialState.score).toBeLessThan(finalState.score);
    //     });
    // });
});
