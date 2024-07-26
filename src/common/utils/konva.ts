import Konva from 'konva'

import { TOOLS } from '../../common/tools'
import { Vec2, Canvas, Grid, Layer, Rectangle, Selected, Tileset, Workspace } from '../../stores/editor/types'
import { brightenDarken, getRgbaValue } from './colors'

export const getAngle = (x: number, y: number) => Math.atan(y / (x == 0 ? 0.01 : x)) + (x < 0 ? Math.PI : 0)

export const getDistance = (p1: Vec2, p2: Vec2) => Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2))

export const getCenter = (p1: Vec2, p2: Vec2): Vec2 => ({
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2
})

export const getCoordsFromPos = (grid: Grid, pos: Konva.Vector2d): Konva.Vector2d => ({
    x: Math.ceil(pos.x / grid.width) - 1,
    y: Math.ceil(pos.y / grid.height) - 1
})

export const pickColor = (ctx: CanvasRenderingContext2D, pos: Konva.Vector2d): number[] =>
    Object.values(ctx.getImageData(pos.x, pos.y, 1, 1).data)

export const getPointerRelativePos = (
    workspace: Workspace,
    pos: Konva.Vector2d,
    offset?: Konva.Vector2d
): Konva.Vector2d => ({
    x: (pos.x - ((offset && offset.x * workspace.scale) || 0) - workspace.x) / workspace.scale,
    y: (pos.y - ((offset && offset.y * workspace.scale) || 0) - workspace.y) / workspace.scale
})

export function getSelectionRect(shape: Konva.Rect): Rectangle {
    const [x, y, w, h] = [shape.x(), shape.y(), shape.width(), shape.height()]
    return {
        height: Math.abs(h),
        width: Math.abs(w),
        x: w < 0 ? x + w : x,
        y: h < 0 ? y + h : y
    }
}

export function centerStage(
    stage: Konva.Stage,
    canvas: Canvas,
    cb: (pos: Konva.Vector2d, scale: Konva.Vector2d) => void
): void {
    const padding = 100
    const dimension = canvas.height >= canvas.width ? 'height' : 'width'
    const width = window.innerWidth
    const height = window.innerHeight
    const scale = (dimension === 'width' ? width - padding * 2 : height - padding * 2) / canvas[dimension]
    const x = (width - canvas.width * scale) / 2
    const y = (height - canvas.height * scale) / 2

    stage.position({ x, y })
    stage.scale({ x: scale, y: scale })
    stage.batchDraw()

    cb(stage.position(), { x: scale, y: scale } as Konva.Vector2d)
}

export function actionDraw(
    pos: Konva.Vector2d,
    selected: Selected,
    ctx: CanvasRenderingContext2D,
    keyDown?: KeyboardEvent | null
): void {
    const { tool, toolSize } = selected
    switch (tool) {
        case TOOLS.BRIGHTNESS: {
            const pick = ctx.getImageData(pos.x, pos.y, toolSize, toolSize)
            const amount = keyDown && keyDown.code === 'AltLeft' ? -1 : 1
            ctx.putImageData(brightenDarken(pick, amount), pos.x, pos.y)
            break
        }
        default: {
            ctx.fillStyle = getRgbaValue(selected.color)
            if (tool === TOOLS.ERASER) {
                ctx.clearRect(pos.x, pos.y, toolSize, toolSize)
            } else {
                ctx.fillRect(Math.floor(pos.x), Math.floor(pos.y), toolSize, toolSize)
            }
            break
        }
    }
}

export function actionLine(
    startPos: Konva.Vector2d,
    endPos: Konva.Vector2d,
    selected: Selected,
    ctx: CanvasRenderingContext2D,
    keyDown?: KeyboardEvent | null
): void {
    const drawPixel = (x: number, y: number): void => actionDraw({ x, y }, selected, ctx, keyDown)
    const ang = getAngle(endPos.x - startPos.x, endPos.y - startPos.y)
    const tri =
        Math.abs(startPos.x - endPos.x) > Math.abs(startPos.y - endPos.y)
            ? {
                  long: Math.abs(startPos.x - endPos.x),
                  x: Math.sign(Math.cos(ang)),
                  y: Math.tan(ang) * Math.sign(Math.cos(ang))
              }
            : {
                  long: Math.abs(startPos.y - endPos.y),
                  x: Math.tan(Math.PI / 2 - ang) * Math.sign(Math.cos(Math.PI / 2 - ang)),
                  y: Math.sign(Math.cos(Math.PI / 2 - ang))
              }

    for (let i = 0; i < tri.long; i++) {
        const thispoint = {
            x: Math.round(startPos.x + tri.x * i),
            y: Math.round(startPos.y + tri.y * i)
        }
        drawPixel(thispoint.x, thispoint.y)
    }
    drawPixel(Math.round(endPos.x), Math.round(endPos.y))
}

