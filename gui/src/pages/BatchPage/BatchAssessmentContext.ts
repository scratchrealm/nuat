import React, { useCallback } from "react"

export type UnitAssessment = {
    quality: {
        autocorrelogram?: number,
        averageWaveform?: number,
        spikeAmplitudes?: number,
        snippets?: number
        overall?: number
    }
    multiUnitActivity?: boolean
    noiseOverlap?: boolean
    comments?: string
}

export type BatchAssessment = {
    batchId: string
    userId: string
    unitAssessments: {
        unitId: string | number
        assessment: UnitAssessment
    }[]
} | undefined

export type BatchAssessmentAction = {
    type: 'setUnitAssessment'
    unitId: string | number
    assessment: UnitAssessment | undefined
} | {
    type: 'setBatchAssessment'
    batchAssessment: BatchAssessment
}

export const batchAssessmentReducer = (state: BatchAssessment, action: BatchAssessmentAction) => {
    switch (action.type) {
        case 'setUnitAssessment': {
            if (state === undefined) return state // batch assessment needs to be created first
            const {assessment} = action
            let unitAssessments = [...state.unitAssessments]
            if (!unitAssessments.some(a => (a.unitId === action.unitId))) {
                if (assessment !== undefined) {
                    unitAssessments.push({
                        unitId: action.unitId,
                        assessment
                    })
                }
            }
            else {
                if (assessment !== undefined) {
                    unitAssessments = unitAssessments.map(a => {
                        if (a.unitId === action.unitId) {
                            return {
                                unitId: action.unitId,
                                assessment
                            }
                        }
                        else return a
                    })
                }
                else {
                    unitAssessments = unitAssessments.filter(a => (a.unitId !== action.unitId))
                }
            }
            return {
                ...state,
                unitAssessments
            }
        }
        case 'setBatchAssessment': {
            return action.batchAssessment
        }
        default: throw Error('Unexpected action type: ' + (action as any).type)
    }
}

type BatchAssessmentContextType = {
    batchAssessment: BatchAssessment
    batchAssessmentOnDisk: BatchAssessment
    saveBatchAssessment: () => void
    batchAssessmentDispatch: (a: BatchAssessmentAction) => void
}

const BatchAssessmentContext = React.createContext<BatchAssessmentContextType>({
    batchAssessment: undefined,
    batchAssessmentOnDisk: undefined,
    saveBatchAssessment: () => {},
    batchAssessmentDispatch: () => {}
})

export const useBatchAssessment = () => {
    const {batchAssessment, batchAssessmentOnDisk, saveBatchAssessment, batchAssessmentDispatch} = React.useContext(BatchAssessmentContext)
    const setUnitAssessment = useCallback((unitId: string | number, assessment: UnitAssessment | undefined) => {
        batchAssessmentDispatch({type: 'setUnitAssessment', unitId, assessment})
    }, [batchAssessmentDispatch])
    const setBatchAssessment = useCallback((assessment: BatchAssessment) => {
        batchAssessmentDispatch({type: 'setBatchAssessment', batchAssessment: assessment})
    }, [batchAssessmentDispatch])
    return {batchAssessment, batchAssessmentOnDisk, saveBatchAssessment, setUnitAssessment, setBatchAssessment}
}

export default BatchAssessmentContext