import Konva from 'konva'
import { useCallback, useRef } from 'react'

import { getDistance, getCenter } from '../common/utils/konva'

const MAX_ZOOM = 200
const SCALE_BY = 1.2

export const useZoomEvents = (
    stage: Konva.Stage | undefined,
    onChangePosition: (pos: Konva.Vector2d) => void,
    onChangeScale: (scale: Konva.Vector2d) => void,
    dragBoundFunc?: (pos: Konva.Vector2d) => Konva.Vector2d
) => {
    const lastCenter = useRef<Konva.Vector2d>()
    const lastDist = useRef(0)

    const onPosition = useCallback(
        (pos: Konva.Vector2d) => {
            if (stage) {
                const newPos = typeof dragBoundFunc === 'function' ? dragBoundFunc(pos) : pos
                onChangePosition(newPos)
                stage.position(newPos)
                // stage.batchDraw()
            }
        },
        [stage, onChangePosition, dragBoundFunc]
    )

    const onScale = useCallback(
        (scale: number) => {
            if (stage) {
                const pointer = stage.getPointerPosition()
                if (pointer) {
                    const { x, y } = pointer
                    const oldScale = stage.scaleX()
                    const newScale = Math.min(scale, MAX_ZOOM)
                    onChangeScale({ x: newScale, y: newScale })
                    onPosition({
                        x: x - ((x - stage.x()) / oldScale) * newScale,
                        y: y - ((y - stage.y()) / oldScale) * newScale
                    })
                    stage.scale({ x: newScale, y: newScale })
                    // stage.batchDraw()
                }
            }
        },
        [stage, onPosition, onChangeScale]
    )

    const onWheel = useCallback(
        (e: Konva.KonvaEventObject<WheelEvent>) => {
            e.evt.preventDefault()
            if (stage) {
                const { altKey, metaKey, deltaX, deltaY } = e.evt
                if (altKey || metaKey) {
                    onScale(deltaY > 0 ? stage.scaleX() / SCALE_BY : stage.scaleX() * SCALE_BY)
                } else {
                    onPosition({
                        x: stage.x() - deltaX,
                        y: stage.y() - deltaY
                    })
                }
            }
        },
        [stage, onScale, onPosition]
    )

    const onTouchMove = useCallback(
        (e: Konva.KonvaEventObject<TouchEvent>) => {
            e.evt.preventDefault()
            if (stage) {
                const touch1 = e.evt.touches[0]
                const touch2 = e.evt.touches[1]

                if (touch1 && touch2) {
                    if (stage.isDragging()) {
                        stage.stopDrag()
                    }

                    const p1 = { x: touch1.clientX, y: touch1.clientY }
                    const p2 = { x: touch2.clientX, y: touch2.clientY }

                    if (!lastCenter.current) {
                        lastCenter.current = getCenter(p1, p2)
                        return
                    }

                    const newCenter = getCenter(p1, p2)
                    const dist = getDistance(p1, p2)

                    if (!lastDist.current) {
                        lastDist.current = dist
                    }

                    const pointTo = {
                        x: (newCenter.x - stage.x()) / stage.scaleX(),
                        y: (newCenter.y - stage.y()) / stage.scaleX()
                    }

                    const scale = stage.scaleX() * (dist / lastDist.current)
                    const dx = newCenter.x - lastCenter.current.x
                    const dy = newCenter.y - lastCenter.current.y

                    onScale(scale)
                    onPosition({
                        x: newCenter.x - pointTo.x * scale + dx,
                        y: newCenter.y - pointTo.y * scale + dy
                    })

                    lastDist.current = dist
                    lastCenter.current = newCenter
                }
            }
        },
        [stage, onScale, onPosition]
    )

    const onTouchEnd = () => {
        lastDist.current = 0
        lastCenter.current = undefined
    }

    const onDragEnd = () => {
        stage && onPosition(stage.position())
    }

    return {
        onDragEnd,
        onScale,
        onTouchEnd,
        onTouchMove,
        onWheel
    }
}
