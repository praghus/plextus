import { v4 as uuidv4 } from "uuid";

import { PALETTES, DEFAULT_TILESET_IMAGE, TOOLS } from "../../common/constants";

export const EDITOR_RESOURCE_NAME = "editor";
export const EDITOR_TILESET_RESOURCE_KEY = "tileset";

export const EDITOR_CHANGE_CANVAS_SIZE = `${EDITOR_RESOURCE_NAME}/EDITOR_CHANGE_CANVAS_SIZE`;
export const EDITOR_CHANGE_GRID_COLOR = `${EDITOR_RESOURCE_NAME}/EDITOR_CHANGE_GRID_COLOR`;
export const EDITOR_CHANGE_GRID_SIZE = `${EDITOR_RESOURCE_NAME}/EDITOR_CHANGE_GRID_SIZE`;
export const EDITOR_CHANGE_SELECTED_LAYER = `${EDITOR_RESOURCE_NAME}/EDITOR_CHANGE_SELECTED_LAYER`;
export const EDITOR_CHANGE_SELECTED_TILE = `${EDITOR_RESOURCE_NAME}/EDITOR_CHANGE_SELECTED_TILE`;
export const EDITOR_CHANGE_PALETTE = `${EDITOR_RESOURCE_NAME}/EDITOR_CHANGE_PALETTE`;
export const EDITOR_CHANGE_POSITION = `${EDITOR_RESOURCE_NAME}/EDITOR_CHANGE_POSITION`;
export const EDITOR_CHANGE_PRIMARY_COLOR = `${EDITOR_RESOURCE_NAME}/EDITOR_CHANGE_PRIMARY_COLOR`;
export const EDITOR_CHANGE_SCALE = `${EDITOR_RESOURCE_NAME}/EDITOR_CHANGE_SCALE`;
export const EDITOR_CHANGE_TOOL = `${EDITOR_RESOURCE_NAME}/EDITOR_CHANGE_TOOL`;
export const EDITOR_CHANGE_TILESET = `${EDITOR_RESOURCE_NAME}/EDITOR_CHANGE_TILESET`;
export const EDITOR_CHANGE_WORKSPACE_SIZE = `${EDITOR_RESOURCE_NAME}/EDITOR_CHANGE_WORKSPACE_SIZE`;
export const EDITOR_SET_TILESET_IMAGE = `${EDITOR_RESOURCE_NAME}/EDITOR_SET_TILESET_IMAGE`;
export const EDITOR_SET_TILESET_IMAGE_SUCCESS = `${EDITOR_RESOURCE_NAME}/EDITOR_SET_TILESET_IMAGE_SUCCESS`;
export const EDITOR_CHANGE_LAYERS = `${EDITOR_RESOURCE_NAME}/EDITOR_CHANGE_LAYERS`;
export const EDITOR_TOGGLE_SHOW_GRID = `${EDITOR_RESOURCE_NAME}/EDITOR_TOGGLE_SHOW_GRID`;
export const EDITOR_CHANGE_LAYER_DATA = `${EDITOR_RESOURCE_NAME}/EDITOR_CHANGE_LAYER_DATA`;
export const EDITOR_CHANGE_LAYER_NAME = `${EDITOR_RESOURCE_NAME}/EDITOR_CHANGE_LAYER_NAME`;
export const EDITOR_CHANGE_LAYER_OPACITY = `${EDITOR_RESOURCE_NAME}/EDITOR_CHANGE_LAYER_OPACITY`;
export const EDITOR_CHANGE_LAYER_VISIBLE = `${EDITOR_RESOURCE_NAME}/EDITOR_CHANGE_LAYER_VISIBLE`;
export const EDITOR_REMOVE_LAYER = `${EDITOR_RESOURCE_NAME}/EDITOR_REMOVE_LAYER`;
export const EDITOR_SAVE_CHANGES = `${EDITOR_RESOURCE_NAME}/EDITOR_SAVE_CHANGES`;
export const EDITOR_HISTORY_ACTION = `${EDITOR_RESOURCE_NAME}/EDITOR_HISTORY_ACTION`;

export const DEFAULT_PALLETE = PALETTES.DAWNBRINGER_32_PALETTE;

const layerId = uuidv4();

export const INITIAL_STATE = {
  canvas: {
    width: 256,
    height: 256,
    background: null,
  },
  grid: {
    width: 16,
    height: 16,
    visible: true,
    color: [255, 255, 255, 128],
  },
  layers: [
    {
      id: layerId,
      name: "Layer 1",
      width: 16,
      height: 16,
      visible: true,
      opacity: 255,
      data: new Array(16 * 16).fill(null),
    },
  ],
  palette: DEFAULT_PALLETE,
  selected: {
    area: {
      x: 0,
      y: 0,
      cols: 0,
      rows: 0,
    },
    color: DEFAULT_PALLETE[0],
    color2: null,
    data: null,
    layerId,
    tileId: 1,
    tool: TOOLS.DRAG,
  },
  tileset: {
    columns: 10,
    firstgid: 1,
    tilecount: 10,
    tileheight: 16,
    tilewidth: 16,
    image: DEFAULT_TILESET_IMAGE,
    lastUpdateTime: performance.now(),
  },
  workspace: {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    scale: 3,
  },
};
