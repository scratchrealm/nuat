import { FunctionComponent, useEffect, useMemo, useState } from "react"
import ZarrArrayClient from "../../../../zarr/ZarrArrayClient"
import { useBatch } from "../../BatchContext"
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

    useEffect(() => {
        (async () => {
            const zarrUri = `${batchUri}/units/${unitId}/data.zarr`
            const c1 = new ZarrArrayClient(zarrUri, 'average_waveform_in_neighborhood')
            const x = await c1.getArray2D()
            setAverageWaveformData(x)
        })()
    }, [batchUri, unitId])

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

    if (!averageWaveformData) return <div>Loading waveform data...</div>
    return (
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
            layoutMode="vertical"
            hideElectrodes={false}
            channelLocations={channelLocations}
            peakAmplitude={peakAmplitude}
            ampScaleFactor={1}
            horizontalStretchFactor={1}
            showChannelIds={true}
            useUnitColors={false}
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

export default AverageWaveformView