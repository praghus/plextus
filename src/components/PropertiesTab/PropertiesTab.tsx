import React, { useMemo, useState } from 'react'
import { debounce } from 'lodash'
import { useDispatch, useSelector } from 'react-redux'
import { ColorPicker, Color, ColorValue } from 'mui-color'
import { Grid, InputAdornment, Slider, TextField, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'

import { selectCanvas, selectGrid, selectSelected } from '../../store/editor/selectors'
import { changeCanvasBackground, changeGridColor, changeGridPitch, changeToolSize } from '../../store/editor/actions'
import { rgbaToHex } from '../../common/utils/colors'
import { StyledSettingsContainer, StyledPropContainer } from './PropertiesTab.styled'

const PropertiesTab: React.FunctionComponent = () => {
    const canvas = useSelector(selectCanvas)
    const grid = useSelector(selectGrid)
    const selected = useSelector(selectSelected)

    const theme = useTheme()

    const gridColor = grid.color ? rgbaToHex(grid.color) : (theme.palette.mode === 'dark' && '#fff') || '#000'
    const canvasBackground = rgbaToHex(canvas?.background || [0, 0, 0, 0])

    const [toolSize, setToolSize] = useState<number>(selected.toolSize)

    const dispatch = useDispatch()
    const onChangeGridPitch = (pitch: number) => dispatch(changeGridPitch(pitch))
    const onChangeToolSize = (size: number) => dispatch(changeToolSize(size))

    const onChangeCanvasBackground = useMemo(
        () => debounce((color: number[] | null) => dispatch(changeCanvasBackground(color)), 300),
        [dispatch]
    )

    const onChangeGridColor = useMemo(
        () => debounce((color: number[]) => dispatch(changeGridColor(color)), 300),
        [dispatch]
    )

    return (
        <StyledSettingsContainer>
            <Grid container spacing={2} alignItems="center" justifyContent="center">
                <Grid item xs={12}>
                    <Typography variant="subtitle1">Pixel tool size</Typography>
                </Grid>
                <Grid item xs={1}></Grid>
                <Grid item xs={8}>
                    <Slider
                        min={1}
                        max={grid.width}
                        marks
                        value={typeof toolSize === 'number' ? toolSize : 0}
                        onChange={(_, value) => setToolSize(value as number)}
                        onChangeCommitted={(_, value) => {
                            Number.isInteger(value) && value > 0 && onChangeToolSize(value as number)
                        }}
                    />
                </Grid>
                <Grid item xs={3}>
                    {toolSize} pixels
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="subtitle1">Grid pitch every</Typography>
                    <StyledPropContainer>
                        <TextField
                            type="number"
                            size="small"
                            fullWidth={true}
                            value={grid.pitch}
                            onChange={e => {
                                const pitch = parseInt(e.target.value)
                                Number.isInteger(pitch) && pitch >= 0 && onChangeGridPitch(pitch)
                            }}
                            InputProps={{
                                endAdornment: <InputAdornment position="end">tiles</InputAdornment>,
                                inputProps: { min: 0 }
                            }}
                        />
                    </StyledPropContainer>
                </Grid>
                <Grid item xs={5}>
                    <StyledPropContainer>
                        <ColorPicker
                            hideTextfield
                            value={gridColor}
                            onChange={(color: ColorValue) => {
                                const { rgb } = color as Color
                                onChangeGridColor(rgb)
                            }}
                        />
                        Grid
                    </StyledPropContainer>
                </Grid>
                <Grid item xs={7}>
                    <StyledPropContainer>
                        <ColorPicker
                            hideTextfield
                            value={canvasBackground}
                            onChange={(color: ColorValue) => {
                                const { rgb, alpha } = color as Color
                                onChangeCanvasBackground(alpha > 0 ? rgb : null)
                            }}
                        />
                        Background
                    </StyledPropContainer>
                </Grid>
            </Grid>
        </StyledSettingsContainer>
    )
}
PropertiesTab.displayName = 'PropertiesTab'

export default PropertiesTab
