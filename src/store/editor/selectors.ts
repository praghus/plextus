import { createSelector } from 'reselect'
import { store } from '../store'
import { Canvas, DeflatedLayer, EditorState, Grid, Layer, Pallete, Selected, Tileset, Workspace } from './types'
import { EDITOR_RESOURCE_NAME } from './constants'
import { parseLayerData } from '../../common/utils/pako'

export const selectEditor = (state: ReturnType<typeof store.getState>): EditorState => state[EDITOR_RESOURCE_NAME]

export const selectCanvas = createSelector<typeof selectEditor, EditorState, Canvas>(
    selectEditor,
    ({ canvas }) => canvas as Canvas
)

export const selectGrid = createSelector<typeof selectEditor, EditorState, Grid>(selectEditor, ({ grid }) => grid)

export const selectRawLayers = createSelector<typeof selectEditor, EditorState, DeflatedLayer[]>(
    selectEditor,
    ({ layers }) => layers
)

export const selectLayers = createSelector<typeof selectEditor, EditorState, Layer[]>(selectEditor, ({ layers }) =>
    layers.map((layer: DeflatedLayer) => (layer.data ? { ...layer, data: parseLayerData(layer.data) } : layer) as Layer)
)

export const selectPalette = createSelector<typeof selectEditor, EditorState, Pallete>(
    selectEditor,
    ({ palette }) => palette
)

export const selectSelected = createSelector<typeof selectEditor, EditorState, Selected>(
    selectEditor,
    ({ selected }) => selected
)

export const selectTileset = createSelector<typeof selectEditor, EditorState, Tileset>(
    selectEditor,
    ({ tileset }) => tileset
)

export const selectTilesetImage = createSelector<typeof selectEditor, EditorState, string>(
    selectEditor,
    ({ tileset }) => tileset.image
)

export const selectWorkspace = createSelector<typeof selectEditor, EditorState, Workspace>(
    selectEditor,
    ({ workspace }) => workspace
)

export const selectUndoable = createSelector(selectEditor, ({ tileset, layers }) => ({
    tileset,
    layers
}))
