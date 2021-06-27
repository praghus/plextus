import { routerMiddleware } from 'connected-react-router'
import createSagaMiddleware from 'redux-saga'
import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit'
import { createInjectorsEnhancer } from 'redux-injectors'
import createReducer from './reducers'
import history from '../common/utils/history'
import { IS_PRODUCTION } from '../common/constants'
import { cacheMiddleware, undoMiddleware } from './middlewares'

const sagaMiddleware = createSagaMiddleware()

const { run: runSaga } = sagaMiddleware

const middlewares = [sagaMiddleware, cacheMiddleware, undoMiddleware, routerMiddleware(history)]

const enhancers = [
    createInjectorsEnhancer({
        createReducer,
        runSaga
    })
]

/* istanbul ignore next */
export const store = configureStore({
    reducer: createReducer(),
    middleware: [
        ...getDefaultMiddleware({
            serializableCheck: false
        }),
        ...middlewares
    ],
    devTools: !IS_PRODUCTION,
    enhancers
})

export type RootState = ReturnType<typeof store.getState>
