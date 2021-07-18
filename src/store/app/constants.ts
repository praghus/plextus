export const APP_RESOURCE_NAME = 'app'
export const APP_STORAGE_KEY = 'griderState'
export const APP_UNDO_HISTORY_LIMIT = 20

export const APP_CHANGE_LAST_UPDATE_TIME = `${APP_RESOURCE_NAME}/APP_CHANGE_LAST_UPDATE_TIME`
export const APP_CHANGE_IS_LOADING = `${APP_RESOURCE_NAME}/APP_CHANGE_IS_LOADING`
export const APP_CHANGE_IS_IMPORT_DIALOG_OPEN = `${APP_RESOURCE_NAME}/APP_CHANGE_IS_IMPORT_DIALOG_OPEN`
export const APP_CHANGE_IS_NEW_PROJECT_DIALOG_OPEN = `${APP_RESOURCE_NAME}/APP_CHANGE_IS_NEW_PROJECT_DIALOG_OPEN`
export const APP_REHYDRATE_STORE_START = `${APP_RESOURCE_NAME}/APP_REHYDRATE_STORE_START`
export const APP_REHYDRATE_STORE_SUCCESS = `${APP_RESOURCE_NAME}/APP_REHYDRATE_STORE_SUCCESS`
export const APP_REHYDRATE_STORE_ERROR = `${APP_RESOURCE_NAME}/APP_REHYDRATE_STORE_ERROR`

export const INITIAL_STATE = {
    error: null,
    isLoading: false,
    isLoaded: true,
    isImportDialogOpen: false,
    isNewProjectDialogOpen: false,
    lastUpdateTime: performance.now()
}
