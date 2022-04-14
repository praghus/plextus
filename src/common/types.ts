export type ValueOf<T> = T[keyof T]

export interface StringTMap<T> {
    [key: string]: T
}

export interface NumberTMap<T> {
    [key: number]: T
}
