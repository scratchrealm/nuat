import { FunctionComponent, useEffect, useMemo, useState } from "react"
import ZarrArrayClient from "../../../../zarr/ZarrArrayClient"
import { useBatch } from "../../BatchContext"
import { useBatchDisplayOptions } from "../../BatchDisplayOptionsContext"
import SpikeDiscriminationOverTimePlot from "./SpikeDiscriminationOverTimePlot"

type Props = {
    width: number
    height: number
    unitId1: string | number
    unitId2: string | number
    mode: 'discrimination_features' | 'spike_amplitudes'
}

const SpikeDiscriminationOverTimeView: FunctionComponent<Props> = ({width, height, unitId1, unitId2, mode}) => {
    const {batchUri} = useBatch()
    const [spikeTimesData, setSpikeTimesData] = useState<[number[], number[]]>()
    const [spikeDiscriminationData, setSpikeDiscriminationData] = useState<[number[], number[]]>()
    const {viewFiltered} = useBatchDisplayOptions()

    useEffect(() => {
        let canceled = false
        setSpikeTimesData(undefined)
        setSpikeDiscriminationData(undefined)
        ;(async () => {
            const zarrUri = `${batchUri}/unit_pairs/${unitId1}-${unitId2}/data.zarr`
            const a1 = new ZarrArrayClient(zarrUri, 'spike_times_1')
            const a2 = new ZarrArrayClient(zarrUri, 'spike_times_2')
            const x1 = await a1.getArray1D()
            const x2 = await a2.getArray1D()
            if (canceled) return
            setSpikeTimesData([x1, x2])
            const a = viewFiltered ? '_filtered_only' : ''
            const b1 = new ZarrArrayClient(zarrUri, `${mode}_1` + a)
            const b2 = new ZarrArrayClient(zarrUri, `${mode}_2` + a)
            const y1 = await b1.getArray1D()
            const y2 = await b2.getArray1D()
            if (canceled) return
            setSpikeDiscriminationData([y1, y2])
        })()
        return () => {canceled = true}
    }, [batchUri, unitId1, unitId2, viewFiltered, mode])

    const {valMin, valMax} = useMemo(() => {
        if (!spikeDiscriminationData) return {valMin: 0, valMax: 1}
        let valMin = 0 // be sure to include 0
        let valMax = 0 // be sure to include 0
        let first = true
        for (let aa = 0; aa < 2; aa++) {
            for (let i = 0; i < spikeDiscriminationData[aa].length; i++) {
                const val1 = spikeDiscriminationData[aa][i]
                if (first) {
                    valMin = val1
                    valMax = val1
                    first = false
                }
                else {
                    if (val1 < valMin) valMin = val1
                    if (val1 > valMax) valMax = val1
                }
            }
        }
        return {valMin, valMax}
    }, [spikeDiscriminationData])

    if (!spikeDiscriminationData) return <div>Loading data...</div>
    if (!spikeTimesData) return <div>Loading spike times data...</div>
    return (
        <SpikeDiscriminationOverTimePlot
            spikeTimes={spikeTimesData}
            discriminationValues={spikeDiscriminationData}
            valMin={valMin}
            valMax={valMax}
            width={width}
            height={height}
        />
    )
}

export default SpikeDiscriminationOverTimeView