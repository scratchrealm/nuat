import { FunctionComponent, useMemo, useState } from "react"
import { useBatchAssessment } from "../../BatchAssessmentContext"
import { UnitInfo } from "../CurrentUnitView"

type Props = {
    width: number
    height: number
    unitId: number | string
    unitInfo: UnitInfo
}

const qKeys = [
    {key: 'autocorrelogram', label: 'Autocorrelogram'},
    {key: 'averageWaveform', label: 'Average waveform'},
    {key: 'spikeAmplitudes', label: 'Spike amplitudes'},
    {key: 'snippets', label: 'Snippets'},
    {key: 'overall', label: 'Overall'}
]

const UnitAssessmentView: FunctionComponent<Props> = ({ width, height, unitId }) => {
    const {batchAssessment, setUnitAssessment} = useBatchAssessment()

    const unitAssessment = useMemo(() => (
        batchAssessment ? (batchAssessment.unitAssessments.find(u => (u.unitId === unitId)) || {assessment: undefined}).assessment || {quality: {}} : undefined
    ), [batchAssessment, unitId])

    return (
        <div style={{position: 'absolute', width, height, overflowY: 'auto', background: '#225566', color: 'white'}}>
            <div style={{padding: 10}}>
                <h3>Unit assessment</h3>
                <p>Unit ID: {unitId}</p>
                <hr />
                {
                    qKeys.map(qKey => (
                        <div key={qKey.key}>
                            <div>{qKey.label}</div>
                            <RatingScale value={unitAssessment ? (unitAssessment.quality as any)[qKey.key] : undefined} onChange={val => {
                                setUnitAssessment(
                                    unitId, {
                                        quality: {
                                            ...(unitAssessment || {quality: {}}).quality,
                                            [qKey.key]: val
                                        }
                                    }
                                )
                            }} readOnly={batchAssessment ? false : true} />
                            <hr />
                        </div>
                    ))
                }
                <p>Zoom and pan the spike amplitudes view to see different spikes in the snippets view.</p>
            </div>
        </div>
    )
}

type RatingScaleProps = {
    value?: number
    onChange: (val: number) => void
    readOnly?: boolean
}

const RatingScale: FunctionComponent<RatingScaleProps> = ({ value, onChange, readOnly }) => {
    const values = [[1, 2, 3, 4, 5], [6, 7, 8, 9, 10]]
    return (
        <div>
            {
                values.map((row, i) => (
                    <span key={i}>
                        {
                            row.map(val => (
                                <span key={val}>
                                    <input disabled={readOnly} type="radio" value={val} checked={value === val} onChange={evt => {
                                        onChange(val)
                                    }} /><span style={{cursor: 'default'}}>{val}&nbsp;</span>
                                </span>
                            ))
                        }
                        <br />
                    </span>
                ))
            }
        </div>
    )
}

export default UnitAssessmentView