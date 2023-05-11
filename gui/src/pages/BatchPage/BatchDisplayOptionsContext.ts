import React, { useCallback } from "react"

export type WaveformOpts = {
    layoutMode: 'geom' | 'vertical'
}

export type BatchDisplayOptions = {
    waveformOpts: WaveformOpts
    viewFiltered: boolean
}

type BatchAssessmentContextType = {
    batchDisplayOptions: BatchDisplayOptions
    setBatchDisplayOptions: (batchDisplayOptions: BatchDisplayOptions) => void
}

const BatchDisplayOptionsContext = React.createContext<BatchAssessmentContextType>({
    batchDisplayOptions: {waveformOpts: {layoutMode: 'vertical'}, viewFiltered: false},
    setBatchDisplayOptions: () => {}
})

export const useBatchDisplayOptions = () => {
    const {batchDisplayOptions, setBatchDisplayOptions} = React.useContext(BatchDisplayOptionsContext)
    return {
        waveformOpts: batchDisplayOptions.waveformOpts,
        setWaveformOpts: useCallback((waveformOpts: {layoutMode: 'geom' | 'vertical'}) => {
            setBatchDisplayOptions({
                ...batchDisplayOptions,
                waveformOpts
            })
        }, [batchDisplayOptions, setBatchDisplayOptions]),
        viewFiltered: batchDisplayOptions.viewFiltered,
        setViewFiltered: useCallback((viewFiltered: boolean) => {
            setBatchDisplayOptions({
                ...batchDisplayOptions,
                viewFiltered
            })
        }, [batchDisplayOptions, setBatchDisplayOptions])
    }
}

export default BatchDisplayOptionsContext