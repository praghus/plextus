import { AnyAction } from 'redux'
import { put, StrictEffect, select, takeLatest, call } from 'redux-saga/effects'
import logger from '../../common/utils/logger'
import { clearCache, setCacheBlob } from '../../common/utils/storage'
import { compressLayerData } from '../../common/utils/pako'
import { selectRawLayers } from './selectors'
import { resetToDefaults, changeTilesetImageSuccess, changeLayersSuccess } from './actions'
import { APP_STORAGE_KEY } from '../app/constants'
import {
    EDITOR_CHANGE_LAYERS,
    EDITOR_CHANGE_LAYER_DATA,
    EDITOR_CHANGE_LAYER_IMAGE,
    EDITOR_CLEAR_PROJECT,
    EDITOR_SAVE_CHANGES,
    EDITOR_SET_TILESET_IMAGE
} from './constants'
import { DeflatedLayer, Layer } from './types'
import { getStateToSave } from './utils'

export function* setTilesetImage(action: AnyAction): Generator<StrictEffect, void, any> {
    const { blob } = action.payload
    try {
        const image: any = window.URL.createObjectURL(blob)
        yield put(changeTilesetImageSuccess(image))
    } catch (err) {
        logger.error(err)
    }
}

export function* saveChanges(): Generator<StrictEffect, void, any> {
    try {
        const state = yield select(state => state)
        const toSave = yield call(() => getStateToSave(state))

        yield call(() => setCacheBlob(APP_STORAGE_KEY, JSON.stringify(toSave), 'application/json'))

        logger.info('Saving to store')
    } catch (err) {
        logger.error(err)
    }
}

export function* changeLayers(action: AnyAction): Generator<StrictEffect, void, any> {
    const { layers } = action.payload
    try {
        const changedLayers = layers.map((layer: Layer) =>
            layer.data ? ({ ...layer, data: compressLayerData(layer.data) } as DeflatedLayer) : layer
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
            layer.id === layerId && layer.data ? { ...layer, data: compressLayerData(data) } : layer
        )
        yield put(changeLayersSuccess(changedLayers))
    } catch (err) {
        logger.error(err)
    }
}

export function* changeLayerImage(action: AnyAction): Generator<StrictEffect, void, any> {
    const { layerId, blob } = action.payload
    try {
        const layers: DeflatedLayer[] = yield select(selectRawLayers)
        const image: any = window.URL.createObjectURL(blob)
        const changedLayers = layers.map(layer => (layer.id === layerId && layer.image ? { ...layer, image } : layer))

        yield put(changeLayersSuccess(changedLayers))
    } catch (err) {
        logger.error(err)
    }
}

export function* clearProject(): Generator<StrictEffect, void, any> {
    try {
        // historyData.forEach(URL.revokeObjectURL)
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
        yield takeLatest(EDITOR_CHANGE_LAYER_IMAGE, changeLayerImage),
        yield takeLatest(EDITOR_CLEAR_PROJECT, clearProject)
}
