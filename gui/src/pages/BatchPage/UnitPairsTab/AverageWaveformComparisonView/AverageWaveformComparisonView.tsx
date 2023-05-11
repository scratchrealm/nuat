import { FunctionComponent, useEffect, useMemo, useState } from "react"
import ZarrArrayClient from "../../../../zarr/ZarrArrayClient"
import { useBatch } from "../../BatchContext"
import { useBatchDisplayOptions } from "../../BatchDisplayOptionsContext"
import AverageWaveformPlot from "../../UnitsTab/AverageWaveformView/AverageWaveformPlot"
import { WaveformViewLeftToolbar } from "../../UnitsTab/AverageWaveformView/AverageWaveformView"
import { UnitPairInfo } from "../CurrentUnitPairView"

type Props = {
    width: number
    height: number
    unitId1: string | number
    unitId2: string | number
    unitPairInfo: UnitPairInfo
}

const AverageWaveformComparisonView: FunctionComponent<Props> = ({width, height, unitId1, unitId2, unitPairInfo}) => {
    const {batchUri} = useBatch()
    const [averageWaveformComparisonData, setAverageWaveformComparisonData] = useState<[number[][], number[][]]>()

    const {waveformOpts, viewFiltered} = useBatchDisplayOptions()

    useEffect(() => {
        let canceled = false
        setAverageWaveformComparisonData(undefined)
        ;(async () => {
            const zarrUri = `${batchUri}/unit_pairs/${unitId1}-${unitId2}/data.zarr`
            const a = viewFiltered ? '_filtered_only' : ''
            const c1 = new ZarrArrayClient(zarrUri, 'average_waveform_1_in_neighborhood' + a)
            const c2 = new ZarrArrayClient(zarrUri, 'average_waveform_2_in_neighborhood' + a)
            const x1 = await c1.getArray2D()
            const x2 = await c2.getArray2D()
            if (canceled) return
            setAverageWaveformComparisonData([x1, x2])
        })()
        return () => {canceled = true}
    }, [batchUri, unitId1, unitId2, viewFiltered])

    const channelLocations = useMemo(() => {
        const ret: {[key: string]: number[]} = {}
        for (let i = 0; i < unitPairInfo.channel_neighborhood_ids.length; i++) {
            const ch = unitPairInfo.channel_neighborhood_ids[i]
            const loc = unitPairInfo.channel_neighborhood_locations[i]
            ret[ch + ''] = [loc.x, loc.y]
        }
        return ret
    }, [unitPairInfo.channel_neighborhood_ids, unitPairInfo.channel_neighborhood_locations])

    const peakAmplitude = useMemo(() => {
        if (!averageWaveformComparisonData) return 0
        let max = 0
        for (let aa = 0; aa < 2; aa++) {
            for (let i = 0; i < averageWaveformComparisonData[aa].length; i++) {
                const wf = averageWaveformComparisonData[aa][i]
                for (let j = 0; j < wf.length; j++) {
                    const val = Math.abs(wf[j])
                    if (val > max) max = val
                }
            }
        }
        return max
    }, [averageWaveformComparisonData])

    const leftToolbarWidth = 30

    if (!averageWaveformComparisonData) return <div>Loading waveform comparison data...</div>
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
                    allChannelIds={unitPairInfo.channel_neighborhood_ids}
                    channelIds={unitPairInfo.channel_neighborhood_ids}
                    units={[
                        {
                            channelIds: unitPairInfo.channel_neighborhood_ids,
                            waveform: transpose(averageWaveformComparisonData[0]),
                            waveformColor: 'blue'
                        },
                        {
                            channelIds: unitPairInfo.channel_neighborhood_ids,
                            waveform: transpose(averageWaveformComparisonData[1]),
                            waveformColor: 'red'
                        }
                    ]}
                    layoutMode={waveformOpts.layoutMode}
                    hideElectrodes={false}
                    channelLocations={channelLocations}
                    peakAmplitude={peakAmplitude}
                    ampScaleFactor={1}
                    horizontalStretchFactor={1}
                    showChannelIds={true}
                    useUnitColors={true}
                    width={width - leftToolbarWidth}
                    height={height}
                    showReferenceProbe={false}
                    disableAutoRotate={true}
                />
            </div>
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

export default AverageWaveformComparisonView