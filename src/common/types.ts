export type ValueOf<T> = T[keyof T];

export type ActionType<TActions extends { [k: string]: any }> = ReturnType<
  ValueOf<TActions>
>;

export interface StringTMap<T> {
  [key: string]: T;
}

export interface NumberTMap<T> {
  [key: number]: T;
}
