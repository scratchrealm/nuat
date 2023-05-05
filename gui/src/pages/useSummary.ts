import { getFileData } from "@figurl/interface"
import { useCallback, useEffect, useState } from "react"
import { BatchConfig } from "./BatchPage/BatchContext"

export type Summary = {
    batches: {
        batch_id: string
        title: string
        owner_id?: string
        info: BatchConfig
        description: string
    }[]
}

const useSummary = () => {
    const [summary, setSummary] = useState<Summary | undefined>(undefined)
    const [refreshCode, setRefreshCode] = useState(0)
    useEffect(() => {
        setSummary(undefined)
        ;(async () => {
            const s = await getFileData(`$dir/nuat_summary.json`, () => {}, {responseType: 'json'})
            setSummary(s)
        })()
    }, [refreshCode])

    const refreshSummary = useCallback(() => {
        setRefreshCode(c => (c + 1))
    }, [])

    return {summary, refreshSummary}
}

export default useSummary