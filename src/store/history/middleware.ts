import { AnyAction, Dispatch, Middleware, MiddlewareAPI } from '@reduxjs/toolkit'
import { get, includes } from 'lodash'
import { historyAction } from '../editor/actions'

import { add } from './actions'
import { HISTORY_REDO, HISTORY_UNDO } from './constants'
import { selectUndoItem, selectRedoItem } from './selectors'
import { HistoryState, UndoRedoAction } from './types'

function createUndoMiddleware(revertingActions: Record<string, unknown>): Middleware {
    const SUPPORTED_ACTIONS = Object.keys(revertingActions)
    let acting = false

    return ({ dispatch, getState }: MiddlewareAPI) =>
        (next: Dispatch) =>
        (action: AnyAction) => {
            const state = getState()
            const ret = next(action)

            switch (action.type) {
                case HISTORY_UNDO:
                    {
                        const undoItem = selectUndoItem(state)
                        if (undoItem) {
                            acting = true
                            dispatch(getUndoAction(undoItem))
                            dispatch(historyAction(undoItem.before))
                            acting = false
                        }
                    }
                    break
                case HISTORY_REDO:
                    {
                        const redoItem = selectRedoItem(state)
                        if (redoItem) {
                            acting = true
                            dispatch(historyAction(redoItem.before))
                            dispatch(redoItem.action)
                            acting = false
                        }
                    }
                    break
                default:
                    if (!acting && includes(SUPPORTED_ACTIONS, action.type)) {
                        dispatch(add(action, getBefore(state, action)))
                    }
                    break
            }

            return ret
        }

    function getUndoAction(undoItem: UndoRedoAction) {
        const { action, before } = undoItem
        const { type } = action
        const actionCreator = get(revertingActions[type], 'action', revertingActions[type])
        if (!actionCreator) {
            throw new Error(`Illegal reverting action definition for '${type}'`)
        }
        return actionCreator(action, before)
    }

    function getBefore(state: HistoryState, action: AnyAction) {
        const beforeFactory = get(revertingActions[action.type], 'getBefore')
        return beforeFactory && beforeFactory(state, action)
    }
}

export default createUndoMiddleware
