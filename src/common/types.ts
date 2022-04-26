import { Theme } from '@mui/material/styles'

export type ValueOf<T> = T[keyof T]

export interface StringTMap<T> {
    [key: string]: T
}

export interface NumberTMap<T> {
    [key: number]: T
}

export interface IMuiTheme {
    theme?: Theme
}
