import { useTimeRange } from "@figurl/timeseries-views"
import { FunctionComponent, useEffect, useMemo, useState } from "react"
import { WaveformOpts } from "../../BatchDisplayOptionsContext"
import AverageWaveformPlot from "../AverageWaveformView/AverageWaveformPlot"
import { transpose } from "../AverageWaveformView/AverageWaveformView"
import { UnitInfo } from "../CurrentUnitView"
import BoxGrid from "./BoxGrid"
import SnippetsClient, { Snippet } from "./SnippetsClient"

type Props = {
    width: number
    height: number
    snippetsClient: SnippetsClient
    spikeTimes?: number[]
    averageWaveform?: number[][]
    unitId: string | number
    unitInfo: UnitInfo
    waveformOpts: WaveformOpts
}

const SnippetsPlot: FunctionComponent<Props> = ({ width, height, snippetsClient, spikeTimes, averageWaveform, unitInfo, waveformOpts }) => {
    const [snippets, setSnippets] = useState<Snippet[]>([])
    const {visibleStartTimeSec, visibleEndTimeSec} = useTimeRange()
    
    useEffect(() => {
        let canceled = false
        let visibleIndices: number[] = []
        if (spikeTimes && visibleStartTimeSec !== undefined && visibleEndTimeSec !== undefined) {
            visibleIndices = spikeTimes.map((t, i) => ({t, i})).filter(({t, i}) => (t >= visibleStartTimeSec) && (t < visibleEndTimeSec)).map(({t, i}) => i)
        }
        const i1 = visibleIndices[0] || 0
        const i2 = Math.min(visibleIndices[visibleIndices.length - 1] || 0, i1 + 20)
        ;(async () => {
            const x = await snippetsClient.getSnippets(i1, i2)
            if (canceled) return
            setSnippets(x)
        })()
        return () => {canceled = true}
    }, [snippetsClient, spikeTimes, visibleStartTimeSec, visibleEndTimeSec])

    const channelLocations = useMemo(() => {
        const ret: {[key: string]: number[]} = {}
        for (let i = 0; i < unitInfo.channel_neighborhood_ids.length; i++) {
            const ch = unitInfo.channel_neighborhood_ids[i]
            const loc = unitInfo.channel_neighborhood_locations[i]
            ret[ch + ''] = [loc.x, loc.y]
        }
        return ret
    }, [unitInfo.channel_neighborhood_ids, unitInfo.channel_neighborhood_locations])

    const peakAmplitude = useMemo(() => {
        if (averageWaveform === undefined) return 0
        let max = 0
        const waveform = averageWaveform
        for (let i = 0; i < waveform.length; i++) {
            const wf = waveform[i]
            for (let j = 0; j < wf.length; j++) {
                const val = Math.abs(wf[j])
                if (val > max) max = val
            }
        }
        return max
    }, [averageWaveform])

    return (
        <BoxGrid
            width={width}
            height={height}
        >
            {snippets.map((snippet, ii) => (
                // Not really an average waveform, but that's okay
                <AverageWaveformPlot
                    key={ii}
                    allChannelIds={unitInfo.channel_neighborhood_ids}
                    channelIds={unitInfo.channel_neighborhood_ids}
                    units={[
                        {
                            channelIds: unitInfo.channel_neighborhood_ids,
                            waveform: transpose(snippet.waveform),
                            waveformColor: 'black'
                        }
                    ]}
                    layoutMode={waveformOpts.layoutMode}
                    hideElectrodes={false}
                    channelLocations={channelLocations}
                    peakAmplitude={peakAmplitude}
                    ampScaleFactor={1}
                    horizontalStretchFactor={1}
                    showChannelIds={false}
                    useUnitColors={false}
                    width={0}
                    height={0}
                    showReferenceProbe={false}
                    disableAutoRotate={true}
                />
            ))}
        </BoxGrid>
    )
}

export default SnippetsPlot
