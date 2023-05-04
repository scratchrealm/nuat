import { FunctionComponent, PropsWithChildren, useEffect, useMemo, useState } from "react"
import { useBatch } from "../BatchContext"
import UnitSelectionContext from "./UnitSelectionContext"

type Props = {
    // none
}

const SetupUnitSelection: FunctionComponent<PropsWithChildren<Props>> = ({children}) => {
    const [currentUnitId, setCurrentUnitId] = useState<string | number>()

    const {batchInfo} = useBatch()
    const unitIds = useMemo(() => (
        batchInfo ? batchInfo.unit_ids : undefined
    ), [batchInfo])

    const value = {
        currentUnitId,
        unitIds,
        setCurrentUnitId
    }

    useEffect(() => {
        if ((unitIds) && (unitIds.length > 0) && (currentUnitId === undefined)) {
            setCurrentUnitId(unitIds[0])
        }
    }, [unitIds, currentUnitId])

    return (
        <UnitSelectionContext.Provider value={value}>
            {children}
        </UnitSelectionContext.Provider>
    )
}

export default SetupUnitSelection