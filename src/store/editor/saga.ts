import { AnyAction } from 'redux'
import { put, StrictEffect, takeLatest } from 'redux-saga/effects'

import logger from '../../common/utils/logger'
import { changeTilesetImageSuccess } from './actions'
import { EDITOR_SET_TILESET_IMAGE } from './constants'

export function* setTilesetImage(action: AnyAction): Generator<StrictEffect, void, unknown> {
    const { blob } = action.payload
    try {
        const image: any = window.URL.createObjectURL(blob)
        yield put(changeTilesetImageSuccess(image))
    } catch (err) {
        logger.error(err)
    }
}

/**
 * Editor saga manages watcher lifecycle
 */
export default function* editorSaga(): Generator {
    yield takeLatest(EDITOR_SET_TILESET_IMAGE, setTilesetImage)
}
