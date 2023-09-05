import React, { useRef, useEffect } from 'react'
import Konva from 'konva'
import useImage from 'use-image'
import { Group, Rect } from 'react-konva'
import { TOOLS } from '../../common/tools'
import { getRgbaValue } from '../../common/utils/colors'
import { getPointerRelativePos } from '../../common/utils/konva'
import { getTilePos } from '../../store/editor/utils'
import { Grid, Layer, Selected, Tileset, Workspace } from '../../store/editor/types'

interface Props {
    grid: Grid
    pointerPosition: Konva.Vector2d
    selected: Selected
    selectedLayer: Layer | null
    tileset: Tileset
    workspace: Workspace
}

const Pointer: React.FunctionComponent<Props> = ({
    grid,
    pointerPosition,
    selected,
    selectedLayer,
    tileset,
    workspace
}) => {
    const { tilewidth: width, tileheight: height } = tileset
    const { scale } = workspace

    const pointerRef = useRef<Konva.Rect>(null)
    const pointerOverlayRef = useRef<Konva.Rect>(null)
    const offset = selectedLayer?.offset || { x: 0, y: 0 }
    const pointerRelPosition = getPointerRelativePos(workspace, pointerPosition as Konva.Vector2d)
    const x = Math.ceil((pointerRelPosition.x - offset.x) / grid.width) - 1
    const y = Math.ceil((pointerRelPosition.y - offset.y) / grid.height) - 1

    const pasteImage = selected.tileId === -1 && (selected.stamp?.data || selectedLayer?.image) && selected.stamp?.image

    const [fillPatternImage] = useImage(pasteImage || tileset.image)

    const [posX, posY] =
        [TOOLS.DELETE, TOOLS.REPLACE, TOOLS.STAMP, TOOLS.TILE_FILL].includes(selected.tool) && selectedLayer?.data
            ? [x * width + offset.x, y * height + offset.y]
            : [pointerRelPosition.x, pointerRelPosition.y]

    useEffect(() => {
        if (pointerRef.current && pointerOverlayRef.current && fillPatternImage) {
            const pointer = pointerRef.current
            const overlay = pointerOverlayRef.current
            if ([TOOLS.STAMP, TOOLS.REPLACE, , TOOLS.TILE_FILL].includes(selected.tool)) {
                const w = (pasteImage && selected.stamp?.width) || width
                const h = (pasteImage && selected.stamp?.height) || height
                overlay.setAttrs({
                    fill: 'rgba(150,200,255,0.3)',
                    height: h,
                    stroke: '#96cdff',
                    width: w
                })
                pointer.setAttrs({
                    fillPatternImage,
                    height: h,
                    stroke: '#96cdff',
                    width: w
                })
                pointer.fillPatternOffset(pasteImage ? { x: 0, y: 0 } : getTilePos(selected.tileId, tileset))
            } else if (selected.tool === TOOLS.DELETE) {
                overlay.setAttrs({
                    fill: 'rgba(255,128,128,0.3)',
                    height,
                    stroke: '#ff8080',
                    width
                })
            } else if (selected.tool === TOOLS.PICKER) {
                overlay.setAttrs({
                    fill: 'rgba(0,0,0,0)',
                    height: 1,
                    stroke: 'rgba(255,255,255,0.8)',
                    width: 1
                })
            } else {
                const toolSize = [TOOLS.BRIGHTNESS, TOOLS.LINE, TOOLS.PENCIL, TOOLS.ERASER].includes(selected.tool)
                    ? selected.toolSize
                    : 1
                overlay.setAttrs({
                    fill:
                        selected.tool !== TOOLS.ERASER && selected.tool !== TOOLS.BRIGHTNESS
                            ? getRgbaValue(selected.color)
                            : undefined,
                    height: toolSize,
                    stroke: 'rgba(255,255,255,0.8)',
                    width: toolSize
                })
            }
        }
    }, [pasteImage, fillPatternImage, tileset, selected, height, width])

    return (
        <Group listening={false}>
            <Rect
                visible={[TOOLS.REPLACE, TOOLS.STAMP, TOOLS.TILE_FILL].includes(selected.tool)}
                ref={pointerRef}
                strokeWidth={0.1}
                x={posX}
                y={posY}
            />
            <Rect ref={pointerOverlayRef} strokeWidth={0.5 / scale} x={posX} y={posY} />
        </Group>
    )
}

Pointer.displayName = 'Pointer'

export default Pointer
