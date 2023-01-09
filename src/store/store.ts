import createSagaMiddleware from 'redux-saga'
import { configureStore, StoreEnhancer } from '@reduxjs/toolkit'
import { createInjectorsEnhancer } from 'redux-injectors'

import { IS_PRODUCTION } from '../common/constants'
import { cacheMiddleware, undoMiddleware } from './middlewares'
import createReducer from './reducers'

const sagaMiddleware = createSagaMiddleware()
const middlewares = [sagaMiddleware, cacheMiddleware, undoMiddleware]

const { run: runSaga } = sagaMiddleware

export const store = configureStore({
    devTools: !IS_PRODUCTION,
    enhancers: [
        createInjectorsEnhancer({
            createReducer,
            runSaga
        }) as StoreEnhancer
    ],
    middleware: getDefaultMiddleware => [
        ...getDefaultMiddleware({
            serializableCheck: false
        }),
        ...middlewares
    ],
    reducer: createReducer()
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
