export const IS_PRODUCTION = process.env.NODE_ENV === 'production'

export const FOOTER_HEIGHT = 30
export const LEFT_BAR_WIDTH = 60
export const RIGHT_BAR_WIDTH = 340
export const STATUS_BAR_HEIGHT = 30

export const SCALE_BY = 1.2
export const SCALE_MIN = 0.25
export const SCALE_MAX = 30.0
export const SCALE_STEP = 0.5

export const IMPORT_PREVIEW_WIDTH = 550
export const IMPORT_PREVIEW_HEIGHT = 300

export enum IMPORT_MODES {
    NEW_PROJECT = 'NEW_PROJECT',
    NEW_LAYER = 'NEW_LAYER'
}

export enum TOOLS {
    CROP = 'CROP',
    DRAG = 'DRAG',
    DELETE = 'DELETE',
    ERASER = 'ERASER',
    FILL = 'FILL',
    LINE = 'LINE',
    PENCIL = 'PENCIL',
    PICKER = 'PICKER',
    STAMP = 'STAMP',
    ZOOM = 'ZOOM'
}

export const PALETTES = {
    DAWNBRINGER_16_PALETTE: {
        name: 'Dawnbringer 16',
        colors: [
            [20, 12, 28],
            [68, 36, 52],
            [48, 52, 109],
            [78, 74, 78],
            [133, 76, 48],
            [52, 101, 36],
            [208, 70, 72],
            [117, 113, 97],
            [89, 125, 206],
            [210, 125, 44],
            [133, 149, 161],
            [109, 170, 44],
            [210, 170, 153],
            [109, 194, 202],
            [218, 212, 94],
            [222, 238, 214]
        ]
    },
    DAWNBRINGER_32_PALETTE: {
        name: 'Dawnbringer 32',
        colors: [
            [0, 0, 0],
            [34, 32, 52],
            [69, 40, 60],
            [102, 57, 49],
            [143, 86, 59],
            [223, 113, 38],
            [217, 160, 102],
            [238, 195, 154],
            [251, 242, 54],
            [153, 229, 80],
            [106, 190, 48],
            [55, 148, 110],
            [75, 105, 47],
            [82, 75, 36],
            [50, 60, 57],
            [63, 63, 116],
            [48, 96, 130],
            [91, 110, 225],
            [99, 155, 255],
            [95, 205, 228],
            [203, 219, 252],
            [255, 255, 255],
            [155, 173, 183],
            [132, 126, 135],
            [105, 106, 106],
            [89, 86, 82],
            [118, 66, 138],
            [172, 50, 50],
            [217, 87, 99],
            [215, 123, 186],
            [143, 151, 74],
            [138, 111, 48]
        ]
    },
    PICO_8: {
        name: 'Pico 8',
        colors: [
            [0, 0, 0],
            [29, 43, 83],
            [126, 37, 83],
            [0, 135, 81],
            [171, 82, 54],
            [95, 87, 79],
            [194, 195, 199],
            [255, 241, 232],
            [255, 0, 77],
            [255, 163, 0],
            [255, 236, 39],
            [0, 228, 54],
            [41, 173, 255],
            [131, 118, 156],
            [255, 119, 168],
            [255, 204, 170]
        ]
    },
    UFO_50: {
        name: 'UFO 50',
        colors: [
            [255, 255, 255],
            [164, 128, 128],
            [254, 184, 84],
            [232, 234, 74],
            [88, 245, 177],
            [100, 164, 164],
            [204, 104, 228],
            [254, 98, 110],
            [200, 200, 200],
            [224, 60, 50],
            [254, 112, 0],
            [99, 179, 29],
            [164, 240, 34],
            [39, 186, 219],
            [254, 72, 222],
            [209, 15, 76],
            [112, 112, 112],
            [153, 21, 21],
            [202, 74, 0],
            [163, 163, 36],
            [0, 132, 86],
            [0, 106, 180],
            [150, 0, 220],
            [134, 22, 80],
            [0, 0, 0],
            [76, 0, 0],
            [120, 52, 80],
            [138, 96, 66],
            [0, 61, 16],
            [32, 32, 64],
            [52, 0, 88],
            [68, 48, 186]
        ]
    }
}

export const DEFAULT_TILESET_IMAGE = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKAAAAAQCAYAAACRBXRYAAAABmJLR0QA/wD/
  AP+gvaeTAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAIUlEQVRo3u3BAQ0AAADCoPdPbQ43oAAAAAAAAAAAAIB3AygQAAHhiTg6AAAAAElFTkSuQmCC`

export const TRANSPARENCY_BG_LIGHT_IMG = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAIAAAACUFjqAAAAI0lEQVQY
  02OsrKxgQAKfP39B5jIx4AU0lWZBcwsvL89gcRoAzrIHWtn3HTMAAAAASUVORK5CYII=`

export const TRANSPARENCY_BG_MID_IMG = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAIAAAACUFjqAAAAI0lEQVQY02
  OMiYlmQAIfPnxE5jIx4AU0lWZBc4uAAP9gcRoAWzIG+m7Xy5gAAAAASUVORK5CYII=`

export const TRANSPARENCY_BG_DARK_IMG = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAIAAAACUFjqAAAAI0lEQVQY0
  2O0tbVhQAJv375D5jIx4AU0lWZBc4uwsNBgcRoA4GsGlHsFWXAAAAAASUVORK5CYII=`

export const FONT_SPRITE_SHEET = `data:image/png;base64,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
  AElFTkSuQmCC`

export const BG_IMAGE = new window.Image()
export const BG_IMAGE_DARK = new window.Image()
export const FONT_SPRITE = new window.Image()

BG_IMAGE.src = TRANSPARENCY_BG_MID_IMG
BG_IMAGE_DARK.src = TRANSPARENCY_BG_DARK_IMG
FONT_SPRITE.src = FONT_SPRITE_SHEET
