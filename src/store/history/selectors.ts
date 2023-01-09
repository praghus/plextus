import { isEmpty } from 'lodash'
import { createSelector } from 'reselect'

import { RootState } from '../store'
import { HISTORY_RESOURCE_NAME } from './constants'
import { HistoryState, UndoRedoAction } from './types'

export const selectHistory = (state: RootState): HistoryState => state[HISTORY_RESOURCE_NAME]
export const selectUndoItem = createSelector(selectHistory, ({ undo }): UndoRedoAction => undo[0])
export const selectRedoItem = createSelector(selectHistory, ({ redo }): UndoRedoAction => redo[0])
export const selectIsPristine = createSelector(
    selectHistory,
    ({ undo, redo }): boolean => isEmpty(undo) && isEmpty(redo)
)
