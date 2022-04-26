import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { debounce } from 'lodash'
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material'
import { FormControl, IconButton, MenuItem, Select } from '@mui/material'

import { PALETTES } from '../../common/constants'
import { changePalette, changePrimaryColor, changeSelectedPalette } from '../../store/editor/actions'
import { selectPalette, selectSelected } from '../../store/editor/selectors'
import { ColorBox } from '../ColorBox'
import {
    StyledBottomContainer,
    StyledButtonContainer,
    StyledColorPicker,
    StyledColorsContainer,
    StyledPalette
} from './Palette.styled'

const DEFAULT = 'DEFAULT'

const Palette: React.FunctionComponent = () => {
    const [colors, setColors] = useState<number[][]>([])
    const palette = useSelector(selectPalette)
    const selected = useSelector(selectSelected)

    const [r, g, b, a] = selected.color
    const selectedIndex = useMemo(
        () =>
            colors
                .map(c => (c.length > 3 ? c.join() : [...c, 255].join()))
                .indexOf(selected.color.length > 3 ? selected.color.join() : [...selected.color, 255].join()),
        [colors, selected.color]
    )

    const { t } = useTranslation()

    const dispatch = useDispatch()
    const onChangePrimaryColor = (color: number[]) => dispatch(changePrimaryColor(color))
    const onChangePalette = (colors: number[][]) => dispatch(changePalette(colors))
    const onChangeSelectedPalette = (name: string) => dispatch(changeSelectedPalette(name))
    const onAddColor = () => onChangePalette([...colors, selected.color])
    const onRemoveColor = () => {
        const newColors: number[][] = []
        onChangePalette(newColors.concat(colors.filter((arr, idx) => idx !== selectedIndex)))
    }

    const onChange = debounce(
        color => dispatch(changePrimaryColor([color.r, color.g, color.b, Math.round(color.a * 255)])),
        300
    )

    useEffect(() => {
        const pal = selected.palette as keyof typeof PALETTES
        setColors(selected.palette === DEFAULT || !PALETTES[pal] ? palette : PALETTES[pal].colors)
    }, [palette, selected.palette])

    return (
        <>
            <StyledColorPicker {...{ onChange }} color={{ a: (isNaN(a) && 1) || (a > 0 && a / 255) || 0, b, g, r }} />
            <StyledPalette>
                <FormControl sx={{ padding: '5px', width: '100%' }}>
                    <Select
                        size="small"
                        value={selected.palette}
                        onChange={e => {
                            onChangeSelectedPalette(e.target.value as string)
                            setColors(
                                e.target.value && e.target.value !== DEFAULT
                                    ? PALETTES[e.target.value as keyof typeof PALETTES].colors
                                    : palette
                            )
                        }}
                    >
                        <MenuItem value={DEFAULT}>{t('i18_current_palette')}</MenuItem>
                        {Object.keys(PALETTES).map(pal => (
                            <MenuItem key={pal} value={pal}>
                                {PALETTES[pal as keyof typeof PALETTES].name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <StyledColorsContainer>
                    {colors.map((rgba, i) => (
                        <ColorBox
                            key={rgba.join()}
                            selected={selectedIndex === i}
                            onClick={onChangePrimaryColor}
                            {...{ rgba }}
                        />
                    ))}
                </StyledColorsContainer>
            </StyledPalette>
            <StyledBottomContainer>
                {selected.palette === DEFAULT && (
                    <StyledButtonContainer>
                        <IconButton disabled={selectedIndex > -1} size="small" onClick={onAddColor}>
                            <AddIcon fontSize="small" />
                        </IconButton>
                        <IconButton disabled={selectedIndex === -1} size="small" onClick={onRemoveColor}>
                            <RemoveIcon fontSize="small" />
                        </IconButton>
                    </StyledButtonContainer>
                )}
            </StyledBottomContainer>
        </>
    )
}
Palette.displayName = 'Palette'

export default Palette
