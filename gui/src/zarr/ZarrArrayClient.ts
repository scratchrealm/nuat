import { serviceQuery } from "@figurl/interface"

class ZarrArrayClient {
    #initialized = false
    #initializing = false
    #arrayInfo: {
        success: boolean
        shape: number[]
        dtype: string
    } | undefined = undefined
    constructor(private uri: string, private arrayName: string) {
        this._initialize()
    }
    private async _initialize() {
        if (this.#initialized) return
        if (this.#initializing) {
            while (this.#initializing) {
                await new Promise(r => setTimeout(r, 100))
            }
            return
        }
        this.#initializing = true
        try {
            const {result} = await serviceQuery(
                'zarr',
                {
                    type: 'get_array_info',
                    path: this.uri,
                    name: this.arrayName
                }
            )
            if (!result.success) {
                throw Error(`Unable to get array info for ${this.uri} ${this.arrayName}`)
            }
            this.#arrayInfo = result
            this.#initialized = true
        }
        finally {
            this.#initializing = false
        }
    }
    async shape() {
        await this._initialize()
        if (!this.#arrayInfo) throw Error('Unexpected arrayInfo is undefined after initialization')
        return this.#arrayInfo.shape
    }
    async dtype() {
        await this._initialize()
        if (!this.#arrayInfo) throw Error('Unexpected arrayInfo is undefined after initialization')
        return this.#arrayInfo.dtype
    }
    async getSubArray(slices: {start: number, stop: number, step: number}[]): Promise<number[] | number[][] | number[][][]> {
        const shape = await this.shape()
        if (shape.length !== slices.length) {
            throw Error(`Unexpected number of slices: ${slices.length} (expected ${shape.length})`)
        }
        const {result, binaryPayload} = await serviceQuery(
            'zarr',
            {
                type: 'get_array_chunk',
                path: this.uri,
                name: this.arrayName,
                slices
            }
        )
        if (!result.success) {
            throw Error(`Unable to get array chunk for ${this.uri} ${this.arrayName}`)
        }
        let data_1d: Uint8Array | Uint16Array | Int16Array | Uint32Array | Int32Array | Float32Array
        if (result.dtype === 'uint8') {
            data_1d = new Uint8Array(binaryPayload)
        }
        else if (result.dtype === 'uint16') {
            data_1d = new Uint16Array(binaryPayload)
        }
        else if (result.dtype === 'int16') {
            data_1d = new Int16Array(binaryPayload)
        }
        else if (result.dtype === 'uint32') {
            data_1d = new Uint32Array(binaryPayload)
        }
        else if (result.dtype === 'int32') {
            data_1d = new Int32Array(binaryPayload)
        }
        else if (result.dtype === 'float32') {
            data_1d = new Float32Array(binaryPayload)
        }
        else {
            throw Error(`Unexpected data type for zarr array: ${result.dtype}`)
        }
        const subArrayShape = slices.map(s => Math.floor((s.stop - s.start) / s.step))
        if (subArrayShape.length === 1) {
            return Array.from(data_1d)
        }
        else if (subArrayShape.length === 2) {
            const data_2d = new Array(subArrayShape[0])
            for (let i = 0; i < subArrayShape[0]; i++) {
                data_2d[i] = Array.from(data_1d.subarray(i * subArrayShape[1], (i + 1) * subArrayShape[1]))
            }
            return data_2d
        }
        else if (subArrayShape.length === 3) {
            const data_3d = new Array(subArrayShape[0])
            for (let i = 0; i < subArrayShape[0]; i++) {
                data_3d[i] = new Array(subArrayShape[1])
                for (let j = 0; j < subArrayShape[1]; j++) {
                    data_3d[i][j] = Array.from(data_1d.subarray((i * subArrayShape[1] + j) * subArrayShape[2], (i * subArrayShape[1] + j + 1) * subArrayShape[2]))
                }
            }
            return data_3d
        }
        else {
            throw Error(`Unexpected shape for zarr array: ${subArrayShape}`)
        }
    }
    async getArray() {
        const shape = await this.shape()
        const slices = shape.map(s => ({start: 0, stop: s, step: 1}))
        return this.getSubArray(slices)
    }
    async getArray1D() {
        const shape = await this.shape()
        if (shape.length !== 1) {
            throw Error(`Cannot get array as 1D because shape is not 1D: ${shape}`)
        }
        const array = await this.getArray()
        return array as number[]
    }
    async getArray2D() {
        const shape = await this.shape()
        if (shape.length !== 2) {
            throw Error(`Cannot get array as 2D because shape is not 2D: ${shape}`)
        }
        const array = await this.getArray()
        return array as number[][]
    }
    async getArray3D() {
        const shape = await this.shape()
        if (shape.length !== 3) {
            throw Error(`Cannot get array as 3D because shape is not 3D: ${shape}`)
        }
        const array = await this.getArray()
        return array as number[][][]
    }
}

export default ZarrArrayClient