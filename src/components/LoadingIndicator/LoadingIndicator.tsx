import React from 'react'
import GridLoader from 'react-spinners/GridLoader'
import Backdrop from '@mui/material/Backdrop'
import { useTheme } from '@mui/material/styles'

import { override } from './LoadingIndicator.styled'

interface Props {
    color?: string
    loading: boolean
    size?: number
}

const LoadingIndicator = ({ color, loading, size }: Props) => {
    const theme = useTheme()
    return (
        <Backdrop sx={{ color: '#fff', zIndex: theme.zIndex.drawer + 1 }} open={loading}>
            <GridLoader css={override} {...{ color, loading, size }} />
        </Backdrop>
    )
}

LoadingIndicator.defaultProps = {
    color: '#fff',
    size: 15
}

export default LoadingIndicator
