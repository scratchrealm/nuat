import { FunctionComponent, useEffect, useState } from "react"
import ZarrArrayClient from "../../../../zarr/ZarrArrayClient"
import { useBatch } from "../../BatchContext"
import CorrelogramPlot from "./CorrelogramPlot"

type Props = {
    width: number
    height: number
    unitId: string | number
}

type AutocorrelogramData = {
    bin_edges_sec: number[]
    bin_counts: number[]
}

const AutocorrelogramView: FunctionComponent<Props> = ({width, height, unitId}) => {
    const {batchUri} = useBatch()
    const [autocorrelogramData, setAutocorrelogramData] = useState<AutocorrelogramData>()

    useEffect(() => {
        let canceled = false
        setAutocorrelogramData(undefined)
        ;(async () => {
            const zarrUri = `${batchUri}/units/${unitId}/data.zarr`
            const c1 = new ZarrArrayClient(zarrUri, 'autocorrelogram_bin_edges_sec')
            const bin_edges_sec = await c1.getArray1D()
            const c2 = new ZarrArrayClient(zarrUri, 'autocorrelogram_bin_counts')
            const bin_counts = await c2.getArray1D()
            if (canceled) return
            setAutocorrelogramData({
                bin_edges_sec,
                bin_counts
            })
        })()
        return () => {canceled = true}
    }, [batchUri, unitId])

    if (!autocorrelogramData) return <div>Loading...</div>
    return (
        <CorrelogramPlot
            binEdgesSec={autocorrelogramData.bin_edges_sec}
            binCounts={autocorrelogramData.bin_counts}
            color="blue"
            width={width}
            height={height}
        />
    )
}

export default AutocorrelogramView