export function componentToHex(c: number): string {
    const hex = Math.round(c).toString(16)
    return hex.length === 1 ? `0${hex}` : hex
}

export const rgbToHex = (r: number, g: number, b: number): string =>
    `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`

export const rgbaToHex = (c: number[]): string =>
    `#${componentToHex(c[0])}${componentToHex(c[1])}${componentToHex(c[2])}${c[3] >= 0 ? componentToHex(c[3]) : ''}`

export const getRgbaValue = (c: number[]): string =>
    `rgba(${c[0]},${c[1]},${c[2]},${(c[3] && (c[3] / 255).toPrecision(1)) || 255})`

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

export const normalize = (n: number, min: number, max: number): number => {
    let normalized = n
    while (n < min) {
        normalized += max - min
    }
    while (n >= max) {
        normalized -= max - min
    }
    return normalized
}

export const brighten = (hex: string, percent: number): string => {
    const a = Math.round((255 * percent) / 100)
    const r = normalize(a + parseInt(hex.substr(1, 2), 16), 0, 256)
    const g = normalize(a + parseInt(hex.substr(3, 2), 16), 0, 256)
    const b = normalize(a + parseInt(hex.substr(5, 2), 16), 0, 256)
    return `#${(0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1)}`
}

export const darken = (hex: string, percent: number): string => {
    return brighten(hex, -percent)
}
