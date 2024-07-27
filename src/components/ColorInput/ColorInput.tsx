import { useState } from 'react'
import { Typography, TextField } from '@mui/material'

import { rgbaToHex, colorToRGBA } from '../../common/utils/colors'
import { ColorBox } from '../ColorBox'
import { StyledColorValue } from './ColorInput.styled'

interface Props {
    value: number[]
    onChange: (color: number[]) => void
}

const ColorInput = ({ value, onChange }: Props) => {
    const [editingColor, setEditingColor] = useState<string | null>(null)
    return (
        <>
            <ColorBox rgba={value} />
            <Typography variant="overline" sx={{ marginLeft: 1, width: '100%' }}>
                {typeof editingColor === 'string' ? (
                    <TextField
                        autoFocus
                        fullWidth={true}
                        size="small"
                        type="text"
                        variant="standard"
                        value={editingColor}
                        onBlur={() => {
                            onChange(colorToRGBA(editingColor))
                            setEditingColor(null)
                        }}
                        onChange={e => {
                            setEditingColor(e.target.value)
                        }}
                        onKeyDown={e => {
                            if (e.key === 'Enter') {
                                onChange(colorToRGBA(editingColor))
                                setEditingColor(null)
                            }
                            if (e.key === 'Escape') {
                                setEditingColor(null)
                            }
                        }}
                    />
                ) : (
                    <StyledColorValue
                        {...{ editingColor }}
                        onClick={() => {
                            setEditingColor(rgbaToHex(value))
                        }}
                    >
                        {rgbaToHex(value)}
                    </StyledColorValue>
                )}
            </Typography>
        </>
    )
}
ColorInput.displayName = 'ColorInput'

export default ColorInput
