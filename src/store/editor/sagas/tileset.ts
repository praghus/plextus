import { AnyAction } from '@reduxjs/toolkit'
import { all, put, select, takeLatest } from 'redux-saga/effects'

import logger from '../../../common/utils/logger'
import { compressLayerData } from '../../../common/utils/pako'
import { changeAppIsLoading } from '../../app/actions'
import { selectLayers } from '../selectors'
import { changeTilesetImageSuccess, removeTileSuccess } from '../actions'
import { DeflatedLayer, Layer } from '../types'
import { EDITOR_REMOVE_TILE, EDITOR_SET_TILESET_IMAGE } from '../constants'

function* removeTile(action: AnyAction) {
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

function* setTilesetImage(action: AnyAction) {
    const { blob } = action.payload
    try {
        const image: string = window.URL.createObjectURL(blob)
        yield put(changeTilesetImageSuccess(image))
    } catch (err) {
        logger.error(err)
    }
}

export default function* tilesetSaga() {
    yield all([takeLatest(EDITOR_REMOVE_TILE, removeTile), takeLatest(EDITOR_SET_TILESET_IMAGE, setTilesetImage)])
}
