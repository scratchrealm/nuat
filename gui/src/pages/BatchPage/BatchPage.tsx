import { FunctionComponent } from "react";
import TabWidget from "../TabWidget/TabWidget";
import BatchControlPanel from "./BatchControlPanel";
import DescriptionTab from "./DescriptionTab";
import SetupBatchAssessment from "./SetupBatchAssessment";
import SetupBatchContext from "./SetupBatchContext";
import SetupBatchDisplayOptions from "./SetupBatchDisplayOptions";
import UnitPairsTab from "./UnitPairsTab/UnitPairsTab";
import UnitsTab from "./UnitsTab/UnitsTab";

type Props = {
    batchId: string
    width: number
    height: number
}

const BatchPage: FunctionComponent<Props> = ({batchId, width, height}) => {
    const controlPanelWidth = Math.max(80, Math.min(220, width / 6))

    return (
        <SetupBatchContext batchId={batchId}>
            <SetupBatchAssessment>
                <SetupBatchDisplayOptions>
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
                        />
                        <UnitPairsTab
                            width={0}
                            height={0}
                        />
                        <DescriptionTab
                            width={0}
                            height={0}
                        />
                    </TabWidget>  
                    </div>
                </SetupBatchDisplayOptions>
            </SetupBatchAssessment>
        </SetupBatchContext>
    )
}

export default BatchPage