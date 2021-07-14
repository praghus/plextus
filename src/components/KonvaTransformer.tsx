import React, { useRef } from 'react'
import Konva from 'konva'
import { Rect, Transformer } from 'react-konva'

import { Grid } from '../store/editor/types'

type Props = {
    grid: Grid
    isResizing: boolean
    listening: boolean
    onChange: () => void
    onClick: (isResizing: boolean) => void
}

const KonvaTransformer = ({ grid, isResizing, listening, onChange, onClick }: Props): JSX.Element => {
    const shapeRef = useRef<Konva.Rect>(null)
    const trRef = useRef<Konva.Transformer>(null)
    const { width, height } = grid

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
                {...{ listening }}
                draggable
                ref={shapeRef}
                id="selectRect"
                fill="rgba(0,128,255,0.3)"
                onClick={() => onClick(!isResizing)}
                onTap={() => onClick(!isResizing)}
                onTransform={e => {
                    e.target.scaleX(Math.round((e.target.scaleX() / width) * width))
                    e.target.scaleY(Math.round((e.target.scaleY() / height) * height))
                    e.target.position({
                        x: Math.round(e.target.x() / width) * width,
                        y: Math.round(e.target.y() / height) * height
                    })
                }}
                onDragMove={e => {
                    e.target.position({
                        x: Math.round(e.target.x() / width) * width,
                        y: Math.round(e.target.y() / height) * height
                    })
                }}
                onDragEnd={() => {
                    onChange()
                }}
                onTransformEnd={() => {
                    if (shapeRef.current) {
                        const scaleX = shapeRef.current.scaleX()
                        const scaleY = shapeRef.current.scaleY()
                        onChange()
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
