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
    {key: 'autocorrelogram', label: 'Autocorrelogram', tooltip: "A score of 1 indicates no refractory period dip, while a score of 10 indicates a clear dip and no ISI violations."},
    {key: 'averageWaveform', label: 'Average waveform', tooltip: "A score of 1 indicates the template has no resemblance to a spike, while a score of 10 indicates a typical spike of a neural event."},
    {key: 'spikeAmplitudes', label: 'Spike amplitudes', tooltip: "A score of 1 indicates that the spike amplitudes imply multi-unit or extremely artifactual activity, while a score of 10 indicates steady and consistent amplitudes."},
    {key: 'snippets', label: 'Snippets', tooltip: "A score of 1 indicates a high number of outliers or pure noise snippets, while a score of 10 indicates that all snippets look like the average waveform plus noise."},
    {key: 'overall', label: 'Overall', tooltip: "A score of 1 indicates a very poor unit, while a score of 10 indicates a very good unit."}
]

const UnitAssessmentView: FunctionComponent<Props> = ({ width, height, unitId }) => {
    const {batchAssessment, setUnitAssessment} = useBatchAssessment()

    const unitAssessment = useMemo(() => (
        batchAssessment ? (batchAssessment.unitAssessments.find(u => (u.unitId === unitId)) || {assessment: undefined}).assessment || {quality: {}} : undefined
    ), [batchAssessment, unitId])

    const userId = batchAssessment ? batchAssessment.userId : undefined

    return (
        <div style={{position: 'absolute', width, height, overflowY: 'auto', background: '#225566', color: 'white', fontSize: 12}}>
            <div style={{padding: 10}}>
                <h3>Unit assessment {userId ? `(${userId})` : ''}</h3>
                <p>Unit ID: {unitId}</p>
                <hr />
                {
                    qKeys.map(qKey => (
                        <div key={qKey.key}>
                            <div title={qKey.tooltip} style={{cursor: 'default', textDecoration: 'underline'}}>{qKey.label}</div>
                            <RatingScale value={unitAssessment ? (unitAssessment.quality as any)[qKey.key] : undefined} onChange={val => {
                                setUnitAssessment(
                                    unitId, {
                                        ...(unitAssessment || {quality: {}}),
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
                <CheckboxComponent label="Multi-unit activity" value={unitAssessment ? (unitAssessment.multiUnitActivity ? true : false) : false} onChange={val => {
                    setUnitAssessment(
                        unitId, {
                            ...(unitAssessment || {quality: {}}),
                            multiUnitActivity: val
                        }
                    )
                }} readOnly={batchAssessment ? false : true} />
                <CheckboxComponent label="Noise overlap" value={unitAssessment ? (unitAssessment.noiseOverlap ? true : false) : false} onChange={val => {
                    setUnitAssessment(
                        unitId, {
                            ...(unitAssessment || {quality: {}}),
                            noiseOverlap: val
                        }
                    )
                }} readOnly={batchAssessment ? false : true} />
                <p>Comments:</p>
                <CommentsComponent value={unitAssessment ? (unitAssessment.comments || '') : ''} onChange={val => {
                    setUnitAssessment(
                        unitId, {
                            ...(unitAssessment || {quality: {}}),
                            comments: val
                        }
                    )
                }} readOnly={batchAssessment ? false : true} />
                <p>Zoom and pan the spike amplitudes view to see different spikes in the snippets view.</p>
                <button onClick={() => {
                    setUnitAssessment(
                        unitId, {quality: {}}
                    )
                }}>Clear</button>
            </div>
        </div>
    )
}

type RatingScaleProps = {
    value?: number
    onChange: (val: number) => void
    readOnly?: boolean
    tooltip?: string
}

const RatingScale: FunctionComponent<RatingScaleProps> = ({ value, onChange, readOnly, tooltip }) => {
    const values = [[1, 2, 3, 4, 5], [6, 7, 8, 9, 10]]
    return (
        <div title={tooltip}>
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

type CheckboxComponentProps = {
    label: string
    value: boolean
    onChange: (val: boolean) => void
    readOnly?: boolean
}

const CheckboxComponent: FunctionComponent<CheckboxComponentProps> = ({ label, value, onChange, readOnly }) => {
    return (
        <div>
            <input disabled={readOnly} type="checkbox" checked={value} onChange={evt => {
                onChange(evt.target.checked)
            }} /><span style={{cursor: 'default'}}>{label}</span>
        </div>
    )
}

type CommentsComponentProps = {
    value: string
    onChange: (val: string) => void
    readOnly?: boolean
}

const CommentsComponent: FunctionComponent<CommentsComponentProps> = ({ value, onChange, readOnly }) => {
    return (
        <div>
            <textarea disabled={readOnly} value={value} rows={6} onChange={evt => {
                onChange(evt.target.value)
            }} />
        </div>
    )
}

export default UnitAssessmentView