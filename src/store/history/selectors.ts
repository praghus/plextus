import { createSelector } from 'reselect'
import { store } from '../store'
import { HISTORY_RESOURCE_NAME } from './constants'
import { HistoryState } from './types'

export const selectHistory = (state: ReturnType<typeof store.getState>): HistoryState => state[HISTORY_RESOURCE_NAME]

export const selectUndoItem = createSelector<typeof selectHistory, HistoryState, any>(
    selectHistory,
    ({ undo }) => undo[0]
)

export const selectRedoItem = createSelector<typeof selectHistory, HistoryState, any>(
    selectHistory,
    ({ redo }) => redo[0]
)
