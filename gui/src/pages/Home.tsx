import { FunctionComponent, useEffect, useState } from "react";
import Hyperlink from "../components/Hyperlink";
import BatchesTable from "./BatchesTable";
import useSummary from "./useSummary";

type Props = {
    width: number
    height: number
}

const Home: FunctionComponent<Props> = ({width, height}) => {
    const {summary, refreshSummary} = useSummary()

    const [takingLongerThanExpected, setTakingLongerThanExpected] = useState(false)
    useEffect(() => {
        const a = setTimeout(() => {
            setTakingLongerThanExpected(true)
        }, 2500)
        return () => {
            clearTimeout(a)
        }
    }, [])

    const padding = 20

    return (
        <div style={{position: 'absolute', left: padding, top: padding, width: width - padding * 2, height: height - padding * 2, overflowY: 'auto'}}>
            <h1>Neural unit assessment tool</h1>
            <div>
                <Hyperlink onClick={refreshSummary}>Refresh table</Hyperlink>
                &nbsp;|&nbsp;
                <a href="https://github.com/scratchrealm/nuat/blob/main/README.md" target="_blank" rel="noopener noreferrer">View documentation</a>
            </div>
            <h3>Batches</h3>
            {
                summary ? (
                    <BatchesTable summary={summary} />
                ) : (
                    !takingLongerThanExpected ? (
                        <div>Loading...</div>
                    ) : (
                        <div>Loading is taking longer than expected. You may want to try refreshing the page.</div>
                    )
                )
            }
        </div>
    )
}

export default Home