import React, { useRef, useState } from 'react'
import Konva from 'konva'
import { Rect, Transformer } from 'react-konva'
import { Canvas, Grid } from '../store/editor/types'

type Props = {
    canvas: Canvas
    grid: Grid
}

const KonvaTransformer = ({ canvas, grid }: Props): JSX.Element => {
    const shapeRef = useRef<Konva.Rect>(null)
    const trRef = useRef<Konva.Transformer>(null)
    const [isResizing, setIsResizing] = useState(true)

    const { width, height } = grid

    const setPosition = e => ({
        x: Math.round(e.target.x() / width) * width,
        y: Math.round(e.target.y() / height) * height
    })

    React.useEffect(() => {
        if (shapeRef.current) {
            shapeRef.current.scaleX(canvas.width / width)
            shapeRef.current.scaleY(canvas.height / height)
        }
    }, [])

    React.useEffect(() => {
        if (isResizing && trRef.current && shapeRef.current) {
            const layer = trRef.current.getLayer()
            trRef.current.nodes([shapeRef.current])
            if (layer) {
                layer.batchDraw()
            }
        }
    }, [isResizing])

    return (
        <React.Fragment>
            <Rect
                {...{ width, height }}
                draggable
                ref={shapeRef}
                id="selectRect"
                fill="rgba(0,128,255,0.3)"
                onClick={() => setIsResizing(!isResizing)}
                onTap={() => setIsResizing(!isResizing)}
                onTransform={e => {
                    e.target.scaleX(Math.round((e.target.scaleX() / width) * width))
                    e.target.scaleY(Math.round((e.target.scaleY() / height) * height))
                    e.target.position(setPosition(e))
                }}
                onDragMove={e => {
                    e.target.position(setPosition(e))
                }}
                onDragEnd={() => {
                    // onChange()
                }}
                onTransformEnd={() => {
                    if (shapeRef.current) {
                        const scaleX = shapeRef.current.scaleX()
                        const scaleY = shapeRef.current.scaleY()
                        // onChange()
                        console.info(scaleX, scaleY)
                    }
                }}
            />
            {isResizing && (
                <Transformer
                    ref={trRef}
                    rotateEnabled={false}
                    boundBoxFunc={(oldBox, newBox) => {
                        // limit resize
                        if (newBox.width < width || newBox.height < height) {
                            return oldBox
                        }
                        return newBox
                    }}
                />
            )}
        </React.Fragment>
    )
}

KonvaTransformer.displayName = 'KonvaTransformer'

export default KonvaTransformer
