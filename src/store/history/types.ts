import { AnyAction } from 'redux'
import { INITIAL_STATE } from './constants'

export type HistoryState = typeof INITIAL_STATE

export type UndoRedoAction = {
    action: AnyAction
    before: any
}
