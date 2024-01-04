import { all } from 'redux-saga/effects'
import { layersSaga, projectSaga, selectionSaga, tilesetSaga } from './sagas'

export default function* editorSaga() {
    yield all([layersSaga(), projectSaga(), selectionSaga(), tilesetSaga()])
}
