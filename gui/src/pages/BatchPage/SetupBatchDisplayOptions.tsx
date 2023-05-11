import { FunctionComponent, PropsWithChildren, useState } from "react"
import BatchDisplayOptionsContext, { BatchDisplayOptions } from './BatchDisplayOptionsContext'

type Props = {
    // none
}

const SetupBatchDisplayOptions: FunctionComponent<PropsWithChildren<Props>> = ({children}) => {
    const [batchDisplayOptions, setBatchDisplayOptions] = useState<BatchDisplayOptions>({waveformOpts: {layoutMode: 'vertical'}, viewFiltered: false})

    const value = {
        batchDisplayOptions,
        setBatchDisplayOptions
    }

    return (
        <BatchDisplayOptionsContext.Provider value={value}>
            {children}
        </BatchDisplayOptionsContext.Provider>
    )
}

export default SetupBatchDisplayOptions