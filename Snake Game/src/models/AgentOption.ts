import {Lazy} from '../util/Lazy'
import {Agent} from '../agents/Agent'

export interface AgentOption {
    id: number
    name: string
    lazyInstance: Lazy<Agent>
}