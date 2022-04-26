import { AnyAction } from 'redux'
import { AppState } from './types'
import {
    APP_REHYDRATE_STORE_SUCCESS,
    APP_REHYDRATE_STORE_ERROR,
    APP_REHYDRATE_STORE_START,
    APP_CHANGE_IS_NEW_PROJECT_DIALOG_OPEN,
    APP_CHANGE_LAST_UPDATE_TIME,
    APP_CHANGE_IS_LOADING,
    APP_CHANGE_IMPORTED_IMAGE,
    APP_CHANGE_THEME,
    INITIAL_STATE
} from './constants'

function appReducer(state = INITIAL_STATE, action: AnyAction): AppState {
    switch (action.type) {
        case APP_REHYDRATE_STORE_START:
            return {
                ...state,
                error: null,
                isLoading: true
            }
        case APP_REHYDRATE_STORE_SUCCESS:
            return {
                ...state,
                error: null,
                isLoading: false,
                lastUpdateTime: performance.now()
            }
        case APP_REHYDRATE_STORE_ERROR:
            return {
                ...state,
                error: action.payload?.error.message,
                isLoading: false
            }
        case APP_CHANGE_IS_NEW_PROJECT_DIALOG_OPEN:
            return {
                ...state,
                isNewProjectDialogOpen: action.payload.isNewProjectDialogOpen
            }
        case APP_CHANGE_LAST_UPDATE_TIME:
            return {
                ...state,
                lastUpdateTime: action.payload.lastUpdateTime
            }
        case APP_CHANGE_IS_LOADING:
            return {
                ...state,
                isLoading: action.payload.isLoading
            }
        case APP_CHANGE_IMPORTED_IMAGE:
            return {
                ...state,
                importedImage: action.payload.image
            }
        case APP_CHANGE_THEME:
            return {
                ...state,
                theme: action.payload.theme
            }
        default:
            return state
    }
}

export default appReducer
