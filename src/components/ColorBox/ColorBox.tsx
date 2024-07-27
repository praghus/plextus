import { getRgbaValue } from '../../common/utils/colors'
import { StyledColorBox, StyledTransparentContainer } from './ColorBox.styled'

interface Props {
    onClick?: (rgba: number[]) => void
    selected?: boolean
    rgba: number[]
}

const ColorBox = ({ onClick, selected, rgba }: Props) => (
    <StyledTransparentContainer
        className={`color-button ${selected ? 'selected' : null}`}
        onClick={() => onClick && onClick(rgba.length > 3 ? rgba : [...rgba, 255])}
    >
        <StyledColorBox style={{ backgroundColor: getRgbaValue(rgba) }} />
    </StyledTransparentContainer>
)
ColorBox.displayName = 'ColorBox'

export default ColorBox
