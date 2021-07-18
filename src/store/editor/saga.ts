import { AnyAction } from 'redux'
import { put, StrictEffect, select, takeLatest, call } from 'redux-saga/effects'
import request from '../../common/utils/fetch-api'
import logger from '../../common/utils/logger'
import { clearCache, setCacheBlob } from '../../common/utils/storage'
import { compressLayerData } from '../../common/utils/pako'

import { selectHistoryTilesets } from '../history/selectors'
import { selectTileset, selectRawLayers } from './selectors'
import { resetToDefaults, changeTilesetImageSuccess, changeLayersSuccess } from './actions'
import { APP_STORAGE_KEY } from '../app/constants'
import {
    EDITOR_CHANGE_LAYERS,
    EDITOR_CHANGE_LAYER_DATA,
    EDITOR_CLEAR_PROJECT,
    EDITOR_SAVE_CHANGES,
    EDITOR_SET_TILESET_IMAGE,
    EDITOR_TILESET_RESOURCE_KEY
} from './constants'

import { DeflatedLayer, Layer } from './types'

const historyData: any[] = []

export function* setTilesetImage(action: AnyAction): Generator<StrictEffect, void, any> {
    const { blob } = action.payload
    try {
        const historyTilesets: any[] = yield select(selectHistoryTilesets)
        const image: any = window.URL.createObjectURL(blob)

        if (historyTilesets) {
            historyData.forEach((img, i) => {
                if (!historyTilesets.includes(img)) {
                    historyData.splice(i, 1)
                    URL.revokeObjectURL(img)
                }
            })
        }
        historyData.push(image)

        yield put(changeTilesetImageSuccess(image))
    } catch (err) {
        logger.error(err)
    }
}

export function* saveChanges(): Generator<StrictEffect, void, any> {
    try {
        const state = yield select(state => state)
        const { image } = yield select(selectTileset)
        if (image) {
            const imageBlob = yield call(() => request.blob(image))
            if (imageBlob) {
                yield call(() => setCacheBlob(EDITOR_TILESET_RESOURCE_KEY, imageBlob, 'image/png'))
            }
        }
        yield call(() => setCacheBlob(APP_STORAGE_KEY, JSON.stringify(state), 'application/json'))
        logger.info('Saving store')
    } catch (err) {
        logger.error(err)
    }
}

export function* changeLayers(action: AnyAction): Generator<StrictEffect, void, any> {
    const { layers } = action.payload
    try {
        const changedLayers = layers.map(
            (layer: Layer) => ({ ...layer, data: compressLayerData(layer.data) } as DeflatedLayer)
        )
        yield put(changeLayersSuccess(changedLayers))
    } catch (err) {
        logger.error(err)
    }
}

export function* changeLayerData(action: AnyAction): Generator<StrictEffect, void, any> {
    const { layerId, data } = action.payload
    try {
        const layers: DeflatedLayer[] = yield select(selectRawLayers)
        const changedLayers = layers.map(layer =>
            layer.id === layerId ? { ...layer, data: compressLayerData(data) } : layer
        )
        yield put(changeLayersSuccess(changedLayers))
    } catch (err) {
        logger.error(err)
    }
}

export function* clearProject(): Generator<StrictEffect, void, any> {
    try {
        historyData.forEach(URL.revokeObjectURL)
        clearCache()
        yield put(resetToDefaults())
    } catch (err) {
        logger.error(err)
    }
}

export default function* editorSaga(): Generator {
    yield takeLatest(EDITOR_SET_TILESET_IMAGE, setTilesetImage),
        yield takeLatest(EDITOR_SAVE_CHANGES, saveChanges),
        yield takeLatest(EDITOR_CHANGE_LAYERS, changeLayers),
        yield takeLatest(EDITOR_CHANGE_LAYER_DATA, changeLayerData),
        yield takeLatest(EDITOR_CLEAR_PROJECT, clearProject)
}
