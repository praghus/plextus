import React, { useMemo, useState } from 'react'
import { debounce } from 'lodash'
import { useDispatch, useSelector } from 'react-redux'
import { ColorPicker, Color, ColorValue } from 'mui-color'
import { Divider, Grid, InputAdornment, Slider, Stack, TextField, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'

import { selectCanvas, selectGrid, selectSelected } from '../../store/editor/selectors'
import { changeCanvasBackground, changeGridColor, changeGridPitch, changeToolSize } from '../../store/editor/actions'
import { rgbaToHex } from '../../common/utils/colors'
import { StyledSettingsContainer, StyledPropContainer } from './PropertiesTab.styled'

const PropertiesTab = () => {
    const canvas = useSelector(selectCanvas)
    const grid = useSelector(selectGrid)
    const selected = useSelector(selectSelected)

    const theme = useTheme()

    const gridColor = grid.color ? rgbaToHex(grid.color) : (theme.palette.mode === 'dark' && '#fff') || '#000'
    const canvasBackground = rgbaToHex(canvas?.background || [0, 0, 0, 0])
    const marks = [
        { label: '1px', value: 1 },
        { label: `${grid.width}px`, value: grid.width }
    ]

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
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ margin: 2 }}>
                        <Slider
                            min={1}
                            max={grid.width}
                            marks={marks}
                            valueLabelDisplay="auto"
                            getAriaValueText={(value: number) => `${value} px`}
                            value={typeof toolSize === 'number' ? toolSize : 0}
                            onChange={(_, value) => setToolSize(value as number)}
                            onChangeCommitted={(_, value) => {
                                Number.isInteger(value) && (value as number) > 0 && onChangeToolSize(value as number)
                            }}
                        />
                    </Stack>
                    <Divider />
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="subtitle1">Grid pitch</Typography>
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
                <Grid item xs={12}>
                    <Divider />
                    <StyledPropContainer>
                        <ColorPicker
                            hideTextfield
                            value={gridColor}
                            onChange={(color: ColorValue) => {
                                const { rgb } = color as Color
                                onChangeGridColor(rgb)
                            }}
                        />
                        Grid color
                    </StyledPropContainer>
                    <StyledPropContainer>
                        <ColorPicker
                            hideTextfield
                            value={canvasBackground}
                            onChange={(color: ColorValue) => {
                                const { rgb, alpha } = color as Color
                                onChangeCanvasBackground(alpha > 0 ? rgb : null)
                            }}
                        />
                        Background color
                    </StyledPropContainer>
                </Grid>
            </Grid>
        </StyledSettingsContainer>
    )
}

export default PropertiesTab
