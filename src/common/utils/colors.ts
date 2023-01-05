import { createCanvasElement } from './image'

export const rgbToHex = (r: number, g: number, b: number): string =>
    `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`

export const rgbaToHex = (c: number[]): string =>
    `#${componentToHex(c[0])}${componentToHex(c[1])}${componentToHex(c[2])}${c[3] >= 0 ? componentToHex(c[3]) : ''}`

export const getRgbaValue = (c: number[] | Uint8ClampedArray): string =>
    `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${!isNaN(c[3]) ? (c[3] / 255).toPrecision(1) : 1})`

export function componentToHex(c: number): string {
    const hex = Math.round(c).toString(16)
    return hex.length === 1 ? `0${hex}` : hex
}

export function colorToRGBA(colorStr: string): number[] {
    const [canvasElement, ctx] = createCanvasElement()
    canvasElement.height = 1
    canvasElement.width = 1
    ctx.fillStyle = colorStr
    ctx.fillRect(0, 0, 1, 1)
    const c = ctx.getImageData(0, 0, 1, 1).data
    return [c[0], c[1], c[2], c[3]]
}

export function hexToRgb(hex: string): number[] {
    const value = hex.substring(1, hex.length)
    const r = parseInt(value.substring(0, 2), 16)
    const g = parseInt(value.substring(2, 4), 16)
    const b = parseInt(value.substring(4, 6), 16)
    return [r, g, b]
}

export function hexToRgba(hex: string, a = 255): number[] {
    const [r, g, b] = hexToRgb(hex)
    return [r, g, b, a]
}

export function adjustBrightness(color: number[], amount: number) {
    let [r, g, b] = color

    r = r + amount
    g = g + amount
    b = b + amount

    if (r > 255) r = 255
    else if (r < 0) r = 0

    if (g > 255) g = 255
    else if (g < 0) g = 0

    if (b > 255) b = 255
    else if (b < 0) b = 0

    return [r, g, b]
}

export function brightenDarken(imageData: ImageData, amount: number): ImageData {
    for (let i = 0; i < imageData.data.length; i += 4) {
        const c = adjustBrightness([imageData.data[i], imageData.data[i + 1], imageData.data[i + 2]], amount)
        imageData.data[i] = c[0]
        imageData.data[i + 1] = c[1]
        imageData.data[i + 2] = c[2]
    }
    return imageData
}
