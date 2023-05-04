import React from "react"

export type UnitSelectionContextType = {
    currentUnitId?: string | number
    unitIds?: (string | number)[]
    setCurrentUnitId: (id?: string | number) => void
}

const UnitSelectionContext = React.createContext<UnitSelectionContextType>({
    currentUnitId: undefined,
    unitIds: undefined,
    setCurrentUnitId: () => {}
})

export const useUnitSelection = () => React.useContext(UnitSelectionContext)

export default UnitSelectionContext