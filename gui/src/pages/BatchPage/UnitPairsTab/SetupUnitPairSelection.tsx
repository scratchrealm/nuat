import { FunctionComponent, PropsWithChildren, useEffect, useMemo, useState } from "react"
import { UnitPairId, useBatch } from "../BatchContext"
import UnitPairSelectionContext from "./UnitPairSelectionContext"

type Props = {
    // none
}

const SetupUnitPairSelection: FunctionComponent<PropsWithChildren<Props>> = ({children}) => {
    const [currentUnitPairId, setCurrentUnitPairId] = useState<UnitPairId>()

    const {batchInfo} = useBatch()
    const unitPairIds = useMemo(() => (
        batchInfo ? batchInfo.unit_pair_ids : undefined
    ), [batchInfo])

    const value = {
        currentUnitPairId,
        unitPairIds,
        setCurrentUnitPairId
    }

    useEffect(() => {
        if ((unitPairIds) && (unitPairIds.length > 0) && (currentUnitPairId === undefined)) {
            setCurrentUnitPairId(unitPairIds[0])
        }
    }, [unitPairIds, currentUnitPairId])

    return (
        <UnitPairSelectionContext.Provider value={value}>
            {children}
        </UnitPairSelectionContext.Provider>
    )
}

export default SetupUnitPairSelection