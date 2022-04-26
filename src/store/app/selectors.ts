import { createSelector } from 'reselect'
import { store } from '../store'
import { AppState } from './types'
import { APP_RESOURCE_NAME, INITIAL_STATE } from './constants'

type RootState = ReturnType<typeof store.getState>

export const selectApp = (state: RootState): AppState => state[APP_RESOURCE_NAME] || INITIAL_STATE
export const selectIsLoading = createSelector(selectApp, ({ isLoading }) => isLoading)
export const selectLastUpdateTime = createSelector(selectApp, ({ lastUpdateTime }) => lastUpdateTime)
export const selectImportedImage = createSelector(selectApp, ({ importedImage }) => importedImage)
export const selectIsImportDialogOpen = createSelector(selectApp, ({ importedImage }) => !!importedImage)
export const selectIsNewProjectDialogOpen = createSelector(
    selectApp,
    ({ isNewProjectDialogOpen }) => isNewProjectDialogOpen
)
export const selectAppTheme = createSelector(selectApp, ({ theme }) => theme)