export function fillColor(
    pos: Konva.Vector2d,
    selectedColor: number[],
    bufferImage: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D
): void {
    const [r, g, b] = selectedColor
    const a = !isNaN(selectedColor[3]) ? selectedColor[3] : 255
    const pixelStack = [[Math.floor(pos.x), Math.floor(pos.y)]]
    const colorLayer = ctx.getImageData(0, 0, bufferImage.width, bufferImage.height)
    const startPos = (Math.floor(pos.y) * bufferImage.width + Math.floor(pos.x)) * 4
    const startR = colorLayer.data[startPos]
    const startG = colorLayer.data[startPos + 1]
    const startB = colorLayer.data[startPos + 2]
    const startA = colorLayer.data[startPos + 3]

    let x: number, y: number, pixelPos: number, reachLeft: boolean, reachRight: boolean

    if (r === startR && g === startG && b === startB && a === startA) {
        return
    }

    const matchStartColor = (pixelPos: number) => {
        const r = colorLayer.data[pixelPos]
        const g = colorLayer.data[pixelPos + 1]
        const b = colorLayer.data[pixelPos + 2]
        const a = colorLayer.data[pixelPos + 3]
        return r === startR && g === startG && b === startB && a === startA
    }

    const colorPixel = (pixelPos: number) => {
        colorLayer.data[pixelPos] = r
        colorLayer.data[pixelPos + 1] = g
        colorLayer.data[pixelPos + 2] = b
        colorLayer.data[pixelPos + 3] = a
    }

    const floodFill = () => {
        const newPos = pixelStack.pop() as number[]
        x = newPos[0]
        y = newPos[1]
        pixelPos = (y * bufferImage.width + x) * 4

        while (y >= 0 && matchStartColor(pixelPos)) {
            y--
            pixelPos -= bufferImage.width * 4
        }
        pixelPos += bufferImage.width * 4
        reachLeft = false
        reachRight = false
        y++

        while (y < bufferImage.height && matchStartColor(pixelPos)) {
            colorPixel(pixelPos)
            if (x > 0) {
                if (matchStartColor(pixelPos - 4)) {
                    if (!reachLeft) {
                        pixelStack.push([x - 1, y])
                        reachLeft = true
                    }
                } else if (reachLeft) {
                    reachLeft = false
                }
            }
            if (x < bufferImage.width - 1) {
                if (matchStartColor(pixelPos + 4)) {
                    if (!reachRight) {
                        pixelStack.push([x + 1, y])
                        reachRight = true
                    }
                } else if (reachRight) {
                    reachRight = false
                }
            }
            y++
            pixelPos += bufferImage.width * 4
        }
        if (pixelStack.length) {
            floodFill()
        }
    }
    floodFill()
    ctx.putImageData(colorLayer, 0, 0)
}

export function fillTile(
    gid: number,
    pos: Konva.Vector2d,
    layer: Layer,
    grid: Grid,
    tileset: Tileset,
    cb: (data: number[]) => void
): void {
    if (!layer.data) return

    const { width, height } = layer
    const { x: px, y: py } = getCoordsFromPos(grid, pos)

    const startPos = px + ((layer.width * tileset.tilewidth) / grid.width) * py
    const tileStack = [[px, py]]
    const data = [...layer.data]
    const startGid = data[startPos]

    let x: number, y: number, tilePos: number, reachLeft: boolean, reachRight: boolean

    if (gid === startGid) return

    const matchStartGid = (tilePos: number) => data[tilePos] === startGid

    const fillCell = (tilePos: number) => {
        data[tilePos] = gid
    }

    const floodFill = () => {
        const newPos = tileStack.pop() as number[]
        x = newPos[0]
        y = newPos[1]
        tilePos = x + ((layer.width * tileset.tilewidth) / grid.width) * y

        while (y >= 0 && matchStartGid(tilePos)) {
            y--
            tilePos -= width
        }
        tilePos += width
        reachLeft = false
        reachRight = false
        y++

        while (y < height && matchStartGid(tilePos)) {
            fillCell(tilePos)
            if (x > 0) {
                if (matchStartGid(tilePos - 1)) {
                    if (!reachLeft) {
                        tileStack.push([x - 1, y])
                        reachLeft = true
                    }
                } else if (reachLeft) {
                    reachLeft = false
                }
            }
            if (x < width - 1) {
                if (matchStartGid(tilePos + 1)) {
                    if (!reachRight) {
                        tileStack.push([x + 1, y])
                        reachRight = true
                    }
                } else if (reachRight) {
                    reachRight = false
                }
            }
            y++
            tilePos += width
        }
        if (tileStack.length) {
            floodFill()
        }
    }
    floodFill()
    cb(data)
}
