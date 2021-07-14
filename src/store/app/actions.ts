import {
    APP_CHANGE_LAST_UPDATE_TIME,
    APP_CHANGE_IS_LOADING,
    APP_CHANGE_IS_IMPORT_DIALOG_OPEN,
    APP_CHANGE_IS_NEW_PROJECT_DIALOG_OPEN
} from './constants'

export const changeAppIsLoading = (isLoading: boolean) =>
    ({
        type: APP_CHANGE_IS_LOADING,
        payload: { isLoading }
    } as const)

export const changeLastUpdateTime = (lastUpdateTime: number) =>
    ({
        type: APP_CHANGE_LAST_UPDATE_TIME,
        payload: { lastUpdateTime }
    } as const)

export const changeAppIsImportDialogOpen = (isImportDialogOpen: boolean) =>
    ({
        type: APP_CHANGE_IS_IMPORT_DIALOG_OPEN,
        payload: { isImportDialogOpen }
    } as const)

export const changeAppIsNewProjectDialogOpen = (isNewProjectDialogOpen: boolean) =>
    ({
        type: APP_CHANGE_IS_NEW_PROJECT_DIALOG_OPEN,
        payload: { isNewProjectDialogOpen }
    } as const)
