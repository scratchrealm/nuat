import { getFileData, serviceQuery, useSignedIn } from "@figurl/interface"
import { FunctionComponent, PropsWithChildren, useCallback, useEffect, useReducer, useState } from "react"
import BatchAssessmentContext, { BatchAssessment, batchAssessmentReducer } from "./BatchAssessmentContext"
import { useBatch } from "./BatchContext"

type Props = {
    // none
}

const SetupBatchAssessment: FunctionComponent<PropsWithChildren<Props>> = ({children}) => {
    const [batchAssessment, batchAssessmentDispatch] = useReducer(batchAssessmentReducer, {batchId: '', userId: '', unitAssessments: []})
    const {userId} = useSignedIn()
    const {batchId, batchUri} = useBatch()
    const [batchAssessmentOnDisk, setBatchAssessmentOnDisk] = useState<BatchAssessment>(undefined)
    useEffect(() => {
        (async () => {
            if (!userId) return
            let newBatchAssessment: BatchAssessment | undefined
            try {
                const x = await getFileData(`${batchUri}/assessments/${userId}.json`, () => {}, {responseType: 'json'})
                if (x.userId !== userId) throw Error('Unexpected userId in batch assessment')
                if (x.batchId !== batchId) throw Error('Unexpected batchId in batch assessment')
                newBatchAssessment = x
                setBatchAssessmentOnDisk(x)
            }
            catch(err) {
                newBatchAssessment = undefined
            }
            batchAssessmentDispatch({type: 'setBatchAssessment', batchAssessment: newBatchAssessment})
        })()
    }, [batchId, batchUri, userId])

    const saveBatchAssessment = useCallback(() => {
        (async () => {
            const {result} = await serviceQuery('nuat', {
                type: 'set_batch_assessment',
                batch_id: batchId,
                assessment: batchAssessment
            }, {
                includeUserId: true
            })
            if (result.success) {
                setBatchAssessmentOnDisk(batchAssessment)
            }
            else {
                console.warn(`Unable to save batch assessment: ${result.error}`)
            }
        })()
    }, [batchId, batchAssessment])

    return (
        <BatchAssessmentContext.Provider value={{batchAssessment, batchAssessmentOnDisk, saveBatchAssessment, batchAssessmentDispatch}}>
            {children}
        </BatchAssessmentContext.Provider>
    )
}

export default SetupBatchAssessment