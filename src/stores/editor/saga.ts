import { all } from 'redux-saga/effects'
import logger from '../../common/utils/logger'
import { layersSaga, projectSaga, selectionSaga, tilesetSaga } from './sagas'

export default function* editorSaga() {
    try {
        yield all([layersSaga(), projectSaga(), selectionSaga(), tilesetSaga()])
    } catch (err) {
        logger.error(err)
    }
}
