import { AnyAction } from '@reduxjs/toolkit'
import { all, call, put, select, takeLatest } from 'redux-saga/effects'
import { toast } from 'react-toastify'

import {
    EDITOR_CLEAR_PROJECT,
    EDITOR_CREATE_NEW_PROJECT,
    EDITOR_SAVE_CHANGES,
    EDITOR_SAVE_CHANGES_TO_FILE,
    EDITOR_OPEN_PROJECT_FILE
} from '../constants'
import i18n from '../../../common/translations/i18n'
import logger from '../../../common/utils/logger'
import { TOOLS } from '../../../common/tools'
import { clearCache, setCacheBlob } from '../../../common/utils/storage'
import { downloadProjectFile } from '../../../common/utils/data'
import { APP_STORAGE_KEY } from '../../app/constants'
import { clear } from '../../history/actions'
import { INITIAL_STATE } from '../constants'
import { createEmptyLayer, getStateToSave } from '../utils'
import {
    resetToDefaults,
    loadStateFromFile,
    adjustWorkspaceSize,
    changeLayers,
    changeTool,
    changePosition,
    changeCanvasSize,
    changeGridColor,
    changeGridSize,
    changeScale,
    changeSelectedLayer,
    changeSelectedTile,
    changeTileset,
    saveChanges,
    changeProjectName
} from '../actions'
import { selectEditor, selectWorkspace } from '../selectors'
import { EditorState, Layer, Workspace } from '../types'

function* clearProject() {
    try {
        yield clearCache()
        yield put(clear())
        yield put(resetToDefaults())
    } catch (err) {
        logger.error(err)
    }
}

function* openProject(action: AnyAction) {
    const { data } = action.payload
    try {
        yield clearCache()
        yield put(clear())
        yield put(resetToDefaults())
        yield put(loadStateFromFile(data))
        yield put(adjustWorkspaceSize())
    } catch (err) {
        logger.error(err)
    }
}

function* createNewProject(action: AnyAction) {
    const { config } = action.payload
    try {
        const { w, h, columns, tilewidth, tileheight, name } = config
        const workspace: Workspace = yield select(selectWorkspace)
        const layer: Layer = yield createEmptyLayer('Layer 1', w, h)
        const width = w * tilewidth
        const height = h * tileheight
        const newScale = height >= width ? workspace.height / height : workspace.width / width

        yield put(changeScale(newScale))
        yield put(changeProjectName(name))
        yield put(changePosition((workspace.width - width * newScale) / 2, (workspace.height - height * newScale) / 2))
        yield put(changeCanvasSize(width, height))
        yield put(changeGridSize(tilewidth, tileheight))
        yield put(changeGridColor(null))
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

function* saveChangesToStorage() {
    try {
        const editorState: EditorState = yield select(selectEditor)
        const stateToSave: { editor: EditorState } = yield call(() => getStateToSave(editorState))

        yield call(() => setCacheBlob(APP_STORAGE_KEY, JSON.stringify(stateToSave), 'application/json'))
        yield toast.success(i18n.t('i18_project_saved') as string)
        logger.info('Saving to store')
    } catch (err) {
        logger.error(err)
    }
}

function* saveChangesToFile() {
    try {
        const editorState: EditorState = yield select(selectEditor)
        const stateToSave: { editor: EditorState } = yield call(() => getStateToSave(editorState))
        const { canvas, grid, layers, name, palette, tileset, selected } = stateToSave.editor

        yield call(() =>
            downloadProjectFile(
                `${(name || 'project').toLowerCase()}.plextus`,
                JSON.stringify({
                    canvas,
                    grid,
                    layers,
                    name,
                    palette,
                    selected,
                    tileset
                })
            )
        )
        logger.info('Saving to file')
    } catch (err) {
        logger.error(err)
    }
}

export default function* projectSaga() {
    yield all([
        takeLatest(EDITOR_CLEAR_PROJECT, clearProject),
        takeLatest(EDITOR_OPEN_PROJECT_FILE, openProject),
        takeLatest(EDITOR_SAVE_CHANGES, saveChangesToStorage),
        takeLatest(EDITOR_SAVE_CHANGES_TO_FILE, saveChangesToFile),
        takeLatest(EDITOR_CREATE_NEW_PROJECT, createNewProject)
    ])
}
