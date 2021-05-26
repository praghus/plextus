import {
  APP_CHANGE_LAST_UPDATE_TIME,
  APP_CHANGE_IS_LOADING,
} from "./constants";

// export interface IChangeAppIsLoading extends Action<"changeAppIsLoading"> {
//   isLoading: boolean;
// }
// export interface IChangeLastUpdateTime extends Action<"IChangeLastUpdateTime"> {
//   lastUpdateTime: number;
// }

export const changeAppIsLoading = (isLoading: boolean) =>
  ({
    type: APP_CHANGE_IS_LOADING,
    payload: { isLoading },
  } as const);

export const changeLastUpdateTime = (lastUpdateTime: number) =>
  ({
    type: APP_CHANGE_LAST_UPDATE_TIME,
    payload: { lastUpdateTime },
  } as const);

// export type AppActions =
//   | ReturnType<typeof changeAppIsLoading>
//   | ReturnType<typeof changeLastUpdateTime>;
