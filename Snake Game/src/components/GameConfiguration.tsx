import {useGameAgent, useGameAgentDispatch} from '../contexts/GameAgentContext'
import {AgentOption} from '../models/AgentOption'

interface GameConfigurationProps {
    agentOptions: AgentOption[]
}

function GameConfiguration(props: GameConfigurationProps) {
    const selectedAgent = useGameAgent()
    const agentDispatch = useGameAgentDispatch()

    return <select
        value={selectedAgent?.id ?? 'undefined'}
        onChange={event => agentDispatch({
            type: 'game_agent_chosen',
            agent: props.agentOptions.find(o => o.id === parseInt(event.target.value))
        })}
    >
        {
            selectedAgent === undefined &&
            <option disabled value="undefined">Chose an agent</option>
        }

        {
            props.agentOptions.map(o =>
                <option
                    key={o.id}
                    value={o.id}
                >
                    {o.name}
                </option>
            )
        }
    </select>
}

export default GameConfiguration
