import { FunctionComponent, useEffect, useMemo, useState } from "react"
import ZarrArrayClient from "../../../../zarr/ZarrArrayClient"
import { useBatch } from "../../BatchContext"
import { useBatchDisplayOptions } from "../../BatchDisplayOptionsContext"
import { UnitInfo } from "../CurrentUnitView"
import AverageWaveformPlot from "./AverageWaveformPlot"

type Props = {
    width: number
    height: number
    unitId: string | number
    unitInfo: UnitInfo
}

const AverageWaveformView: FunctionComponent<Props> = ({width, height, unitId, unitInfo}) => {
    const {batchUri} = useBatch()
    const [averageWaveformData, setAverageWaveformData] = useState<number[][]>()
    const {viewFiltered} = useBatchDisplayOptions()

    useEffect(() => {
        let canceled = false
        setAverageWaveformData(undefined)
        ;(async () => {
            const zarrUri = `${batchUri}/units/${unitId}/data.zarr`
            const a = viewFiltered ? '_filtered_only' : ''
            const name = 'average_waveform_in_neighborhood' + a
            const c1 = new ZarrArrayClient(zarrUri, name)
            const x = await c1.getArray2D()
            if (canceled) return
            setAverageWaveformData(x)
        })()
        return () => {canceled = true}
    }, [batchUri, unitId, viewFiltered])

    const channelLocations = useMemo(() => {
        const ret: {[key: string]: number[]} = {}
        for (let i = 0; i < unitInfo.channel_neighborhood_ids.length; i++) {
            const ch = unitInfo.channel_neighborhood_ids[i]
            const loc = unitInfo.channel_neighborhood_locations[i]
            ret[ch + ''] = [loc.x, loc.y]
        }
        return ret
    }, [unitInfo.channel_neighborhood_ids, unitInfo.channel_neighborhood_locations])

    const peakAmplitude = useMemo(() => {
        if (!averageWaveformData) return 0
        let max = 0
        for (let i = 0; i < averageWaveformData.length; i++) {
            const wf = averageWaveformData[i]
            for (let j = 0; j < wf.length; j++) {
                const val = Math.abs(wf[j])
                if (val > max) max = val
            }
        }
        return max
    }, [averageWaveformData])

    const {waveformOpts} = useBatchDisplayOptions()

    const leftToolbarWidth = 30

    if (!averageWaveformData) return <div>Loading waveform data...</div>
    return (
        <div style={{position: 'absolute', width, height}}>
            <div style={{position: 'absolute', width: leftToolbarWidth, height}}>
                <WaveformViewLeftToolbar
                    width={leftToolbarWidth}
                    height={height}
                />
            </div>
            <div style={{position: 'absolute', left: leftToolbarWidth, width: width - leftToolbarWidth, height}}>
                <AverageWaveformPlot
                    allChannelIds={unitInfo.channel_neighborhood_ids}
                    channelIds={unitInfo.channel_neighborhood_ids}
                    units={[
                        {
                            channelIds: unitInfo.channel_neighborhood_ids,
                            waveform: transpose(averageWaveformData),
                            waveformColor: 'blue'
                        }
                    ]}
                    layoutMode={waveformOpts.layoutMode}
                    hideElectrodes={false}
                    channelLocations={channelLocations}
                    peakAmplitude={peakAmplitude}
                    ampScaleFactor={1}
                    horizontalStretchFactor={1}
                    showChannelIds={true}
                    useUnitColors={false}
                    width={width - leftToolbarWidth}
                    height={height}
                    showReferenceProbe={false}
                    disableAutoRotate={true}
                />
            </div>
        </div>
    )
}

type WaveformViewLeftToolbarProps = {
    width: number
    height: number
}

export const WaveformViewLeftToolbar: FunctionComponent<WaveformViewLeftToolbarProps> = ({width, height}) => {
    const {waveformOpts, setWaveformOpts} = useBatchDisplayOptions()
    return (
        <div style={{position: 'absolute', width, height}}>
            <CheckboxComponent
                title="Geometry layout mode"
                value={waveformOpts.layoutMode === 'geom'}
                onChange={val => {
                    setWaveformOpts({
                        ...waveformOpts,
                        layoutMode: val ? 'geom' : 'vertical'
                    })
                }}
            />
        </div>
    )
}

type CheckboxComponentProps = {
    title: string
    value: boolean
    onChange: (val: boolean) => void
    readOnly?: boolean
}

export const CheckboxComponent: FunctionComponent<CheckboxComponentProps> = ({ title, value, onChange, readOnly }) => {
    return (
        <div>
            <input disabled={readOnly} type="checkbox" checked={value} onChange={evt => {
                onChange(evt.target.checked)
            }} title={title} />
        </div>
    )
}

export const transpose = (x: number[][]) => {
    const M = x.length
    const N = x[0].length
    const ret: number[][] = []
    for (let j = 0; j < N; j++) {
        const row: number[] = []
        for (let i = 0; i < M; i++) {
            row.push(x[i][j])
        }
        ret.push(row)
    }
    return ret
}

export default AverageWaveformView