import { FunctionComponent, useCallback, useMemo } from "react"
import { useUnitSelection } from "./UnitSelectionContext"

type Props = {
    width: number
    height: number
}

const UnitsList: FunctionComponent<Props> = ({width, height}) => {
    const {unitIds, setCurrentUnitId, currentUnitId} = useUnitSelection()
    const handleUnitClick = useCallback((unitId: string | number) => {
        setCurrentUnitId(unitId)
    }, [setCurrentUnitId])
    const styleForUnitId = useMemo(() => ((unitId: string | number) => {
        if (unitId === currentUnitId) {
            return {
                backgroundColor: '#2222FF',
                color: 'white'
            }
        }
        else {
            return {}
        }
    }), [currentUnitId])
    return (
        <div style={{position: 'absolute', width, height, background: 'white'}}>
            <table>
                <thead>
                    <tr>
                        <th>Unit</th>
                    </tr>
                </thead>
                <tbody>
                    {unitIds?.map((unitId) => (
                        <tr key={unitId} onClick={() => {handleUnitClick(unitId)}} style={{cursor: 'pointer', ...styleForUnitId(unitId)}}>
                            <td>{unitId}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default UnitsList