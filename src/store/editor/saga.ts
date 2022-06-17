import { AnyAction } from 'redux'
import { call, put, select, takeLatest } from 'redux-saga/effects'
import { toast } from 'react-toastify'
import i18n from '../../common/translations/i18n'
import logger from '../../common/utils/logger'
import { importLayer, generateReducedPalette, reduceColors } from '../../common/utils/image'
import { clearCache, setCacheBlob } from '../../common/utils/storage'
import { compressLayerData } from '../../common/utils/pako'
import { canvasToBlob } from '../../common/utils/data'
import { IUploadedImage } from '../../common/types'
import { IMPORT_MODES, TOOLS } from '../../common/constants'
import { selectImportedImage } from '../app/selectors'
import { changeAppImportedImage, changeAppIsLoading } from '../app/actions'
import {
    selectCanvas,
    selectGrid,
    selectLayers,
    selectRawLayers,
    selectSelected,
    selectTileset,
    selectWorkspace
} from './selectors'
import {
    resetToDefaults,
    changeTilesetImageSuccess,
    changeLayersSuccess,
    removeTileSuccess,
    changeSelectedArea,
    cropSuccess,
    changeLayers,
    changeTool,
    changePosition,
    changeCanvasSize,
    changeGridSize,
    changeScale,
    changeSelectedLayer,
    changeSelectedTile,
    changeTileset,
    saveChanges,
    changeTilesetImage,
    changePalette,
    changeProjectName
} from './actions'
import { clear } from '../history/actions'
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
    EDITOR_CREATE_NEW_PROJECT,
    EDITOR_CROP,
    EDITOR_REMOVE_LAYER,
    EDITOR_REMOVE_TILE,
    EDITOR_SAVE_CHANGES,
    EDITOR_SET_TILESET_IMAGE,
    EDITOR_CREATE_TILE_LAYER_FROM_FILE,
    INITIAL_STATE,
    EDITOR_CREATE_IMAGE_LAYER_FROM_FILE
} from './constants'
import { DeflatedLayer, Grid, Layer, Canvas, Selected, Tileset } from './types'
import { createEmptyLayer, createImageLayer, getStateToSave } from './utils'
import { SagaIterator } from 'redux-saga'

export function* clearProject(): SagaIterator<void> {
    try {
        // historyData.forEach(URL.revokeObjectURL)
        clearCache()
        yield put(resetToDefaults())
    } catch (err) {
        logger.error(err)
    }
}

