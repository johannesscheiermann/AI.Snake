import styled from 'styled-components'
import BoardCell from './BoardCell'

interface Dimensions {
    width: number
    height: number
}

interface BoardProps {
    dimensions: Dimensions
}

const StyledBoard = styled.div<{ dimensions: Dimensions; }>`
  display: grid;
  grid-template-rows: repeat(${props => props.dimensions.height}, 50px);
  grid-template-columns: repeat(${props => props.dimensions.width}, 50px);
  gap: 1px;
`

function Board(props: BoardProps) {
    return <StyledBoard dimensions={props.dimensions}>
        {
            crossProduct(
                range(props.dimensions.width),
                range(props.dimensions.height)
            ).map(([x, y]) =>
                <BoardCell
                    key={`${x},${y}`}
                    coordinates={{x, y}}
                />
            )
        }
    </StyledBoard>
}

const range = (n: number): number[] => [...Array(n).keys()]

function crossProduct<T1, T2>(xs: T1[], ys: T2[]): [T1, T2][] {
    return xs.flatMap(x =>
        ys.map(y => [x, y] as [T1, T2])
    )
}

export default Board