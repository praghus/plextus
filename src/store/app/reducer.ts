import { AnyAction } from "redux";
import { AppState } from "./types";
import {
  APP_REHYDRATE_STORE_SUCCESS,
  APP_REHYDRATE_STORE_ERROR,
  APP_REHYDRATE_STORE_START,
  APP_CHANGE_LAST_UPDATE_TIME,
  APP_CHANGE_IS_LOADING,
  INITIAL_STATE,
} from "./constants";

function appReducer(state = INITIAL_STATE, action: AnyAction): AppState {
  switch (action.type) {
    case APP_REHYDRATE_STORE_START:
      return {
        ...state,
        isLoaded: false,
        error: null,
        isLoading: true,
      };
    case APP_REHYDRATE_STORE_SUCCESS:
      return {
        ...state,
        isLoaded: true,
        error: null,
        isLoading: false,
        lastUpdateTime: performance.now(),
      };
    case APP_REHYDRATE_STORE_ERROR:
      return {
        ...state,
        isLoaded: false,
        error: action.payload?.error.message,
        isLoading: false,
      };
    case APP_CHANGE_LAST_UPDATE_TIME:
      return {
        ...state,
        lastUpdateTime: action.payload.lastUpdateTime,
      };
    case APP_CHANGE_IS_LOADING:
      return {
        ...state,
        isLoading: action.payload.isLoading,
      };
    default:
      return state;
  }
}

export default appReducer;
