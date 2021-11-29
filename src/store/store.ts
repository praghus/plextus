import createSagaMiddleware from 'redux-saga'
import { configureStore } from '@reduxjs/toolkit'
import { createInjectorsEnhancer } from 'redux-injectors'
import { IS_PRODUCTION } from '../common/constants'
import { cacheMiddleware, undoMiddleware } from './middlewares'
import createReducer from './reducers'

const sagaMiddleware = createSagaMiddleware()
const middlewares = [sagaMiddleware, cacheMiddleware, undoMiddleware]

const { run: runSaga } = sagaMiddleware

const enhancers = [
    createInjectorsEnhancer({
        createReducer,
        runSaga
    })
]

/* istanbul ignore next */
export const store = configureStore({
    devTools: !IS_PRODUCTION,
    enhancers,
    middleware: getDefaultMiddleware => [
        ...getDefaultMiddleware({
            serializableCheck: false
        }),
        ...middlewares
    ],
    reducer: createReducer()
})
