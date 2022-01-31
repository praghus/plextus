import React from 'react'
import styled from '@emotion/styled'
import { getRgbaValue } from '../common/utils/colors'

const StyledColorBox = styled.div`
    display: inline-flex;
    width: 18px;
    height: 18px;
    margin: 1px;
    text-decoration: none;
    font-size: 0;
    user-select: none;
    cursor: pointer;
    border-radius: 3px;

    &:active {
        border: 1px solid #222;
    }

    &.selected {
        border: 2px solid rgba(255, 255, 255, 0.5);
    }
`

type Props = {
    onClick: (rgba: number[]) => void
    selected: boolean
    rgba: number[]
}

const ColorBox = ({ onClick, selected, rgba }: Props): JSX.Element => (
    <StyledColorBox
        onClick={() => onClick(rgba.length > 3 ? rgba : [...rgba, 255])}
        className={`color-button ${selected ? 'selected' : null}`}
        style={{ backgroundColor: getRgbaValue(rgba) }}
    />
)
ColorBox.displayName = 'ColorBox'

export default ColorBox
