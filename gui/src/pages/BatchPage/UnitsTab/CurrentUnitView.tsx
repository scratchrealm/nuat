import { FunctionComponent } from "react"
import AutocorrelogramView from "./AutocorrelogramView/AutocorrelogramView"
import { useUnitSelection } from "./UnitSelectionContext"

type Props = {
    width: number
    height: number
}

const CurrentUnitView: FunctionComponent<Props> = ({width, height}) => {
    const {currentUnitId} = useUnitSelection()
    if (currentUnitId === undefined) return <div>No unit selected</div>
    return (
        <AutocorrelogramView
            width={width}
            height={height}
            unitId={currentUnitId}
        />
    )
}

export default CurrentUnitView