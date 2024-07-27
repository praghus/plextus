import { all, call, put, select, takeLatest } from 'redux-saga/effects'

import {
    EDITOR_CHANGE_LAYERS,
    EDITOR_CHANGE_LAYER_DATA,
    EDITOR_CHANGE_LAYER_IMAGE,
    EDITOR_CHANGE_LAYER_NAME,
    EDITOR_CHANGE_LAYER_OFFSET,
    EDITOR_CHANGE_LAYER_OPACITY,
    EDITOR_CHANGE_LAYER_VISIBLE,
    EDITOR_REMOVE_LAYER,
    EDITOR_CREATE_TILE_LAYER_FROM_FILE,
    EDITOR_CREATE_IMAGE_LAYER_FROM_FILE,
    INITIAL_STATE
} from '../constants'
import logger from '../../../common/utils/logger'
import {
    // generateReducedPalette,
    importLayer
} from '../../../common/utils/image'
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
    // changePalette,
    changePosition,
    changeProjectName,
    changeSelectedLayer,
    changeTileset,
    changeTilesetImage,
    saveChanges
} from '../actions'
import { DeflatedLayer, Layer, /*Pallete,*/ Tileset } from '../types'
import { createImageLayer } from '../utils'
import { AppAction } from '../../store'

function* changeLayersSaga(action: AppAction) {
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

function* removeLayer(action: AppAction) {
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

function* changeLayerData(action: AppAction) {
    const { layerId, data } = action.payload
    yield changeLayerProp(layerId, { data: compressLayerData(data) })
}

function* changeLayerImage(action: AppAction) {
    const { layerId, blob } = action.payload
    yield changeLayerProp(layerId, { image: window.URL.createObjectURL(blob) })
}

function* changeLayerName(action: AppAction) {
    const { layerId, name } = action.payload
    yield changeLayerProp(layerId, { name })
}

function* changeLayerOffset(action: AppAction) {
    const { layerId, offset } = action.payload
    yield changeLayerProp(layerId, { offset })
}

function* changeLayerOpacity(action: AppAction) {
    const { layerId, opacity } = action.payload
    yield changeLayerProp(layerId, { opacity })
}

function* changeLayerVisible(action: AppAction): Generator {
    const { layerId, visible } = action.payload
    yield changeLayerProp(layerId, { visible })
}

function* createImageLayerFromFile(action: AppAction) {
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

function* createTileLayerFromFile(action: AppAction) {
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
        // const palette: Pallete = yield call(generateReducedPalette, tilesetImage);

        // yield put(changePalette(palette));
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

export default function* layersSaga() {
    try {
        yield all([
            takeLatest(EDITOR_CHANGE_LAYERS, changeLayersSaga),
            takeLatest(EDITOR_CHANGE_LAYER_DATA, changeLayerData),
            takeLatest(EDITOR_CHANGE_LAYER_IMAGE, changeLayerImage),
            takeLatest(EDITOR_CHANGE_LAYER_NAME, changeLayerName),
            takeLatest(EDITOR_CHANGE_LAYER_OFFSET, changeLayerOffset),
            takeLatest(EDITOR_CHANGE_LAYER_OPACITY, changeLayerOpacity),
            takeLatest(EDITOR_CHANGE_LAYER_VISIBLE, changeLayerVisible),
            takeLatest(EDITOR_REMOVE_LAYER, removeLayer),
            takeLatest(EDITOR_CREATE_TILE_LAYER_FROM_FILE, createTileLayerFromFile),
            takeLatest(EDITOR_CREATE_IMAGE_LAYER_FROM_FILE, createImageLayerFromFile)
        ])
    } catch (err) {
        logger.error(err)
    }
}
