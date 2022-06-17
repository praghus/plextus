import Konva from 'konva'

import { TOOLS } from '../../common/constants'
import { Canvas, Grid, Selected, Workspace } from '../../store/editor/types'
import { brightenDarken, getRgbaValue } from './colors'

export const getAngle = (x: number, y: number) => Math.atan(y / (x == 0 ? 0.01 : x)) + (x < 0 ? Math.PI : 0)

export const getCoordsFromPos = (grid: Grid, pos: Konva.Vector2d): Konva.Vector2d => ({
    x: Math.ceil(pos.x / grid.width) - 1,
    y: Math.ceil(pos.y / grid.height) - 1
})

export const getPointerRelativePos = (
    workspace: Workspace,
    pos: Konva.Vector2d,
    offset?: Konva.Vector2d
): Konva.Vector2d => ({
    x: Math.floor((pos.x - ((offset && offset.x * workspace.scale) || 0) - workspace.x) / workspace.scale),
    y: Math.floor((pos.y - ((offset && offset.y * workspace.scale) || 0) - workspace.y) / workspace.scale)
})

export const pickColor = (ctx: CanvasRenderingContext2D, pos: Konva.Vector2d): number[] =>
    Object.values(ctx.getImageData(pos.x, pos.y, 1, 1).data)

export function centerStage(
    stage: Konva.Stage,
    canvas: Canvas,
    workspace: Workspace,
    cb: (x: number, y: number, scale: number) => void
): void {
    const padding = 100
    const dimension = canvas.height >= canvas.width ? 'height' : 'width'
    const scale =
        (dimension === 'width' ? workspace.width - padding * 2 : workspace.height - padding * 2) / canvas[dimension]
    const x = (workspace.width - canvas.width * scale) / 2
    const y = (workspace.height - canvas.height * scale) / 2

    stage.position({ x, y })
    stage.scale({ x: scale, y: scale })
    stage.batchDraw()

    cb(x, y, scale)
}

export function actionDraw(
    pos: Konva.Vector2d,
    selected: Selected,
    ctx: CanvasRenderingContext2D,
    keyDown?: KeyboardEvent | null
): void {
    const { tool, toolSize } = selected
    switch (tool) {
        case TOOLS.BRIGHTNESS:
            const pick = ctx.getImageData(pos.x, pos.y, toolSize, toolSize)
            const amount = keyDown && keyDown.code === 'AltLeft' ? -1 : 1
            ctx.putImageData(brightenDarken(pick, amount), pos.x, pos.y)
            break
        default:
            ctx.fillStyle = getRgbaValue(selected.color)
            tool === TOOLS.ERASER
                ? ctx.clearRect(pos.x, pos.y, toolSize, toolSize)
                : ctx.fillRect(Math.floor(pos.x), Math.floor(pos.y), toolSize, toolSize)
            break
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
