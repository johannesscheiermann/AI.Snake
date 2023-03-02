import styled from 'styled-components'
import {Tile} from '../../../game-logic/BoardState'

interface BoardCellProps {
    tile: Tile
}

const StyledBoardCell = styled.div<{ tile: Tile }>`
  border: 1px solid black;
  background: ${props =>
          props.tile === Tile.Snake ? 'red' :
                  props.tile === Tile.Food ? 'green' :
                          props.tile === Tile.Wall ? 'gray' : undefined
  };
`

function BoardCell(props: BoardCellProps) {
    return <StyledBoardCell tile={props.tile}/>
}

export default BoardCell