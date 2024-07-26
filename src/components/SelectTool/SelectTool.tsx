import { useCallback, useEffect, useState } from 'react'
import Konva from 'konva'
import { Group, Rect } from 'react-konva'
import { Grid, Layer, Workspace } from '../../stores/editor/types'
import { getCoordsFromPos, getPointerRelativePos, getSelectionRect } from '../../common/utils/konva'
import { useEditorActions } from '../../hooks/useEditorActions'

interface Props {
    grid: Grid
    isMouseDown: boolean
    pointerPosition: Konva.Vector2d
    selectedLayer: Layer | null
    workspace: Workspace
}

const SelectTool = ({ isMouseDown, grid, pointerPosition, selectedLayer, workspace }: Props) => {
    const [shape, setShape] = useState<Konva.Rect>()
    const [startPos, setStartPos] = useState<Konva.Vector2d>()
    const [isSelecting, setIsSelecting] = useState<boolean>(false)

    const { onChangeSelectedArea } = useEditorActions()

    const handleShape = useCallback((node: Konva.Rect) => {
        setShape(node)
    }, [])

    useEffect(() => {
        if (shape) {
            shape.x(0)
            shape.y(0)
            shape.width(0)
            shape.height(0)
            setIsSelecting(false)
        }
    }, [selectedLayer?.id, shape])

    useEffect(() => {
        if (isMouseDown && !isSelecting) {
            setIsSelecting(true)
            setStartPos(getPointerRelativePos(workspace, pointerPosition as Konva.Vector2d))
        }
    }, [isMouseDown, isSelecting, setStartPos, pointerPosition, workspace])

    useEffect(() => {
        if (isMouseDown && startPos && shape) {
            const endPos = getPointerRelativePos(workspace, pointerPosition as Konva.Vector2d)
            if (selectedLayer?.data) {
                const { x: x1, y: y1 } = getCoordsFromPos(grid, startPos)
                const { x: x2, y: y2 } = getCoordsFromPos(grid, endPos)
                shape.x(x1 * grid.width)
                shape.y(y1 * grid.height)
                shape.width(grid.width + (x2 - x1) * grid.width)
                shape.height(grid.height + (y2 - y1) * grid.height)
            } else {
                const { x: x1, y: y1 } = startPos
                const { x: x2, y: y2 } = endPos
                shape.x(x1)
                shape.y(y1)
                shape.width(x2 - x1)
                shape.height(y2 - y1)
            }
        } else if (isSelecting) {
            if (shape) {
                onChangeSelectedArea(getSelectionRect(shape))
            }
            setIsSelecting(false)
        }
    }, [
        grid,
        isMouseDown,
        isSelecting,
        onChangeSelectedArea,
        pointerPosition,
        startPos,
        selectedLayer,
        shape,
        workspace
    ])

    return (
        <Group>
            <Rect ref={handleShape} id="selectRect" fill="rgba(0,128,255,0.3)" />
        </Group>
    )
}
SelectTool.displayName = 'SelectTool'

export default SelectTool
