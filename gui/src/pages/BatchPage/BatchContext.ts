import { getFileData } from "@figurl/interface"
import React, { useCallback, useEffect, useState } from "react"

export type UnitPairId = [string | number, string | number]

export type BatchInfo = {
    batch_id: string
    channel_ids: (string | number)[]
    sampling_frequency: number
    num_frames: number
    unit_ids: (string | number)[]
    unit_pair_ids: UnitPairId[]
    channel_locations: {x: number, y: number}[]
}

type BatchContextType = {
    batchId: string
    batchUri: string
    batchConfig: BatchConfig | undefined
    batchInfo: BatchInfo | undefined
    refreshBatchConfig: () => void
}

const BatchContext = React.createContext<BatchContextType>({
    batchId: '',
    batchUri: '',
    batchConfig: undefined,
    batchInfo: undefined,
    refreshBatchConfig: () => {}
})

export const useBatch = () => React.useContext(BatchContext)

export type BatchConfig = {
    owner_id?: string
    timestamp_created?: number
    timestamp_modified?: number
}

export const useBatchTextFile = (batchId: string, name: string) => {
    const [internalText, setInternalText] = useState<string | undefined>(undefined)
    const [refreshCode, setRefreshCode] = useState(0)
    useEffect(() => {
        (async () => {
            setInternalText(undefined)
            try {
                const a = await readTextFile(`$dir/batches/${batchId}/${name}`)
                setInternalText(a)
            }
            catch (err) {
                console.warn(err)
                setInternalText('')
            }
        })()
    }, [batchId, name, refreshCode])
    const refresh = useCallback(() => {
        setRefreshCode(c => (c + 1))
    }, [])
    return {text: internalText, refresh}
}

const readTextFile = async (path: string) => {
    const a = await getFileData(path, () => {}, {responseType: 'text'})
    return a as string
}

export default BatchContext