import styled from 'styled-components'
import {useGameState, useGameStateDispatch} from '../contexts/GameStateContext'
import {useGameAgent} from '../contexts/GameAgentContext'
import {SnakeGameState} from '../game-logic/SnakeGameState'
import {useGameActionDispatch} from '../contexts/GameActionContext'

const StyledGamePanel = styled.div`
  align-self: stretch;
  flex-grow: 1;

  display: flex;
  flex-direction: column;

  border: 1px solid black;
`

function GamePanel() {
    const gameAgent = useGameAgent()
    const gameState = useGameState()
    const gameStateDispatch = useGameStateDispatch()
    const gameActionDispatch = useGameActionDispatch()

    const resetGame = () => {
        gameStateDispatch({type: 'game_state_reset'})
        gameActionDispatch({type: 'game_action_reset'})
    }

    return !gameState ? <></> :
        (<StyledGamePanel>
            <span>Score: {gameState.score}</span>
            <span>Status: {gameStatusFor(gameState, !!gameAgent)}</span>
            <button onClick={resetGame}>Reset the game</button>
        </StyledGamePanel>)
}

function gameStatusFor(gameState: SnakeGameState, gameAgentSelected: boolean): string {
    return !gameAgentSelected ? 'Waiting for a game agent to be chosen' :
        !gameState.gameStarted ? 'Waiting for the first game action' :
            gameState.gameOver ? 'The game is over' :
                'The game is still running'
}

export default GamePanel
