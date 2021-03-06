import { Theme } from '@mui/material/styles'

export type ValueOf<T> = T[keyof T]

export interface IMuiTheme {
    theme?: Theme
}

export interface IUploadedImage {
    filename: string
    image: string
}

export interface SelectedTile {
    gid: number | null
    x: number
    y: number
}
