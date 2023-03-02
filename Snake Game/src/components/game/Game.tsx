import React, {useEffect, useRef} from 'react'
import {useGameState, useGameStateDispatch} from '../../contexts/GameStateContext'
import Board from './board/Board'
import {useGameAgent} from '../../contexts/GameAgentContext'
import {useGameAction, useGameActionDispatch} from '../../contexts/GameActionContext'

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
    useEffect(() => {
        const intervalId = setInterval(
            () => gameStateDispatch({
                type: 'game_action_performed',
                gameAction: nextActionRef.current
            }),
            props.moveTimeMilliseconds
        )
        return () => clearInterval(intervalId)
    }, [gameStateDispatch, props.moveTimeMilliseconds])

    return <Board/>
}

export default Game