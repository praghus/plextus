import { v4 as uuidv4 } from 'uuid'
import { execute } from 'wasm-imagemagick'
import { IMPORT_MODES, TILESET_FILENAME } from '../constants'
import { INITIAL_STATE } from '../../store/editor/constants'
import { LayerImportConfig, Tileset } from '../../store/editor/types'
import { spliceIntoChunks } from './array'
import { canvasToBlob } from './data'

export function getImage(src: string): Promise<HTMLImageElement> {
    return new Promise<HTMLImageElement>((resolve, reject) => {
        const image: HTMLImageElement = new window.Image()
        image.src = src
        image.onload = () => resolve(image)
        image.onerror = reject
    })
}

export function createEmptyImage(width: number, height: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const canvasElement = document.createElement('canvas')
        const ctx = canvasElement.getContext('2d') as CanvasRenderingContext2D
        canvasElement.height = height
        ctx.clearRect(0, 0, canvasElement.width, canvasElement.height)
        canvasElement.toBlob((blob: Blob | null) => (blob ? resolve(blob) : reject()), 'image/png')
    })
}

export function downloadImage(canvas: HTMLCanvasElement): void {
    const downloadLink = document.createElement('a')
    const dataURL = canvas.toDataURL('image/png')
    const url = dataURL.replace(/^data:image\/png/, 'data:application/octet-stream')
    downloadLink.setAttribute('download', TILESET_FILENAME)
    downloadLink.setAttribute('href', url)
    downloadLink.click()
}

export function uploadImage(
    file: Blob
): Promise<{ image: HTMLImageElement; blob: Blob; width: number; height: number }> {
    return new Promise((resolve, reject) => {
        const canvasElement = document.createElement('canvas')
        const ctx = canvasElement.getContext('2d') as CanvasRenderingContext2D
        const imageReader = new FileReader()
        imageReader.readAsDataURL(file)
        imageReader.onload = async ev => {
            if (ev.target) {
                const { result } = ev.target
                if (result) {
                    const image = await getImage(result as string)
                    canvasElement.width = image.width
                    canvasElement.height = image.height

                    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height)
                    ctx.drawImage(image, 0, 0)

                    const blob = await canvasToBlob(canvasElement)
                    resolve({ blob, height: image.height, image, width: image.width })
                }
            } else reject()
        }
    })
}

export async function getTilesetHashData(
    tileset: Tileset
): Promise<{ tempTiles: ImageData[]; tempTilesHash: string[] }> {
    const { image, columns, tilecount, tilewidth, tileheight } = tileset
    const canvasElement = document.createElement('canvas')
    const ctx = canvasElement.getContext('2d') as CanvasRenderingContext2D
    const tempTiles: ImageData[] = []
    const tempTilesHash: string[] = []
    const tw = columns * tilewidth
    const th = Math.ceil(tilecount / columns) * tileheight
    const tilesetImage = await getImage(image)

    canvasElement.width = tw
    canvasElement.height = th
    ctx.clearRect(0, 0, tw, th)
    ctx.drawImage(tilesetImage, 0, 0, tw, th)

    for (let y = 0; y < th; y += tileheight) {
        for (let x = 0; x < tw; x += tilewidth) {
            const data = ctx.getImageData(x, y, tilewidth, tileheight)
            const key = data.data.toString()
            if (tempTilesHash.indexOf(key) === -1) {
                tempTilesHash.push(key)
                tempTiles.push(data)
            }
        }
    }
    return { tempTiles, tempTilesHash }
}

