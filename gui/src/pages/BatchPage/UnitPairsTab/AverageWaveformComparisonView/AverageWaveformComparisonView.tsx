import { FunctionComponent, useEffect, useMemo, useState } from "react"
import ZarrArrayClient from "../../../../zarr/ZarrArrayClient"
import { useBatch } from "../../BatchContext"
import AverageWaveformPlot from "../../UnitsTab/AverageWaveformView/AverageWaveformPlot"
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

    useEffect(() => {
        (async () => {
            const zarrUri = `${batchUri}/unit_pairs/${unitId1}-${unitId2}/data.zarr`
            const c1 = new ZarrArrayClient(zarrUri, 'average_waveform_1_in_neighborhood')
            const c2 = new ZarrArrayClient(zarrUri, 'average_waveform_2_in_neighborhood')
            const x1 = await c1.getArray2D()
            const x2 = await c2.getArray2D()
            setAverageWaveformComparisonData([x1, x2])
        })()
    }, [batchUri, unitId1, unitId2])

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

    if (!averageWaveformComparisonData) return <div>Loading waveform comparison data...</div>
    return (
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
            layoutMode="vertical"
            hideElectrodes={false}
            channelLocations={channelLocations}
            peakAmplitude={peakAmplitude}
            ampScaleFactor={1}
            horizontalStretchFactor={1}
            showChannelIds={true}
            useUnitColors={true}
            width={width}
            height={height}
            showReferenceProbe={false}
            disableAutoRotate={true}
        />
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