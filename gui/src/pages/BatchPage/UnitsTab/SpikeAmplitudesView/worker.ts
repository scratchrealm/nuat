import { Opts } from "./WorkerTypes";

let canvas: HTMLCanvasElement | undefined = undefined
let opts: Opts | undefined = undefined
let spikeTimes: number[] | undefined = undefined
let spikeAmplitudes: number[] | undefined = undefined

onmessage = function (evt) {
    if (evt.data.canvas) {
        canvas = evt.data.canvas
        drawDebounced()
    }
    if (evt.data.opts) {
        opts = evt.data.opts
        drawDebounced()
    }
    if (evt.data.eventData) {
        spikeTimes = evt.data.eventData.spikeTimes
        spikeAmplitudes = evt.data.eventData.spikeAmplitudes
        drawDebounced()
    }
}

function debounce(f: () => void, msec: number) {
    let scheduled = false
    return () => {
        if (scheduled) return
        scheduled = true
        setTimeout(() => {
            scheduled = false
            f()
        }, msec)
    }
}

async function draw() {
    if (!canvas) return
    if (!opts) return
    if (!spikeTimes) return
    if (!spikeAmplitudes) return

    const {margins, canvasWidth, canvasHeight, visibleStartTimeSec, visibleEndTimeSec, amplitudeScaleFactor} = opts

    // this is important because main thread no longer has control of canvas (it seems)
    canvas.width = canvasWidth
    canvas.height = canvasHeight

    const context = canvas.getContext("2d")
    if (!context) return

    context.clearRect(0, 0, canvasWidth, canvasHeight)

    const timeToPixel = (t: number) => {
        return margins.left + (canvasWidth - margins.left - margins.right) * (t - visibleStartTimeSec) / (visibleEndTimeSec - visibleStartTimeSec)
    }
    const amplitudeToPixel = (a: number) => {
        if (!opts) return 0
        return canvasHeight - margins.bottom - (canvasHeight - margins.top - margins.bottom) * (a * amplitudeScaleFactor - opts.ampMin) / (opts.ampMax - opts.ampMin)
    }

    const yTicks = getYTicks(opts.ampMin, opts.ampMax)
    for (const a of yTicks) {
        context.strokeStyle = 'black'
        context.textAlign = 'right'
        context.textBaseline = 'middle'
        context.fillText(`${a}`, timeToPixel(visibleStartTimeSec) - 5, amplitudeToPixel(a))

        context.strokeStyle = 'gray'
        context.beginPath()
        context.moveTo(timeToPixel(visibleStartTimeSec), amplitudeToPixel(a))
        context.lineTo(timeToPixel(visibleEndTimeSec), amplitudeToPixel(a))
        context.stroke()
    }

    context.fillStyle = 'black'
    for (let i = 0; i < spikeTimes.length; i++) {
        const t = spikeTimes[i]
        if ((t < visibleStartTimeSec) || (t > visibleEndTimeSec)) continue
        const a = spikeAmplitudes[i]
        const x0 = timeToPixel(t)
        const y0 = amplitudeToPixel(a)
        context.beginPath()
        context.ellipse(x0, y0, 3, 3, 0, 0, Math.PI * 2, false)
        context.fill()
    }
}

const getYTicks = (ampMin: number, ampMax: number) => {
    const a = Math.abs(ampMax - ampMin)
    const b = Math.pow(10, Math.floor(Math.log10(a)))
    const c = a / b
    let d = 0
    if (c < 2) d = 0.2
    else if (c < 5) d = 0.5
    else d = 1
    const e = d * b
    const f = Math.floor(ampMin / e)
    const g = Math.ceil(ampMax / e)
    const ret: number[] = []
    for (let i = f; i <= g; i++) {
        ret.push(i * e)
    }
    return ret
}

const drawDebounced = debounce(draw, 100)

// export { }