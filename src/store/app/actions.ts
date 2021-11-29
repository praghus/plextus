import {
    APP_CHANGE_LAST_UPDATE_TIME,
    APP_CHANGE_IS_LOADING,
    APP_CHANGE_IS_IMPORT_DIALOG_OPEN,
    APP_CHANGE_IS_NEW_PROJECT_DIALOG_OPEN
} from './constants'

export const changeAppIsLoading = (isLoading: boolean) =>
    ({
        payload: { isLoading },
        type: APP_CHANGE_IS_LOADING
    } as const)

export const changeLastUpdateTime = (lastUpdateTime: number) =>
    ({
        payload: { lastUpdateTime },
        type: APP_CHANGE_LAST_UPDATE_TIME
    } as const)

export const changeAppIsImportDialogOpen = (isImportDialogOpen: boolean) =>
    ({
        payload: { isImportDialogOpen },
        type: APP_CHANGE_IS_IMPORT_DIALOG_OPEN
    } as const)

export const changeAppIsNewProjectDialogOpen = (isNewProjectDialogOpen: boolean) =>
    ({
        payload: { isNewProjectDialogOpen },
        type: APP_CHANGE_IS_NEW_PROJECT_DIALOG_OPEN
    } as const)
