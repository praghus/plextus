import React, { useCallback, useState } from 'react'
import styled from '@emotion/styled'
import { debounce } from 'lodash'
import { useDispatch, useSelector } from 'react-redux'
import { ColorPicker } from 'material-ui-color'
import { makeStyles } from '@material-ui/core/styles'
import { Card, CardContent, Grid, InputAdornment, Slider, TextField, Typography } from '@material-ui/core'
import { selectGrid, selectSelected } from '../store/editor/selectors'
import { changeGridColor, changeGridPitch, changeToolSize } from '../store/editor/actions'
import { rgbaToHex } from '../common/utils/colors'
import { Create as CreateIcon } from '@material-ui/icons'

const useStyles = makeStyles(theme => ({
    root: {
        '& > *': {
            padding: theme.spacing(1)
        }
    },
    card: {
        marginBottom: theme.spacing(2)
    },
    grid: {
        marginBottom: theme.spacing(1)
    },
    input: {
        width: 42
    }
}))

const StyledPropContainer = styled.div`
    display: flex;
    align-items: center;
`

const PropertiesTab = (): JSX.Element => {
    const grid = useSelector(selectGrid)
    const selected = useSelector(selectSelected)
    const classes = useStyles()

    const [gridColor, setGridColor] = useState<any>(rgbaToHex(grid.color))
    const [toolSize, setToolSize] = useState<number>(selected.toolSize)

    const dispatch = useDispatch()
    const onChangeGridPitch = (pitch: number) => dispatch(changeGridPitch(pitch))
    const onChangeToolSize = (size: number) => dispatch(changeToolSize(size))

    const onChangeGridColor = useCallback(
        debounce((color: number[]) => dispatch(changeGridColor(color)), 500),
        []
    )

    return (
        <Card className={classes.card}>
            <CardContent>
                <Typography variant="subtitle1">Pixel tool size</Typography>

                <Grid container spacing={2} alignItems="center" className={classes.grid}>
                    <Grid item>
                        <CreateIcon />
                    </Grid>
                    <Grid item xs>
                        <Slider
                            min={1}
                            max={4}
                            marks
                            value={typeof toolSize === 'number' ? toolSize : 0}
                            onChange={(event, value) => setToolSize(value as number)}
                            onChangeCommitted={(event, value) => {
                                Number.isInteger(value) && value > 0 && onChangeToolSize(value as number)
                            }}
                        />
                    </Grid>
                    <Grid item>{toolSize} pixels</Grid>
                </Grid>

                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <Typography variant="subtitle1">Grid pitch every</Typography>
                        <StyledPropContainer>
                            <TextField
                                type="number"
                                value={grid.pitch}
                                onChange={event => {
                                    const pitch = parseInt(event.target.value)
                                    Number.isInteger(pitch) && pitch >= 0 && onChangeGridPitch(pitch)
                                }}
                                InputProps={{
                                    inputProps: { min: 0 },
                                    endAdornment: <InputAdornment position="end">tiles</InputAdornment>
                                }}
                            />
                        </StyledPropContainer>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="subtitle1">Grid color</Typography>
                        <StyledPropContainer>
                            <ColorPicker
                                // hideTextfield
                                value={gridColor}
                                onChange={color => {
                                    setGridColor(color)
                                    color.rgb && onChangeGridColor(color.rgb)
                                }}
                            />
                        </StyledPropContainer>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    )
}

export default PropertiesTab
