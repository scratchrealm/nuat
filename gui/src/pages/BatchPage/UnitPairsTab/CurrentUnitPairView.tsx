import { Splitter } from "@figurl/core-views"
import { getFileData } from "@figurl/interface"
import { SetupTimeseriesSelection } from "@figurl/timeseries-views"
import { FunctionComponent, useEffect, useState } from "react"
import TitledView from "../../../components/TitledView"
import { UnitPairId, useBatch } from "../BatchContext"
import AverageWaveformComparisonView from "./AverageWaveformComparisonView/AverageWaveformComparisonView"
import CrossCorrelogramView from "./CrossCorrelogramView/CrossCorrelogramView"
import SpikeDiscriminationOverTimeView from "./SpikeDiscriminationOverTimeView/SpikeDiscriminationOverTimeView"
import UnitPairAssessmentView from "./UnitPairAssessmentView/UnitPairAssessmentView"
import { useUnitPairSelection } from "./UnitPairSelectionContext"

type Props = {
    width: number
    height: number
}

export type UnitPairInfo = {
    channel_neighborhood_ids: number[]
    channel_neighborhood_locations: {
        x: number
        y: number
    }[]
    num_events_1: number
    num_events_2: number
}

const useUnitPairInfo = (unitPairId: UnitPairId | undefined) => {
    const [unitPairInfo, setUnitPairInfo] = useState<UnitPairInfo>()
    const {batchUri} = useBatch()
    useEffect(() => {
        (async () => {
            if (unitPairId === undefined) return
            const x = await getFileData(`${batchUri}/unit_pairs/${unitPairId[0]}-${unitPairId[1]}/unit_pair_info.json`, () => {}, {responseType: 'json'})
            setUnitPairInfo(x)
        })()
    }, [unitPairId, batchUri])
    return unitPairInfo
}

const CurrentUnitPairView: FunctionComponent<Props> = ({width, height}) => {
    const {currentUnitPairId} = useUnitPairSelection()
    const unitPairInfo = useUnitPairInfo(currentUnitPairId)
    if (currentUnitPairId === undefined) return <div>No unit pair selected</div>
    if (unitPairInfo === undefined) return <div>Loading...</div>
    const rightPanelWidth = 250
    return (
        <SetupTimeseriesSelection>
            <div style={{position: 'absolute', width, height}}>
                <div style={{position: 'absolute', width: width - rightPanelWidth, height}}>
                    <Splitter
                        width={width - rightPanelWidth}
                        height={height}
                        direction="vertical"
                        initialPosition={height / 3}
                    >
                        <Splitter
                            width={0}
                            height={0}
                            direction="horizontal"
                            initialPosition={width / 2}
                        >
                            <TitledView title="Cross-correlogram" width={0} height={0}>
                                <CrossCorrelogramView
                                    width={0}
                                    height={0}
                                    unitId1={currentUnitPairId[0]}
                                    unitId2={currentUnitPairId[1]}
                                />
                            </TitledView>
                            <TitledView title="Average waveform comparison" width={0} height={0}>
                                <AverageWaveformComparisonView
                                    width={0}
                                    height={0}
                                    unitId1={currentUnitPairId[0]}
                                    unitId2={currentUnitPairId[1]}
                                    unitPairInfo={unitPairInfo}
                                />
                            </TitledView>
                        </Splitter>
                        <TitledView title="Spike discrimination over time" width={0} height={0}>
                            <SpikeDiscriminationOverTimeView
                                width={0}
                                height={0}
                                unitId1={currentUnitPairId[0]}
                                unitId2={currentUnitPairId[1]}
                            />
                        </TitledView>
                    </Splitter>
                </div>
                <div style={{position: 'absolute', left: width - rightPanelWidth, width: rightPanelWidth, height}}>
                    <UnitPairAssessmentView
                        width={rightPanelWidth}
                        height={height}
                        unitPairId={currentUnitPairId}
                        unitPairInfo={unitPairInfo}
                    />
                </div>
            </div>
        </SetupTimeseriesSelection>
    )
}

export default CurrentUnitPairView