import { FunctionComponent, useCallback, useEffect, useState } from "react"
import TimeScrollView2, { useTimeScrollView2 } from '@figurl/timeseries-views/dist/component-time-scroll-view-2/TimeScrollView2';
import { useTimeRange, useTimeseriesSelectionInitialization } from "@figurl/timeseries-views";
import { Opts } from "./WorkerTypes";

type Props = {
    width: number
    height: number
    spikeAmplitudes: number[]
    spikeTimes: number[]
    ampMin: number
    ampMax: number
}

const gridlineOpts = {
    hideX: false,
    hideY: true
}

const yAxisInfo = {
    showTicks: false,
    yMin: undefined,
    yMax: undefined
}

const SpikeAmplitudesPlot: FunctionComponent<Props> = ({width, height, spikeAmplitudes, spikeTimes, ampMin, ampMax}) => {
    const hideToolbar = true
    const {canvasWidth, canvasHeight, margins} = useTimeScrollView2({width, height, hideToolbar})

    const [canvasElement, setCanvasElement] = useState<HTMLCanvasElement | undefined>()

    const {visibleStartTimeSec, visibleEndTimeSec} = useTimeRange()

    const [amplitudeScaleFactor, setAmplitudeScaleFactor] = useState(1)

    useTimeseriesSelectionInitialization(spikeTimes[0] || 0, spikeTimes[spikeTimes.length - 1] || 0, 0)

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            setAmplitudeScaleFactor(x => (x / 1.3))
        }
        else if (e.key === 'ArrowUp') {
            setAmplitudeScaleFactor(x => (x * 1.3))
        }
    }, [])

    const [worker, setWorker] = useState<Worker | null>(null)
    useEffect(() => {
        let canceled = false
        if (!canvasElement) return
        let offscreenCanvas: OffscreenCanvas
        try {
            offscreenCanvas = canvasElement.transferControlToOffscreen();
        }
        catch(err) {
            console.warn('Unable to transfer control of canvas.')
            return
        }
        const worker = new Worker(new URL('./worker', import.meta.url))
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        worker.onmessage = ev => {
            if (canceled) return
            //
        }
        
        worker.postMessage({
            canvas: offscreenCanvas,
        }, [offscreenCanvas])

		setWorker(worker)

        return () => {
            worker.terminate()
            canceled = true
        }
    }, [canvasElement])

    useEffect(() => {
        if (!worker) return
        if (visibleStartTimeSec === undefined) return
        if (visibleEndTimeSec === undefined) return
        const opts: Opts = {
            canvasWidth,
            canvasHeight,
            margins,
            visibleStartTimeSec,
            visibleEndTimeSec,
            ampMin,
            ampMax,
            amplitudeScaleFactor
        }
        worker.postMessage({
            opts
        })
    }, [worker, canvasWidth, canvasHeight, visibleStartTimeSec, visibleEndTimeSec, margins, amplitudeScaleFactor, ampMin, ampMax])

    useEffect(() => {
        if (!worker) return
        if (!spikeAmplitudes) return
        if (!spikeTimes) return
        const eventData = {
            spikeAmplitudes,
            spikeTimes
        }
        worker.postMessage({
            eventData
        })
    }, [worker, spikeAmplitudes, spikeTimes])

    return (
        <TimeScrollView2
            width={width}
            height={height}
            onCanvasElement={setCanvasElement}
            gridlineOpts={gridlineOpts}
            onKeyDown={handleKeyDown}
            // onMouseDown={handleMouseDown}
            // onMouseMove={handleMouseMove}
            // onMouseOut={handleMouseOut}
            hideToolbar={hideToolbar}
            yAxisInfo={yAxisInfo}
        />
    )
}

export default SpikeAmplitudesPlot