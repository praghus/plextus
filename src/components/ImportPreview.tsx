import React, { useCallback, useEffect, useState } from 'react'
import Konva from 'konva'
import styled from '@emotion/styled'
import Slider from '@material-ui/core/Slider'
import { Stage, Layer, Rect } from 'react-konva'
import {
    IMPORT_PREVIEW_WIDTH,
    IMPORT_PREVIEW_HEIGHT,
    BG_IMAGE,
    SCALE_MIN,
    SCALE_MAX,
    SCALE_STEP,
    IMPORT_MODES
} from '../common/constants'

import GridLines from './GridLines'
import { LayerImportConfig } from 'store/editor/types'

const StyledPreviewContainer = styled.div`
    width: ${IMPORT_PREVIEW_WIDTH}px;
    overflow: auto;
    margin-top: 15px;
`

const StyledStage = styled(Stage)`
    background: #222;
    cursor: move;
`

type Props = {
    image: CanvasImageSource
    config: LayerImportConfig
}

const ImportPreview = ({ image, config }: Props): JSX.Element => {
    const { offset, mode, resolution, tileSize } = config

    const width = Math.ceil((resolution.w + offset.x) / tileSize.w) * tileSize.w
    const height = Math.ceil((resolution.h + offset.y) / tileSize.h) * tileSize.h

    const [position, setPosition] = useState<Konva.Vector2d>({ x: 0, y: 0 })
    const [scale, setScale] = useState<Konva.Vector2d>({ x: 2, y: 2 })
    const [stage, setStage] = useState<Konva.Stage>()
    const [preview, setPreview] = useState<Konva.Rect>()

    const handleStage = useCallback(node => {
        setStage(node)
    }, [])

    const handlePreview = useCallback(node => {
        setPreview(node)
    }, [])

    const onScale = useCallback(
        (newScale: any): void => {
            if (stage) {
                const x = IMPORT_PREVIEW_WIDTH / 2
                const y = IMPORT_PREVIEW_HEIGHT / 2
                const oldScale = stage.scaleX()
                const newPos = {
                    x: x - ((x - stage.x()) / oldScale) * newScale,
                    y: y - ((y - stage.y()) / oldScale) * newScale
                }
                setPosition(newPos)
                setScale({ x: newScale, y: newScale })
            }
        },
        [stage]
    )

    useEffect(() => {
        preview?.setAttrs({ fillPatternImage: image, height, width })
    }, [image, height, width, preview])

    useEffect(() => {
        preview?.fillPatternOffset({ x: -offset.x, y: -offset.y })
    }, [offset, preview])

    useEffect(() => {
        stage?.scale(scale)
        stage?.position(position)
        stage?.batchDraw()
    }, [position, scale, stage])

    return (
        <>
            <StyledPreviewContainer>
                <StyledStage
                    {...{ scale }}
                    ref={handleStage}
                    width={IMPORT_PREVIEW_WIDTH}
                    height={IMPORT_PREVIEW_HEIGHT}
                    draggable
                >
                    <Layer imageSmoothingEnabled={false}>
                        <Rect fillPatternImage={BG_IMAGE} {...{ height, width }} />
                        <Rect fillPatternRepeat="no-repeat" ref={handlePreview} />
                        {mode !== IMPORT_MODES.NEW_IMAGE && (
                            <GridLines
                                {...{ height, width }}
                                scale={scale.x}
                                grid={{
                                    color: [255, 255, 255],
                                    height: tileSize.h,
                                    visible: true,
                                    width: tileSize.w
                                }}
                            />
                        )}
                    </Layer>
                </StyledStage>
            </StyledPreviewContainer>
            <Slider
                value={scale.x}
                step={SCALE_STEP}
                min={SCALE_MIN}
                max={SCALE_MAX}
                onChange={(event, value) => onScale(value)}
            />
        </>
    )
}
ImportPreview.displayName = 'ImportPreview'

export default ImportPreview
