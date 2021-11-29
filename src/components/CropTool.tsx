import React, { useCallback, useEffect, useState } from 'react'
import Konva from 'konva'
import { Rect, Transformer } from 'react-konva'
import { Canvas, Grid, Rectangle } from '../store/editor/types'

type Props = {
    canvas: Canvas
    grid: Grid
    onChangeSelectedArea: (rect: Rectangle) => void
}

const CropTool = ({ canvas, grid, onChangeSelectedArea }: Props): JSX.Element => {
    const { width, height } = grid
    const [shape, setShape] = useState<Konva.Rect>()
    const [transformer, setTransformer] = useState<Konva.Transformer>()

    const handleShape = useCallback(node => {
        setShape(node)
    }, [])

    const handleTransformer = useCallback(node => {
        setTransformer(node)
    }, [])

    const getPosition = useCallback(
        (e: Konva.KonvaEventObject<Event>): Vec2 => ({
            x: Math.round(e.target.x() / width) * width,
            y: Math.round(e.target.y() / height) * height
        }),
        [width, height]
    )

    const setArea = useCallback(
        () =>
            shape &&
            onChangeSelectedArea({
                height: shape.scaleY(),
                width: shape.scaleX(),
                x: shape.x() / width,
                y: shape.y() / height
            }),
        [shape]
    )

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
        onChangeSelectedArea({
            height: canvas.height / height,
            width: canvas.width / width,
            x: 0,
            y: 0
        })
    }, [shape, transformer])

    return (
        <>
            <Rect
                {...{ height, width }}
                draggable
                ref={handleShape}
                id="selectRect"
                fill="rgba(0,128,255,0.3)"
                onTransform={(e: Konva.KonvaEventObject<Event>) => {
                    e.target.scaleX(Math.round((e.target.scaleX() / width) * width))
                    e.target.scaleY(Math.round((e.target.scaleY() / height) * height))
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
