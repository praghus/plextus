import React from 'react'
import GridLoader from 'react-spinners/GridLoader'
import Backdrop from '@material-ui/core/Backdrop'
import { makeStyles } from '@material-ui/core/styles'
import { css } from '@emotion/react'

const useStyles = makeStyles(theme => ({
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: '#fff'
    }
}))

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
    const classes = useStyles()
    return (
        <Backdrop className={classes.backdrop} open={loading}>
            <GridLoader css={override} {...{ loading, size, color }} />
        </Backdrop>
    )
}
LoadingIndicator.displayName = 'LoadingIndicator'
LoadingIndicator.defaultProps = {
    size: 15,
    color: '#fff'
}

export default LoadingIndicator