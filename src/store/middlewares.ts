import { AnyAction, Dispatch, Middleware, MiddlewareAPI } from 'redux'
import createUndoMiddleware from './history/middleware'
import logger from '../common/utils/logger'
import { selectUndoable, selectTileset, selectRawLayers, selectCanvas } from './editor/selectors'
import {
    changeLayersSuccess,
    changeTilesetImageSuccess,
    cropSuccess,
    historyAction,
    removeTileSuccess
} from './editor/actions'
import {
    EDITOR_SET_TILESET_IMAGE,
    EDITOR_CHANGE_LAYERS_SUCCESS,
    EDITOR_REMOVE_TILE_SUCCESS,
    EDITOR_CROP_SUCCESS
} from './editor/constants'
import { APP_REHYDRATE_STORE_SUCCESS, APP_REHYDRATE_STORE_ERROR, APP_REHYDRATE_STORE_START } from './app/constants'
import { loadStateFromStore } from './editor/utils'
import { RevertingPayload } from './history/types'
import { store } from './store'

type RootState = ReturnType<typeof store.getState>

let isLoadExecuted = false

const handleLoad = async (api: MiddlewareAPI) => {
    const { dispatch } = api
    dispatch({ type: APP_REHYDRATE_STORE_START })
    try {
        const loaded = await loadStateFromStore()
        const state = { ...api.getState(), ...loaded }
        dispatch({
            payload: { state },
            type: APP_REHYDRATE_STORE_SUCCESS
        })
        logger.info('Loading store')
    } catch (error) {
        dispatch({
            payload: { error },
            type: APP_REHYDRATE_STORE_ERROR
        })
    }
}

const cacheMiddleware: Middleware = (api: MiddlewareAPI) => (next: Dispatch) => (action: AnyAction) => {
    if (!isLoadExecuted) {
        isLoadExecuted = true
        handleLoad(api)
    }
    return next(action)
}

const undoMiddleware = createUndoMiddleware({
    getViewState: selectUndoable,
    revertingActions: {
        [EDITOR_CHANGE_LAYERS_SUCCESS]: {
            action: (action: AnyAction, { layers }: RevertingPayload) => changeLayersSuccess(layers),
            getBefore: (state: RootState) => ({ layers: selectRawLayers(state) })
        },
        [EDITOR_CROP_SUCCESS]: {
            action: (action: AnyAction, { canvas, layers }: RevertingPayload) => cropSuccess(layers, canvas),
            getBefore: (state: RootState) => ({
                canvas: selectCanvas(state),
                layers: selectRawLayers(state)
            })
        },
        [EDITOR_REMOVE_TILE_SUCCESS]: {
            action: (action: AnyAction, { layers, tileset }: RevertingPayload) => removeTileSuccess(layers, tileset),
            getBefore: (state: RootState) => ({
                layers: selectRawLayers(state),
                tileset: selectTileset(state)
            })
        },
        [EDITOR_SET_TILESET_IMAGE]: {
            action: (action: AnyAction, { image }: RevertingPayload) => changeTilesetImageSuccess(image),
            getBefore: (state: RootState) => ({ tileset: selectTileset(state) })
        }
    },
    setViewState: historyAction
})

export { cacheMiddleware, undoMiddleware }
