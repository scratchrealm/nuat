import { Check } from "@mui/icons-material"
import { FunctionComponent, useCallback, useMemo } from "react"
import { UnitAssessment, useBatchAssessment } from "../BatchAssessmentContext"
import { useUnitSelection } from "./UnitSelectionContext"

type Props = {
    width: number
    height: number
}

const UnitsList: FunctionComponent<Props> = ({width, height}) => {
    const {unitIds, setCurrentUnitId, currentUnitId} = useUnitSelection()
    const {batchAssessment} = useBatchAssessment()
    const handleUnitClick = useCallback((unitId: string | number) => {
        setCurrentUnitId(unitId)
    }, [setCurrentUnitId])
    const styleForUnitId = useMemo(() => ((unitId: string | number) => {
        if (unitId === currentUnitId) {
            return {
                backgroundColor: '#2222FF',
                color: 'white'
            }
        }
        else {
            return {}
        }
    }), [currentUnitId])
    const unitAssessmentsById = useMemo(() => {
        const ret: {[key: string | number]: UnitAssessment} = {}
        if (!batchAssessment) return ret
        for (const u of batchAssessment.unitAssessments) {
            if (u) ret[u.unitId] = u.assessment
        }
        return ret
    }, [batchAssessment])
    return (
        <div style={{position: 'absolute', width, height, background: 'white'}}>
            <table>
                <thead>
                    <tr>
                        <th>Unit</th>
                        <th>Assess. {}</th>
                    </tr>
                </thead>
                <tbody>
                    {unitIds?.map((unitId) => (
                        <tr key={unitId} onClick={() => {handleUnitClick(unitId)}} style={{cursor: 'pointer', ...styleForUnitId(unitId)}}>
                            <td>{unitId}</td>
                            <td>{unitAssessmentsById[unitId] ? <span>&#x2713; {unitAssessmentsById[unitId].quality.overall}</span> : ''}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default UnitsList