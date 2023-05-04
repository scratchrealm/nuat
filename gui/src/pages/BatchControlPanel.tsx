import { FunctionComponent } from "react"
import Hyperlink from "../components/Hyperlink"
import useRoute from "../useRoute"
import { useBatch } from "./BatchPage/BatchContext"

type Props = {
    width: number
    height: number
}

const BatchControlPanel: FunctionComponent<Props> = () => {
    const {setRoute} = useRoute()

    const {batchId} = useBatch()

    return (
        <div style={{paddingLeft: 15, paddingTop: 15, fontSize: 14, userSelect: 'none'}}>
            <div><Hyperlink onClick={() => setRoute({page: 'home'})}>&#8592; Back to batches</Hyperlink></div>
            <hr />
            <div>Batch: {batchId}</div>
        </div>
    )
}

export default BatchControlPanel