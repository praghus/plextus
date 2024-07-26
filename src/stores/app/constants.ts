import { THEMES } from '../../common/constants'
import { IUploadedImage } from '../../common/types'

export const APP_RESOURCE_NAME = 'app'
export const APP_STORAGE_KEY = 'plextus2Storage'
export const APP_CHANGE_LAST_UPDATE_TIME = `${APP_RESOURCE_NAME}/APP_CHANGE_LAST_UPDATE_TIME`
export const APP_CHANGE_IMPORTED_IMAGE = `${APP_RESOURCE_NAME}/APP_CHANGE_IMPORTED_IMAGE`
export const APP_CHANGE_IS_LOADING = `${APP_RESOURCE_NAME}/APP_CHANGE_IS_LOADING`
export const APP_REHYDRATE_STORE_START = `${APP_RESOURCE_NAME}/APP_REHYDRATE_STORE_START`
export const APP_REHYDRATE_STORE_SUCCESS = `${APP_RESOURCE_NAME}/APP_REHYDRATE_STORE_SUCCESS`
export const APP_REHYDRATE_STORE_ERROR = `${APP_RESOURCE_NAME}/APP_REHYDRATE_STORE_ERROR`
export const APP_CHANGE_THEME = `${APP_RESOURCE_NAME}/APP_SWITCH_THEME`

export const INITIAL_STATE = {
    error: null,
    importedImage: undefined as undefined | IUploadedImage,
    isLoading: false,
    lastUpdateTime: performance.now(),
    theme: THEMES.LIGHT
}
