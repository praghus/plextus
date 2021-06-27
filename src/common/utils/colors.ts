export function componentToHex(c: number): string {
    const hex = c.toString(16)
    return hex.length === 1 ? `0${hex}` : hex
}

export const rgbToHex = (r: number, g: number, b: number): string =>
    `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`

export const getRgbaValue = (c: number[]): string => `rgba(${c[0]},${c[1]},${c[2]},${(c[3] / 255).toPrecision(1)})`

export const hexToRgb = (hex: string): number[] => {
    const value = hex.substring(1, hex.length)
    const r = parseInt(value.substring(0, 2), 16)
    const g = parseInt(value.substring(2, 4), 16)
    const b = parseInt(value.substring(4, 6), 16)

    return [r, g, b]
}

export const hexToRgba = (hex: string, a = 255): number[] => {
    const [r, g, b] = hexToRgb(hex)
    return [r, g, b, a]
}
