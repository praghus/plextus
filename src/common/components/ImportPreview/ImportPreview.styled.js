import styled from 'styled-components'
import { Stage, Layer, Rect } from 'react-konva'
import Slider from '@material-ui/core/Slider'
import {
  IMPORT_PREVIEW_WIDTH,
  IMPORT_PREVIEW_HEIGHT,
  TRANSPARENCY_BG_MID_IMG,
  SCALE_MIN,
  SCALE_MAX,
  SCALE_STEP
} from '../../constants'

const bgImage = new window.Image()
bgImage.src = TRANSPARENCY_BG_MID_IMG

export const StyledPreviewContainer = styled.div`
  width: ${IMPORT_PREVIEW_WIDTH}px;
  overflow: auto;
  margin-bottom: 10px;
`

export const StyledStage = styled(Stage).attrs(() => ({
  width: IMPORT_PREVIEW_WIDTH,
  height: IMPORT_PREVIEW_HEIGHT,
  draggable: true
}))`
  cursor: move;
`

export const StyledBackground = styled(Rect).attrs(({ imageDimensions }) => ({
  width: imageDimensions.w,
  height: imageDimensions.h,
  shadowBlur: 10,
  // fill: data.backgroundcolor,
  fillPatternImage: bgImage,
  fillPatternScaleX: 1,
  fillPatternScaleY: 1
}))``

export const StyledLayer = styled(Layer).attrs(() => ({
  imageSmoothingEnabled: false
}))``

export const StyledSlider = styled(Slider).attrs(() => ({
  step: SCALE_STEP,
  min: SCALE_MIN,
  max: SCALE_MAX,
}))``
