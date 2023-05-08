import { FunctionComponent, useEffect, useMemo, useState } from "react"
import ZarrArrayClient from "../../../../zarr/ZarrArrayClient"
import { useBatch } from "../../BatchContext"
import SpikeDiscriminationOverTimePlot from "./SpikeDiscriminationOverTimePlot"

type Props = {
    width: number
    height: number
    unitId1: string | number
    unitId2: string | number
}

const SpikeDiscriminationOverTimeView: FunctionComponent<Props> = ({width, height, unitId1, unitId2}) => {
    const {batchUri} = useBatch()
    const [spikeTimesData, setSpikeTimesData] = useState<[number[], number[]]>()
    const [spikeDiscriminationData, setSpikeDiscriminationData] = useState<[number[], number[]]>()

    useEffect(() => {
        (async () => {
            const zarrUri = `${batchUri}/unit_pairs/${unitId1}-${unitId2}/data.zarr`
            const a1 = new ZarrArrayClient(zarrUri, 'spike_times_1')
            const a2 = new ZarrArrayClient(zarrUri, 'spike_times_2')
            const x1 = await a1.getArray1D()
            const x2 = await a2.getArray1D()
            setSpikeTimesData([x1, x2])
            const b1 = new ZarrArrayClient(zarrUri, 'discrimination_features_1')
            const b2 = new ZarrArrayClient(zarrUri, 'discrimination_features_2')
            const y1 = await b1.getArray1D()
            const y2 = await b2.getArray1D()
            setSpikeDiscriminationData([y1, y2])
        })()
    }, [batchUri, unitId1, unitId2])

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

    if (!spikeDiscriminationData) return <div>Loading spike discrimination data...</div>
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