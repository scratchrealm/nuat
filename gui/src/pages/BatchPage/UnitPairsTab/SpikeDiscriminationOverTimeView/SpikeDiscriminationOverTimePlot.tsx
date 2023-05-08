import { FunctionComponent, useCallback, useEffect, useState } from "react"
import TimeScrollView2, { useTimeScrollView2 } from '@figurl/timeseries-views/dist/component-time-scroll-view-2/TimeScrollView2';
import { useTimeRange, useTimeseriesSelectionInitialization } from "@figurl/timeseries-views";
import { Opts } from "./WorkerTypes";

type Props = {
    width: number
    height: number
    discriminationValues: [number[], number[]]
    spikeTimes: [number[], number[]]
    valMin: number
    valMax: number
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

const SpikeDiscriminationOverTimePlot: FunctionComponent<Props> = ({width, height, discriminationValues, spikeTimes, valMin, valMax}) => {
    const hideToolbar = true
    const {canvasWidth, canvasHeight, margins} = useTimeScrollView2({width, height, hideToolbar})

    const [canvasElement, setCanvasElement] = useState<HTMLCanvasElement | undefined>()

    const {visibleStartTimeSec, visibleEndTimeSec} = useTimeRange()

    const [valueScaleFactor, setValueScaleFactor] = useState(1)

    useTimeseriesSelectionInitialization(Math.min(spikeTimes[0][0] || 0, spikeTimes[1][0] || 0), Math.max(spikeTimes[0][spikeTimes[0].length - 1] || 0, spikeTimes[1][spikeTimes[1].length - 1] || 0))

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            setValueScaleFactor(x => (x / 1.3))
        }
        else if (e.key === 'ArrowUp') {
            setValueScaleFactor(x => (x * 1.3))
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
            valMin,
            valMax,
            valueScaleFactor
        }
        worker.postMessage({
            opts
        })
    }, [worker, canvasWidth, canvasHeight, visibleStartTimeSec, visibleEndTimeSec, margins, valueScaleFactor, valMin, valMax])

    useEffect(() => {
        if (!worker) return
        if (!discriminationValues) return
        if (!spikeTimes) return
        const eventData = {
            discriminationValues,
            spikeTimes
        }
        worker.postMessage({
            eventData
        })
    }, [worker, discriminationValues, spikeTimes])

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

export default SpikeDiscriminationOverTimePlot