import React, { useCallback, useState } from 'react'
import styled from '@emotion/styled'
import { debounce } from 'lodash'
import { useDispatch, useSelector } from 'react-redux'
import { ColorPicker } from 'material-ui-color'
import { makeStyles } from '@material-ui/core/styles'
import { Card, CardContent, Grid, InputAdornment, Slider, TextField, Typography } from '@material-ui/core'
import { selectCanvas, selectGrid, selectSelected } from '../store/editor/selectors'
import { changeCanvasBackground, changeGridColor, changeGridPitch, changeToolSize } from '../store/editor/actions'
import { rgbaToHex } from '../common/utils/colors'
import { Create as CreateIcon } from '@material-ui/icons'

const useStyles = makeStyles(theme => ({
    card: {
        marginBottom: theme.spacing(2)
    },
    grid: {
        marginBottom: theme.spacing(1)
    },
    input: {
        width: 42
    },
    root: {
        '& > *': {
            padding: theme.spacing(1)
        }
    }
}))

const StyledPropContainer = styled.div`
    display: flex;
    align-items: center;
`

const PropertiesTab = (): JSX.Element => {
    const canvas = useSelector(selectCanvas)
    const grid = useSelector(selectGrid)
    const selected = useSelector(selectSelected)
    const classes = useStyles()

    const [canvasBackground, setCanvasBackground] = useState<any>(rgbaToHex(canvas.background || [0, 0, 0, 0]))
    const [gridColor, setGridColor] = useState<any>(rgbaToHex(grid.color))
    const [toolSize, setToolSize] = useState<number>(selected.toolSize)

    const dispatch = useDispatch()
    const onChangeGridPitch = (pitch: number) => dispatch(changeGridPitch(pitch))
    const onChangeToolSize = (size: number) => dispatch(changeToolSize(size))

    const onChangeCanvasBackground = useCallback(
        debounce((color: number[] | null) => dispatch(changeCanvasBackground(color)), 500),
        []
    )

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
                    <Grid item xs={12}>
                        <Typography variant="subtitle1">Grid pitch every</Typography>
                        <StyledPropContainer>
                            <TextField
                                fullWidth
                                type="number"
                                value={grid.pitch}
                                onChange={event => {
                                    const pitch = parseInt(event.target.value)
                                    Number.isInteger(pitch) && pitch >= 0 && onChangeGridPitch(pitch)
                                }}
                                InputProps={{
                                    endAdornment: <InputAdornment position="end">tiles</InputAdornment>,
                                    inputProps: { min: 0 }
                                }}
                            />
                        </StyledPropContainer>
                    </Grid>
                    <Grid item xs={6}>
                        <StyledPropContainer>
                            <ColorPicker
                                hideTextfield
                                value={gridColor}
                                onChange={color => {
                                    setGridColor(color)
                                    color.rgb && onChangeGridColor(color.rgb)
                                }}
                            />
                            Grid color
                        </StyledPropContainer>
                    </Grid>
                    <Grid item xs={12}>
                        <StyledPropContainer>
                            <ColorPicker
                                hideTextfield
                                value={canvasBackground}
                                onChange={color => {
                                    setCanvasBackground(color)
                                    color.rgb && onChangeCanvasBackground(color.alpha > 0 ? color.rgb : null)
                                }}
                            />
                            Background color
                        </StyledPropContainer>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    )
}
PropertiesTab.displayName = 'PropertiesTab'

export default PropertiesTab
