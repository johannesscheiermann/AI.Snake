import styled from 'styled-components'
import BoardCell from './BoardCell'
import {crossProduct} from '../../../util/Combinatorics'
import {useGameState} from '../../../contexts/GameStateContext'
import {Dimensions} from '../../../models/Dimensions'
import {range} from '../../../util/Enumerations'

const StyledBoard = styled.div<{ dimensions: Dimensions }>`
  display: grid;
  grid-template-rows: repeat(${props => props.dimensions.height}, 50px);
  grid-template-columns: repeat(${props => props.dimensions.width}, 50px);
  gap: 1px;
`

function Board() {
    const gameState = useGameState()

    return !gameState ? <></> :
        (<StyledBoard dimensions={gameState.dimensions}>
            {
                crossProduct(
                    range(gameState.dimensions.height),
                    range(gameState.dimensions.width)
                ).map(([y, x]) => {
                        const tile = gameState.boardState.tileAt({y, x})
                        return <BoardCell
                            tile={tile}
                            key={JSON.stringify({y, x, tile})}
                        />
                    }
                )
            }
        </StyledBoard>)
}

export default Board
