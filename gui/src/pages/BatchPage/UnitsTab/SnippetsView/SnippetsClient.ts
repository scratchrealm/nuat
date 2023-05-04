import ZarrArrayClient from "../../../../zarr/ZarrArrayClient"

export type Snippet = {
    waveform: number[][] // nSamples x nChannels
}

class SnippetsClient {
    constructor(private arrayClient: ZarrArrayClient) {
    }
    async getSnippets(start: number, end: number) {
        const shape = await this.arrayClient.shape()
        if (end > shape[0]) end = shape[0]
        const slices = [{start, stop: end, step: 1}, {start: 0, stop: shape[1], step: 1}, {start: 0, stop: shape[2], step: 1}]
        const array = await this.arrayClient.getSubArray(slices)
        return array.map(waveform => ({
            waveform: waveform as number[][]
        }))
    }
}

export default SnippetsClient