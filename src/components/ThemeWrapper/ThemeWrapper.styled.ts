import { createTheme } from '@mui/material/styles'
import { css } from '@emotion/react'

import { THEMES } from '../../common/constants'

export const lightTheme = createTheme({ palette: { mode: THEMES.LIGHT } })
export const darkTheme = createTheme({ palette: { mode: THEMES.DARK } })

export const styles = css`
    html {
        scroll-behavior: smooth;
    }
    body {
        margin: 0;
        padding: 0;
        height: 100%;
        width: 100%;
        overflow: hidden;
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    }
`
