import { FunctionComponent, useMemo } from "react"
import { useBatchAssessment } from "../../BatchAssessmentContext"
import { UnitPairId } from "../../BatchContext"
import { CheckboxComponent, CommentsComponent, RatingScale } from "../../UnitsTab/UnitAssessmentView/UnitAssessmentView"
import { UnitPairInfo } from "../CurrentUnitPairView"
import { equalUnitPairIds } from "../UnitPairsList"

type Props = {
    width: number
    height: number
    unitPairId: UnitPairId
    unitPairInfo: UnitPairInfo
}

const qKeys = [
    {key: 'crossCorrelogram', label: 'Cross correlogram', tooltip: "A score of 0 indicates these are certainly the same unit, while a score of 5 indicates there is no evidence to suggest these are the same unit."},
    {key: 'averageWaveforms', label: 'Average waveforms', tooltip: "A score of 0 indicates these are certainly the same unit, while a score of 5 indicates there is no evidence to suggest these are the same unit."},
    {key: 'discriminationOverTime', label: 'Spike discrimination over time', tooltip: "A score of 0 indicates these are certainly the same unit, while a score of 5 indicates there is no evidence to suggest these are the same unit."},
    {key: 'overall', label: 'Overall', tooltip: "A score of 0 indicates these are certainly the same unit, while a score of 5 indicates there is no evidence to suggest these are the same unit."}
]

const UnitPairAssessmentView: FunctionComponent<Props> = ({ width, height, unitPairId }) => {
    const {batchAssessment, setUnitPairAssessment} = useBatchAssessment()

    const unitPairAssessment = useMemo(() => (
        // batchAssessment ? (batchAssessment.unitAssessments.find(u => (u.unitId === unitId)) || {assessment: undefined}).assessment || {quality: {}} : undefined
        batchAssessment ? (batchAssessment.unitPairAssessments.find(u => (equalUnitPairIds(u.unitPairId, unitPairId))) || {assessment: undefined}).assessment || {separation: {}} : undefined
    ), [batchAssessment, unitPairId])

    const userId = batchAssessment ? batchAssessment.userId : undefined

    return (
        <div style={{position: 'absolute', width, height, overflowY: 'auto', background: '#225566', color: 'white', fontSize: 12}}>
            <div style={{padding: 10}}>
                <h3>Unit assessment {userId ? `(${userId})` : ''}</h3>
                <p>Unit pair: {unitPairId[0]}-{unitPairId[1]}</p>
                <hr />
                {
                    qKeys.map(qKey => (
                        <div key={qKey.key}>
                            <div title={qKey.tooltip} style={{cursor: 'default', textDecoration: 'underline'}}>{qKey.label}</div>
                            <RatingScale value={unitPairAssessment ? (unitPairAssessment.separation as any)[qKey.key] : undefined} onChange={val => {
                                setUnitPairAssessment(
                                    unitPairId, {
                                        ...(unitPairAssessment || {separation: {}}),
                                        separation: {
                                            ...(unitPairAssessment || {separation: {}}).separation,
                                            [qKey.key]: val
                                        }
                                    }
                                )
                            }} readOnly={batchAssessment ? false : true} />
                            <hr />
                        </div>
                    ))
                }
                <CheckboxComponent label="Burst pair" value={unitPairAssessment ? (unitPairAssessment.burstPair ? true : false) : false} onChange={val => {
                    setUnitPairAssessment(
                        unitPairId, {
                            ...(unitPairAssessment || {separation: {}}),
                            burstPair: val
                        }
                    )
                }} readOnly={batchAssessment ? false : true} />
                <p>Comments:</p>
                <CommentsComponent value={unitPairAssessment ? (unitPairAssessment.comments || '') : ''} onChange={val => {
                    setUnitPairAssessment(
                        unitPairId, {
                            ...(unitPairAssessment || {separation: {}}),
                            comments: val
                        }
                    )
                }} readOnly={batchAssessment ? false : true} />
                <button onClick={() => {
                    setUnitPairAssessment(unitPairId, undefined)
                }} disabled={batchAssessment ? false : true}>Clear</button>
            </div>
        </div>
    )
}

export default UnitPairAssessmentView