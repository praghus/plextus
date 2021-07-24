import { StringTMap } from 'common/types'
import { AnyAction } from 'redux'
import { Canvas, DeflatedLayer, Layer, Pallete, Rectangle, Tileset } from './types'
import { FOOTER_HEIGHT, RIGHT_BAR_WIDTH, STATUS_BAR_HEIGHT } from '../../common/constants'
import {
    EDITOR_CHANGE_CANVAS,
    EDITOR_CHANGE_CANVAS_BACKGROUND,
    EDITOR_CHANGE_GRID_COLOR,
    EDITOR_CHANGE_GRID_PITCH,
    EDITOR_CHANGE_GRID_SIZE,
    EDITOR_CHANGE_LAYER_DATA,
    EDITOR_CHANGE_LAYER_IMAGE,
    EDITOR_CHANGE_LAYER_NAME,
    EDITOR_CHANGE_LAYER_OPACITY,
    EDITOR_CHANGE_LAYER_OFFSET,
    EDITOR_CHANGE_LAYER_VISIBLE,
    EDITOR_CHANGE_LAYERS,
    EDITOR_CHANGE_LAYERS_SUCCESS,
    EDITOR_CHANGE_PALETTE,
    EDITOR_CHANGE_POSITION,
    EDITOR_CHANGE_PRIMARY_COLOR,
    EDITOR_CHANGE_SCALE,
    EDITOR_CHANGE_SELECTED_AREA,
    EDITOR_CHANGE_SELECTED_LAYER,
    EDITOR_CHANGE_SELECTED_TILE,
    EDITOR_CHANGE_TILESET,
    EDITOR_CHANGE_TOOL,
    EDITOR_CHANGE_TOOL_SIZE,
    EDITOR_CHANGE_WORKSPACE_SIZE,
    EDITOR_CLEAR_PROJECT,
    EDITOR_CROP,
    EDITOR_CROP_SUCCESS,
    EDITOR_HISTORY_ACTION,
    EDITOR_REMOVE_LAYER,
    EDITOR_REMOVE_TILE,
    EDITOR_REMOVE_TILE_SUCCESS,
    EDITOR_RESET_TO_DEFAULTS,
    EDITOR_SAVE_CHANGES,
    EDITOR_SET_TILESET_IMAGE_SUCCESS,
    EDITOR_SET_TILESET_IMAGE,
    EDITOR_TOGGLE_SHOW_GRID
} from './constants'

export const adjustWorkspaceSize = (): AnyAction =>
    changeWorkspaceSize(window.innerWidth - RIGHT_BAR_WIDTH, window.innerHeight - STATUS_BAR_HEIGHT - FOOTER_HEIGHT)

export const clearProject = () =>
    ({
        type: EDITOR_CLEAR_PROJECT
    } as const)

export const resetToDefaults = () =>
    ({
        type: EDITOR_RESET_TO_DEFAULTS
    } as const)

export const changeCanvasBackground = (background: number[] | null) =>
    ({
        type: EDITOR_CHANGE_CANVAS_BACKGROUND,
        payload: { background }
    } as const)

export const changeCanvasSize = (width: number | null, height: number | null) =>
    ({
        type: EDITOR_CHANGE_CANVAS,
        payload: { width, height }
    } as const)

export const changeGridColor = (color: number[]) =>
    ({
        type: EDITOR_CHANGE_GRID_COLOR,
        payload: { color }
    } as const)

export const changeGridPitch = pitch =>
    ({
        type: EDITOR_CHANGE_GRID_PITCH,
        payload: { pitch }
    } as const)

export const changeGridSize = (width: number, height: number) =>
    ({
        type: EDITOR_CHANGE_GRID_SIZE,
        payload: { width, height }
    } as const)

export const changeSelectedLayer = (layerId: string) =>
    ({
        type: EDITOR_CHANGE_SELECTED_LAYER,
        payload: { layerId }
    } as const)

export const changePalette = (palette: Pallete) =>
    ({
        type: EDITOR_CHANGE_PALETTE,
        payload: { palette }
    } as const)

export const changePosition = (x: number, y: number) =>
    ({
        type: EDITOR_CHANGE_POSITION,
        payload: { x, y }
    } as const)

export const changePrimaryColor = (color: number[]) =>
    ({
        type: EDITOR_CHANGE_PRIMARY_COLOR,
        payload: { color }
    } as const)

