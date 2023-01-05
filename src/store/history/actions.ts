import { AnyAction } from '@reduxjs/toolkit'

import { HISTORY_ADD, HISTORY_CLEAR, HISTORY_UNDO, HISTORY_REDO, INITIAL_STATE } from './constants'

export const add = (action: AnyAction, before: typeof INITIAL_STATE) =>
    ({ payload: { action, before }, type: HISTORY_ADD } as const)
export const clear = () => ({ type: HISTORY_CLEAR } as const)
export const undo = () => ({ type: HISTORY_UNDO } as const)
export const redo = () => ({ type: HISTORY_REDO } as const)
