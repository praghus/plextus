import React, { useRef, useEffect } from 'react'
import Konva from 'konva'
import useImage from 'use-image'
import { Rect } from 'react-konva'
import { TOOLS } from '../common/constants'
import { getRgbaValue } from '../common/utils/colors'
import { getCoordsFromPos } from '../common/utils/konva'
import { getTilePos } from '../store/editor/utils'
import { Grid, Selected, Tileset } from '../store/editor/types'

type Props = {
    grid: Grid
    isMouseDown: boolean
    isMouseOver: boolean
    pointerRelPosition: Konva.Vector2d
    scale: number
    selected: Selected
    tileset: Tileset
}

const Pointer = ({
    grid,
    isMouseDown,
    isMouseOver,
    pointerRelPosition,
    scale,
    selected,
    tileset
}: Props): JSX.Element | null => {
    if (isMouseDown || !isMouseOver || selected.tool === TOOLS.DRAG || selected.tool === TOOLS.CROP) {
        return null
    }
    const { tilewidth: width, tileheight: height } = tileset
    const pointerRef = useRef<Konva.Rect>(null)
    const pointerOverlayRef = useRef<Konva.Rect>(null)
    const { x, y } = getCoordsFromPos(grid, pointerRelPosition as Konva.Vector2d)
    const [fillPatternImage] = useImage(tileset.image)
    const [posX, posY] =
        selected.tool === TOOLS.STAMP || selected.tool === TOOLS.DELETE
            ? [x * width, y * height]
            : [Math.floor(pointerRelPosition.x), Math.floor(pointerRelPosition.y)]

    useEffect(() => {
        if (pointerRef.current && pointerOverlayRef.current && fillPatternImage) {
            const pointer = pointerRef.current
            const overlay = pointerOverlayRef.current
            if (selected.tool === TOOLS.STAMP) {
                overlay.setAttrs({
                    width,
                    height,
                    stroke: '#96cdff',
                    fill: 'rgba(150,200,255,0.3)'
                })
                pointer.setAttrs({
                    width,
                    height,
                    fillPatternImage,
                    stroke: '#96cdff'
                })
                pointer.fillPatternOffset(getTilePos(selected.tileId, tileset))
            } else if (selected.tool === TOOLS.DELETE) {
                overlay.setAttrs({
                    width,
                    height,
                    stroke: '#ff8080',
                    fill: 'rgba(255,128,128,0.3)'
                })
            } else {
                const toolSize = [TOOLS.LINE, TOOLS.PENCIL, TOOLS.ERASER].includes(selected.tool)
                    ? selected.toolSize
                    : 1
                overlay.setAttrs({
                    width: toolSize,
                    height: toolSize,
                    stroke: 'rgba(255,255,255,0.8)',
                    fill: selected.tool !== TOOLS.ERASER && getRgbaValue(selected.color)
                })
            }
        }
    }, [fillPatternImage, tileset, selected])

    return (
        <>
            <Rect
                visible={selected.tool === TOOLS.STAMP}
                listening={false}
                ref={pointerRef}
                strokeWidth={0.1}
                x={posX}
                y={posY}
            />
            <Rect listening={false} ref={pointerOverlayRef} strokeWidth={0.5 / scale} x={posX} y={posY} />
        </>
    )
}

Pointer.displayName = 'Pointer'

export default Pointer
