import { combineReducers, AnyAction, Reducer } from 'redux'
import { connectRouter } from 'connected-react-router'
import { undoHistoryReducerCreator } from 'redux-undo-redo'
import { APP_UNDO_HISTORY_RESOURCE_NAME, APP_REHYDRATE_STORE_SUCCESS, APP_RESOURCE_NAME } from './app/constants'
import { EDITOR_RESOURCE_NAME } from './editor/constants'
import { store } from './store'
import history from '../common/utils/history'
import appReducer from './app/reducer'
import editorReducer from './editor/reducer'

type RootState = ReturnType<typeof store.getState>

const rehydrateStoreReducer = (next: Reducer) => (state: RootState, action: AnyAction) =>
    action.type === APP_REHYDRATE_STORE_SUCCESS ? next(action.payload.state, action) : next(state, action)

export default function createReducer(injectedReducers = {}): Reducer {
    const rootReducer = rehydrateStoreReducer(
        combineReducers({
            router: connectRouter(history),
            [APP_RESOURCE_NAME]: appReducer,
            [EDITOR_RESOURCE_NAME]: editorReducer,
            [APP_UNDO_HISTORY_RESOURCE_NAME]: undoHistoryReducerCreator({ undoHistoryLimit: 10 }),
            ...injectedReducers
        })
    )

    return rootReducer
}
