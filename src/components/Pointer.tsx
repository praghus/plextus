import React, { useRef, useEffect } from 'react'
import Konva from 'konva'
import useImage from 'use-image'
import { Rect } from 'react-konva'
import { TOOLS } from '../common/constants'
import { getRgbaValue } from '../common/utils/colors'
import { getCoordsFromPos, getPointerRelativePos } from '../common/utils/konva'
import { getTilePos } from '../store/editor/utils'
import { Grid, Layer, Selected, Tileset, Workspace } from '../store/editor/types'

type Props = {
    grid: Grid
    isMouseDown: boolean
    isMouseOver: boolean
    pointerPosition: Konva.Vector2d
    scale: number
    selected: Selected
    selectedLayer: Layer | null
    tileset: Tileset
    workspace: Workspace
}

const Pointer = ({
    grid,
    isMouseDown,
    isMouseOver,
    pointerPosition,
    scale,
    selected,
    selectedLayer,
    tileset,
    workspace
}: Props): JSX.Element | null => {
    if (isMouseDown || !isMouseOver || [TOOLS.DRAG, TOOLS.CROP, TOOLS.OFFSET].includes(selected.tool)) {
        return null
    }
    const { tilewidth: width, tileheight: height } = tileset

    const pointerRef = useRef<Konva.Rect>(null)
    const pointerOverlayRef = useRef<Konva.Rect>(null)
    const offset = selectedLayer?.offset || { x: 0, y: 0 }
    const pointerRelPosition = getPointerRelativePos(workspace, pointerPosition as Konva.Vector2d)
    const x = Math.ceil((pointerRelPosition.x - offset.x) / grid.width) - 1
    const y = Math.ceil((pointerRelPosition.y - offset.y) / grid.height) - 1

    const [fillPatternImage] = useImage(tileset.image)
    const [posX, posY] = [TOOLS.DELETE, TOOLS.REPLACE, TOOLS.STAMP].includes(selected.tool)
        ? [x * width + offset.x, y * height + offset.y]
        : [Math.floor(pointerRelPosition.x), Math.floor(pointerRelPosition.y)]

    useEffect(() => {
        if (pointerRef.current && pointerOverlayRef.current && fillPatternImage) {
            const pointer = pointerRef.current
            const overlay = pointerOverlayRef.current
            if ([TOOLS.STAMP, TOOLS.REPLACE].includes(selected.tool)) {
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
                visible={[TOOLS.REPLACE, TOOLS.STAMP].includes(selected.tool)}
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
