import { isEmpty } from 'lodash'
import { createSelector } from 'reselect'
import { store } from '../store'
import { HISTORY_RESOURCE_NAME } from './constants'
import { HistoryState } from './types'

type RootState = ReturnType<typeof store.getState>

export const selectHistory = (state: ReturnType<typeof store.getState>): HistoryState => state[HISTORY_RESOURCE_NAME]

export const selectUndoItem = createSelector<typeof selectHistory, HistoryState, any>(
    selectHistory,
    ({ undo }) => undo[0]
)

export const selectRedoItem = createSelector<typeof selectHistory, HistoryState, any>(
    selectHistory,
    ({ redo }) => redo[0]
)

export const selectIsPristine = createSelector<typeof selectHistory, RootState, boolean>(
    selectHistory,
    ({ undo, redo }) => isEmpty(undo) && isEmpty(redo)
)

export const selectHistoryTilesets = createSelector<typeof selectHistory, RootState, string[]>(
    selectHistory,
    ({ undo, redo }) => {
        const undoImages = undo.map(({ before }) => before.tileset && before.tileset.image)
        const redoImages = redo.map(({ before }) => before.tileset && before.tileset.image)
        return [...undoImages, ...redoImages]
    }
)
