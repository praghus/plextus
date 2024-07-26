import React from 'react'
import { ThemeProvider } from '@mui/material/styles'
import { useSelector } from 'react-redux'
import { Global } from '@emotion/react'

import { THEMES } from '../../common/constants'
import { selectAppTheme } from '../../stores/app/selectors'
import { lightTheme, darkTheme, styles } from './ThemeWrapper.styled'

interface Props {
    children?: React.ReactNode
}

const ThemeWrapper = ({ children }: Props) => {
    const appTheme = useSelector(selectAppTheme)
    return (
        <ThemeProvider theme={appTheme === THEMES.DARK ? darkTheme : lightTheme}>
            <Global {...{ styles }} />
            {children}
        </ThemeProvider>
    )
}
ThemeWrapper.displayName = 'ThemeWrapper'

export default ThemeWrapper
