import { v4 as uuidv4 } from 'uuid'
import Konva from 'konva'
import { FONT_SPRITE } from '../../common/constants'
import { Grid, Layer, Tileset, Workspace } from './types'

const noop = Function.prototype

export const getLayerById = (layers: Layer[], id: string) => layers.find(layer => layer.id === id)

export const getCoordsFromPos = (grid: Grid, pos: Konva.Vector2d): Konva.Vector2d => ({
    x: Math.ceil(pos.x / grid.width) - 1,
    y: Math.ceil(pos.y / grid.height) - 1
})

export const getPointerRelativePos = (workspace: Workspace, pos: Konva.Vector2d): Konva.Vector2d => ({
    x: (pos.x - workspace.x) / workspace.scale,
    y: (pos.y - workspace.y) / workspace.scale
})

export const getTilePos = (gid: number, tileset: Tileset): Konva.Vector2d => {
    const { firstgid, columns, tilewidth, tileheight } = tileset
    const x = ((gid - firstgid) % columns) * tilewidth
    const y = (Math.ceil((gid - firstgid + 1) / columns) - 1) * tileheight
    return { x, y }
}

export const addNewTile = (tileset: Tileset, tilesetCanvas: HTMLCanvasElement, onSave = noop): void => {
    const { columns, tilecount, tilewidth, tileheight } = tileset
    const newTileId = tilecount + 1
    const pos = getTilePos(newTileId, tileset)
    const canvasElement: any = document.createElement('canvas')
    const canvasContext: CanvasRenderingContext2D = canvasElement.getContext('2d')

    canvasElement.width = columns * tilewidth
    canvasElement.height = pos.y + tileheight
    canvasContext.clearRect(0, 0, canvasElement.width, canvasElement.height)
    canvasContext.drawImage(tilesetCanvas, 0, 0)

    canvasElement.toBlob((blob: Blob) => {
        blob && onSave(blob, newTileId)
    }, 'image/png')
}

export const createEmptyLayer = (name: string, width: number, height: number): Layer => ({
    id: uuidv4(),
    data: new Array(width * height).fill(null),
    height,
    opacity: 255,
    name,
    visible: true,
    width
})

export const getTilesetDimensions = (tileset: Tileset) => ({
    w: tileset.columns * tileset.tilewidth,
    h: Math.ceil(tileset.tilecount / tileset.columns) * tileset.tileheight
})

export const textRenderer =
    (ctx: CanvasRenderingContext2D) =>
    (text: string, x: number, y: number): void => {
        text.split('\n')
            .reverse()
            .forEach((output, index) => {
                for (let i = 0; i < output.length; i += 1) {
                    const chr = output.charCodeAt(i)
                    const size = 5
                    ctx.drawImage(
                        FONT_SPRITE,
                        (chr % 16) * size,
                        Math.ceil((chr + 1) / 16 - 1) * size,
                        size,
                        size,
                        Math.floor(x + i * size),
                        Math.floor(y - index * (size + 1)),
                        size,
                        size
                    )
                }
            })
    }

export const getImageData = (ctx: CanvasRenderingContext2D, size: number, rgba: number[]): ImageData => {
    const [r, g, b, a] = rgba
    const imgData = ctx.createImageData(size, size)
    for (let i = 0; i < imgData.data.length; i += 4) {
        imgData.data[i + 0] = r
        imgData.data[i + 1] = g
        imgData.data[i + 2] = b
        imgData.data[i + 3] = a
    }
    return imgData
}

// // Refer to: http://rosettacode.org/wiki/Bitmap/Bresenham's_line_algorithm#JavaScript
// export const bline = (x0: number, y0: number, x1: number, y1: number, setPixel = noop) => {
//     const dx = Math.abs(x1 - x0),
//         sx = x0 < x1 ? 1 : -1
//     const dy = Math.abs(y1 - y0),
//         sy = y0 < y1 ? 1 : -1
//     let err = (dx > dy ? dx : -dy) / 2
//     while (true) {
//         setPixel(x0, y0)
//         if (x0 === x1 && y0 === y1) break
//         const e2 = err
//         if (e2 > -dx) {
//             err -= dy
//             x0 += sx
//         }
//         if (e2 < dy) {
//             err += dx
//             y0 += sy
//         }
//     }
// }

