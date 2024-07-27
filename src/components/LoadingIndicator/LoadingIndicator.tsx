import GridLoader from 'react-spinners/GridLoader'
import Backdrop from '@mui/material/Backdrop'
import { useTheme } from '@mui/material/styles'

import { cssOverride } from './LoadingIndicator.styled'

interface Props {
    color?: string
    loading: boolean
}

const LoadingIndicator = ({ color, loading }: Props) => {
    const theme = useTheme()
    return (
        <Backdrop sx={{ color: '#fff', zIndex: theme.zIndex.drawer + 1 }} open={loading}>
            <GridLoader size={15} {...{ color, cssOverride, loading }} />
        </Backdrop>
    )
}

LoadingIndicator.displayName = 'LoadingIndicator'

export default LoadingIndicator
