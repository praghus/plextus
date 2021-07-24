import React, { useEffect, useRef, useState } from 'react'
import Konva from 'konva'
import { Rect, Transformer } from 'react-konva'
import { Canvas, Grid, Rectangle } from '../store/editor/types'

type Props = {
    canvas: Canvas
    grid: Grid
    onChangeSelectedArea: (rect: Rectangle) => void
}

const KonvaTransformer = ({ canvas, grid, onChangeSelectedArea }: Props): JSX.Element => {
    const shapeRef = useRef<Konva.Rect>(null)
    const trRef = useRef<Konva.Transformer>(null)
    const [isResizing, setIsResizing] = useState(true)

    const { width, height } = grid

    const setPosition = (e: Konva.KonvaEventObject<Event>) => ({
        x: Math.round(e.target.x() / width) * width,
        y: Math.round(e.target.y() / height) * height
    })

    const setArea = () =>
        shapeRef.current &&
        onChangeSelectedArea({
            x: shapeRef.current.x() / width,
            y: shapeRef.current.y() / height,
            width: shapeRef.current.scaleX(),
            height: shapeRef.current.scaleY()
        })

    useEffect(() => {
        if (shapeRef.current) {
            shapeRef.current.scaleX(canvas.width / width)
            shapeRef.current.scaleY(canvas.height / height)
        }
        onChangeSelectedArea({
            x: 0,
            y: 0,
            width: canvas.width / width,
            height: canvas.height / height
        })
    }, [])

    useEffect(() => {
        if (isResizing && trRef.current && shapeRef.current) {
            const layer = trRef.current.getLayer()
            trRef.current.nodes([shapeRef.current])
            if (layer) {
                layer.batchDraw()
            }
        }
    }, [isResizing])

    return (
        <>
            <Rect
                {...{ width, height }}
                draggable
                ref={shapeRef}
                id="selectRect"
                fill="rgba(0,128,255,0.3)"
                onClick={() => setIsResizing(!isResizing)}
                onTap={() => setIsResizing(!isResizing)}
                onTransform={(e: Konva.KonvaEventObject<Event>) => {
                    e.target.scaleX(Math.round((e.target.scaleX() / width) * width))
                    e.target.scaleY(Math.round((e.target.scaleY() / height) * height))
                    e.target.position(setPosition(e))
                }}
                onDragMove={(e: Konva.KonvaEventObject<Event>) => {
                    e.target.position(setPosition(e))
                }}
                onDragEnd={setArea}
                onTransformEnd={setArea}
            />
            {isResizing && (
                <Transformer
                    ref={trRef}
                    rotateEnabled={false}
                    boundBoxFunc={(oldBox, newBox) => {
                        if (newBox.width < width || newBox.height < height) {
                            return oldBox
                        }
                        return newBox
                    }}
                />
            )}
        </>
    )
}

KonvaTransformer.displayName = 'KonvaTransformer'

export default KonvaTransformer
