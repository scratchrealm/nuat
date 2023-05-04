import { Splitter } from "@figurl/core-views"
import { getFileData } from "@figurl/interface"
import { SetupTimeseriesSelection } from "@figurl/timeseries-views"
import { FunctionComponent, useEffect, useState } from "react"
import { useBatch } from "../BatchContext"
import AutocorrelogramView from "./AutocorrelogramView/AutocorrelogramView"
import AverageWaveformView from "./AverageWaveformView/AverageWaveformView"
import SnippetsView from "./SnippetsView/SnippetsView"
import SpikeAmplitudesView from "./SpikeAmplitudesView/SpikeAmplitudesView"
import { useUnitSelection } from "./UnitSelectionContext"

type Props = {
    width: number
    height: number
}

export type UnitInfo = {
    channel_neighborhood_ids: number[]
    channel_neighborhood_locations: {
        x: number
        y: number
    }[]
    peak_channel_id: number
    num_events: number
}

const useUnitInfo = (unitId: (string | number) | undefined) => {
    const [unitInfo, setUnitInfo] = useState<UnitInfo>()
    const {batchUri} = useBatch()
    useEffect(() => {
        (async () => {
            if (unitId === undefined) return
            const x = await getFileData(`${batchUri}/units/${unitId}/unit_info.json`, () => {}, {responseType: 'json'})
            setUnitInfo(x)
        })()
    }, [unitId, batchUri])
    return unitInfo
}

const CurrentUnitView: FunctionComponent<Props> = ({width, height}) => {
    const {currentUnitId} = useUnitSelection()
    const unitInfo = useUnitInfo(currentUnitId)
    if (currentUnitId === undefined) return <div>No unit selected</div>
    if (unitInfo === undefined) return <div>Loading...</div>
    return (
        <SetupTimeseriesSelection>
            <Splitter
                width={width}
                height={height}
                direction="vertical"
                initialPosition={2 * height / 3}
            >
                <Splitter
                    width={0}
                    height={0}
                    direction="vertical"
                    initialPosition={height / 3}
                >
                    <Splitter
                        width={0}
                        height={0}
                        direction="horizontal"
                        initialPosition={width / 2}
                    >
                        <AutocorrelogramView
                            width={0}
                            height={0}
                            unitId={currentUnitId}
                        />
                        <AverageWaveformView
                            width={0}
                            height={0}
                            unitId={currentUnitId}
                            unitInfo={unitInfo}
                        />
                    </Splitter>
                    <SpikeAmplitudesView
                        width={0}
                        height={0}
                        unitId={currentUnitId}
                    />
                </Splitter>
                <SnippetsView
                    width={0}
                    height={0}
                    unitId={currentUnitId}
                    unitInfo={unitInfo}
                />
            </Splitter>
        </SetupTimeseriesSelection>
    )
}

export default CurrentUnitView