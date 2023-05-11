import { useTimeseriesSelectionInitialization } from "@figurl/timeseries-views"
import { FunctionComponent, useEffect, useMemo, useState } from "react"
import ZarrArrayClient from "../../../../zarr/ZarrArrayClient"
import { useBatch } from "../../BatchContext"
import { useBatchDisplayOptions } from "../../BatchDisplayOptionsContext"
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
    const {viewFiltered} = useBatchDisplayOptions()

    useEffect(() => {
        let canceled = false
        setSpikeTimesData(undefined)
        setSpikeAmplitudesData(undefined)
        ;(async () => {
            const zarrUri = `${batchUri}/units/${unitId}/data.zarr`
            const c1 = new ZarrArrayClient(zarrUri, 'spike_times')
            const x = await c1.getArray1D()
            if (canceled) return
            setSpikeTimesData(x)
            const a = viewFiltered ? '_filtered_only' : ''
            const c2 = new ZarrArrayClient(zarrUri, 'spike_amplitudes' + a)
            const y = await c2.getArray1D()
            if (canceled) return
            setSpikeAmplitudesData(y)
        })()
        return () => {canceled = true}
    }, [batchUri, unitId, viewFiltered])

    const {ampMin, ampMax} = useMemo(() => {
        if (!spikeAmplitudesData) return {ampMin: 0, ampMax: 1}
        let ampMin = 0 // be sure to include 0
        let ampMax = 0 // be sure to include 0
        for (let i = 0; i < spikeAmplitudesData.length; i++) {
            const amp = spikeAmplitudesData[i]
            if (amp < ampMin) ampMin = amp
            if (amp > ampMax) ampMax = amp
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