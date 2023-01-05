import { AnyAction } from '@reduxjs/toolkit'
import {
    Canvas,
    DeflatedLayer,
    Layer,
    Pallete,
    Rectangle,
    Tileset,
    ProjectConfig,
    LayerImportConfig,
    ProjectFile,
    Stamp
} from './types'
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
    EDITOR_CHANGE_PROJECT_NAME,
    EDITOR_CHANGE_SCALE,
    EDITOR_CHANGE_SELECTED_AREA,
    EDITOR_CHANGE_SELECTED_LAYER,
    EDITOR_CHANGE_SELECTED_PALETTE,
    EDITOR_CHANGE_SELECTED_TILE,
    EDITOR_CHANGE_TILESET,
    EDITOR_CHANGE_TOOL,
    EDITOR_CHANGE_TOOL_SIZE,
    EDITOR_CHANGE_WORKSPACE_SIZE,
    EDITOR_CLEAR_PROJECT,
    EDITOR_CROP,
    EDITOR_CROP_SUCCESS,
    EDITOR_HISTORY_ACTION,
    EDITOR_OPEN_PROJECT_FILE,
    EDITOR_REMOVE_LAYER,
    EDITOR_REMOVE_TILE,
    EDITOR_REMOVE_TILE_SUCCESS,
    EDITOR_RESET_TO_DEFAULTS,
    EDITOR_SAVE_CHANGES,
    EDITOR_SAVE_CHANGES_TO_FILE,
    EDITOR_COPY_SELECTED_AREA,
    EDITOR_SET_TILESET_IMAGE_SUCCESS,
    EDITOR_SET_TILESET_IMAGE,
    EDITOR_TOGGLE_SHOW_GRID,
    EDITOR_CREATE_NEW_PROJECT,
    EDITOR_CREATE_IMAGE_LAYER_FROM_FILE,
    EDITOR_CREATE_TILE_LAYER_FROM_FILE,
    EDITOR_LOAD_STATE_FROM_FILE,
    EDITOR_CHANGE_SELECTED_STAMP,
    EDITOR_PASTE
} from './constants'

export const adjustWorkspaceSize = (): AnyAction => changeWorkspaceSize(window.innerWidth, window.innerHeight)

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
        payload: { background },
        type: EDITOR_CHANGE_CANVAS_BACKGROUND
    } as const)

export const changeCanvasSize = (width: number | null, height: number | null) =>
    ({
        payload: { height, width },
        type: EDITOR_CHANGE_CANVAS
    } as const)

export const changeGridColor = (color: null | number[]) =>
    ({
        payload: { color },
        type: EDITOR_CHANGE_GRID_COLOR
    } as const)

export const changeGridPitch = (pitch: number) =>
    ({
        payload: { pitch },
        type: EDITOR_CHANGE_GRID_PITCH
    } as const)

export const changeGridSize = (width: number, height: number) =>
    ({
        payload: { height, width },
        type: EDITOR_CHANGE_GRID_SIZE
    } as const)

export const changeSelectedLayer = (layerId: string) =>
    ({
        payload: { layerId },
        type: EDITOR_CHANGE_SELECTED_LAYER
    } as const)

export const changePalette = (palette: Pallete) =>
    ({
        payload: { palette },
        type: EDITOR_CHANGE_PALETTE
    } as const)

export const changeSelectedPalette = (name: string) =>
    ({
        payload: { name },
        type: EDITOR_CHANGE_SELECTED_PALETTE
    } as const)

export const changePosition = (x: number, y: number) =>
    ({
        payload: { x, y },
        type: EDITOR_CHANGE_POSITION
    } as const)

export const changePrimaryColor = (color: number[]) =>
    ({
        payload: { color },
        type: EDITOR_CHANGE_PRIMARY_COLOR
    } as const)

export const changeProjectName = (name: string) =>
    ({
        payload: { name },
        type: EDITOR_CHANGE_PROJECT_NAME
    } as const)

export const changeScale = (scale: number) =>
    ({
        payload: { scale },
        type: EDITOR_CHANGE_SCALE
    } as const)

export const changeTool = (tool: string) =>
    ({
        payload: { tool },
        type: EDITOR_CHANGE_TOOL
    } as const)

export const changeToolSize = (toolSize: number) =>
    ({
        payload: { toolSize },
        type: EDITOR_CHANGE_TOOL_SIZE
    } as const)

export const changeSelectedArea = (area: Rectangle | null) =>
    ({
        payload: { area },
        type: EDITOR_CHANGE_SELECTED_AREA
    } as const)

export const changeSelectedTile = (tileId: number | null) =>
    ({
        payload: { tileId },
        type: EDITOR_CHANGE_SELECTED_TILE
    } as const)

export const changeSelectedStamp = (stamp: Stamp) =>
    ({
        payload: { stamp },
        type: EDITOR_CHANGE_SELECTED_STAMP
    } as const)

