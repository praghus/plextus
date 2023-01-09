import { takeLatest } from 'redux-saga/effects'

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
    EDITOR_COPY_SELECTED_AREA,
    EDITOR_CROP,
    EDITOR_REMOVE_LAYER,
    EDITOR_REMOVE_TILE,
    EDITOR_SAVE_CHANGES,
    EDITOR_SAVE_CHANGES_TO_FILE,
    EDITOR_SET_TILESET_IMAGE,
    EDITOR_CREATE_TILE_LAYER_FROM_FILE,
    EDITOR_CREATE_IMAGE_LAYER_FROM_FILE,
    EDITOR_OPEN_PROJECT_FILE,
    EDITOR_PASTE
} from '../constants'
import {
    changeLayersSaga,
    changeLayerData,
    changeLayerImage,
    changeLayerName,
    changeLayerOffset,
    changeLayerOpacity,
    changeLayerVisible,
    createImageLayerFromFile,
    createTileLayerFromFile,
    removeLayer
} from './layerSagas'
import { clearProject, createNewProject, openProject, saveChangesToFile, saveChangesToStorage } from './projectSagas'
import { copySelectedArea, cropArea, paste } from './selectionSagas'
import { removeTile, setTilesetImage } from './tilesetSagas'

export default function* editorSaga() {
    yield takeLatest(EDITOR_CLEAR_PROJECT, clearProject),
        yield takeLatest(EDITOR_CHANGE_LAYERS, changeLayersSaga),
        yield takeLatest(EDITOR_CHANGE_LAYER_DATA, changeLayerData),
        yield takeLatest(EDITOR_CHANGE_LAYER_IMAGE, changeLayerImage),
        yield takeLatest(EDITOR_CHANGE_LAYER_NAME, changeLayerName),
        yield takeLatest(EDITOR_CHANGE_LAYER_OFFSET, changeLayerOffset),
        yield takeLatest(EDITOR_CHANGE_LAYER_OPACITY, changeLayerOpacity),
        yield takeLatest(EDITOR_CHANGE_LAYER_VISIBLE, changeLayerVisible),
        yield takeLatest(EDITOR_COPY_SELECTED_AREA, copySelectedArea),
        yield takeLatest(EDITOR_CROP, cropArea),
        yield takeLatest(EDITOR_OPEN_PROJECT_FILE, openProject),
        yield takeLatest(EDITOR_PASTE, paste),
        yield takeLatest(EDITOR_REMOVE_LAYER, removeLayer),
        yield takeLatest(EDITOR_REMOVE_TILE, removeTile),
        yield takeLatest(EDITOR_SAVE_CHANGES, saveChangesToStorage),
        yield takeLatest(EDITOR_SAVE_CHANGES_TO_FILE, saveChangesToFile),
        yield takeLatest(EDITOR_SET_TILESET_IMAGE, setTilesetImage),
        yield takeLatest(EDITOR_CREATE_NEW_PROJECT, createNewProject),
        yield takeLatest(EDITOR_CREATE_TILE_LAYER_FROM_FILE, createTileLayerFromFile),
        yield takeLatest(EDITOR_CREATE_IMAGE_LAYER_FROM_FILE, createImageLayerFromFile)
}
