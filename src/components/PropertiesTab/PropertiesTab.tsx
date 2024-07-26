import { useMemo } from 'react'
import { debounce } from 'lodash'
import { useDispatch, useSelector } from 'react-redux'
import { Divider, Grid, InputAdornment, TextField, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'

import { selectCanvas, selectGrid, selectSelected } from '../../stores/editor/selectors'
import { changeCanvasBackground, changeGridColor, changeGridPitch, changeToolSize } from '../../stores/editor/actions'
import { StyledSettingsContainer, StyledPropContainer, StyledColorLabel } from './PropertiesTab.styled'
import { ColorInput } from '../ColorInput'

const PropertiesTab = () => {
    const canvas = useSelector(selectCanvas)
    const grid = useSelector(selectGrid)
    const selected = useSelector(selectSelected)

    const theme = useTheme()

    const gridColor = grid.color ? grid.color : (theme.palette.mode === 'dark' && [255, 255, 255, 1]) || [0, 0, 0, 1]
    const canvasBackground = canvas?.background || [0, 0, 0, 0]

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
                    <Typography variant="subtitle2">Colors</Typography>
                    <StyledPropContainer>
                        <div style={{ display: 'flex', width: '60%' }}>
                            <ColorInput value={gridColor} onChange={onChangeGridColor} />
                        </div>
                        <StyledColorLabel>grid</StyledColorLabel>
                    </StyledPropContainer>
                    <StyledPropContainer>
                        <div style={{ display: 'flex', width: '60%' }}>
                            <ColorInput value={canvasBackground} onChange={onChangeCanvasBackground} />
                        </div>
                        <StyledColorLabel>background</StyledColorLabel>
                    </StyledPropContainer>
                </Grid>
                <Grid item xs={12}>
                    <Divider />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        type="number"
                        size="small"
                        label="Pixel tool size"
                        variant="outlined"
                        fullWidth={true}
                        value={selected.toolSize}
                        onChange={e => {
                            const value = parseInt(e.target.value)
                            onChangeToolSize(value as number)
                        }}
                        InputProps={{
                            endAdornment: <InputAdornment position="end">px</InputAdornment>,
                            inputProps: { min: 1, max: grid.width }
                        }}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        type="number"
                        size="small"
                        label="Grid pitch"
                        variant="outlined"
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
                </Grid>
            </Grid>
        </StyledSettingsContainer>
    )
}
PropertiesTab.displayName = 'PropertiesTab'

export default PropertiesTab
