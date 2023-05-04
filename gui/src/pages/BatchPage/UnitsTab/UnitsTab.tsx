import { FunctionComponent } from "react";
import Splitter from "../../../components/Splitter";
import CurrentUnitView from "./CurrentUnitView";
import SetupUnitSelection from "./SetupUnitSelection";
import UnitsList from "./UnitsList";

type Props = {
    width: number
    height: number
}

const UnitsTab: FunctionComponent<Props> = ({width, height}) => {
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
                />
            </Splitter>
        </SetupUnitSelection>
    )
}

export default UnitsTab