import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { Image } from 'react-konva'
import { useDidUpdate } from '../../hooks/useDidUpdate'
import {
  IMPORT_PREVIEW_WIDTH,
  IMPORT_PREVIEW_HEIGHT
} from '../../constants'
import GridLines from '../GridLines'
import {
  StyledBackground,
  StyledPreviewContainer,
  StyledStage,
  StyledLayer,
  StyledSlider
} from './ImportPreview.styled'

const ImportPreview = ({
  gridSize, imageDimensions, offset, previewImage
}) => {
  const stageRef = useRef(null)
  const [stage, setStage] = useState(null)
  const [scale, setScale] = useState({ x: 2, y: 2 })
  const [position, setPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    stageRef.current.scale(scale)
    setStage(stageRef.current)
  }, [])

  useDidUpdate(() => {
    if (stage) {
      stage.scale(scale)
      stage.position(position)
      stage.batchDraw()
    }
  }, [scale, position])

  const grid = {
    color: [255, 255, 255, 128],
    visible: true,
    width: gridSize.w,
    height: gridSize.h
  }

  const onScale = (newScale) => {
    if (stage) {
      const x = IMPORT_PREVIEW_WIDTH / 2
      const y = IMPORT_PREVIEW_HEIGHT / 2
      const oldScale = stage.scaleX()
      const newPos = {
        x: x - ((x - stage.x()) / oldScale) * newScale,
        y: y - ((y - stage.y()) / oldScale) * newScale,
      }
      setPosition(newPos)
      setScale({ x: newScale, y: newScale })
    }
  }

  return (
    <>
      <StyledSlider value={scale.x} onChange={(event, value) => onScale(value)} />
      <StyledPreviewContainer>
        <StyledStage {...{ scale }} ref={stageRef}>
          <StyledLayer {...{ imageDimensions }}>
            <StyledBackground {...{ imageDimensions }} />
            <Image image={previewImage} x={offset.x} y={offset.y} />
            <GridLines
              width={imageDimensions.w}
              height={imageDimensions.h}
              scale={scale.x}
              {...{ grid }}
            />
          </StyledLayer>
        </StyledStage>
      </StyledPreviewContainer>
    </>
  )
}

ImportPreview.propTypes = {
  gridSize: PropTypes.object.isRequired,
  imageDimensions: PropTypes.object.isRequired,
  offset: PropTypes.object.isRequired,
  previewImage: PropTypes.object.isRequired
}

export default ImportPreview
