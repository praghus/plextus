import Konva from 'konva'
import { FONT_SPRITE, TOOLS } from '../../common/constants'
import { Canvas, Grid, Selected, Workspace } from '../../store/editor/types'
import { getRgbaValue } from './colors'

const getAngle = (x: number, y: number) => Math.atan(y / (x == 0 ? 0.01 : x)) + (x < 0 ? Math.PI : 0)

export const getCoordsFromPos = (grid: Grid, pos: Konva.Vector2d): Konva.Vector2d => ({
    x: Math.ceil(pos.x / grid.width) - 1,
    y: Math.ceil(pos.y / grid.height) - 1
})

export const getPointerRelativePos = (
    workspace: Workspace,
    pos: Konva.Vector2d,
    offset?: Konva.Vector2d
): Konva.Vector2d => ({
    x: (pos.x - ((offset && offset.x * workspace.scale) || 0) - workspace.x) / workspace.scale,
    y: (pos.y - ((offset && offset.y * workspace.scale) || 0) - workspace.y) / workspace.scale
})

export const centerStage = (
    stage: Konva.Stage,
    canvas: Canvas,
    workspace: Workspace,
    cb: (x: number, y: number, scale: number) => void
): void => {
    const PADDING = 0 //150
    const dimension = workspace.height > workspace.width ? 'height' : 'width'
    const scale = workspace[dimension] / (canvas[dimension] + PADDING)
    const x = (workspace.width - canvas.width * scale) / 2
    const y = (workspace.height - canvas.height * scale) / 2

    stage.position({ x, y })
    stage.scale({ x: scale, y: scale })
    stage.batchDraw()

    cb(x, y, scale)
}

export const pickColor = (ctx: CanvasRenderingContext2D, x: number, y: number) =>
    Object.values(ctx.getImageData(x, y, 1, 1).data)

export function fillColor(pos: Konva.Vector2d, selectedColor, bufferImage, ctx): void {
    const [r, g, b, a] = selectedColor
    const pixelStack = [[pos.x, pos.y]]
    const colorLayer = ctx.getImageData(0, 0, bufferImage.width, bufferImage.height)
    const startPos = (pos.y * bufferImage.width + pos.x) * 4
    const startR = colorLayer.data[startPos]
    const startG = colorLayer.data[startPos + 1]
    const startB = colorLayer.data[startPos + 2]
    const startA = colorLayer.data[startPos + 3]

    let x: number, y: number, pixelPos: number, reachLeft: boolean, reachRight: boolean

    // exit if color is the same
    if (r === startR && g === startG && b === startB && a === startA) {
        return
    }

    floodFill()
    function floodFill() {
        const newPos = pixelStack.pop() as number[]
        x = newPos[0]
        y = newPos[1]

        //get current pixel position
        pixelPos = (y * bufferImage.width + x) * 4
        // Go up as long as the color matches and are inside the canvas
        while (y >= 0 && matchStartColor(pixelPos)) {
            y--
            pixelPos -= bufferImage.width * 4
        }
        //Don't overextend
        pixelPos += bufferImage.width * 4
        reachLeft = false
        reachRight = false
        y++
        // Go down as long as the color matches and in inside the canvas
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

    ctx.putImageData(colorLayer, 0, 0)

    function matchStartColor(pixelPos) {
        const r = colorLayer.data[pixelPos]
        const g = colorLayer.data[pixelPos + 1]
        const b = colorLayer.data[pixelPos + 2]
        const a = colorLayer.data[pixelPos + 3]
        return r === startR && g === startG && b === startB && a === startA
    }

    function colorPixel(pixelPos) {
        colorLayer.data[pixelPos] = r
        colorLayer.data[pixelPos + 1] = g
        colorLayer.data[pixelPos + 2] = b
        colorLayer.data[pixelPos + 3] = a
    }
}

export function actionDraw(pos: Konva.Vector2d, selected: Selected, ctx: CanvasRenderingContext2D) {
    const { toolSize } = selected
    const erase = selected.tool === TOOLS.ERASER
    ctx.fillStyle = getRgbaValue(selected.color)
    erase ? ctx.clearRect(pos.x, pos.y, toolSize, toolSize) : ctx.fillRect(pos.x, pos.y, toolSize, toolSize)
}

export function actionLine(
    startPos: Konva.Vector2d,
    endPos: Konva.Vector2d,
    selected: Selected,
    ctx: CanvasRenderingContext2D
) {
    const { toolSize } = selected
    const tri = {} as { x: number; y: number; long: number }
    const ang = getAngle(endPos.x - startPos.x, endPos.y - startPos.y)
    const erase = selected.tool === TOOLS.ERASER

    const drawPixel = (x: number, y: number, w: number, h: number): void =>
        erase ? ctx.clearRect(x, y, w, h) : ctx.fillRect(x, y, w, h)

    if (Math.abs(startPos.x - endPos.x) > Math.abs(startPos.y - endPos.y)) {
        tri.x = Math.sign(Math.cos(ang))
        tri.y = Math.tan(ang) * Math.sign(Math.cos(ang))
        tri.long = Math.abs(startPos.x - endPos.x)
    } else {
        tri.x = Math.tan(Math.PI / 2 - ang) * Math.sign(Math.cos(Math.PI / 2 - ang))
        tri.y = Math.sign(Math.cos(Math.PI / 2 - ang))
        tri.long = Math.abs(startPos.y - endPos.y)
    }

    ctx.fillStyle = getRgbaValue(selected.color)

    for (let i = 0; i < tri.long; i++) {
        const thispoint = {
            x: Math.round(startPos.x + tri.x * i),
            y: Math.round(startPos.y + tri.y * i)
        }
        drawPixel(thispoint.x, thispoint.y, toolSize, toolSize)
    }

    drawPixel(Math.round(endPos.x), Math.round(endPos.y), toolSize, toolSize)
}

export const renderText = (text: string, x: number, y: number, ctx: CanvasRenderingContext2D): void => {
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
