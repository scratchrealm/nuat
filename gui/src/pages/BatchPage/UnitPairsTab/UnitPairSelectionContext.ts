import React from "react"
import { UnitPairId } from "../BatchContext"

export type UnitPairSelectionContextType = {
    currentUnitPairId?: UnitPairId
    unitPairIds?: UnitPairId[]
    setCurrentUnitPairId: (id?: UnitPairId) => void
}

const UnitPairSelectionContext = React.createContext<UnitPairSelectionContextType>({
    currentUnitPairId: undefined,
    unitPairIds: undefined,
    setCurrentUnitPairId: () => {}
})

export const useUnitPairSelection = () => React.useContext(UnitPairSelectionContext)

export default UnitPairSelectionContext