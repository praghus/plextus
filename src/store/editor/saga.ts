import { AnyAction } from 'redux'
import { put, StrictEffect, select, takeLatest, call } from 'redux-saga/effects'
import logger from '../../common/utils/logger'
import { clearCache, setCacheBlob } from '../../common/utils/storage'
import { compressLayerData } from '../../common/utils/pako'
import { TOOLS } from '../../common/constants'
import { changeAppIsLoading } from '../app/actions'
import { selectCanvas, selectGrid, selectLayers, selectRawLayers, selectSelected } from './selectors'
import {
    resetToDefaults,
    changeTilesetImageSuccess,
    changeLayersSuccess,
    removeTileSuccess,
    changeSelectedArea,
    cropSuccess,
    changeTool,
    changePosition
} from './actions'
import { APP_STORAGE_KEY } from '../app/constants'
import {
    EDITOR_CHANGE_LAYERS,
    EDITOR_CHANGE_LAYER_DATA,
    EDITOR_CHANGE_LAYER_IMAGE,
    EDITOR_CHANGE_LAYER_NAME,
    EDITOR_CHANGE_LAYER_OFFSET,
    EDITOR_CHANGE_LAYER_OPACITY,
    EDITOR_CHANGE_LAYER_VISIBLE,
    EDITOR_CLEAR_PROJECT,
    EDITOR_CROP,
    EDITOR_REMOVE_LAYER,
    EDITOR_REMOVE_TILE,
    EDITOR_SAVE_CHANGES,
    EDITOR_SET_TILESET_IMAGE
} from './constants'
import { DeflatedLayer, Grid, Layer, Canvas, Selected } from './types'
import { getStateToSave } from './utils'

export function* clearProject(): Generator<StrictEffect, void, any> {
    try {
        // historyData.forEach(URL.revokeObjectURL)
        clearCache()
        yield put(resetToDefaults())
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

function* changeLayerProp(layerId: string, value: any): Generator<StrictEffect, void, any> {
    try {
        const layers: DeflatedLayer[] = yield select(selectRawLayers)
        const changedLayers = layers.map(layer => (layer.id === layerId ? { ...layer, ...value } : layer))
        yield put(changeLayersSuccess(changedLayers))
    } catch (err) {
        logger.error(err)
    }
}

export function* changeLayerData(action: AnyAction): Generator {
    const { layerId, data } = action.payload
    yield changeLayerProp(layerId, { data: compressLayerData(data) })
}

export function* changeLayerImage(action: AnyAction): Generator {
    const { layerId, blob } = action.payload
    yield changeLayerProp(layerId, { image: window.URL.createObjectURL(blob) })
}

export function* changeLayerName(action: AnyAction): Generator {
    const { layerId, name } = action.payload
    yield changeLayerProp(layerId, { name })
}

export function* changeLayerOffset(action: AnyAction): Generator {
    const { layerId, offset } = action.payload
    yield changeLayerProp(layerId, { offset })
}

export function* changeLayerOpacity(action: AnyAction): Generator {
    const { layerId, opacity } = action.payload
    yield changeLayerProp(layerId, { opacity })
}

export function* changeLayerVisible(action: AnyAction): Generator {
    const { layerId, visible } = action.payload
    yield changeLayerProp(layerId, { visible })
}

export function* cropArea(): Generator<StrictEffect, void, any> {
    try {
        const grid: Grid = yield select(selectGrid)
        const canvas: Canvas = yield select(selectCanvas)
        const layers: Layer[] = yield select(selectLayers)
        const { area }: Selected = yield select(selectSelected)

        if (area && area.width > 0 && area.height > 0) {
            const changedCanvas = {
                ...canvas,
                width: area.width * grid.width,
                height: area.height * grid.height
            }
            const changedLayers = layers.map(layer => {
                if (layer.data) {
                    const changedData: (number | null)[] = new Array(area.width * area.height).fill(null)
                    for (let y = 0; y < area.height; y += 1) {
                        for (let x = 0; x < area.width; x += 1) {
                            changedData[x + area.width * y] =
                                x + area.x >= 0 && x + area.x < layer.width
                                    ? layer.data[x + area.x + layer.width * (y + area.y)] || null
                                    : null
                        }
                    }
                    return {
                        ...layer,
                        width: area.width,
                        height: area.height,
                        data: compressLayerData(changedData)
                    } as DeflatedLayer
                } else {
                    return layer as DeflatedLayer
                }
            })
            yield put(cropSuccess(changedLayers, changedCanvas))
        }
        yield put(changeTool(TOOLS.DRAG))
        yield put(changePosition(0, 0))
        yield put(changeSelectedArea(null))
    } catch (err) {
        logger.error(err)
    }
}

export function* removeLayer(action: AnyAction): Generator<StrictEffect, void, any> {
    const { layerId } = action.payload
    try {
        const layers: DeflatedLayer[] = yield select(selectRawLayers)
        const changedLayers = layers.filter(({ id }) => id !== layerId)
        yield put(changeLayersSuccess(changedLayers))
    } catch (err) {
        logger.error(err)
    }
}

export function* removeTile(action: AnyAction): Generator<StrictEffect, void, any> {
    const { tileId, tileset } = action.payload
    try {
        yield put(changeAppIsLoading(true))
        const layers: Layer[] = yield select(selectLayers)
        const changedLayers = layers.map(layer => {
            if (layer.data) {
                const changedData = layer.data.map(tile =>
                    tile === tileId ? null : (tile > tileId && tile - 1) || tile
                )
                return { ...layer, data: compressLayerData(changedData) } as DeflatedLayer
            } else {
                return layer as DeflatedLayer
            }
        })
        yield put(removeTileSuccess(changedLayers, tileset))
        yield put(changeAppIsLoading(false))
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

export function* setTilesetImage(action: AnyAction): Generator<StrictEffect, void, any> {
    const { blob } = action.payload
    try {
        const image: any = window.URL.createObjectURL(blob)
        yield put(changeTilesetImageSuccess(image))
    } catch (err) {
        logger.error(err)
    }
}

export default function* editorSaga(): Generator {
    yield takeLatest(EDITOR_CLEAR_PROJECT, clearProject),
        yield takeLatest(EDITOR_CHANGE_LAYERS, changeLayers),
        yield takeLatest(EDITOR_CHANGE_LAYER_DATA, changeLayerData),
        yield takeLatest(EDITOR_CHANGE_LAYER_IMAGE, changeLayerImage),
        yield takeLatest(EDITOR_CHANGE_LAYER_NAME, changeLayerName),
        yield takeLatest(EDITOR_CHANGE_LAYER_OFFSET, changeLayerOffset),
        yield takeLatest(EDITOR_CHANGE_LAYER_OPACITY, changeLayerOpacity),
        yield takeLatest(EDITOR_CHANGE_LAYER_VISIBLE, changeLayerVisible),
        yield takeLatest(EDITOR_CROP, cropArea),
        yield takeLatest(EDITOR_REMOVE_LAYER, removeLayer),
        yield takeLatest(EDITOR_REMOVE_TILE, removeTile),
        yield takeLatest(EDITOR_SAVE_CHANGES, saveChanges),
        yield takeLatest(EDITOR_SET_TILESET_IMAGE, setTilesetImage)
}
