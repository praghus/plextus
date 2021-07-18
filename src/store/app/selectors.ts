import { createSelector } from 'reselect'
import { isEmpty } from 'lodash'
import { store } from '../store'
import { selectHistory } from '../history/selectors'
import { AppState } from './types'
import { APP_RESOURCE_NAME, INITIAL_STATE } from './constants'

type RootState = ReturnType<typeof store.getState>

export const selectApp = (state: RootState): AppState => state[APP_RESOURCE_NAME] || INITIAL_STATE

export const selectRoute = (state: RootState) => state.router

export const selectLastUpdateTime = createSelector<typeof selectApp, AppState, number>(
    selectApp,
    ({ lastUpdateTime }) => lastUpdateTime
)

export const selectIsLoading = createSelector<typeof selectApp, AppState, boolean>(
    selectApp,
    ({ isLoading }) => isLoading
)

export const selectLocation = createSelector<typeof selectRoute, RootState, string>(
    selectRoute,
    ({ location }) => location
)

export const selectIsImportDialogOpen = createSelector<typeof selectApp, AppState, boolean>(
    selectApp,
    ({ isImportDialogOpen }) => isImportDialogOpen
)

export const selectIsNewProjectDialogOpen = createSelector<typeof selectApp, AppState, boolean>(
    selectApp,
    ({ isNewProjectDialogOpen }) => isNewProjectDialogOpen
)

export const selectIsLoaded = createSelector<typeof selectApp, AppState, boolean>(
    selectApp,
    ({ isLoading, isLoaded }) => !isLoading && isLoaded
)

export const selectIsPristine = createSelector<typeof selectHistory, RootState, boolean>(
    selectHistory,
    ({ undo, redo }) => isEmpty(undo) && isEmpty(redo)
)

export const selectHistoryTilesets = createSelector<typeof selectHistory, RootState, string[]>(
    selectHistory,
    ({ undo, redo }) => {
        const undoImages = undo.map(({ before }) => before.tileset && before.tileset.image)
        const redoImages = redo.map(({ before }) => before.tileset && before.tileset.image)
        return [...undoImages, ...redoImages]
    }
)
