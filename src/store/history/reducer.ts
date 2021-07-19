import { AnyAction } from '@reduxjs/toolkit'
import { omitBy, isNil } from 'lodash'
import { HISTORY_ADD, HISTORY_CLEAR, HISTORY_LIMIT, HISTORY_REDO, HISTORY_UNDO, INITIAL_STATE } from './constants'

function historyReducer(state = INITIAL_STATE, action: AnyAction) {
    const { type, payload: undoItem } = action
    const { undo, redo } = state

    switch (type) {
        case HISTORY_UNDO: {
            return undo.length === 0
                ? state
                : {
                      undo: undo.slice(1),
                      redo: [undo[0], ...redo]
                  }
        }
        case HISTORY_REDO: {
            return redo.length === 0
                ? state
                : {
                      undo: [redo[0], ...undo],
                      redo: redo.slice(1)
                  }
        }
        case HISTORY_ADD: {
            const newUndo = [omitBy(undoItem, isNil)]
            HISTORY_LIMIT ? newUndo.push(...undo.slice(0, HISTORY_LIMIT - 1)) : newUndo.push(...undo)

            return {
                undo: newUndo,
                redo: []
            }
        }
        case HISTORY_CLEAR:
            return INITIAL_STATE
        default:
            return state
    }
}

export default historyReducer
