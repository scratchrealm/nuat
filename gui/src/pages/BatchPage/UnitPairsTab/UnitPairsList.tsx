import { FunctionComponent, useCallback, useMemo } from "react"
import { UnitPairAssessment, useBatchAssessment } from "../BatchAssessmentContext"
import { UnitPairId } from "../BatchContext"
import { useUnitPairSelection } from "./UnitPairSelectionContext"

type Props = {
    width: number
    height: number
}

export function equalUnitPairIds(x: UnitPairId, y: UnitPairId) {
    return x[0] === y[0] && x[1] === y[1]
}

function unitPairIdToString(unitPairId: UnitPairId) {
    return `${unitPairId[0]}-${unitPairId[1]}`
}

const UnitPairsList: FunctionComponent<Props> = ({width, height}) => {
    const {unitPairIds, setCurrentUnitPairId, currentUnitPairId} = useUnitPairSelection()
    const {batchAssessment} = useBatchAssessment()
    const handleUnitClick = useCallback((unitPairId: UnitPairId) => {
        setCurrentUnitPairId(unitPairId)
    }, [setCurrentUnitPairId])
    const styleForUnitPairId = useMemo(() => ((unitPairId: UnitPairId) => {
        if (currentUnitPairId === undefined) return {}
        if (equalUnitPairIds(unitPairId, currentUnitPairId)) {
            return {
                backgroundColor: '#2222FF',
                color: 'white'
            }
        }
        else {
            return {}
        }
    }), [currentUnitPairId])
    const unitPairAssessmentsByIdString = useMemo(() => {
        const ret: {[key: string]: UnitPairAssessment} = {}
        if (!batchAssessment) return ret
        for (const u of batchAssessment.unitPairAssessments) {
            if (u) ret[unitPairIdToString(u.unitPairId)] = u.assessment
        }
        return ret
    }, [batchAssessment])
    return (
        <div style={{position: 'absolute', width, height, background: 'white'}}>
            <table>
                <thead>
                    <tr>
                        <th>Unit pair</th>
                        <th>Assess. {}</th>
                    </tr>
                </thead>
                <tbody>
                    {unitPairIds?.map((unitPairId) => (
                        <tr key={unitPairIdToString(unitPairId)} onClick={() => {handleUnitClick(unitPairId)}} style={{cursor: 'pointer', ...styleForUnitPairId(unitPairId)}}>
                            <td>{unitPairIdToString(unitPairId)}</td>
                            <td>{unitPairAssessmentsByIdString[unitPairIdToString(unitPairId)] ? <span>&#x2713; {unitPairAssessmentsByIdString[unitPairIdToString(unitPairId)].separation.overall}</span> : ''}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default UnitPairsList