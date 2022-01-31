import { v4 as uuidv4 } from 'uuid'
import { IMPORT_MODES } from '../constants'
import { INITIAL_STATE } from '../../store/editor/constants'
import { LayerImportConfig, Tileset } from '../../store/editor/types'
import { canvasToBlob } from './data'

export const getImage = (src: string): Promise<HTMLImageElement> =>
    new Promise<HTMLImageElement>((resolve, reject) => {
        const image: HTMLImageElement = new window.Image()
        image.src = src
        image.onload = () => resolve(image)
        image.onerror = reject
    })

export const createEmptyImage = (width: number, height: number): Promise<Blob> =>
    new Promise(resolve => {
        const canvasElement: any = document.createElement('canvas')
        const ctx: CanvasRenderingContext2D = canvasElement.getContext('2d')
        canvasElement.width = width
        canvasElement.height = height
        ctx.clearRect(0, 0, canvasElement.width, canvasElement.height)
        canvasElement.toBlob((blob: Blob) => resolve(blob), 'image/png')
    })

export const downloadImage = (canvas: HTMLCanvasElement) => {
    const downloadLink = document.createElement('a')
    const dataURL = canvas.toDataURL('image/png')
    const url = dataURL.replace(/^data:image\/png/, 'data:application/octet-stream')
    downloadLink.setAttribute('download', 'tileset.png')
    downloadLink.setAttribute('href', url)
    downloadLink.click()
}

export const uploadImage = (
    file: Blob
): Promise<{ image: HTMLImageElement; blob: Blob; width: number; height: number }> =>
    new Promise((resolve, reject) => {
        const canvasElement: any = document.createElement('canvas')
        const ctx: CanvasRenderingContext2D = canvasElement.getContext('2d')
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

export const getTilesetHashData = async (
    tileset: Tileset
): Promise<{ tempTiles: ImageData[]; tempTilesHash: string[] }> => {
    const { image, columns, tilecount, tilewidth, tileheight } = tileset
    const canvasElement: any = document.createElement('canvas')
    const ctx: CanvasRenderingContext2D = canvasElement.getContext('2d')
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

export const importLayer = async (image: CanvasImageSource, config: LayerImportConfig, tileset: Tileset) => {
    const { columns, mode, name, offset, resolution, tileSize } = config
    if (image) {
        const layerCanvas: any = document.createElement('canvas')
        const layerContext: CanvasRenderingContext2D = layerCanvas.getContext('2d')
        const tilesetCanvas: any = document.createElement('canvas')
        const tilesetContext: CanvasRenderingContext2D = tilesetCanvas.getContext('2d')

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

// // Generate new palette from tileset
// for (let y = 0; y < tilesetCanvas.height; y += 1) {
//   for (let x = 0; x < tilesetCanvas.width; x += 1) {
//     const p = Object.values(tilesetContext.getImageData(x, y, 1, 1).data)
//     p[3] = 255
//     if (tempPalette.indexOf(p.join()) === -1) {
//       tempPalette.push(p.join())
//     }
//   }
// }
// onChangePalette(getOrderedPalette(tempPalette))
