import { IUploadedImage } from '../../common/types'
import {
    APP_CHANGE_LAST_UPDATE_TIME,
    APP_CHANGE_IMPORTED_IMAGE,
    APP_CHANGE_IS_LOADING,
    APP_CHANGE_THEME
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

export const changeAppImportedImage = (image?: IUploadedImage) =>
    ({
        payload: { image },
        type: APP_CHANGE_IMPORTED_IMAGE
    } as const)

export const changeAppTheme = (theme: string) =>
    ({
        payload: { theme },
        type: APP_CHANGE_THEME
    } as const)
