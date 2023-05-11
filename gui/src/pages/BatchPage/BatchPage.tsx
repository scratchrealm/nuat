import { FunctionComponent, useState } from "react";
import BatchControlPanel from "./BatchControlPanel";
import TabWidget from "../TabWidget/TabWidget";
import DescriptionTab from "./DescriptionTab";
import SetupBatchContext from "./SetupBatchContext";
import SetupBatchAssessment from "./SetupBatchAssessment";
import UnitsTab from "./UnitsTab/UnitsTab";
import UnitPairsTab from "./UnitPairsTab/UnitPairsTab";
import WaveformOpts from "./UnitsTab/WaveformOpts";

type Props = {
    batchId: string
    width: number
    height: number
}

const BatchPage: FunctionComponent<Props> = ({batchId, width, height}) => {
    const controlPanelWidth = Math.max(80, Math.min(220, width / 6))
    const [waveformOpts, setWaveformOpts] = useState<WaveformOpts>({layoutMode: 'vertical'})

    return (
        <SetupBatchContext batchId={batchId}>
            <SetupBatchAssessment>
                <div style={{position: 'absolute', width: controlPanelWidth, height}}>
                    <BatchControlPanel
                        width={controlPanelWidth}
                        height={height}
                    />
                </div>
                <div style={{position: 'absolute', left: controlPanelWidth, width: width - controlPanelWidth, height}}>
                <TabWidget
                    width={width - controlPanelWidth}
                    height={height}
                    tabs={[
                        {label: 'Units', closeable: false},
                        {label: 'Unit pairs', closeable: false},
                        {label: 'Description', closeable: false}
                    ]}
                >
                    <UnitsTab
                        width={0}
                        height={0}
                        waveformOpts={waveformOpts}
                        setWaveformOpts={setWaveformOpts}
                    />
                    <UnitPairsTab
                        width={0}
                        height={0}
                        waveformOpts={waveformOpts}
                        setWaveformOpts={setWaveformOpts}
                    />
                    <DescriptionTab
                        width={0}
                        height={0}
                    />
                </TabWidget>  
                </div>
            </SetupBatchAssessment>
        </SetupBatchContext>
    )
}

export default BatchPage