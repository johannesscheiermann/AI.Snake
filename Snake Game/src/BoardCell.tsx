import styled from 'styled-components'

interface Coordinates {
    x: number
    y: number
}

interface BoardCellProps {
    coordinates: Coordinates
}

const StyledBoardCell = styled.div`
  border: 1px solid black;
`

function BoardCell(props: BoardCellProps) {
    return <StyledBoardCell>

    </StyledBoardCell>
}

export default BoardCell