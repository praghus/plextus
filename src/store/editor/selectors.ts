import { createSelector } from 'reselect'
import { RootState } from '../store'
import { Canvas, EditorState, Grid, Layer, Pallete, Selected, Tileset, Workspace } from './types'
import { EDITOR_RESOURCE_NAME } from './constants'

const selectEditor = (state: RootState): EditorState => state[EDITOR_RESOURCE_NAME]

const selectCanvas = createSelector<typeof selectEditor, EditorState, Canvas>(selectEditor, ({ canvas }) => canvas)

const selectGrid = createSelector<typeof selectEditor, EditorState, Grid>(selectEditor, ({ grid }) => grid)

const selectLayers = createSelector<typeof selectEditor, EditorState, Layer[]>(selectEditor, ({ layers }) => layers)

const selectPalette = createSelector<typeof selectEditor, EditorState, Pallete>(selectEditor, ({ palette }) => palette)

const selectSelected = createSelector<typeof selectEditor, EditorState, Selected>(
    selectEditor,
    ({ selected }) => selected
)

const selectTileset = createSelector<typeof selectEditor, EditorState, Tileset>(selectEditor, ({ tileset }) => tileset)

const selectTilesetImage = createSelector<typeof selectEditor, EditorState, string>(
    selectEditor,
    ({ tileset }) => tileset.image
)

const selectWorkspace = createSelector<typeof selectEditor, EditorState, Workspace>(
    selectEditor,
    ({ workspace }) => workspace
)

const selectUndoable = createSelector(selectEditor, ({ tileset, layers }) => ({
    tileset,
    layers
}))

export {
    selectEditor,
    selectCanvas,
    selectGrid,
    selectLayers,
    selectPalette,
    selectSelected,
    selectTileset,
    selectTilesetImage,
    selectWorkspace,
    selectUndoable
}
