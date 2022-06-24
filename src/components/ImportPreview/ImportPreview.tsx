import React, { useCallback, useMemo, useEffect, useState } from 'react'
import Konva from 'konva'
import Slider from '@mui/material/Slider'
import { useTheme } from '@mui/material/styles'
import { Layer, Rect } from 'react-konva'

import { useZoomEvents } from '../../hooks/useZoomEvents'
import { LayerImportConfig } from '../../store/editor/types'
import { IMPORT_PREVIEW_WIDTH, IMPORT_PREVIEW_HEIGHT, IMPORT_MODES } from '../../common/constants'
import { TransparentBackground } from '../TransparentBackground'
import { GridLines } from '../GridLines'

import { StyledStage, StyledPreviewContainer } from './ImportPreview.styled'

interface Props {
    image: CanvasImageSource
    config: LayerImportConfig
}

const ImportPreview: React.FunctionComponent<Props> = ({ image, config }) => {
    const { offset, mode, resolution, tileSize } = config

    const width = Math.ceil((resolution.w + offset.x) / tileSize.w) * tileSize.w
    const height = Math.ceil((resolution.h + offset.y) / tileSize.h) * tileSize.h

    const [position, setPosition] = useState<Konva.Vector2d>({ x: 0, y: 0 })
    const [scale, setScale] = useState<Konva.Vector2d>({ x: 2, y: 2 })
    const [stage, setStage] = useState<Konva.Stage>()
    const [preview, setPreview] = useState<Konva.Rect>()

    const theme = useTheme()

    const handleStage = useCallback((node: Konva.Stage) => {
        setStage(node)
    }, [])

    const handlePreview = useCallback((node: Konva.Rect) => {
        setPreview(node)
    }, [])

    const dragBoundFunc = useCallback(
        (pos: Konva.Vector2d) => {
            return {
                x:
                    IMPORT_PREVIEW_WIDTH > width * scale.x
                        ? 0
                        : Math.max(IMPORT_PREVIEW_WIDTH - width * scale.x, Math.min(pos.x, 0)),
                y:
                    IMPORT_PREVIEW_HEIGHT > height * scale.y
                        ? 0
                        : Math.max(IMPORT_PREVIEW_HEIGHT - height * scale.y, Math.min(pos.y, 0))
            }
        },
        [scale, width, height]
    )

    const { onScale, onTouchEnd, onTouchMove, onWheel } = useZoomEvents(stage, setPosition, setScale, dragBoundFunc)

    const grid = useMemo(
        () => ({
            color: [255, 255, 255],
            height: tileSize.h,
            visible: true,
            width: tileSize.w
        }),
        [tileSize]
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
                    {...{ dragBoundFunc, onTouchEnd, onTouchMove, onWheel, scale }}
                    ref={handleStage}
                    width={IMPORT_PREVIEW_WIDTH}
                    height={IMPORT_PREVIEW_HEIGHT}
                    draggable
                >
                    <Layer imageSmoothingEnabled={false}>
                        <TransparentBackground {...{ height, theme, width }} scale={1 / scale.x} />
                        <Rect fillPatternRepeat="no-repeat" ref={handlePreview} />
                        {mode !== IMPORT_MODES.NEW_IMAGE && (
                            <GridLines {...{ grid, height, theme, width }} scale={scale.x} />
                        )}
                    </Layer>
                </StyledStage>
            </StyledPreviewContainer>
            <Slider
                sx={{ marginBottom: '10px' }}
                size="small"
                value={scale.x}
                step={0.1}
                min={0.25}
                max={20}
                marks={[{ value: 1 }]}
                onChange={(_, value) => onScale(value as number)}
            />
        </>
    )
}
ImportPreview.displayName = 'ImportPreview'

export default ImportPreview
