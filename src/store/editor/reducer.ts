import { AnyAction } from 'redux'
import { Canvas, EditorState } from './types'
import {
    INITIAL_STATE,
    EDITOR_CHANGE_CANVAS,
    EDITOR_CHANGE_CANVAS_BACKGROUND,
    EDITOR_CHANGE_GRID_COLOR,
    EDITOR_CHANGE_GRID_PITCH,
    EDITOR_CHANGE_GRID_SIZE,
    EDITOR_CHANGE_LAYERS_SUCCESS,
    EDITOR_CHANGE_PALETTE,
    EDITOR_CHANGE_POSITION,
    EDITOR_CHANGE_PRIMARY_COLOR,
    EDITOR_CHANGE_PROJECT_NAME,
    EDITOR_CHANGE_SELECTED_AREA,
    EDITOR_CHANGE_SELECTED_LAYER,
    EDITOR_CHANGE_SELECTED_TILE,
    EDITOR_CHANGE_SCALE,
    EDITOR_CHANGE_TILESET,
    EDITOR_CHANGE_TOOL,
    EDITOR_CHANGE_TOOL_SIZE,
    EDITOR_CHANGE_WORKSPACE_SIZE,
    EDITOR_CROP_SUCCESS,
    EDITOR_HISTORY_ACTION,
    EDITOR_LOAD_STATE_FROM_FILE,
    EDITOR_REMOVE_TILE_SUCCESS,
    EDITOR_RESET_TO_DEFAULTS,
    EDITOR_SET_TILESET_IMAGE_SUCCESS,
    EDITOR_TOGGLE_SHOW_GRID,
    EDITOR_CHANGE_SELECTED_PALETTE
} from './constants'

function editorReducer(state = INITIAL_STATE, action: AnyAction): EditorState {
    switch (action.type) {
        case EDITOR_LOAD_STATE_FROM_FILE:
            return {
                ...action.payload.data
            }
        case EDITOR_CHANGE_CANVAS:
            return {
                ...state,
                canvas: {
                    background: action.payload.background,
                    height: action.payload.height,
                    width: action.payload.width
                }
            }
        case EDITOR_CHANGE_CANVAS_BACKGROUND:
            return {
                ...state,
                canvas: {
                    ...(state.canvas as Canvas),
                    background: action.payload.background
                }
            }
        case EDITOR_CHANGE_GRID_COLOR:
            return { ...state, grid: { ...state.grid, color: action.payload.color } }
        case EDITOR_CHANGE_GRID_PITCH:
            return { ...state, grid: { ...state.grid, pitch: action.payload.pitch } }
        case EDITOR_CHANGE_GRID_SIZE:
            return {
                ...state,
                grid: {
                    ...state.grid,
                    height: action.payload.height,
                    width: action.payload.width
                }
            }
        case EDITOR_CHANGE_LAYERS_SUCCESS:
            return { ...state, layers: action.payload.layers }
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
        case EDITOR_CHANGE_PROJECT_NAME:
            return {
                ...state,
                name: action.payload.name
            }
        case EDITOR_CHANGE_SELECTED_AREA:
            return {
                ...state,
                selected: { ...state.selected, area: action.payload.area }
            }
        case EDITOR_CHANGE_SELECTED_LAYER:
            return {
                ...state,
                selected: { ...state.selected, layerId: action.payload.layerId }
            }
        case EDITOR_CHANGE_SELECTED_PALETTE:
            return {
                ...state,
                selected: { ...state.selected, palette: action.payload.name }
            }
        case EDITOR_CHANGE_SELECTED_TILE:
            return {
                ...state,
                selected: { ...state.selected, tileId: action.payload.tileId }
            }
        case EDITOR_CHANGE_SCALE:
            return {
                ...state,
                workspace: { ...state.workspace, scale: action.payload.scale }
            }
        case EDITOR_CHANGE_TILESET:
            return {
                ...state,
                tileset: {
                    ...state.tileset,
                    ...action.payload.tileset
                }
            }
        case EDITOR_CHANGE_TOOL:
            return {
                ...state,
                selected: { ...state.selected, tool: action.payload.tool }
            }
        case EDITOR_CHANGE_TOOL_SIZE:
            return {
                ...state,
                selected: { ...state.selected, toolSize: action.payload.toolSize }
            }
        case EDITOR_CHANGE_WORKSPACE_SIZE:
            return {
                ...state,
                workspace: {
                    ...state.workspace,
                    height: action.payload.height,
                    width: action.payload.width
                }
            }
        case EDITOR_CROP_SUCCESS:
            return {
                ...state,
                canvas: action.payload.canvas,
                layers: action.payload.layers
            }
        case EDITOR_TOGGLE_SHOW_GRID:
            return {
                ...state,
                grid: { ...state.grid, visible: action.payload.visible }
            }
        case EDITOR_HISTORY_ACTION:
            return {
                ...state,
                canvas: action.payload.canvas || state.canvas,
                layers: action.payload.layers || state.layers,
                tileset: action.payload.tileset || state.tileset
            }
        case EDITOR_REMOVE_TILE_SUCCESS:
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
        case EDITOR_SET_TILESET_IMAGE_SUCCESS:
            return {
                ...state,
                tileset: {
                    ...state.tileset,
                    image: action.payload.image
                }
            }
        default:
            return state
    }
}

export default editorReducer
