import React, { useCallback, useEffect, useState } from 'react'
import Konva from 'konva'
import { Rect, Transformer } from 'react-konva'
import { Canvas, Grid, Rectangle } from '../../store/editor/types'
import { getSelectionRect } from '../../common/utils/konva'

interface Props {
    canvas: Canvas
    grid: Grid
    onChangeSelectedArea: (rect: Rectangle) => void
}

const CropTool: React.FunctionComponent<Props> = ({ canvas, grid, onChangeSelectedArea }) => {
    const { width, height } = grid
    const [shape, setShape] = useState<Konva.Rect>()
    const [transformer, setTransformer] = useState<Konva.Transformer>()

    const handleShape = useCallback((node: Konva.Rect) => {
        setShape(node)
    }, [])

    const handleTransformer = useCallback((node: Konva.Transformer) => {
        setTransformer(node)
    }, [])

    const getPosition = useCallback(
        (e: Konva.KonvaEventObject<Event>): Vec2 => ({
            x: Math.round(e.target.x() / width) * width,
            y: Math.round(e.target.y() / height) * height
        }),
        [width, height]
    )

    const setArea = useCallback(() => {
        if (shape) {
            onChangeSelectedArea({
                height: shape.scaleY(),
                width: shape.scaleX(),
                x: shape.x() / width,
                y: shape.y() / height
            })
        }
    }, [height, onChangeSelectedArea, shape, width])

    useEffect(() => {
        if (shape && transformer) {
            const layer = transformer.getLayer()
            transformer.nodes([shape])
            shape.scaleX(canvas.width / width)
            shape.scaleY(canvas.height / height)
            if (layer) {
                layer.batchDraw()
            }
        }
    }, [canvas.height, canvas.width, height, shape, transformer, width])

    return (
        <>
            <Rect
                {...{ height, width }}
                draggable
                ref={handleShape}
                id="selectRect"
                fill="rgba(0,128,255,0.3)"
                onTransform={(e: Konva.KonvaEventObject<Event>) => {
                    e.target.scaleX(Math.max(1, Math.round((e.target.scaleX() / width) * width)))
                    e.target.scaleY(Math.max(1, Math.round((e.target.scaleY() / height) * height)))
                    e.target.position(getPosition(e))
                    e.evt.preventDefault()
                }}
                onDragMove={(e: Konva.KonvaEventObject<Event>) => {
                    e.target.position(getPosition(e))
                    e.evt.preventDefault()
                }}
                onDragEnd={setArea}
                onTransformEnd={setArea}
            />
            <Transformer ref={handleTransformer} rotateEnabled={false} />
        </>
    )
}
CropTool.displayName = 'CropTool'

export default CropTool
