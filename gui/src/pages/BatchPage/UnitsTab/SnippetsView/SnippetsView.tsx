import { FunctionComponent, useEffect, useState } from "react"
import ZarrArrayClient from "../../../../zarr/ZarrArrayClient"
import { useBatch } from "../../BatchContext"
import { useBatchDisplayOptions } from "../../BatchDisplayOptionsContext"
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
    const {viewFiltered} = useBatchDisplayOptions()

    const [averageWaveformData, setAverageWaveformData] = useState<number[][]>()
    useEffect(() => {
        (async () => {
            const zarrUri = `${batchUri}/units/${unitId}/data.zarr`
            const a = viewFiltered ? '_filtered_only' : ''
            const c1 = new ZarrArrayClient(zarrUri, 'average_waveform_in_neighborhood' + a)
            const x = await c1.getArray2D()
            setAverageWaveformData(x)
        })()
    }, [batchUri, unitId, viewFiltered])

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
            const a = viewFiltered ? '_filtered_only' : ''
            const c1 = new ZarrArrayClient(zarrUri, 'snippets_in_neighborhood' + a)
            await c1.shape()
            const client = new SnippetsClient(c1)
            setSnippetsClient(client)
        })()
    }, [batchUri, unitId, viewFiltered])

    const {waveformOpts} = useBatchDisplayOptions()

    
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
            waveformOpts={waveformOpts}
        />
    )
}

export default SnippetsView