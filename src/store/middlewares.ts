import { AnyAction, Dispatch, Middleware, MiddlewareAPI } from 'redux'
import { createUndoMiddleware } from 'redux-undo-redo'
import logger from '../common/utils/logger'
import request from '../common/utils/fetch-api'
import { selectUndoable, selectLayers, selectTileset } from './editor/selectors'
import { changeLayerData, changeTilesetImageSuccess, historyAction } from './editor/actions'
import { getCacheItem, setCacheBlob } from '../common/utils/storage'
import {
    EDITOR_RESOURCE_NAME,
    EDITOR_TILESET_RESOURCE_KEY,
    EDITOR_SAVE_CHANGES,
    EDITOR_CHANGE_LAYER_DATA,
    EDITOR_SET_TILESET_IMAGE
} from './editor/constants'
import {
    APP_REHYDRATE_STORE_SUCCESS,
    APP_REHYDRATE_STORE_ERROR,
    APP_REHYDRATE_STORE_START,
    APP_STORAGE_KEY
} from './app/constants'
import { store } from './store'

type RootState = ReturnType<typeof store.getState>

let isLoadExecuted = false

const loadStore = async (api: MiddlewareAPI): Promise<RootState> => {
    const stateBlob = await getCacheItem(APP_STORAGE_KEY)
    const tilesetBlob = await getCacheItem(EDITOR_TILESET_RESOURCE_KEY)
    if (stateBlob && tilesetBlob) {
        const state = await request.json(window.URL.createObjectURL(stateBlob))
        const editorState = state && state[EDITOR_RESOURCE_NAME]
        const image = window.URL.createObjectURL(tilesetBlob)

        return {
            ...api.getState(),
            [EDITOR_RESOURCE_NAME]: {
                ...editorState,
                tileset: {
                    ...editorState.tileset,
                    image
                }
            }
        }
    }
    return api.getState()
}

// @todo move to store/editor/saga
const handleSave = async (state: RootState) => {
    const { image } = state[EDITOR_RESOURCE_NAME].tileset
    if (image) {
        const imageBlob = await request.blob(image)
        if (imageBlob) {
            await setCacheBlob(EDITOR_TILESET_RESOURCE_KEY, imageBlob, 'image/png')
        }
    }
    await setCacheBlob(APP_STORAGE_KEY, JSON.stringify(state), 'application/json')
    logger.info('Saving store')
}

const handleLoad = async (api: MiddlewareAPI) => {
    const { dispatch } = api
    dispatch({ type: APP_REHYDRATE_STORE_START })
    try {
        const state = await loadStore(api)
        dispatch({
            type: APP_REHYDRATE_STORE_SUCCESS,
            payload: { state }
        })
        logger.info('Loading store')
    } catch (error) {
        dispatch({
            type: APP_REHYDRATE_STORE_ERROR,
            payload: { error }
        })
    }
}

const cacheMiddleware: Middleware = (api: MiddlewareAPI) => (next: Dispatch) => (action: AnyAction) => {
    if (!isLoadExecuted) {
        isLoadExecuted = true
        handleLoad(api)
    } else if (action.type === EDITOR_SAVE_CHANGES) {
        handleSave(api.getState())
    }
    return next(action)
}

const undoMiddleware = createUndoMiddleware({
    getViewState: selectUndoable,
    setViewState: historyAction,
    revertingActions: {
        [EDITOR_SET_TILESET_IMAGE]: {
            action: (action: AnyAction, { image }: any) => changeTilesetImageSuccess(image),
            createArgs: (state: any) => ({ oldTileset: selectTileset(state) })
        },
        [EDITOR_CHANGE_LAYER_DATA]: {
            action: (action: AnyAction, { layerId, data }: any) => changeLayerData(layerId, data),
            createArgs: (state: any) => ({ oldLayers: selectLayers(state) })
        }
    }
})

export { cacheMiddleware, undoMiddleware }
