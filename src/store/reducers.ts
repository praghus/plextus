import { combineReducers, AnyAction, Reducer } from '@reduxjs/toolkit'
import { APP_REHYDRATE_STORE_SUCCESS, APP_RESOURCE_NAME } from './app/constants'
import { EDITOR_RESOURCE_NAME } from './editor/constants'
import { HISTORY_RESOURCE_NAME } from './history/constants'
import { RootState } from './store'
import appReducer from './app/reducer'
import editorReducer from './editor/reducer'
import historyReducer from './history/reducer'

const rehydrateStoreReducer = (next: Reducer) => (state: RootState, action: AnyAction) =>
    action.type === APP_REHYDRATE_STORE_SUCCESS ? next(action.payload.state, action) : next(state, action)

export default function createReducer(injectedReducers = {}): Reducer {
    const rootReducer = rehydrateStoreReducer(
        combineReducers({
            [APP_RESOURCE_NAME]: appReducer,
            [EDITOR_RESOURCE_NAME]: editorReducer,
            [HISTORY_RESOURCE_NAME]: historyReducer,
            ...injectedReducers
        })
    )

    return rootReducer
}
