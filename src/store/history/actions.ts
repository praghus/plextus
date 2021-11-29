import { HISTORY_ADD, HISTORY_CLEAR, HISTORY_UNDO, HISTORY_REDO } from './constants'

export const add = (action, before) => ({ payload: { action, before }, type: HISTORY_ADD } as const)
export const clear = () => ({ type: HISTORY_CLEAR } as const)
export const undo = () => ({ type: HISTORY_UNDO } as const)
export const redo = () => ({ type: HISTORY_REDO } as const)
