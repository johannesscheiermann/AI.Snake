export interface SearchNode<State, Action> {
    state: State
    depth: number
    pathCost: number
    previousAction: Action | undefined
    predecessor: SearchNode<State, Action> | undefined
    successors: SearchNode<State, Action>[]
    isExpanded: boolean
    isLeaf: boolean
}