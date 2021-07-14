import { AnyAction } from 'redux'
import { put, StrictEffect, select, takeLatest } from 'redux-saga/effects'

import logger from '../../common/utils/logger'
import { clearCache } from '../../common/utils/storage'
import { selectHistoryTilesets } from '../app/selectors'
import { resetToDefaults, changeTilesetImageSuccess } from './actions'
import { EDITOR_CLEAR_PROJECT, EDITOR_SET_TILESET_IMAGE } from './constants'

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
    yield takeLatest(EDITOR_SET_TILESET_IMAGE, setTilesetImage), yield takeLatest(EDITOR_CLEAR_PROJECT, clearProject)
}
