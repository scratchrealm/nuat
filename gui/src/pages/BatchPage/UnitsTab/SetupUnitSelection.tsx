import { FunctionComponent, PropsWithChildren, useMemo, useState } from "react"
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

    return (
        <UnitSelectionContext.Provider value={value}>
            {children}
        </UnitSelectionContext.Provider>
    )
}

export default SetupUnitSelection