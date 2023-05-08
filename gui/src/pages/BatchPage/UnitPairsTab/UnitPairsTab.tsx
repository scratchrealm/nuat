import { FunctionComponent } from "react";
import Splitter from "../../../components/Splitter";
import CurrentUnitPairView from "./CurrentUnitPairView";
import SetupUnitPairSelection from "./SetupUnitPairSelection";
import UnitPairsList from "./UnitPairsList";

type Props = {
    width: number
    height: number
}

const UnitPairsTab: FunctionComponent<Props> = ({width, height}) => {
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
                />
            </Splitter>
        </SetupUnitPairSelection>
    )
}

export default UnitPairsTab