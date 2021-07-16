import React, { useRef, useEffect } from 'react'
import Konva from 'konva'
import useImage from 'use-image'
import { Rect } from 'react-konva'
import { getCoordsFromPos, getTilePos } from '../store/editor/utils'
import { Grid, Selected, Tileset } from '../store/editor/types'
import { TOOLS } from '../common/constants'

const TOOL_SIZE = 1

type Props = {
    grid: Grid
    isMouseDown: boolean
    isMouseOver: boolean
    pointerRelPosition: Konva.Vector2d
    selected: Selected
    tileset: Tileset
}

const Pointer = ({
    grid,
    isMouseDown,
    isMouseOver,
    pointerRelPosition,
    selected,
    tileset
}: Props): JSX.Element | null => {
    if (isMouseDown || !isMouseOver || selected.tool === TOOLS.DRAG || selected.tool === TOOLS.CROP) {
        return null
    }

    const pointerRef = useRef<Konva.Rect>(null)
    const { tilewidth, tileheight } = tileset
    const { x, y } = getCoordsFromPos(grid, pointerRelPosition as Konva.Vector2d)
    const [image] = useImage(tileset.image)
    const [posX, posY] =
        selected.tool === TOOLS.STAMP || selected.tool === TOOLS.DELETE
            ? [x * tilewidth, y * tileheight]
            : [Math.ceil(pointerRelPosition.x / TOOL_SIZE) - 1, Math.ceil(pointerRelPosition.y / TOOL_SIZE) - 1]

    useEffect(() => {
        if (pointerRef.current && image) {
            const pointer = pointerRef.current
            if (selected.tool === TOOLS.STAMP) {
                pointer.setAttrs({
                    width: tilewidth,
                    height: tileheight,
                    stroke: '#00C',
                    fillPatternImage: image
                })
                pointer.fillPatternOffset(getTilePos(selected.tileId, tileset))
            } else if (selected.tool === TOOLS.DELETE) {
                pointer.setAttrs({
                    width: tilewidth,
                    height: tileheight,
                    stroke: '#C00',
                    fillPatternImage: null
                })
            } else {
                pointer.setAttrs({
                    width: 1,
                    height: 1,
                    stroke: '#00C',
                    fillPatternImage: null
                })
            }
        }
    }, [image, tileset, selected])

    return <Rect listening={false} ref={pointerRef} strokeWidth={0.1} x={posX} y={posY} />
}

Pointer.displayName = 'Pointer'

export default Pointer
