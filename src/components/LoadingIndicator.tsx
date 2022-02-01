import React from 'react'
import GridLoader from 'react-spinners/GridLoader'
import Backdrop from '@mui/material/Backdrop'
import { useTheme } from '@mui/material/styles'
import { css } from '@emotion/react'

const override = css`
    margin: 2em auto;
    position: absolute;
    top: 50%;
    left: 50%;
    width: 64px;
    height: 64px;
    margin-left: -32px;
    margin-top: -32px;
    z-index: 100;
`

type Props = {
    color: string
    loading: boolean
    size: number
}

const LoadingIndicator = ({ color, loading, size }: Props): JSX.Element => {
    const theme = useTheme()
    return (
        <Backdrop sx={{ color: '#fff', zIndex: theme.zIndex.drawer + 1 }} open={loading}>
            <GridLoader css={override} {...{ color, loading, size }} />
        </Backdrop>
    )
}
LoadingIndicator.displayName = 'LoadingIndicator'
LoadingIndicator.defaultProps = {
    color: '#fff',
    size: 15
}

export default LoadingIndicator
