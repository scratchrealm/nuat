import { useUrlState } from "@figurl/interface"
import { useCallback, useMemo } from "react"

export type Route = {
    page: 'home'
} | {
    page: 'batch'
    batchId: string
}

const useRoute = () => {
    const {urlState, updateUrlState} = useUrlState()
    const route: Route = useMemo(() => {
        const p = urlState['path'] || ''
        if (p.startsWith('/batch/')) {
            const a = p.split('/')
            const batchId = a[2]
            return {
                page: 'batch',
                batchId
            }
        }
        else {
            return {
                page: 'home'
            }
        }
    }, [urlState])

    const setRoute = useCallback((r: Route) => {
        if (r.page === 'home') {
            updateUrlState({path: '/'})
        }
        else if (r.page === 'batch') {
            updateUrlState({path: `/batch/${r.batchId}`})
        }
    }, [updateUrlState])

    return {
        route,
        setRoute
    }    
}

export default useRoute