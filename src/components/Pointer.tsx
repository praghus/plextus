import React, { useRef, useState, useEffect } from 'react'
import Konva from 'konva'
import useImage from 'use-image'
import { Group, Rect } from 'react-konva'
import {
    getCoordsFromPos,
    getPointerRelativePos,
    getTilePos
    // textRenderer
} from '../store/editor/utils'
import { Canvas, Grid, Selected, Tileset, Workspace } from '../store/editor/types'

type Props = {
    grid: Grid
    pointerRelPosition: Konva.Vector2d | null
    selected: Selected
    tileset: Tileset
}

const Pointer = ({ grid, selected, tileset, pointerRelPosition }: Props): JSX.Element => {
    // const [pointerPosition, setPointerPosition] = useState<Konva.Vector2d>({ x: 0, y: 0 })
    const [image] = useImage(tileset.image)
    const [offset, setOffset] = useState(getTilePos(selected.tileId, tileset))
    const { tilewidth, tileheight } = tileset
    const { x, y } = getCoordsFromPos(grid, pointerRelPosition as Konva.Vector2d)

    useEffect(() => {
        setOffset(getTilePos(selected.tileId, tileset))
    }, [tileset, selected.tileId])

    return (
        <Rect
            x={x * tilewidth}
            y={y * tileheight}
            shadowBlur={2}
            width={tilewidth}
            height={tileheight}
            fillPatternImage={image}
            fillPatternOffsetX={offset.x}
            fillPatternOffsetY={offset.y}
        />
    )
}

Pointer.displayName = 'Pointer'

export default Pointer
