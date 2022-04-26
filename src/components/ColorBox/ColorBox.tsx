import React from 'react'
import { getRgbaValue } from '../../common/utils/colors'
import { StyledColorBox } from './ColorBox.styled'

interface Props {
    onClick: (rgba: number[]) => void
    selected: boolean
    rgba: number[]
}

const ColorBox: React.FunctionComponent<Props> = ({ onClick, selected, rgba }) => (
    <StyledColorBox
        onClick={() => onClick(rgba.length > 3 ? rgba : [...rgba, 255])}
        className={`color-button ${selected ? 'selected' : null}`}
        style={{ backgroundColor: getRgbaValue(rgba) }}
    />
)
ColorBox.displayName = 'ColorBox'

export default ColorBox
