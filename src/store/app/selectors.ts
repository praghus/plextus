import { createSelector } from 'reselect'
import { store } from '../store'
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
