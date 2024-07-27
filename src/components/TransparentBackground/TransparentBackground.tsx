import { Rect } from 'react-konva'
import { Theme } from '@mui/material/styles'

import { TRANSPARENCY_BG_LIGHT_IMG, TRANSPARENCY_BG_DARK_IMG } from '../../common/constants'

const BG_IMAGE_LIGHT = new window.Image()
const BG_IMAGE_DARK = new window.Image()

BG_IMAGE_LIGHT.src = TRANSPARENCY_BG_LIGHT_IMG
BG_IMAGE_DARK.src = TRANSPARENCY_BG_DARK_IMG

interface Props {
    width: number
    height: number
    theme: Theme
    scale?: number
}

const TransparentBackground = ({ width, height, scale, theme }: Props) => (
    <Rect
        {...{ height, width }}
        // shadowBlur={2}
        // shadowOpacity={0.6}
        fillPatternImage={theme.palette.mode === 'dark' ? BG_IMAGE_DARK : BG_IMAGE_LIGHT}
        fillPatternScaleX={scale || 1}
        fillPatternScaleY={scale || 1}
    />
)
TransparentBackground.displayName = 'TransparentBackground'

export default TransparentBackground