export const changeWorkspaceSize = (width: number, height: number) =>
    ({
        payload: { height, width },
        type: EDITOR_CHANGE_WORKSPACE_SIZE
    } as const)

export const changeTileset = (tileset: Tileset) =>
    ({
        payload: { tileset },
        type: EDITOR_CHANGE_TILESET
    } as const)

export const changeTilesetImage = (blob: Blob) =>
    ({
        payload: { blob },
        type: EDITOR_SET_TILESET_IMAGE
    } as const)

export const changeTilesetImageSuccess = (image: string) =>
    ({
        payload: { image },
        type: EDITOR_SET_TILESET_IMAGE_SUCCESS
    } as const)

export const changeLayers = (layers: (Layer | null)[]) =>
    ({
        payload: { layers },
        type: EDITOR_CHANGE_LAYERS
    } as const)

export const changeLayerData = (layerId: string, data: (number | null)[]) =>
    ({
        payload: { data, layerId },
        type: EDITOR_CHANGE_LAYER_DATA
    } as const)

export const changeLayerImage = (layerId: string, blob: Blob) =>
    ({
        payload: { blob, layerId },
        type: EDITOR_CHANGE_LAYER_IMAGE
    } as const)

export const changeLayerOffset = (layerId: string, x: number, y: number) =>
    ({
        payload: { layerId, offset: { x, y } },
        type: EDITOR_CHANGE_LAYER_OFFSET
    } as const)

export const changeLayersSuccess = (layers: DeflatedLayer[] | null[]) =>
    ({
        payload: { layers },
        type: EDITOR_CHANGE_LAYERS_SUCCESS
    } as const)

export const changeLayerName = (layerId: string, name: string) =>
    ({
        payload: { layerId, name },
        type: EDITOR_CHANGE_LAYER_NAME
    } as const)

export const changeLayerOpacity = (layerId: string, opacity: number) =>
    ({
        payload: { layerId, opacity },
        type: EDITOR_CHANGE_LAYER_OPACITY
    } as const)

export const changeLayerVisible = (layerId: string, visible: boolean) =>
    ({
        payload: { layerId, visible },
        type: EDITOR_CHANGE_LAYER_VISIBLE
    } as const)

export const copySelectedArea = (imageCanvas: HTMLCanvasElement) =>
    ({
        payload: { imageCanvas },
        type: EDITOR_COPY_SELECTED_AREA
    } as const)

export const paste = () =>
    ({
        type: EDITOR_PASTE
    } as const)

export const crop = () =>
    ({
        type: EDITOR_CROP
    } as const)

export const cropSuccess = (layers: DeflatedLayer[], canvas: Canvas) =>
    ({
        payload: { canvas, layers },
        type: EDITOR_CROP_SUCCESS
    } as const)

export const historyAction = <T>(payload: Record<string, T>) =>
    ({
        payload,
        type: EDITOR_HISTORY_ACTION
    } as const)

export const removeLayer = (layerId: string) =>
    ({
        payload: { layerId },
        type: EDITOR_REMOVE_LAYER
    } as const)

export const removeTile = (tileId: number, tileset: Tileset) =>
    ({
        payload: { tileId, tileset },
        type: EDITOR_REMOVE_TILE
    } as const)

export const removeTileSuccess = (layers: DeflatedLayer[], tileset: Tileset) =>
    ({
        payload: { layers, tileset },
        type: EDITOR_REMOVE_TILE_SUCCESS
    } as const)

export const saveChanges = () =>
    ({
        type: EDITOR_SAVE_CHANGES
    } as const)

export const saveChangesToFile = () =>
    ({
        type: EDITOR_SAVE_CHANGES_TO_FILE
    } as const)

export const toggleShowGrid = (visible: boolean) =>
    ({
        payload: { visible },
        type: EDITOR_TOGGLE_SHOW_GRID
    } as const)

export const createNewProject = (config: ProjectConfig) =>
    ({
        payload: { config },
        type: EDITOR_CREATE_NEW_PROJECT
    } as const)

export const createNewImageLayerFromFile = (config: LayerImportConfig) =>
    ({
        payload: { config },
        type: EDITOR_CREATE_IMAGE_LAYER_FROM_FILE
    } as const)

export const createNewTileLayerFromFile = (config: LayerImportConfig) =>
    ({
        payload: { config },
        type: EDITOR_CREATE_TILE_LAYER_FROM_FILE
    } as const)

export const loadStateFromFile = (data: ProjectFile) =>
    ({
        payload: { data },
        type: EDITOR_LOAD_STATE_FROM_FILE
    } as const)

export const openProject = (data: ProjectFile) =>
    ({
        payload: { data },
        type: EDITOR_OPEN_PROJECT_FILE
    } as const)
