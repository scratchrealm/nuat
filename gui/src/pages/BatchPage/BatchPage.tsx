import { FunctionComponent } from "react";
import BatchControlPanel from "../BatchControlPanel";
import TabWidget from "../TabWidget/TabWidget";
import MainTab from "./MainTab";
import SetupBatchContext from "./SetupBatchContext";
import UnitsTab from "./UnitsTab/UnitsTab";

type Props = {
    batchId: string
    width: number
    height: number
}

const BatchPage: FunctionComponent<Props> = ({batchId, width, height}) => {
    const controlPanelWidth = Math.max(200, Math.min(300, width / 6))

    return (
        <SetupBatchContext batchId={batchId}>
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
                    {label: 'Main', closeable: false},
                    {label: 'Units', closeable: false},
                ]}
            >
                <MainTab
                    width={0}
                    height={0}
                />
                <UnitsTab
                    width={0}
                    height={0}
                />
            </TabWidget>  
            </div>
        </SetupBatchContext>
    )
}

export default BatchPage