export function* changeLayersSaga(action: AnyAction): SagaIterator<void> {
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

function* changeLayerProp(layerId: string, value: Record<string, number | string | boolean>): SagaIterator<void> {
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

export function* cropArea(): SagaIterator<void> {
    try {
        const grid: Grid = yield select(selectGrid)
        const canvas: Canvas = yield select(selectCanvas)
        const layers: Layer[] = yield select(selectLayers)
        const { area }: Selected = yield select(selectSelected)

        if (area && area.width > 0 && area.height > 0) {
            const changedCanvas = {
                ...canvas,
                height: area.height * grid.height,
                width: area.width * grid.width
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
                        data: compressLayerData(changedData),
                        height: area.height,
                        width: area.width
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

export function* removeLayer(action: AnyAction): SagaIterator<void> {
    const { layerId } = action.payload
    try {
        const layers: DeflatedLayer[] = yield select(selectRawLayers)
        const changedLayers = layers.filter(({ id }) => id !== layerId)
        yield put(changeLayersSuccess(changedLayers))
    } catch (err) {
        logger.error(err)
    }
}

export function* removeTile(action: AnyAction): SagaIterator<void> {
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

export function* saveChangesSaga(): SagaIterator<void> {
    try {
        const state = yield select(state => state)
        const toSave = yield call(() => getStateToSave(state))
        yield call(() => setCacheBlob(APP_STORAGE_KEY, JSON.stringify(toSave), 'application/json'))
        toast.success(i18n.t('i18_map_saved') as string)
        logger.info('Saving to store')
    } catch (err) {
        logger.error(err)
    }
}

export function* setTilesetImage(action: AnyAction): SagaIterator<void> {
    const { blob } = action.payload
    try {
        const image: string = window.URL.createObjectURL(blob)
        yield put(changeTilesetImageSuccess(image))
    } catch (err) {
        logger.error(err)
    }
}

export function* createNewProject(action: AnyAction): SagaIterator<void> {
    const { config } = action.payload
    try {
        const workspace = yield select(selectWorkspace)
        const { w, h, columns, tilewidth, tileheight, name } = config
        const width = w * tilewidth
        const height = h * tileheight
        const newScale = height >= width ? workspace.height / height : workspace.width / width
        const layer = createEmptyLayer('Layer 1', w, h)

        yield put(changeScale(newScale))
        yield put(changeProjectName(name))
        yield put(changePosition((workspace.width - width * newScale) / 2, (workspace.height - height * newScale) / 2))
        yield put(changeCanvasSize(width, height))
        yield put(changeGridSize(tilewidth, tileheight))
        yield put(changeLayers([layer]))
        yield put(changeSelectedLayer(layer.id))
        yield put(changeSelectedTile(1))
        yield put(changeTool(TOOLS.DRAG))
        yield put(
            changeTileset({
                ...INITIAL_STATE.tileset,
                columns,
                tilecount: 1,
                tileheight,
                tilewidth
            })
        )
        yield put(clear())
        yield put(saveChanges())
    } catch (err) {
        logger.error(err)
    }
}

export function* createImageLayerFromFile(action: AnyAction): SagaIterator<void> {
    const { config } = action.payload
    try {
        yield put(changeAppIsLoading(true))
        const importedImage: IUploadedImage = yield select(selectImportedImage)
        const layers: Layer[] = yield select(selectLayers)
        const layer = createImageLayer(config.name, importedImage.image, config.resolution.w, config.resolution.h)
        yield put(changeLayers([...layers, { ...layer }]))
        yield put(changeSelectedLayer(layer.id))
        yield put(changeAppImportedImage())
        yield put(changeAppIsLoading(false))
    } catch (err) {
        logger.error(err)
    }
}

export function* createTileLayerFromFile(action: AnyAction): SagaIterator<void> {
    const { image, config } = action.payload
    try {
        yield put(changeAppIsLoading(true))
        yield put(changeAppImportedImage())

        const layers: Layer[] = yield select(selectLayers)
        const tileset: Tileset = yield select(selectTileset)

        const { layer, tilesetCanvas, tilecount } = yield call(importLayer, image, config, tileset)
        const { columns, colorsCount, mode, name, tileSize, reducedColors } = config
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

        const tilesetImage = reducedColors
            ? yield call(reduceColors, tilesetCanvas, colorsCount)
            : yield call(canvasToBlob, tilesetCanvas)

        const palette = yield call(generateReducedPalette, tilesetImage)

        yield put(changePalette(palette))
        yield put(changeTilesetImage(tilesetImage))
        yield put(changeSelectedLayer(layer.id))
        yield put(saveChanges())
        yield put(clear())
        yield put(changeAppIsLoading(false))
    } catch (err) {
        logger.error(err)
    }
}

export default function* editorSaga(): Generator {
    yield takeLatest(EDITOR_CLEAR_PROJECT, clearProject),
        yield takeLatest(EDITOR_CHANGE_LAYERS, changeLayersSaga),
        yield takeLatest(EDITOR_CHANGE_LAYER_DATA, changeLayerData),
        yield takeLatest(EDITOR_CHANGE_LAYER_IMAGE, changeLayerImage),
        yield takeLatest(EDITOR_CHANGE_LAYER_NAME, changeLayerName),
        yield takeLatest(EDITOR_CHANGE_LAYER_OFFSET, changeLayerOffset),
        yield takeLatest(EDITOR_CHANGE_LAYER_OPACITY, changeLayerOpacity),
        yield takeLatest(EDITOR_CHANGE_LAYER_VISIBLE, changeLayerVisible),
        yield takeLatest(EDITOR_CROP, cropArea),
        yield takeLatest(EDITOR_REMOVE_LAYER, removeLayer),
        yield takeLatest(EDITOR_REMOVE_TILE, removeTile),
        yield takeLatest(EDITOR_SAVE_CHANGES, saveChangesSaga),
        yield takeLatest(EDITOR_SET_TILESET_IMAGE, setTilesetImage),
        yield takeLatest(EDITOR_CREATE_NEW_PROJECT, createNewProject),
        yield takeLatest(EDITOR_CREATE_TILE_LAYER_FROM_FILE, createTileLayerFromFile),
        yield takeLatest(EDITOR_CREATE_IMAGE_LAYER_FROM_FILE, createImageLayerFromFile)
}
