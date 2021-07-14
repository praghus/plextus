import { AnyAction } from 'redux'
import { EditorState } from './types'
import {
    INITIAL_STATE,
    EDITOR_CHANGE_CANVAS_SIZE,
    EDITOR_CHANGE_GRID_COLOR,
    EDITOR_CHANGE_GRID_SIZE,
    EDITOR_CHANGE_LAYER_DATA,
    EDITOR_CHANGE_LAYER_NAME,
    EDITOR_CHANGE_LAYER_OPACITY,
    EDITOR_CHANGE_LAYER_VISIBLE,
    EDITOR_REMOVE_LAYER,
    EDITOR_CHANGE_LAYERS,
    EDITOR_CHANGE_PALETTE,
    EDITOR_CHANGE_POSITION,
    EDITOR_CHANGE_PRIMARY_COLOR,
    EDITOR_CHANGE_SELECTED_LAYER,
    EDITOR_CHANGE_SELECTED_TILE,
    EDITOR_CHANGE_SCALE,
    EDITOR_CHANGE_TILESET,
    EDITOR_CHANGE_TOOL,
    EDITOR_CHANGE_WORKSPACE_SIZE,
    EDITOR_RESET_TO_DEFAULTS,
    EDITOR_SET_TILESET_IMAGE_SUCCESS,
    EDITOR_TOGGLE_SHOW_GRID,
    EDITOR_HISTORY_ACTION
} from './constants'

function editorReducer(state = INITIAL_STATE, action: AnyAction): EditorState {
    switch (action.type) {
        case EDITOR_CHANGE_CANVAS_SIZE:
            return {
                ...state,
                canvas: {
                    ...state.canvas,
                    width: action.payload.width,
                    height: action.payload.height
                }
            }
        case EDITOR_CHANGE_GRID_COLOR:
            return { ...state, grid: { ...state.grid, color: action.payload.color } }
        case EDITOR_CHANGE_GRID_SIZE:
            return {
                ...state,
                grid: {
                    ...state.grid,
                    width: action.payload.width,
                    height: action.payload.height
                }
            }
        case EDITOR_CHANGE_SELECTED_LAYER:
            return {
                ...state,
                selected: { ...state.selected, layerId: action.payload.layerId }
            }
        case EDITOR_CHANGE_SELECTED_TILE:
            return {
                ...state,
                selected: { ...state.selected, tileId: action.payload.tileId }
            }
        case EDITOR_CHANGE_PALETTE:
            return { ...state, palette: action.payload.palette }
        case EDITOR_CHANGE_POSITION:
            return {
                ...state,
                workspace: {
                    ...state.workspace,
                    x: action.payload.x,
                    y: action.payload.y
                }
            }
        case EDITOR_CHANGE_PRIMARY_COLOR:
            return {
                ...state,
                selected: { ...state.selected, color: action.payload.color }
            }
        case EDITOR_CHANGE_SCALE:
            return {
                ...state,
                workspace: { ...state.workspace, scale: action.payload.scale }
            }
        case EDITOR_CHANGE_TOOL:
            return {
                ...state,
                selected: { ...state.selected, tool: action.payload.tool }
            }
        case EDITOR_CHANGE_WORKSPACE_SIZE:
            return {
                ...state,
                workspace: {
                    ...state.workspace,
                    width: action.payload.width,
                    height: action.payload.height
                }
            }
        case EDITOR_TOGGLE_SHOW_GRID:
            return {
                ...state,
                grid: { ...state.grid, visible: action.payload.visible }
            }
        case EDITOR_CHANGE_TILESET:
            return { ...state, tileset: action.payload.tileset }
        case EDITOR_SET_TILESET_IMAGE_SUCCESS:
            return {
                ...state,
                tileset: {
                    ...state.tileset,
                    image: action.payload.image,
                    lastUpdateTime: action.payload.lastUpdateTime
                }
            }
        case EDITOR_CHANGE_LAYERS:
            return { ...state, layers: action.payload.layers }
        case EDITOR_CHANGE_LAYER_DATA:
            return {
                ...state,
                layers: state.layers.map(l =>
                    l.id === action.payload.layerId ? { ...l, data: action.payload.data } : l
                )
            }
        case EDITOR_CHANGE_LAYER_NAME:
            return {
                ...state,
                layers: state.layers.map(l =>
                    l.id === action.payload.layerId ? { ...l, name: action.payload.name } : l
                )
            }
        case EDITOR_CHANGE_LAYER_OPACITY:
            return {
                ...state,
                layers: state.layers.map(l =>
                    l.id === action.payload.layerId ? { ...l, opacity: action.payload.opacity } : l
                )
            }
        case EDITOR_CHANGE_LAYER_VISIBLE:
            return {
                ...state,
                layers: state.layers.map(l =>
                    l.id === action.payload.layerId ? { ...l, visible: action.payload.visible } : l
                )
            }
        case EDITOR_REMOVE_LAYER:
            return {
                ...state,
                layers: state.layers.filter(({ id }) => id !== action.payload.layerId)
            }
        case EDITOR_HISTORY_ACTION:
            return {
                ...state,
                layers: action.payload.layers,
                tileset: action.payload.tileset
            }
        case EDITOR_RESET_TO_DEFAULTS:
            return {
                ...state,
                canvas: null,
                layers: [],
                selected: INITIAL_STATE.selected,
                tileset: INITIAL_STATE.tileset
            }
        default:
            return state
    }
}

export default editorReducer
