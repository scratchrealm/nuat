import { FunctionComponent, useEffect, useState } from "react"
import ZarrArrayClient from "../../../../zarr/ZarrArrayClient"
import { useBatch } from "../../BatchContext"
import CorrelogramPlot from "../../UnitsTab/AutocorrelogramView/CorrelogramPlot"

type Props = {
    width: number
    height: number
    unitId1: string | number
    unitId2: string | number
}

type CrossCorrelogramData = {
    bin_edges_sec: number[]
    bin_counts: number[]
}

const CrossCorrelogramView: FunctionComponent<Props> = ({width, height, unitId1, unitId2}) => {
    const {batchUri} = useBatch()
    const [crossCorrelogramData, setCrossCorrelogramData] = useState<CrossCorrelogramData>()

    useEffect(() => {
        let canceled = false
        setCrossCorrelogramData(undefined)
        ;(async () => {
            const zarrUri = `${batchUri}/unit_pairs/${unitId1}-${unitId2}/data.zarr`
            const c1 = new ZarrArrayClient(zarrUri, 'cross_correlogram_bin_edges_sec')
            const bin_edges_sec = await c1.getArray1D()
            const c2 = new ZarrArrayClient(zarrUri, 'cross_correlogram_bin_counts')
            const bin_counts = await c2.getArray1D()
            if (canceled) return
            setCrossCorrelogramData({
                bin_edges_sec,
                bin_counts
            })
        })()
        return () => {canceled = true}
    }, [batchUri, unitId1, unitId2])

    if (!crossCorrelogramData) return <div>Loading...</div>
    return (
        <CorrelogramPlot
            binEdgesSec={crossCorrelogramData.bin_edges_sec}
            binCounts={crossCorrelogramData.bin_counts}
            color="blue"
            width={width}
            height={height}
        />
    )
}

export default CrossCorrelogramView