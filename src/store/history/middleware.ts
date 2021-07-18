import { get, includes } from 'lodash'
import { add } from './actions'
import { HISTORY_REDO, HISTORY_UNDO } from './constants'
import { selectUndoItem, selectRedoItem } from './selectors'

function createUndoMiddleware({ getViewState, setViewState, revertingActions }) {
    const SUPPORTED_ACTIONS = Object.keys(revertingActions)
    let acting = false

    return ({ dispatch, getState }) =>
        next =>
        action => {
            const state = getState()
            const ret = next(action)

            switch (action.type) {
                case HISTORY_UNDO:
                    {
                        const undoItem = selectUndoItem(state)
                        if (undoItem) {
                            acting = true
                            // setViewState && dispatch(setViewState(undoItem.afterState))
                            dispatch(getUndoAction(undoItem))
                            setViewState && dispatch(setViewState(undoItem.before))
                            acting = false
                        }
                    }
                    break
                case HISTORY_REDO:
                    {
                        const redoItem = selectRedoItem(state)
                        if (redoItem) {
                            acting = true
                            setViewState && dispatch(setViewState(redoItem.before))
                            dispatch(redoItem.action)
                            acting = false
                        }
                    }
                    break
                default:
                    if (!acting && includes(SUPPORTED_ACTIONS, action.type)) {
                        getViewState && dispatch(add(action, getUndoArgs(state, action)))
                    }
                    break
            }

            return ret
        }

    function getUndoAction(undoItem: any) {
        const { action, before } = undoItem
        const { type } = action
        const actionCreator = get(revertingActions[type], 'action', revertingActions[type])
        if (!actionCreator) {
            throw new Error(`Illegal reverting action definition for '${type}'`)
        }
        return actionCreator(action, before)
    }

    function getUndoArgs(state, action) {
        const argsFactory = get(revertingActions[action.type], 'createArgs')
        return argsFactory && argsFactory(state, action)
    }
}

export default createUndoMiddleware