export const drawLine = (x1: number, y1: number, x2: number, y2: number, pixel = noop) => {
    let x: number
    let y: number
    let px: number
    let py: number
    let xe: number
    let ye: number
    let i: number

    const dx = x2 - x1
    const dy = y2 - y1
    const dx1 = Math.abs(dx)
    const dy1 = Math.abs(dy)

    px = 2 * dy1 - dx1
    py = 2 * dx1 - dy1

    if (dy1 <= dx1) {
        if (dx >= 0) {
            x = x1
            y = y1
            xe = x2
        } else {
            x = x2
            y = y2
            xe = x1
        }
        pixel(x, y)

        for (i = 0; x < xe; i += 1) {
            x += 1
            if (px < 0) {
                px += 2 * dy1
            } else {
                if ((dx < 0 && dy < 0) || (dx > 0 && dy > 0)) {
                    y += 1
                } else {
                    y -= 1
                }
                px += 2 * (dy1 - dx1)
            }

            pixel(x, y)
        }
    } else {
        if (dy >= 0) {
            x = x1
            y = y1
            ye = y2
        } else {
            x = x2
            y = y2
            ye = y1
        }

        pixel(x, y)

        for (i = 0; y < ye; i += 1) {
            y += 1
            if (py <= 0) {
                py += 2 * dx1
            } else {
                if ((dx < 0 && dy < 0) || (dx > 0 && dy > 0)) {
                    x += 1
                } else {
                    x -= 1
                }
                py += 2 * (dx1 - dy1)
            }

            pixel(x, y)
        }
    }
}

// //Action functions
// export function actionDraw(offScreenCTX, coordX, coordY, currentColor, currentMode) {
//     offScreenCTX.fillStyle = currentColor.color
//     switch (currentMode) {
//         case 'erase':
//             offScreenCTX.clearRect(coordX, coordY, 1, 1)
//             break
//         default:
//             offScreenCTX.fillRect(coordX, coordY, 1, 1)
//     }
// }

// export function actionLine(sx, sy, tx, ty, currentColor, ctx, currentMode, scale = 1) {
//     ctx.fillStyle = currentColor.color
//     const drawPixel = (x, y, w, h) => {
//         return currentMode === 'erase' ? ctx.clearRect(x, y, w, h) : ctx.fillRect(x, y, w, h)
//     }
//     //create triangle object
//     const tri: { x: number; y: number; long: number } = { x: 0, y: 0, long: 0 }

//     const getTriangle = (x1, y1, x2, y2, ang) => {
//         if (Math.abs(x1 - x2) > Math.abs(y1 - y2)) {
//             tri.x = Math.sign(Math.cos(ang))
//             tri.y = Math.tan(ang) * Math.sign(Math.cos(ang))
//             tri.long = Math.abs(x1 - x2)
//         } else {
//             tri.x = Math.tan(Math.PI / 2 - ang) * Math.sign(Math.cos(Math.PI / 2 - ang))
//             tri.y = Math.sign(Math.cos(Math.PI / 2 - ang))
//             tri.long = Math.abs(y1 - y2)
//         }
//     }

//     // finds the angle of (x,y) on a plane from the origin
//     const getAngle = (x, y) => Math.atan(y / (x == 0 ? 0.01 : x)) + (x < 0 ? Math.PI : 0)

//     const angle = getAngle(tx - sx, ty - sy) // angle of line

//     getTriangle(sx, sy, tx, ty, angle)

//     for (let i = 0; i < tri.long; i++) {
//         const thispoint = {
//             x: Math.round(sx + tri.x * i),
//             y: Math.round(sy + tri.y * i)
//         }
//         // for each point along the line
//         drawPixel(
//             thispoint.x * scale, // round for perfect pixels
//             thispoint.y * scale, // thus no aliasing
//             scale,
//             scale
//         ) // fill in one pixel, 1x1
//     }
//     //fill endpoint
//     drawPixel(
//         Math.round(tx) * scale, // round for perfect pixels
//         Math.round(ty) * scale, // thus no aliasing
//         scale,
//         scale
//     ) // fill in one pixel, 1x1
// }
