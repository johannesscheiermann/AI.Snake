import React, {useEffect, useRef, useState} from 'react'
import {useGameState, useGameStateDispatch} from '../../contexts/GameStateContext'
import Board from './board/Board'
import {useGameAgent} from '../../contexts/GameAgentContext'
import {useGameAction, useGameActionDispatch} from '../../contexts/GameActionContext'
import {nnInputFor} from '../../neural-network/qLearning'
import {AugmentedState} from '../../game-logic/SnakeGameState'
import {xd} from '../../App'

interface GameProps {
    moveTimeMilliseconds: number
}

function Game(props: GameProps) {

    const gameAgent = useGameAgent()
    const gameState = useGameState()
    const gameActionDispatch = useGameActionDispatch()

    useEffect(() => {
        if (gameState) {
            gameAgent?.lazyInstance.value.updateNextGameAction(
                gameState,
                nextGameAction => gameActionDispatch({
                    type: 'game_action_chosen',
                    gameAction: nextGameAction
                })
            )
        }
    }, [gameAgent, gameState, gameActionDispatch])

    const nextAction = useGameAction()
    const nextActionRef = useRef(nextAction)
    useEffect(() => {
        nextActionRef.current = nextAction
    }, [nextAction])

    const gameStateDispatch = useGameStateDispatch()

    const [weiter, setWeiter] = useState<boolean>(false)
    const refWeiter = useRef(weiter)
    refWeiter.current = weiter


    useEffect(() => {
        const intervalId = setInterval(
            () => {
                if (weiter) {
                    setWeiter(false)
                    gameStateDispatch({
                        type: 'game_action_performed',
                        gameAction: nextActionRef.current
                    })
                    // console.log(xd(nnInputFor(new AugmentedState(gameState!),nextAction,gameState?.dimensions.height!)))
                } else if(!gameState?.gameStarted){
                    // console.log(xd(nnInputFor(new AugmentedState(gameState!),nextAction,gameState?.dimensions.height!)))

                }
            },
            props.moveTimeMilliseconds
        )
        return () => clearInterval(intervalId)
    }, [gameStateDispatch, props.moveTimeMilliseconds, weiter])


    useEffect(
        () => {
            window.addEventListener('keyup', e => {
                if (e.key === 'Enter') {
                    setWeiter(true)
                }
            })
        }, []
    )

    return <Board/>
}

export default Game