import { AnyAction } from '@reduxjs/toolkit'
import { call, put, select } from 'redux-saga/effects'

import logger from '../../../common/utils/logger'
import { generateReducedPalette, importLayer } from '../../../common/utils/image'
import { compressLayerData } from '../../../common/utils/pako'
import { IMPORT_MODES } from '../../../common/constants'
import { canvasToBlob } from '../../../common/utils/data'
import { clear } from '../../history/actions'
import { changeAppImportedImage, changeAppIsLoading } from '../../app/actions'
import { selectLayers, selectRawLayers, selectTileset } from '../selectors'
import {
    changeCanvasSize,
    changeGridSize,
    changeLayers,
    changeLayersSuccess,
    changePalette,
    changePosition,
    changeProjectName,
    changeSelectedLayer,
    changeTileset,
    changeTilesetImage,
    saveChanges
} from '../actions'
import { DeflatedLayer, Layer, Pallete, Tileset } from '../types'
import { createImageLayer } from '../utils'
import { INITIAL_STATE } from '../constants'

function* changeLayersSaga(action: AnyAction) {
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

function* removeLayer(action: AnyAction) {
    const { layerId } = action.payload
    try {
        const layers: DeflatedLayer[] = yield select(selectRawLayers)
        const changedLayers = layers.filter(({ id }) => id !== layerId)
        yield put(changeLayersSuccess(changedLayers))
    } catch (err) {
        logger.error(err)
    }
}

function* changeLayerProp(layerId: string, value: Record<string, number | string | boolean>) {
    try {
        const layers: DeflatedLayer[] = yield select(selectRawLayers)
        const changedLayers = layers.map(layer => (layer.id === layerId ? { ...layer, ...value } : layer))
        yield put(changeLayersSuccess(changedLayers))
    } catch (err) {
        logger.error(err)
    }
}

function* changeLayerData(action: AnyAction) {
    const { layerId, data } = action.payload
    yield changeLayerProp(layerId, { data: compressLayerData(data) })
}

function* changeLayerImage(action: AnyAction) {
    const { layerId, blob } = action.payload
    yield changeLayerProp(layerId, { image: window.URL.createObjectURL(blob) })
}

function* changeLayerName(action: AnyAction) {
    const { layerId, name } = action.payload
    yield changeLayerProp(layerId, { name })
}

function* changeLayerOffset(action: AnyAction) {
    const { layerId, offset } = action.payload
    yield changeLayerProp(layerId, { offset })
}

function* changeLayerOpacity(action: AnyAction) {
    const { layerId, opacity } = action.payload
    yield changeLayerProp(layerId, { opacity })
}

function* changeLayerVisible(action: AnyAction): Generator {
    const { layerId, visible } = action.payload
    yield changeLayerProp(layerId, { visible })
}

function* createImageLayerFromFile(action: AnyAction) {
    const { config } = action.payload
    try {
        yield put(changeAppIsLoading(true))
        const layers: Layer[] = yield select(selectLayers)
        const layer: Layer = yield createImageLayer(
            config.name,
            config.imageUrl,
            config.resolution.w,
            config.resolution.h
        )
        yield put(changeLayers([...layers, { ...layer }]))
        yield put(changeSelectedLayer(layer.id))
        yield put(changeAppImportedImage())
        yield put(changeAppIsLoading(false))
    } catch (err) {
        logger.error(err)
    }
}

function* createTileLayerFromFile(action: AnyAction) {
    const { config } = action.payload
    try {
        yield put(changeAppIsLoading(true))

        const layers: Layer[] = yield select(selectLayers)
        const tileset: Tileset = yield select(selectTileset)

        const { layer, tilesetCanvas, tilecount } = yield call(importLayer, config.image, config, tileset)
        const { columns, mode, name, tileSize } = config
        const { w: tilewidth, h: tileheight } = tileSize

        const w = layer.width * tilewidth
        const h = layer.height * tileheight

        if (mode === IMPORT_MODES.NEW_PROJECT) {
            yield put(changePosition(0, 0))
            yield put(changeCanvasSize(w, h))
            yield put(changeProjectName(name))
            yield put(changeGridSize(tilewidth, tileheight))
            yield put(changeLayers([{ ...layer, name }]))
            yield put(
                changeTileset({
                    ...INITIAL_STATE.tileset,
                    columns,
                    tilecount,
                    tileheight,
                    tilewidth
                })
            )
        } else if (mode === IMPORT_MODES.NEW_LAYER) {
            yield put(changeLayers([...layers, { ...layer, name }]))
            yield put(
                changeTileset({
                    ...tileset,
                    tilecount
                })
            )
        }

        const tilesetImage: Blob = yield call(canvasToBlob, tilesetCanvas)
        const palette: Pallete = yield call(generateReducedPalette, tilesetImage)

        yield put(changePalette(palette))
        yield put(changeTilesetImage(tilesetImage))
        yield put(changeSelectedLayer(layer.id))
        yield put(saveChanges())
        yield put(clear())
        yield put(changeAppIsLoading(false))
        yield put(changeAppImportedImage())
    } catch (err) {
        logger.error(err)
    }
}

export {
    changeLayersSaga,
    changeLayerData,
    changeLayerImage,
    changeLayerName,
    changeLayerOffset,
    changeLayerOpacity,
    changeLayerProp,
    changeLayerVisible,
    createImageLayerFromFile,
    createTileLayerFromFile,
    removeLayer
}
