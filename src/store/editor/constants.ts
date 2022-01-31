import { v4 as uuidv4 } from 'uuid'

import { PALETTES, DEFAULT_TILESET_IMAGE, TOOLS } from '../../common/constants'
import { Canvas, DeflatedLayer, Rectangle } from './types'

export const EDITOR_RESOURCE_NAME = 'editor'
export const EDITOR_TILESET_RESOURCE_KEY = 'tileset'
export const EDITOR_CREATE_NEW_PROJECT = `${EDITOR_RESOURCE_NAME}/EDITOR_CREATE_NEW_PROJECT`
export const EDITOR_CHANGE_CANVAS = `${EDITOR_RESOURCE_NAME}/EDITOR_CHANGE_CANVAS`
export const EDITOR_CHANGE_CANVAS_BACKGROUND = `${EDITOR_RESOURCE_NAME}/EDITOR_CHANGE_CANVAS_BACKGROUND`
export const EDITOR_CHANGE_GRID_COLOR = `${EDITOR_RESOURCE_NAME}/EDITOR_CHANGE_GRID_COLOR`
export const EDITOR_CHANGE_GRID_PITCH = `${EDITOR_RESOURCE_NAME}/EDITOR_CHANGE_GRID_PITCH`
export const EDITOR_CHANGE_GRID_SIZE = `${EDITOR_RESOURCE_NAME}/EDITOR_CHANGE_GRID_SIZE`
export const EDITOR_CHANGE_LAYER_DATA = `${EDITOR_RESOURCE_NAME}/EDITOR_CHANGE_LAYER_DATA`
export const EDITOR_CHANGE_LAYER_IMAGE = `${EDITOR_RESOURCE_NAME}/EDITOR_CHANGE_LAYER_IMAGE`
export const EDITOR_CHANGE_LAYER_NAME = `${EDITOR_RESOURCE_NAME}/EDITOR_CHANGE_LAYER_NAME`
export const EDITOR_CHANGE_LAYER_OFFSET = `${EDITOR_RESOURCE_NAME}/EDITOR_CHANGE_LAYER_OFFSET`
export const EDITOR_CHANGE_LAYER_OPACITY = `${EDITOR_RESOURCE_NAME}/EDITOR_CHANGE_LAYER_OPACITY`
export const EDITOR_CHANGE_LAYER_VISIBLE = `${EDITOR_RESOURCE_NAME}/EDITOR_CHANGE_LAYER_VISIBLE`
export const EDITOR_CHANGE_SELECTED_AREA = `${EDITOR_RESOURCE_NAME}/EDITOR_CHANGE_SELECTED_AREA`
export const EDITOR_CHANGE_SELECTED_LAYER = `${EDITOR_RESOURCE_NAME}/EDITOR_CHANGE_SELECTED_LAYER`
export const EDITOR_CHANGE_SELECTED_TILE = `${EDITOR_RESOURCE_NAME}/EDITOR_CHANGE_SELECTED_TILE`
export const EDITOR_CHANGE_PALETTE = `${EDITOR_RESOURCE_NAME}/EDITOR_CHANGE_PALETTE`
export const EDITOR_CHANGE_POSITION = `${EDITOR_RESOURCE_NAME}/EDITOR_CHANGE_POSITION`
export const EDITOR_CHANGE_PRIMARY_COLOR = `${EDITOR_RESOURCE_NAME}/EDITOR_CHANGE_PRIMARY_COLOR`
export const EDITOR_CHANGE_SCALE = `${EDITOR_RESOURCE_NAME}/EDITOR_CHANGE_SCALE`
export const EDITOR_CHANGE_TOOL = `${EDITOR_RESOURCE_NAME}/EDITOR_CHANGE_TOOL`
export const EDITOR_CHANGE_TOOL_SIZE = `${EDITOR_RESOURCE_NAME}/EDITOR_CHANGE_TOOL_SIZE`
export const EDITOR_CHANGE_TILESET = `${EDITOR_RESOURCE_NAME}/EDITOR_CHANGE_TILESET`
export const EDITOR_CHANGE_WORKSPACE_SIZE = `${EDITOR_RESOURCE_NAME}/EDITOR_CHANGE_WORKSPACE_SIZE`
export const EDITOR_CHANGE_LAYERS = `${EDITOR_RESOURCE_NAME}/EDITOR_CHANGE_LAYERS`
export const EDITOR_CHANGE_LAYERS_SUCCESS = `${EDITOR_RESOURCE_NAME}/EDITOR_CHANGE_LAYERS_SUCCESS`
export const EDITOR_CLEAR_PROJECT = `${EDITOR_RESOURCE_NAME}/EDITOR_CLEAR_PROJECT`
export const EDITOR_CROP = `${EDITOR_RESOURCE_NAME}/EDITOR_CROP`
export const EDITOR_CROP_SUCCESS = `${EDITOR_RESOURCE_NAME}/EDITOR_CROP_SUCCESS`
export const EDITOR_HISTORY_ACTION = `${EDITOR_RESOURCE_NAME}/EDITOR_HISTORY_ACTION`
export const EDITOR_REMOVE_LAYER = `${EDITOR_RESOURCE_NAME}/EDITOR_REMOVE_LAYER`
export const EDITOR_REMOVE_TILE = `${EDITOR_RESOURCE_NAME}/EDITOR_REMOVE_TILE`
export const EDITOR_REMOVE_TILE_SUCCESS = `${EDITOR_RESOURCE_NAME}/EDITOR_REMOVE_TILE_SUCCESS`
export const EDITOR_RESET_TO_DEFAULTS = `${EDITOR_RESOURCE_NAME}/EDITOR_RESET_TO_DEFAULTS`
export const EDITOR_SAVE_CHANGES = `${EDITOR_RESOURCE_NAME}/EDITOR_SAVE_CHANGES`
export const EDITOR_CHANGE_SELECTED_PALETTE = `${EDITOR_RESOURCE_NAME}/EDITOR_CHANGE_SELECTED_PALETTE`
export const EDITOR_SET_TILESET_IMAGE = `${EDITOR_RESOURCE_NAME}/EDITOR_SET_TILESET_IMAGE`
export const EDITOR_SET_TILESET_IMAGE_SUCCESS = `${EDITOR_RESOURCE_NAME}/EDITOR_SET_TILESET_IMAGE_SUCCESS`
export const EDITOR_TOGGLE_SHOW_GRID = `${EDITOR_RESOURCE_NAME}/EDITOR_TOGGLE_SHOW_GRID`
export const EDITOR_CREATE_TILE_LAYER_FROM_FILE = `${EDITOR_RESOURCE_NAME}/EDITOR_CREATE_TILE_LAYER_FROM_FILE`
export const EDITOR_CREATE_IMAGE_LAYER_FROM_FILE = `${EDITOR_RESOURCE_NAME}/EDITOR_CREATE_IMAGE_LAYER_FROM_FILE`
export const EDITOR_LOAD_STATE_FROM_FILE = `${EDITOR_RESOURCE_NAME}/EDITOR_LOAD_STATE_FROM_FILE`
export const DEFAULT_PALLETE = PALETTES.DAWNBRINGER_32_PALETTE.colors

const layerId = uuidv4()

export const INITIAL_STATE = {
    canvas: null as Canvas | null,
    grid: {
        color: [0, 0, 0, 255],
        height: 16,
        pitch: 10,
        visible: true,
        width: 16
    },
    layers: [] as DeflatedLayer[] | [],
    palette: DEFAULT_PALLETE,
    selected: {
        area: null as Rectangle | null,
        color: DEFAULT_PALLETE[0],
        layerId,
        palette: 'DEFAULT',
        stamp: [] as (number | null)[][],
        tileId: 1,
        tool: TOOLS.DRAG,
        toolSize: 1
    },
    tileset: {
        columns: 10,
        firstgid: 1,
        image: DEFAULT_TILESET_IMAGE,
        lastUpdateTime: performance.now(),
        tilecount: 1,
        tileheight: 16,
        tilewidth: 16
    },
    workspace: {
        height: 0,
        scale: 0,
        width: 0,
        x: 0,
        y: 0
    }
}
