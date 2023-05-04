import { useTimeseriesSelectionInitialization } from "@figurl/timeseries-views"
import { FunctionComponent, useEffect, useMemo, useState } from "react"
import ZarrArrayClient from "../../../../zarr/ZarrArrayClient"
import { useBatch } from "../../BatchContext"
import SpikeAmplitudesPlot from "./SpikeAmplitudesPlot"

type Props = {
    width: number
    height: number
    unitId: string | number
}

const SpikeAmplitudesView: FunctionComponent<Props> = ({width, height, unitId}) => {
    const {batchUri} = useBatch()
    const [spikeTimesData, setSpikeTimesData] = useState<number[]>()
    const [spikeAmplitudesData, setSpikeAmplitudesData] = useState<number[]>()

    useEffect(() => {
        (async () => {
            const zarrUri = `${batchUri}/units/${unitId}/data.zarr`
            const c1 = new ZarrArrayClient(zarrUri, 'spike_times')
            const x = await c1.getArray1D()
            setSpikeTimesData(x)
            const c2 = new ZarrArrayClient(zarrUri, 'spike_amplitudes')
            const y = await c2.getArray1D()
            setSpikeAmplitudesData(y)
        })()
    }, [batchUri, unitId])

    const {ampMin, ampMax} = useMemo(() => {
        if (!spikeAmplitudesData) return {ampMin: 0, ampMax: 1}
        let ampMin = 0
        let ampMax = 1
        for (let i = 0; i < spikeAmplitudesData.length; i++) {
            const amp = spikeAmplitudesData[i]
            if (i === 0) {
                ampMin = amp
                ampMax = amp
            }
            else {
                if (amp < ampMin) ampMin = amp
                if (amp > ampMax) ampMax = amp
            }
        }
        return {ampMin, ampMax}
    }, [spikeAmplitudesData])

    if (!spikeAmplitudesData) return <div>Loading spike amplitude data...</div>
    if (!spikeTimesData) return <div>Loading spike times data...</div>
    return (
        <SpikeAmplitudesPlot
            spikeTimes={spikeTimesData}
            spikeAmplitudes={spikeAmplitudesData}
            ampMin={ampMin}
            ampMax={ampMax}
            width={width}
            height={height}
        />
    )
}

export default SpikeAmplitudesView