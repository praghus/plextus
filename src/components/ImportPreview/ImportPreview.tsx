import React, { useCallback, useMemo, useEffect, useState } from 'react'
import Konva from 'konva'
import Slider from '@mui/material/Slider'
import { useTheme } from '@mui/material/styles'
import { Layer, Rect } from 'react-konva'
import { LayerImportConfig } from 'store/editor/types'
import {
    IMPORT_PREVIEW_WIDTH,
    IMPORT_PREVIEW_HEIGHT,
    SCALE_MIN,
    SCALE_MAX,
    SCALE_STEP,
    IMPORT_MODES
} from '../../common/constants'
import { TransparentBackground } from '../TransparentBackground'
import { StyledStage, StyledPreviewContainer } from './ImportPreview.styled'
import { GridLines } from '../GridLines'

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

    const grid = useMemo(
        () => ({
            color: [255, 255, 255],
            height: tileSize.h,
            visible: true,
            width: tileSize.w
        }),
        [tileSize]
    )

    const onScale = useCallback(
        (newScale: number): void => {
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
                        <TransparentBackground {...{ height, theme, width }} scale={1 / scale.x} />
                        <Rect fillPatternRepeat="no-repeat" ref={handlePreview} />
                        {mode !== IMPORT_MODES.NEW_IMAGE && <GridLines {...{ grid, height, width }} scale={scale.x} />}
                    </Layer>
                </StyledStage>
            </StyledPreviewContainer>
            <Slider
                sx={{ marginBottom: '10px' }}
                size="small"
                value={scale.x}
                step={SCALE_STEP}
                min={SCALE_MIN}
                max={SCALE_MAX}
                onChange={(_, value) => onScale(value as number)}
            />
        </>
    )
}
ImportPreview.displayName = 'ImportPreview'

export default ImportPreview