export const changeScale = (scale: number) =>
    ({
        type: EDITOR_CHANGE_SCALE,
        payload: { scale }
    } as const)

export const changeTool = (tool: string) =>
    ({
        type: EDITOR_CHANGE_TOOL,
        payload: { tool }
    } as const)

export const changeToolSize = (toolSize: number) =>
    ({
        type: EDITOR_CHANGE_TOOL_SIZE,
        payload: { toolSize }
    } as const)

export const changeSelectedArea = (area: Rectangle | null) =>
    ({
        type: EDITOR_CHANGE_SELECTED_AREA,
        payload: { area }
    } as const)

export const changeSelectedTile = (tileId: number) =>
    ({
        type: EDITOR_CHANGE_SELECTED_TILE,
        payload: { tileId }
    } as const)

export const changeWorkspaceSize = (width: number, height: number) =>
    ({
        type: EDITOR_CHANGE_WORKSPACE_SIZE,
        payload: { width, height }
    } as const)

export const changeTileset = (tileset: Tileset) =>
    ({
        type: EDITOR_CHANGE_TILESET,
        payload: { tileset }
    } as const)

export const changeTilesetImage = (blob: Blob) =>
    ({
        type: EDITOR_SET_TILESET_IMAGE,
        payload: { blob }
    } as const)

export const changeTilesetImageSuccess = (image: ImageData) =>
    ({
        type: EDITOR_SET_TILESET_IMAGE_SUCCESS,
        payload: { image }
    } as const)

export const changeLayers = (layers: Layer[] | null[]) =>
    ({
        type: EDITOR_CHANGE_LAYERS,
        payload: { layers }
    } as const)

export const changeLayerData = (layerId: string, data: (number | null)[]) =>
    ({
        type: EDITOR_CHANGE_LAYER_DATA,
        payload: { layerId, data }
    } as const)

export const changeLayerImage = (layerId: string, blob: Blob) =>
    ({
        type: EDITOR_CHANGE_LAYER_IMAGE,
        payload: { layerId, blob }
    } as const)

export const changeLayerOffset = (layerId: string, x: number, y: number) =>
    ({
        type: EDITOR_CHANGE_LAYER_OFFSET,
        payload: { layerId, offset: { x, y } }
    } as const)

export const changeLayersSuccess = (layers: DeflatedLayer[] | null[]) =>
    ({
        type: EDITOR_CHANGE_LAYERS_SUCCESS,
        payload: { layers }
    } as const)

export const changeLayerName = (layerId: string, name: string) =>
    ({
        type: EDITOR_CHANGE_LAYER_NAME,
        payload: { layerId, name }
    } as const)

export const changeLayerOpacity = (layerId: string, opacity: number) =>
    ({
        type: EDITOR_CHANGE_LAYER_OPACITY,
        payload: { layerId, opacity }
    } as const)

export const changeLayerVisible = (layerId: string, visible: boolean) =>
    ({
        type: EDITOR_CHANGE_LAYER_VISIBLE,
        payload: { layerId, visible }
    } as const)

export const crop = () =>
    ({
        type: EDITOR_CROP
    } as const)

export const cropSuccess = (layers: DeflatedLayer[], canvas: Canvas) =>
    ({
        type: EDITOR_CROP_SUCCESS,
        payload: { layers, canvas }
    } as const)

export const historyAction = <T>(payload: StringTMap<T>) =>
    ({
        type: EDITOR_HISTORY_ACTION,
        payload
    } as const)

export const removeLayer = (layerId: string) =>
    ({
        type: EDITOR_REMOVE_LAYER,
        payload: { layerId }
    } as const)

export const removeTile = (tileId: number, tileset: Tileset) =>
    ({
        type: EDITOR_REMOVE_TILE,
        payload: { tileId, tileset }
    } as const)

export const removeTileSuccess = (layers: DeflatedLayer[], tileset: Tileset) =>
    ({
        type: EDITOR_REMOVE_TILE_SUCCESS,
        payload: { layers, tileset }
    } as const)

export const saveChanges = () =>
    ({
        type: EDITOR_SAVE_CHANGES
    } as const)

export const toggleShowGrid = (visible: boolean) =>
    ({
        type: EDITOR_TOGGLE_SHOW_GRID,
        payload: { visible }
    } as const)
