import { FunctionComponent, useState } from "react";
import Splitter from "../../../components/Splitter";
import CurrentUnitView from "./CurrentUnitView";
import SetupUnitSelection from "./SetupUnitSelection";
import UnitsList from "./UnitsList";
import WaveformOpts from "./WaveformOpts";

type Props = {
    width: number
    height: number
    waveformOpts: WaveformOpts
    setWaveformOpts: (opts: WaveformOpts) => void
}

const UnitsTab: FunctionComponent<Props> = ({width, height, waveformOpts, setWaveformOpts}) => {
    return (
        <SetupUnitSelection>
            <Splitter
                width={width}
                height={height}
                direction="horizontal"
                initialPosition={200}
            >
                <UnitsList
                    width={0}
                    height={0}
                />
                <CurrentUnitView
                    width={0}
                    height={0}
                    waveformOpts={waveformOpts}
                    setWaveformOpts={setWaveformOpts}
                />
            </Splitter>
        </SetupUnitSelection>
    )
}

export default UnitsTab