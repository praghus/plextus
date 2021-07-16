import Konva from 'konva'
import { Canvas, Workspace } from '../../store/editor/types'
import { getRgbaValue } from './colors'

const PADDING = 150

const getAngle = (x: number, y: number) => Math.atan(y / (x == 0 ? 0.01 : x)) + (x < 0 ? Math.PI : 0)

export const centerStage = (
    stage: Konva.Stage,
    canvas: Canvas,
    workspace: Workspace,
    cb: (x: number, y: number, scale: number) => void
): void => {
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

export function actionDraw(pos: Konva.Vector2d, selectedColor: number[], ctx: CanvasRenderingContext2D, erase = false) {
    ctx.fillStyle = getRgbaValue(selectedColor)
    erase ? ctx.clearRect(pos.x, pos.y, 1, 1) : ctx.fillRect(pos.x, pos.y, 1, 1)
}

export function actionLine(
    startPos: Konva.Vector2d,
    endPos: Konva.Vector2d,
    selectedColor: number[],
    ctx: CanvasRenderingContext2D,
    erase = false
) {
    const tri = {} as { x: number; y: number; long: number }
    const ang = getAngle(endPos.x - startPos.x, endPos.y - startPos.y)

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

    ctx.fillStyle = getRgbaValue(selectedColor)

    for (let i = 0; i < tri.long; i++) {
        const thispoint = {
            x: Math.round(startPos.x + tri.x * i),
            y: Math.round(startPos.y + tri.y * i)
        }
        drawPixel(thispoint.x, thispoint.y, 1, 1)
    }

    drawPixel(Math.round(endPos.x), Math.round(endPos.y), 1, 1)
}
