import { FunctionComponent } from "react";
import Splitter from "../../../components/Splitter";
import CurrentUnitPairView from "./CurrentUnitPairView";
import SetupUnitPairSelection from "./SetupUnitPairSelection";
import UnitPairsList from "./UnitPairsList";

type Props = {
    width: number
    height: number
    waveformOpts: any
    setWaveformOpts: (opts: any) => void
}

const UnitPairsTab: FunctionComponent<Props> = ({width, height, waveformOpts, setWaveformOpts}) => {
    return (
        <SetupUnitPairSelection>
            <Splitter
                width={width}
                height={height}
                direction="horizontal"
                initialPosition={200}
            >
                <UnitPairsList
                    width={0}
                    height={0}
                />
                <CurrentUnitPairView
                    width={0}
                    height={0}
                    waveformOpts={waveformOpts}
                    setWaveformOpts={setWaveformOpts}
                />
            </Splitter>
        </SetupUnitPairSelection>
    )
}

export default UnitPairsTab