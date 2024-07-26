import { IMPORT_MODES } from '../../common/constants'
import { INITIAL_STATE } from './constants'

export type EditorState = typeof INITIAL_STATE
export type Pallete = typeof INITIAL_STATE.palette
export type Selected = typeof INITIAL_STATE.selected
export type Tileset = typeof INITIAL_STATE.tileset
export type Workspace = typeof INITIAL_STATE.workspace

export type Vec2 = {
    x: number
    y: number
}

export type Dim = {
    w: number
    h: number
}

export type Canvas = {
    width: number
    height: number
    background: number[] | null
}

export type Layer = {
    id: string
    name: string
    width: number
    height: number
    visible: boolean
    opacity: number
    offset: Vec2
    image?: string
    data?: number[]
}

export type Stamp = {
    width: number
    height: number
    data: (number | null)[] | null
    image: string
}

export type Grid = {
    color: number[]
    width: number
    height: number
    visible: boolean
    pitch?: number
}

export type DeflatedLayer = {
    id: string
    name: string
    width: number
    height: number
    visible: boolean
    opacity: number
    offset: Vec2
    image?: string
    data?: string
}

export type Rectangle = {
    x: number
    y: number
    width: number
    height: number
}

export type ProjectConfig = {
    w: number
    h: number
    name: string
    columns: number
    tilewidth: number
    tileheight: number
}

export type LayerImportConfig = {
    image?: CanvasImageSource
    imageUrl?: string
    mode: IMPORT_MODES
    name: string
    offset: Vec2
    tileSize: Dim
    columns: number
    colorsCount?: number
    reducedColors?: boolean
    resolution: Dim
}

export type ProjectFile = {
    name: string
    canvas: Canvas
    grid: Grid
    layers: DeflatedLayer[]
    palette: Pallete
    tileset: Tileset
    selected: Selected
}
