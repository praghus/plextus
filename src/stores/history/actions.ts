import { AppAction } from '../store'
import { HISTORY_ADD, HISTORY_CLEAR, HISTORY_UNDO, HISTORY_REDO, INITIAL_STATE } from './constants'

export const add = (action: AppAction, before: typeof INITIAL_STATE) => ({
    payload: { action, before },
    type: HISTORY_ADD
})
export const clear = () => ({ type: HISTORY_CLEAR })
export const undo = () => ({ type: HISTORY_UNDO })
export const redo = () => ({ type: HISTORY_REDO })
