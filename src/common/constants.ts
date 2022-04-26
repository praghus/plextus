export const IS_PRODUCTION = process.env.NODE_ENV === 'production'

export const LEFT_BAR_WIDTH = 60
export const RIGHT_BAR_WIDTH = 340
export const STATUS_BAR_HEIGHT = 40

export const SCALE_BY = 1.2
export const SCALE_MIN = 0.25
export const SCALE_MAX = 30.0
export const SCALE_STEP = 0.5

export const IMPORT_PREVIEW_WIDTH = 550
export const IMPORT_PREVIEW_HEIGHT = 300

export const TILESET_FILENAME = 'tileset.png'

export enum THEMES {
    DARK = 'dark',
    LIGHT = 'light'
}

export enum IMPORT_MODES {
    NEW_PROJECT = 'NEW_PROJECT',
    NEW_LAYER = 'NEW_LAYER',
    NEW_IMAGE = 'NEW_IMAGE'
}

export enum TOOLS {
    BRIGHTNESS = 'BRIGHTNESS',
    CROP = 'CROP',
    DRAG = 'DRAG',
    DELETE = 'DELETE',
    ERASER = 'ERASER',
    FILL = 'FILL',
    LINE = 'LINE',
    OFFSET = 'OFFSET',
    PENCIL = 'PENCIL',
    PICKER = 'PICKER',
    REPLACE = 'REPLACE',
    SELECT = 'SELECT',
    STAMP = 'STAMP'
}

export const TOOLS_DESC = {
    [TOOLS.BRIGHTNESS]: 'Lighten Tool [Click], Darken Toll [Alt+Click]',
    [TOOLS.CROP]: 'Layer Crop Tool',
    [TOOLS.DRAG]: 'View Tool',
    [TOOLS.DELETE]: 'Tile Remove Tool',
    [TOOLS.ERASER]: 'Eraser Tool',
    [TOOLS.FILL]: 'Bucket Fill Tool',
    [TOOLS.LINE]: 'Pixel Line Tool',
    [TOOLS.OFFSET]: 'Layer Offset Tool',
    [TOOLS.PENCIL]: 'Pixel Tool',
    [TOOLS.PICKER]: 'Color Picker',
    [TOOLS.REPLACE]: 'Tile Replace Tool',
    [TOOLS.SELECT]: 'Select Tool',
    [TOOLS.STAMP]: 'Tile Stamp Tool [Click], Tile Clone Tool [Alt+Click]'
}

export const DEFAULT_TILESET_IMAGE = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKAAAAAQCAYAAACRBXRYAAAABmJLR0QA/wD/
  AP+gvaeTAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAIUlEQVRo3u3BAQ0AAADCoPdPbQ43oAAAAAAAAAAAAIB3AygQAAHhiTg6AAAAAElFTkSuQmCC`

export const TRANSPARENCY_BG_LIGHT_IMG = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAIAAAACUFjqAAAAI0lEQVQY
  02P8//8/AxJ4+PAhMpeJAS+gqTQLmlvk5eUHi9MAcYAIts0d55YAAAAASUVORK5CYII=`

export const TRANSPARENCY_BG_DARK_IMG = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAIAAAACUFjqAAAAI0lEQVQY02
  OMiYlmQAIfPnxE5jIx4AU0lWZBc4uAAP9gcRoAWzIG+m7Xy5gAAAAASUVORK5CYII=`

// Palettes
export * as PALETTES from './palettes'
