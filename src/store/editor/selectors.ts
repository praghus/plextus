import { createSelector } from 'reselect'
import { store } from '../store'
import { Canvas, DeflatedLayer, EditorState, Layer } from './types'
import { DEFAULT_PALLETE, EDITOR_RESOURCE_NAME } from './constants'
import { parseLayerData } from '../../common/utils/pako'

export const selectEditor = (state: ReturnType<typeof store.getState>): EditorState => state[EDITOR_RESOURCE_NAME]
export const selectCanvas = createSelector(selectEditor, ({ canvas }) => canvas as Canvas)
export const selectGrid = createSelector(selectEditor, ({ grid }) => grid)
export const selectRawLayers = createSelector(selectEditor, ({ layers }) => layers)
export const selectLayers = createSelector(selectEditor, ({ layers }) =>
    layers.map((layer: DeflatedLayer) => (layer.data ? { ...layer, data: parseLayerData(layer.data) } : layer) as Layer)
)
export const selectPalette = createSelector(selectEditor, ({ palette }) => palette || DEFAULT_PALLETE)
export const selectProjectName = createSelector(selectEditor, ({ name }) => name)
export const selectSelected = createSelector(selectEditor, ({ selected }) => selected)
export const selectTileset = createSelector(selectEditor, ({ tileset }) => tileset)
export const selectTilesetImage = createSelector(selectEditor, ({ tileset }) => tileset.image)
export const selectWorkspace = createSelector(selectEditor, ({ workspace }) => workspace)
export const selectSelectedLayer = createSelector(
    selectLayers,
    selectSelected,
    (layers, selected) => layers.find(({ id }) => id === selected.layerId) || null
)
