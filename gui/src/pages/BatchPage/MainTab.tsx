import { FunctionComponent } from "react";
import Splitter from "../../components/Splitter";
import DescriptionEditor from "./DescriptionEditor";

type Props = {
    width: number
    height: number
}

const MainTab: FunctionComponent<Props> = ({width, height}) => {
    return (
        <Splitter
            width={width}
            height={height}
            direction="horizontal"
            initialPosition={width / 2}
        >
            <DescriptionEditor
                width={0}
                height={0}
            />
        </Splitter>
    )
}

export default MainTab