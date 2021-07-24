import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styled from '@emotion/styled'
import { Add as AddIcon, Remove as RemoveIcon } from '@material-ui/icons'
import { FormControl, IconButton, MenuItem, Select } from '@material-ui/core'

import { PALETTES } from '../common/constants'
import { changePalette, changePrimaryColor } from '../store/editor/actions'
import { selectPalette, selectSelected } from '../store/editor/selectors'
import ColorBox from './ColorBox'

const DEFAULT = 'DEFAULT'

const StyledFormControl = styled(FormControl)`
    width: 100%;
    padding: 0;
`

const StyledColorsContainer = styled.div`
    max-height: 120px;
    margin: 4px;
    overflow: auto;
`

const StyledPalette = styled.div`
    margin-bottom: 10px;
    line-height: 0;
`

const StyledBottomContainer = styled.div`
    display: flex;
    justify-content: flex-end;
`

const StyledButtonContainer = styled.div`
    display: flex;
    padding: 4px;
`

const Palette = (): JSX.Element => {
    const [colors, setColors] = useState<number[][]>([])
    const [current, setCurrent] = useState<string>(DEFAULT)

    const palette = useSelector(selectPalette)
    const selected = useSelector(selectSelected)
    const selectedIndex = colors.map(c => c.join()).indexOf(selected.color.join())

    const dispatch = useDispatch()
    const onChangePrimaryColor = (color: number[]) => dispatch(changePrimaryColor(color))
    const onChangePalette = (colors: number[][]) => dispatch(changePalette(colors))
    const onAddColor = () => onChangePalette([...colors, selected.color])
    const onRemoveColor = () => {
        const newColors: number[][] = []
        onChangePalette(newColors.concat(colors.filter((arr, idx) => idx !== selectedIndex)))
    }

    useEffect(() => {
        setColors(palette)
    }, [palette])

    return (
        <>
            <StyledPalette>
                <StyledFormControl>
                    <Select
                        defaultValue={DEFAULT}
                        onChange={(e: React.ChangeEvent<{ value: unknown }>) => {
                            setCurrent(e.target.value as string)
                            setColors(
                                e.target.value && e.target.value !== DEFAULT
                                    ? PALETTES[e.target.value as string].colors
                                    : palette
                            )
                        }}
                    >
                        <MenuItem value={DEFAULT}>Current plette</MenuItem>
                        {Object.keys(PALETTES).map(pal => (
                            <MenuItem key={pal} value={pal}>
                                {PALETTES[pal].name}
                            </MenuItem>
                        ))}
                    </Select>
                </StyledFormControl>
                <StyledColorsContainer>
                    {colors.map(rgba => (
                        <ColorBox
                            key={rgba.join()}
                            selected={rgba.join() === selected.color.join()}
                            onClick={onChangePrimaryColor}
                            {...{ rgba }}
                        />
                    ))}
                </StyledColorsContainer>
            </StyledPalette>
            <StyledBottomContainer>
                {current === DEFAULT && (
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

export default Palette
