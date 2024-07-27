import { combineReducers, Reducer, UnknownAction } from '@reduxjs/toolkit'
import { APP_REHYDRATE_STORE_SUCCESS, APP_RESOURCE_NAME } from './app/constants'
import { EDITOR_RESOURCE_NAME } from './editor/constants'
import { HISTORY_RESOURCE_NAME } from './history/constants'
import { AppAction, RootState } from './store'
import appReducer from './app/reducer'
import editorReducer from './editor/reducer'
import historyReducer from './history/reducer'

const rehydrateStoreReducer = (next: Reducer) => (state: RootState, action: UnknownAction) =>
    action.type === APP_REHYDRATE_STORE_SUCCESS
        ? next((action as AppAction).payload.state, action)
        : next(state, action)

export default function createReducer(): Reducer {
    const rootReducer = rehydrateStoreReducer(
        combineReducers<RootState>({
            [APP_RESOURCE_NAME]: appReducer,
            [EDITOR_RESOURCE_NAME]: editorReducer,
            [HISTORY_RESOURCE_NAME]: historyReducer
        })
    )
    return rootReducer
}