export async function importLayer(image: CanvasImageSource, config: LayerImportConfig, tileset: Tileset) {
    const { columns, mode, name, offset, resolution, tileSize } = config
    if (image) {
        const layerCanvas = document.createElement('canvas')
        const layerContext = layerCanvas.getContext('2d') as CanvasRenderingContext2D
        const tilesetCanvas = document.createElement('canvas')
        const tilesetContext = tilesetCanvas.getContext('2d') as CanvasRenderingContext2D

        const { w: layerwidth, h: layerheight } = resolution
        const { w: tilewidth, h: tileheight } = tileSize
        const { tilecount } = mode === IMPORT_MODES.NEW_PROJECT ? INITIAL_STATE.tileset : tileset
        const tw = columns * tilewidth
        const th = Math.ceil(tilecount / columns) * tileheight

        const { tempTiles, tempTilesHash } =
            mode === IMPORT_MODES.NEW_LAYER ? await getTilesetHashData(tileset) : { tempTiles: [], tempTilesHash: [] }

        const layer = {
            data: [] as number[],
            height: (Math.ceil(layerheight / tileheight) * tileheight) / tileheight,
            id: uuidv4(),
            offset: { x: 0, y: 0 },
            opacity: 255,
            visible: true,
            width: (Math.ceil(layerwidth / tilewidth) * tilewidth) / tilewidth
        }
        const w = layer.width * tilewidth
        const h = layer.height * tileheight

        tilesetCanvas.width = tw
        tilesetCanvas.height = th
        tilesetContext.clearRect(0, 0, tw, th)

        layerCanvas.width = w
        layerCanvas.height = h
        layerContext.clearRect(0, 0, w, h)
        layerContext.drawImage(image, offset.x, offset.y, layerwidth, layerheight)

        for (let y = 0; y < layerCanvas.height; y += tileheight) {
            for (let x = 0; x < layerCanvas.width; x += tilewidth) {
                const data = layerContext.getImageData(x, y, tilewidth, tileheight)
                const empty = !data.data.some(channel => channel !== 0)
                const key = data.data.toString()
                if (empty) {
                    layer.data.push(0)
                } else if (tempTilesHash.indexOf(key) === -1) {
                    const number = tempTilesHash.length
                    tilesetCanvas.width = columns * tilewidth
                    tilesetCanvas.height = Math.ceil((number + 1) / columns) * tileheight
                    tempTilesHash.push(key)
                    tempTiles.push(data)
                    layer.data.push(number + 1)
                } else {
                    layer.data.push(tempTilesHash.indexOf(key) + 1)
                }
            }
        }
        tempTiles.forEach((tile, i) => {
            const posX = (i % columns) * tilewidth
            const posY = (Math.ceil((i + 1) / columns) - 1) * tileheight
            tilesetContext.putImageData(tile, posX, posY)
        })

        return {
            layer: { ...layer, name },
            tilecount: tempTiles.length,
            tilesetCanvas
        }
    } else throw new Error('No image data for processing!')
}

export async function reduceColors(canvas: HTMLCanvasElement, colorsCount: 256): Promise<Blob> {
    const blob = await canvasToBlob(canvas)
    const fetchedSourceImage = await new Response(blob).arrayBuffer()
    const sourceBytes = new Uint8Array(fetchedSourceImage)

    const { outputFiles, exitCode } = await execute({
        commands: [`convert ${TILESET_FILENAME} +dither -alpha off -colors ${colorsCount} remap.png`],
        inputFiles: [{ content: sourceBytes, name: TILESET_FILENAME }]
    })
    if (exitCode === 0) {
        const reducedBlob = outputFiles[0].blob
        return reducedBlob.slice(0, reducedBlob.size, 'image/png')
    }
    return blob
}

export async function generateReducedPalette(blob: Blob): Promise<number[][]> {
    const fetchedSourceImage = await new Response(blob).arrayBuffer()
    const sourceBytes = new Uint8Array(fetchedSourceImage)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
    const tempPalette: string[] = []

    const { outputFiles, exitCode } = await execute({
        commands: [`convert ${TILESET_FILENAME} -alpha off -unique-colors palette.png`],
        inputFiles: [{ content: sourceBytes, name: TILESET_FILENAME }]
    })

    if (exitCode === 0) {
        const reducedBlob = outputFiles[0].blob
        const pal = reducedBlob.slice(0, reducedBlob.size, 'image/png')
        const paletteImg = await getImage(window.URL.createObjectURL(pal))
        const { width, height } = paletteImg

        canvas.width = width
        canvas.height = height
        ctx.clearRect(0, 0, width, height)
        ctx.drawImage(paletteImg, 0, 0)

        const data = ctx.getImageData(0, 0, width, height).data

        return spliceIntoChunks<number>(Array.from(data), 4)
            .map(([r, g, b]) => [r, g, b])
            .filter(c => {
                const h = c.toString()
                if (tempPalette.indexOf(h) === -1) {
                    tempPalette.push(h)
                    return true
                }
                return false
            })
    }
    return []
}
