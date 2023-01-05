import { AnyAction } from '@reduxjs/toolkit'

import { INITIAL_STATE } from './constants'
import { Canvas, DeflatedLayer, Tileset } from '../editor/types'

export type HistoryState = typeof INITIAL_STATE

export type UndoRedoAction = {
    action: AnyAction
    before: AnyAction
}

export type RevertingPayload = {
    canvas: Canvas
    layers: DeflatedLayer[]
    tileset: Tileset
    image: string
}
