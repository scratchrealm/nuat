import YAML from 'js-yaml'
import { FunctionComponent, PropsWithChildren, useMemo } from "react"
import BatchContext, { BatchConfig, BatchInfo, useBatchTextFile } from "./BatchContext"

type Props = {
    batchId: string
}

const SetupBatchContext: FunctionComponent<PropsWithChildren<Props>> = ({batchId, children}) => {
    const {text: batchConfigText, refresh: refreshBatchConfig} = useBatchTextFile(batchId, 'batch.yaml')
    const batchConfig = useMemo(() => {
        if (!batchConfigText) return undefined
        try {
            return YAML.load(batchConfigText) as BatchConfig
        }
        catch (err) {
            console.warn('Problem loading yaml')
            console.warn(err)
            return undefined
        }
    }, [batchConfigText])

    const {text: batchInfoText} = useBatchTextFile(batchId, 'batch_info.json')
    const batchInfo = useMemo(() => {
        if (!batchInfoText) return undefined
        try {
            return JSON.parse(batchInfoText) as BatchInfo
        }
        catch (err) {
            console.warn('Problem loading json')
            console.warn(err)
            return undefined
        }
    }, [batchInfoText])

    const batchUri = `$dir/batches/${batchId}`

    const value = {
        batchId,
        batchUri,
        batchConfig,
        batchInfo,
        refreshBatchConfig
    }

    return (
        <BatchContext.Provider value={value}>
            {children}
        </BatchContext.Provider>
    )
}

export default SetupBatchContext