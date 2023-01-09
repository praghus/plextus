import { AnyAction } from '@reduxjs/toolkit'
import { call, put, select } from 'redux-saga/effects'

import logger from '../../../common/utils/logger'
import { compressLayerData } from '../../../common/utils/pako'
import { createImage, get2DContext } from '../../../common/utils/image'
import { TOOLS } from '../../../common/tools'
import {
    changeSelectedArea,
    cropSuccess,
    changeTool,
    changePosition,
    changeSelectedTile,
    changeSelectedStamp
} from '../actions'
import { selectCanvas, selectGrid, selectLayers, selectSelected } from '../selectors'
import { DeflatedLayer, Grid, Layer, Canvas, Selected } from '../types'

function* copySelectedArea(action: AnyAction) {
    try {
        const grid: Grid = yield select(selectGrid)
        const layers: Layer[] = yield select(selectLayers)
        const { area, layerId }: Selected = yield select(selectSelected)
        const { imageCanvas } = action.payload

        const selectedLayer = layers.find(({ id }) => id === layerId)

        if (area && area.width > 0 && area.height > 0) {
            const ctx: CanvasRenderingContext2D = yield get2DContext(imageCanvas)
            const imageData: ImageData = yield ctx.getImageData(area.x, area.y, area.width, area.height)
            const blob: Blob = yield call(createImage, area.width, area.height, imageData)
            const image = window.URL.createObjectURL(blob)
            const left = area.x / grid.width
            const top = area.y / grid.height
            const width = area.width / grid.width
            const height = area.height / grid.height
            const data: (number | null)[] | null = selectedLayer?.data ? new Array(width * height).fill(null) : null

            if (selectedLayer?.data && data) {
                for (let y = 0; y < height; y += 1) {
                    for (let x = 0; x < width; x += 1) {
                        data[x + width * y] =
                            x + left >= 0 && x + left < selectedLayer.width
                                ? selectedLayer.data[x + left + selectedLayer.width * (y + top)] || null
                                : null
                    }
                }
            }
            yield put(changeSelectedStamp({ data, height: area.height, image, width: area.width }))
        }
    } catch (err) {
        logger.error(err)
    }
}

function* paste() {
    try {
        const { stamp }: Selected = yield select(selectSelected)
        if (stamp?.image) {
            yield put(changeSelectedTile(-1))
            yield put(changeTool(TOOLS.STAMP))
        }
    } catch (err) {
        logger.error(err)
    }
}

function* cropArea() {
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

export { copySelectedArea, cropArea, paste }
