/* eslint-disable @typescript-eslint/no-explicit-any */
import createSagaMiddleware from 'redux-saga'
import { configureStore } from '@reduxjs/toolkit'

import { IS_PRODUCTION } from '../common/constants'
import { cacheMiddleware, undoMiddleware } from './middlewares'
import createReducer from './reducers'
import rootSaga from './editor/saga'

const sagaMiddleware = createSagaMiddleware()

export const store = configureStore({
    devTools: !IS_PRODUCTION,
    reducer: createReducer(),
    middleware: gDM =>
        gDM({
            // serializableCheck: false,
            serializableCheck: {
                ignoredActionPaths: ['payload.blob', 'payload.action.payload.blob'],
                ignoredPaths: ['history.undo', 'history.redo']
            }
        }).concat(sagaMiddleware, undoMiddleware, cacheMiddleware)
})
sagaMiddleware.run(rootSaga)

export type AppAction = { type: string; payload: any }
export type AppDispatch = typeof store.dispatch
export type AppStore = typeof store
export type RootState = ReturnType<typeof store.getState>
