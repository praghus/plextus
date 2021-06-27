import React, { useEffect, useRef, useState } from 'react'
import Konva from 'konva'
import styled from '@emotion/styled'
import Slider from '@material-ui/core/Slider'
import { Image, Stage, Layer, Rect } from 'react-konva'
import { useDidUpdate } from '../hooks/useDidUpdate'
import {
    IMPORT_PREVIEW_WIDTH,
    IMPORT_PREVIEW_HEIGHT,
    TRANSPARENCY_BG_MID_IMG,
    SCALE_MIN,
    SCALE_MAX,
    SCALE_STEP
} from '../common/constants'
import GridLines from './GridLines'

const bgImage = new window.Image()
bgImage.src = TRANSPARENCY_BG_MID_IMG

const StyledPreviewContainer = styled.div`
    width: ${IMPORT_PREVIEW_WIDTH}px;
    overflow: auto;
    margin-bottom: 10px;
`

const StyledStage = styled(Stage)`
    cursor: move;
`

type Props = {
    gridSize: {
        w: number
        h: number
    }
    imageDimensions: {
        w: number
        h: number
    }
    offset: {
        x: number
        y: number
    }
    previewImage?: CanvasImageSource | undefined
}

const ImportPreview = ({ gridSize, imageDimensions, offset, previewImage }: Props): JSX.Element => {
    const stageRef = useRef<Konva.Stage>(null)
    const [scale, setScale] = useState({ x: 2, y: 2 })
    const [position, setPosition] = useState({ x: 0, y: 0 })

    useEffect(() => {
        if (stageRef.current) {
            stageRef.current.scale(scale)
        }
    }, [])

    useDidUpdate(() => {
        if (stageRef.current) {
            stageRef.current.scale(scale)
            stageRef.current.position(position)
            stageRef.current.batchDraw()
        }
    }, [scale, position])

    const onScale = (newScale: any): void => {
        if (stageRef.current) {
            const x = IMPORT_PREVIEW_WIDTH / 2
            const y = IMPORT_PREVIEW_HEIGHT / 2
            const oldScale = stageRef.current.scaleX()
            const newPos = {
                x: x - ((x - stageRef.current.x()) / oldScale) * newScale,
                y: y - ((y - stageRef.current.y()) / oldScale) * newScale
            }
            setPosition(newPos)
            setScale({ x: newScale, y: newScale })
        }
    }

    return (
        <>
            <Slider
                value={scale.x}
                step={SCALE_STEP}
                min={SCALE_MIN}
                max={SCALE_MAX}
                onChange={(event, value) => onScale(value)}
            />
            <StyledPreviewContainer>
                <StyledStage
                    {...{ scale }}
                    ref={stageRef}
                    width={IMPORT_PREVIEW_WIDTH}
                    height={IMPORT_PREVIEW_HEIGHT}
                    draggable
                >
                    <Layer imageSmoothingEnabled={false}>
                        <Rect
                            width={imageDimensions.w}
                            height={imageDimensions.h}
                            shadowBlur={10}
                            fillPatternImage={bgImage}
                            fillPatternScaleX={1}
                            fillPatternScaleY={1}
                        />
                        <Image image={previewImage} x={offset.x} y={offset.y} />
                        <GridLines
                            width={imageDimensions.w}
                            height={imageDimensions.h}
                            scale={scale.x}
                            grid={{
                                color: [255, 255, 255, 128],
                                visible: true,
                                width: gridSize.w,
                                height: gridSize.h
                            }}
                        />
                    </Layer>
                </StyledStage>
            </StyledPreviewContainer>
        </>
    )
}

export default ImportPreview
