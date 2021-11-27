import { isEmpty } from 'lodash'
import { createSelector } from 'reselect'
import { store } from '../store'
import { HISTORY_RESOURCE_NAME } from './constants'
import { HistoryState, UndoRedoAction } from './types'

export const selectHistory = (state: ReturnType<typeof store.getState>): HistoryState => state[HISTORY_RESOURCE_NAME]
export const selectUndoItem = createSelector(selectHistory, ({ undo }): UndoRedoAction => undo[0])
export const selectRedoItem = createSelector(selectHistory, ({ redo }): UndoRedoAction => redo[0])
export const selectIsPristine = createSelector(
    selectHistory,
    ({ undo, redo }): boolean => isEmpty(undo) && isEmpty(redo)
)

// export const selectHistoryTilesets = createSelector(
//     selectHistory,
//     ({ undo, redo }) => {
//         const undoImages = undo.map(({ before }) => before.tileset && before.tileset.image)
//         const redoImages = redo.map(({ before }) => before.tileset && before.tileset.image)
//         return [...undoImages, ...redoImages]
//     }
// )
