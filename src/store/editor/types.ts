import { INITIAL_STATE } from './constants'

export type EditorState = typeof INITIAL_STATE
export type Grid = typeof INITIAL_STATE.grid
export type Pallete = typeof INITIAL_STATE.palette
export type Selected = typeof INITIAL_STATE.selected
export type Tileset = typeof INITIAL_STATE.tileset
export type Workspace = typeof INITIAL_STATE.workspace

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
    data: number[]
}

export type DeflatedLayer = {
    id: string
    name: string
    width: number
    height: number
    visible: boolean
    opacity: number
    data: string
}
