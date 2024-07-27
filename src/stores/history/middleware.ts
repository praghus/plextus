/* eslint-disable @typescript-eslint/no-explicit-any */
import { Middleware, MiddlewareAPI } from '@reduxjs/toolkit'
import { get, includes } from 'lodash'
import { historyAction } from '../editor/actions'

import { add } from './actions'
import { HISTORY_REDO, HISTORY_UNDO } from './constants'
import { selectUndoItem, selectRedoItem } from './selectors'
import { HistoryState, RevertingPayload, UndoRedoAction } from './types'
import { AppAction } from '../store'

function createUndoMiddleware(revertingActions: Record<string, unknown>): Middleware {
    let acting = false
    return (api: MiddlewareAPI) => (next: (action: AppAction) => any) => (action: any) => {
        const { dispatch, getState } = api
        const state = getState()
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
                if (!acting && includes(Object.keys(revertingActions), action.type)) {
                    dispatch(add(action, getBefore(state, action)))
                }
                break
        }

        return next(action)
    }

    function getUndoAction(undoItem: UndoRedoAction) {
        const { action, before } = undoItem
        const actionCreator: ((action: AppAction, before: RevertingPayload) => any) | undefined = get(
            revertingActions[action.type],
            'action'
        )
        if (!actionCreator) {
            throw new Error(`Illegal reverting action definition for '${action.type}'`)
        }
        if (typeof actionCreator !== 'function') {
            throw new Error(`Invalid action creator for '${action.type}'`)
        }
        return (actionCreator as (action: AppAction, before: RevertingPayload) => any)(action, before)
    }

    function getBefore(state: HistoryState, action: AppAction) {
        const beforeFactory: ((state: HistoryState, action: AppAction) => any) | undefined = get(
            revertingActions[action.type],
            'getBefore'
        )
        if (typeof beforeFactory !== 'function') {
            throw new Error(`Invalid before factory for '${action.type}'`)
        }
        return (beforeFactory as (state: HistoryState, action: AppAction) => any)(state, action)
    }
}

export default createUndoMiddleware
