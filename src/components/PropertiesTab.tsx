import React, { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { debounce } from 'lodash'
import { makeStyles } from '@material-ui/core/styles'
import { Card, CardContent, InputAdornment, TextField, Typography } from '@material-ui/core'
import { selectSelected } from '../store/editor/selectors'
import { changeToolSize } from '../store/editor/actions'

const useStyles = makeStyles(theme => ({
    root: {
        '& > *': {
            padding: theme.spacing(1)
        }
    },
    card: {
        marginBottom: theme.spacing(2)
    },
    inputNarrow: {
        marginTop: theme.spacing(2),
        marginRight: theme.spacing(1),
        width: '140px'
    }
}))

const PropertiesTab = (): JSX.Element => {
    const selected = useSelector(selectSelected)
    const classes = useStyles()

    const dispatch = useDispatch()
    const onChangeToolSize = (size: number[]) => dispatch(changeToolSize(size))

    return (
        <Card className={classes.card}>
            <CardContent>
                <Typography variant="h6">Pixel tool size</Typography>
                <TextField
                    className={classes.inputNarrow}
                    type="number"
                    value={selected.toolSize[0]}
                    onChange={event => {
                        const w = parseInt(event.target.value)
                        Number.isInteger(w) && w > 0 && onChangeToolSize([w, selected.toolSize[1]])
                    }}
                    InputProps={{
                        inputProps: { min: 1 },
                        endAdornment: <InputAdornment position="end">pixels</InputAdornment>
                    }}
                    label="Width"
                    size="small"
                    variant="outlined"
                />
                <TextField
                    className={classes.inputNarrow}
                    type="number"
                    value={selected.toolSize[1]}
                    onChange={event => {
                        const w = parseInt(event.target.value)
                        Number.isInteger(w) && w > 0 && onChangeToolSize([selected.toolSize[0], w])
                    }}
                    InputProps={{
                        inputProps: { min: 1 },
                        endAdornment: <InputAdornment position="end">pixels</InputAdornment>
                    }}
                    label="Height"
                    size="small"
                    variant="outlined"
                />
            </CardContent>
        </Card>
    )
}

export default PropertiesTab
