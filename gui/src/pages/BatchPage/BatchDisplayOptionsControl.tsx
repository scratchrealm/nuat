import { FunctionComponent } from "react";
import { useBatchDisplayOptions } from "./BatchDisplayOptionsContext";
import { CheckboxComponent } from "./UnitsTab/UnitAssessmentView/UnitAssessmentView";

type Props = {
    // none
}

const BatchDisplayOptionsControl: FunctionComponent<Props> = () => {
    const {waveformOpts, setWaveformOpts, viewFiltered, setViewFiltered} = useBatchDisplayOptions()
    return (
        <div>
            <CheckboxComponent
                label="Geometry layout"
                value={waveformOpts.layoutMode === 'geom'}
                onChange={val => {
                    setWaveformOpts({
                        ...waveformOpts,
                        layoutMode: val ? 'geom' : 'vertical'
                    })
                }}
            />
            <CheckboxComponent
                label="Filtered"
                value={viewFiltered}
                onChange={val => {
                    setViewFiltered(val)
                }}
            />
        </div>
    )
}

export default BatchDisplayOptionsControl