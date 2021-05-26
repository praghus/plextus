import { createSelector, Selector } from "reselect";
import { isEmpty } from "lodash";
import { RootState } from "../store";
import { AppState } from "./types";
import {
  APP_RESOURCE_NAME,
  INITIAL_STATE,
  APP_UNDO_HISTORY_RESOURCE_NAME,
} from "./constants";

const selectApp = (state: RootState): AppState =>
  state[APP_RESOURCE_NAME] || INITIAL_STATE;

const selectRoute = (state: RootState) => state.router;

const selectUndoHistory = (state: RootState) =>
  state[APP_UNDO_HISTORY_RESOURCE_NAME];

const selectLastUpdateTime = createSelector<typeof selectApp, AppState, number>(
  selectApp,
  ({ lastUpdateTime }) => lastUpdateTime,
);

const selectIsLoading = createSelector<typeof selectApp, AppState, boolean>(
  selectApp,
  ({ isLoading }) => isLoading,
);

const selectIsLoaded = createSelector<typeof selectApp, AppState, boolean>(
  selectApp,
  ({ isLoading, isLoaded }) => !isLoading && isLoaded,
);

const selectLocation = createSelector<typeof selectRoute, RootState, string>(
  selectRoute,
  ({ location }) => location,
);

const selectIsPristine = createSelector<
  typeof selectUndoHistory,
  RootState,
  boolean
>(
  selectUndoHistory,
  ({ undoQueue, redoQueue }) => isEmpty(undoQueue) && isEmpty(redoQueue),
);

export {
  selectApp,
  selectIsLoading,
  selectIsLoaded,
  selectIsPristine,
  selectLastUpdateTime,
  selectLocation,
};
