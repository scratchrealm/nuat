import { useSignedIn } from "@figurl/interface"
import { JSONStringifyDeterministic } from "@figurl/interface/dist/viewInterface/kacheryTypes"
import { FunctionComponent, useCallback, useMemo } from "react"
import Hyperlink from "../../components/Hyperlink"
import useRoute from "../../useRoute"
import { useBatchAssessment } from "./BatchAssessmentContext"
import { useBatch } from "./BatchContext"

type Props = {
    width: number
    height: number
}

const BatchControlPanel: FunctionComponent<Props> = () => {
    const {setRoute} = useRoute()

    const {batchId} = useBatch()

    const {userId} = useSignedIn()

    const {batchAssessment, batchAssessmentOnDisk, setBatchAssessment, saveBatchAssessment} = useBatchAssessment()

    const handleStartBatchAssessment = useCallback(() => {
        if (!userId) return
        const newBatchAssessment = {
            batchId,
            userId: userId.toString(),
            unitAssessments: [],
            unitPairAssessments: []
        }
        setBatchAssessment(newBatchAssessment)
    }, [batchId, userId, setBatchAssessment])

    const batchAssessmentModified = useMemo(() => {
        if (!batchAssessment) return false
        if (!batchAssessmentOnDisk) return true
        if (JSONStringifyDeterministic(batchAssessmentOnDisk) !== JSONStringifyDeterministic(batchAssessment)) return true
        return false
    }, [batchAssessment, batchAssessmentOnDisk])

    return (
        <div style={{paddingLeft: 15, paddingTop: 15, fontSize: 14, userSelect: 'none'}}>
            <div><Hyperlink onClick={() => setRoute({page: 'home'})}>&#8592; Back to batches</Hyperlink></div>
            <hr />
            <div style={{overflowWrap: 'break-word'}}>Batch: {batchId}</div>
            <hr />
            {
                !batchAssessmentOnDisk && !batchAssessment && userId && (
                    <div><Hyperlink onClick={handleStartBatchAssessment}>Start batch assessment for {userId}</Hyperlink></div>
                )
            }
            {
                batchAssessmentModified && (
                    <div><Hyperlink onClick={saveBatchAssessment}>Save assessment</Hyperlink></div>
                )
            }
        </div>
    )
}

export default BatchControlPanel