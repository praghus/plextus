import React, { useCallback, useEffect, useState } from 'react'
import Konva from 'konva'
import { Rect } from 'react-konva'
import { Grid, Workspace } from '../../store/editor/types'
import { getCoordsFromPos, getPointerRelativePos } from '../../common/utils/konva'

interface Props {
    grid: Grid
    isMouseDown: boolean
    pointerPosition: Konva.Vector2d
    workspace: Workspace
}

const SelectTool: React.FunctionComponent<Props> = ({ isMouseDown, grid, pointerPosition, workspace }) => {
    const [shape, setShape] = useState<Konva.Rect>()
    const [startPos, setStartPos] = useState<Konva.Vector2d>()
    const [isSelecting, setIsSelecting] = useState<boolean>(false)

    const handleShape = useCallback((node: Konva.Rect) => {
        setShape(node)
    }, [])

    useEffect(() => {
        if (isMouseDown && !isSelecting) {
            setIsSelecting(true)
            setStartPos(getPointerRelativePos(workspace, pointerPosition as Konva.Vector2d))
        }
    }, [isMouseDown])

    useEffect(() => {
        if (isMouseDown && startPos) {
            const endRelPosition = getPointerRelativePos(workspace, pointerPosition as Konva.Vector2d)
            const { x: x1, y: y1 } = getCoordsFromPos(grid, startPos)
            const { x: x2, y: y2 } = getCoordsFromPos(grid, endRelPosition)
            const width = grid.width + (x2 - x1) * grid.width
            const height = grid.height + (y2 - y1) * grid.height
            shape?.x(x1 * grid.width)
            shape?.y(y1 * grid.height)
            shape?.width(width)
            shape?.height(height)
        } else {
            setIsSelecting(false)
        }
    }, [grid, isMouseDown, pointerPosition, startPos])

    return <Rect ref={handleShape} id="selectRect" fill="rgba(0,128,255,0.3)" />
}
SelectTool.displayName = 'SelectTool'

export default SelectTool
