import { FunctionComponent, useEffect, useMemo, useState } from "react"
import ZarrArrayClient from "../../../../zarr/ZarrArrayClient"
import { useBatch } from "../../BatchContext"
import { UnitInfo } from "../CurrentUnitView"
import SnippetsClient from "./SnippetsClient"
import SnippetsPlot from "./SnippetsPlot"

type Props = {
    width: number
    height: number
    unitId: string | number
    unitInfo: UnitInfo
}

const SnippetsView: FunctionComponent<Props> = ({width, height, unitId, unitInfo}) => {
    const {batchUri} = useBatch()
    const [snippetsClient, setSnippetsClient] = useState<SnippetsClient>()

    const [averageWaveformData, setAverageWaveformData] = useState<number[][]>()
    useEffect(() => {
        (async () => {
            const zarrUri = `${batchUri}/units/${unitId}/data.zarr`
            const c1 = new ZarrArrayClient(zarrUri, 'average_waveform_in_neighborhood')
            const x = await c1.getArray2D()
            setAverageWaveformData(x)
        })()
    }, [batchUri, unitId])

    const [spikeTimesData, setSpikeTimesData] = useState<number[]>()
    useEffect(() => {
        (async () => {
            const zarrUri = `${batchUri}/units/${unitId}/data.zarr`
            const c1 = new ZarrArrayClient(zarrUri, 'spike_times')
            const x = await c1.getArray1D()
            setSpikeTimesData(x)
        })()
    }, [batchUri, unitId])

    useEffect(() => {
        (async () => {
            const zarrUri = `${batchUri}/units/${unitId}/data.zarr`
            const c1 = new ZarrArrayClient(zarrUri, 'snippets_in_neighborhood')
            await c1.shape()
            const client = new SnippetsClient(c1)
            setSnippetsClient(client)
        })()
    }, [batchUri, unitId])

    
    if (!snippetsClient) return <div>Loading snippets...</div>
    return (
        <SnippetsPlot
            snippetsClient={snippetsClient}
            averageWaveform={averageWaveformData}
            spikeTimes={spikeTimesData}
            unitId={unitId}
            unitInfo={unitInfo}
            width={width}
            height={height}
        />
    )
}

export default SnippetsView