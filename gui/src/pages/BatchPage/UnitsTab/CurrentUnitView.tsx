import { Splitter } from "@figurl/core-views"
import { getFileData } from "@figurl/interface"
import { SetupTimeseriesSelection } from "@figurl/timeseries-views"
import { FunctionComponent, useEffect, useState } from "react"
import TitledView from "../../../components/TitledView"
import { useBatch } from "../BatchContext"
import AutocorrelogramView from "./AutocorrelogramView/AutocorrelogramView"
import AverageWaveformView from "./AverageWaveformView/AverageWaveformView"
import SnippetsView from "./SnippetsView/SnippetsView"
import SpikeAmplitudesView from "./SpikeAmplitudesView/SpikeAmplitudesView"
import UnitAssessmentView from "./UnitAssessmentView/UnitAssessmentView"
import { useUnitSelection } from "./UnitSelectionContext"
import WaveformOpts from "./WaveformOpts"

type Props = {
    width: number
    height: number
    waveformOpts: WaveformOpts
    setWaveformOpts: (opts: WaveformOpts) => void
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

const CurrentUnitView: FunctionComponent<Props> = ({width, height, waveformOpts, setWaveformOpts}) => {
    const {currentUnitId} = useUnitSelection()
    const unitInfo = useUnitInfo(currentUnitId)
    if (currentUnitId === undefined) return <div>No unit selected</div>
    if (unitInfo === undefined) return <div>Loading...</div>
    const rightPanelWidth = 250
    return (
        <SetupTimeseriesSelection>
            <div style={{position: 'absolute', width, height}}>
                <div style={{position: 'absolute', width: width - rightPanelWidth, height}}>
                    <Splitter
                        width={width - rightPanelWidth}
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
                                <TitledView title="Autocorrelogram" width={0} height={0}>
                                    <AutocorrelogramView
                                        width={0}
                                        height={0}
                                        unitId={currentUnitId}
                                    />
                                </TitledView>
                                <TitledView title="Average waveform" width={0} height={0}>
                                    <AverageWaveformView
                                        width={0}
                                        height={0}
                                        unitId={currentUnitId}
                                        unitInfo={unitInfo}
                                        waveformOpts={waveformOpts}
                                        setWaveformOpts={setWaveformOpts}
                                    />
                                </TitledView>
                            </Splitter>
                            <TitledView title="Spike amplitudes" width={0} height={0}>
                                <SpikeAmplitudesView
                                    width={0}
                                    height={0}
                                    unitId={currentUnitId}
                                />
                            </TitledView>
                        </Splitter>
                        <TitledView title="Spike snippets" width={0} height={0}>
                            <SnippetsView
                                width={0}
                                height={0}
                                unitId={currentUnitId}
                                unitInfo={unitInfo}
                                waveformOpts={waveformOpts}
                            />
                        </TitledView>
                    </Splitter>
                </div>
                <div style={{position: 'absolute', left: width - rightPanelWidth, width: rightPanelWidth, height}}>
                    <UnitAssessmentView
                        width={rightPanelWidth}
                        height={height}
                        unitId={currentUnitId}
                        unitInfo={unitInfo}
                    />
                </div>
            </div>
        </SetupTimeseriesSelection>
    )
}

export default CurrentUnitView