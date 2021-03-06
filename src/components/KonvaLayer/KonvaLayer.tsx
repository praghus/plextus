import React, { useCallback, useRef, useState, useEffect } from 'react'
import Konva from 'konva'
import { Image } from 'react-konva'
import { toast } from 'react-toastify'
import { Theme } from '@mui/material/styles'

import logger from '../../common/utils/logger'
import { TOOLS } from '../../common/tools'
import { SelectedTile } from '../../common/types'
import { parseLayerData } from '../../common/utils/pako'
import { createTileFromImageData, getTilePos } from '../../store/editor/utils'
import {
    actionDraw,
    actionLine,
    getCoordsFromPos,
    getPointerRelativePos,
    fillColor,
    pickColor
} from '../../common/utils/konva'
import { isArray } from '../../common/utils/array'
import { useCanvasBuffer } from '../../hooks/useCanvasBuffer'
import { Grid, DeflatedLayer, Selected, Tileset, Workspace } from '../../store/editor/types'

interface Props {
    grid: Grid
    isMouseDown: boolean
    keyDown: KeyboardEvent | null
    layer: DeflatedLayer
    onChangeLayerData: (layerId: string, data: (number | null)[]) => void
    onChangeLayerImage: (layerId: string, blob: Blob) => void
    onChangeLayerOffset: (layerId: string, x: number, y: number) => void
    onChangePrimaryColor: (color: number[]) => void
    onChangeSelectedTile: (tileId: number) => void
    onChangeTileset: (tileset: Tileset) => void
    onSaveTilesetImage: (blob: Blob) => void
    selected: Selected
    stage: Konva.Stage
    tileset: Tileset
    tilesetCanvas: HTMLCanvasElement
    theme: Theme
    workspace: Workspace
}

const KonvaLayer: React.FunctionComponent<Props> = ({
    grid,
    isMouseDown,
    keyDown,
    layer,
    onChangeLayerData,
    onChangeLayerImage,
    onChangeLayerOffset,
    onChangePrimaryColor,
    onChangeSelectedTile,
    onChangeTileset,
    onSaveTilesetImage,
    selected,
    stage,
    tileset,
    tilesetCanvas,
    theme,
    workspace
}) => {
    const [data, setData] = useState<(number | null)[]>()
    const [selectedTile, setSelectedTile] = useState<SelectedTile>()

    const imageRef = useRef<Konva.Image>(null)
    const lastPos = useRef<Konva.Vector2d>()
    const lastLinePos = useRef<Konva.Vector2d>()
    const isSelected = selected.layerId === layer.id

    const { opacity, visible } = layer
    const { tilewidth, tileheight } = tileset

    const {
        ctx,
        image,
        width,
        height,
        bufferCtx,
        bufferImage,
        clearBuffer,
        getBufferPos,
        renderFromBuffer,
        renderTileToBuffer
    } = useCanvasBuffer(grid, layer, stage, tileset, tilesetCanvas)

    const getPos = () => getPointerRelativePos(workspace, stage.getPointerPosition() as Konva.Vector2d, layer.offset)

    const getGid = (x: number, y: number) =>
        isArray(data) ? data[x + ((layer.width * tilewidth) / grid.width) * y] : null

    const drawLine = (pos1: Konva.Vector2d, pos2: Konva.Vector2d) => {
        if (ctx && bufferCtx && bufferImage) {
            if (layer.image) {
                actionLine(pos1, pos2, selected, bufferCtx, keyDown)
                ctx.clearRect(0, 0, width, height)
                ctx.drawImage(bufferImage, 0, 0)
            } else if (selectedTile) {
                actionLine(
                    getBufferPos(pos1, selectedTile),
                    getBufferPos(pos2, selectedTile),
                    selected,
                    bufferCtx,
                    keyDown
                )
                ctx.clearRect(selectedTile.x * tilewidth, selectedTile.y * tileheight, tilewidth, tileheight)
                ctx.drawImage(
                    bufferImage,
                    selectedTile.x * tilewidth,
                    selectedTile.y * tileheight,
                    tilewidth,
                    tileheight
                )
            }
            stage.batchDraw()
        }
    }

    const updateLayer = (x: number, y: number, gid: number | null, update = false) => {
        if (layer.width) {
            const pos = x + ((layer.width * tilewidth) / grid.width) * y
            if (data && data[pos] !== gid) {
                const tempData = [...data]
                tempData[pos] = gid
                setData(tempData)
                if (update) {
                    onChangeLayerData(layer.id, tempData)
                }
            }
            drawTile(gid, pos)
            stage.batchDraw()
        }
    }

    const createTile = async (data: ImageData) => {
        const { blob, newTileId } = await createTileFromImageData(tileset, tilesetCanvas, data)
        onChangeTileset({ ...tileset, tilecount: newTileId })
        onChangeSelectedTile(newTileId)
        onSaveTilesetImage(blob)
    }

    const cloneTile = (x: number, y: number) => {
        if (ctx) {
            const [sx, sy] = layer.image
                ? [Math.ceil(-1 + x / grid.width) * grid.width, Math.ceil(-1 + y / grid.height) * grid.height]
                : [x * tilewidth, y * tileheight]
            createTile(ctx.getImageData(sx, sy, tilewidth, tileheight))
        }
    }

    const replaceTile = (gid: number) => {
        if (data && selected.tileId) {
            const tempData = data.map(tile => (tile === gid ? selected.tileId : tile))
            setData(tempData)
        }
    }

    const drawTile = useCallback(
        (gid: number | null, i: number) => {
            if (ctx && layer.width) {
                const x = (i % layer.width) * grid.width
                const y = Math.ceil((i + 1) / layer.width - 1) * grid.height
                const [w, h] = [tileset.tilewidth, tileset.tileheight]
                ctx.clearRect(x, y, w, h)
                if (gid) {
                    const { x: posX, y: posY } = getTilePos(gid, tileset)
                    ctx.drawImage(tilesetCanvas, posX, posY, w, h, x, y, w, h)
                } else if (isSelected) {
                    ctx.fillStyle = 'rgba(0,0,0,0.2)'
                    ctx.fillRect(x, y, w, h)
                }
            }
        },
        [ctx, grid.height, grid.width, isSelected, layer.width, tileset, tilesetCanvas]
    )

    const onStartDrawing = (secondBtnPressed = false) => {
        if (ctx && visible && isSelected && layer.width) {
            const currentPos = getPos()
            const { x, y } = getCoordsFromPos(grid, currentPos)
            const selectedTile: SelectedTile | undefined = data ? { gid: getGid(x, y), x, y } : undefined
            const pos = selectedTile ? getBufferPos(currentPos) : currentPos

            clearBuffer(selectedTile)

            switch (selected.tool) {
                case TOOLS.REPLACE:
                    selectedTile && selectedTile?.gid !== null && replaceTile(selectedTile.gid)
                    break
                case TOOLS.DELETE:
                case TOOLS.STAMP:
                    if (secondBtnPressed) {
                        selectedTile && selectedTile?.gid !== null
                            ? onChangeSelectedTile(selectedTile.gid)
                            : cloneTile(pos.x, pos.y)
                    } else if (selectedTile) {
                        keyDown?.code === 'AltLeft'
                            ? cloneTile(x, y)
                            : updateLayer(x, y, selected.tool === TOOLS.STAMP ? selected.tileId : null)
                    } else if (selected.tool === TOOLS.STAMP) {
                        renderTileToBuffer(selected.tileId, currentPos)
                    }
                    break
                case TOOLS.PENCIL:
                case TOOLS.ERASER:
                    if (secondBtnPressed) {
                        onChangePrimaryColor(pickColor(ctx, currentPos))
                    } else if (bufferCtx) {
                        actionDraw(pos, selected, bufferCtx, keyDown)
                        renderFromBuffer(selectedTile)
                    }
                    break
                case TOOLS.PICKER:
                    onChangePrimaryColor(pickColor(ctx, currentPos))
                    break
                case TOOLS.FILL:
                    if (secondBtnPressed) {
                        onChangePrimaryColor(pickColor(ctx, currentPos))
                    } else if (bufferCtx && bufferImage) {
                        fillColor(pos, selected.color, bufferImage, bufferCtx)
                        renderFromBuffer(selectedTile)
                    }
                    break
                case TOOLS.LINE:
                    if (secondBtnPressed) {
                        onChangePrimaryColor(pickColor(ctx, currentPos))
                    }
                    lastLinePos.current = lastPos.current
                    break
                default:
                    break
            }
            lastPos.current = currentPos
            selectedTile && setSelectedTile(selectedTile)
        }
    }

    const onDrawing = () => {
        const prevPos = lastPos.current as Konva.Vector2d
        const nextPos = getPos()

        if (isMouseDown) {
            switch (selected.tool) {
                case TOOLS.DELETE:
                case TOOLS.STAMP:
                    if (nextPos.x !== prevPos.x || nextPos.y !== prevPos.y) {
                        if (layer.data) {
                            const { x, y } = getCoordsFromPos(grid, nextPos)
                            updateLayer(x, y, selected.tool === TOOLS.STAMP ? selected.tileId : null)
                        } else if (selected.tool === TOOLS.STAMP) {
                            renderTileToBuffer(selected.tileId, nextPos)
                        }
                    }
                    break
                case TOOLS.BRIGHTNESS:
                case TOOLS.ERASER:
                case TOOLS.PENCIL:
                    if (nextPos.x !== prevPos.x || nextPos.y !== prevPos.y) {
                        drawLine(prevPos, nextPos)
                        renderFromBuffer(selectedTile)
                    }
                    break
                case TOOLS.LINE:
                    if (
                        lastLinePos.current &&
                        (lastLinePos.current.x !== prevPos.x || lastLinePos.current.y !== prevPos.y)
                    ) {
                        clearBuffer(selectedTile)
                        drawLine(lastLinePos.current, nextPos)
                    }
                    break
                default:
                    break
            }
        }
        lastPos.current = nextPos
    }

    const onEndDrawing = () => {
        if (layer.image && image) {
            renderFromBuffer()
            image.toBlob(blob => blob && onChangeLayerImage(layer.id, blob), 'image/png')
        } else {
            switch (selected.tool) {
                case TOOLS.DELETE:
                case TOOLS.REPLACE:
                case TOOLS.STAMP:
                    data && onChangeLayerData(layer.id, data)
                    break
                case TOOLS.BRIGHTNESS:
                case TOOLS.ERASER:
                case TOOLS.LINE:
                case TOOLS.PENCIL:
                case TOOLS.FILL:
                    // create a new tile when it was drawn on empty slot
                    if (selectedTile && !selectedTile.gid && bufferCtx) {
                        const gid = tileset.tilecount + 1
                        createTile(bufferCtx.getImageData(0, 0, tilewidth, tileheight))
                        updateLayer(selectedTile.x, selectedTile.y, gid, true)
                        renderFromBuffer({ ...selectedTile, gid })
                        toast.success(`New tile #${gid} created`)
                    } else {
                        renderFromBuffer(selectedTile)
                        tilesetCanvas.toBlob(blob => blob && onSaveTilesetImage(blob), 'image/png')
                    }
                    break
                default:
                    break
            }
        }
    }

    const onDragEnd = () => {
        if (imageRef.current) {
            onChangeLayerOffset(layer.id, Math.round(imageRef.current.x()), Math.round(imageRef.current.y()))
        }
    }

    const redraw = () => {
        if (ctx && isArray(data)) {
            ctx.clearRect(0, 0, width, height)
            data.map(drawTile)
            stage.batchDraw()
            logger.info('Redraw', 'LAYER')
        }
    }

    useEffect(() => {
        if (layer.data) {
            setData(parseLayerData(layer.data))
            logger.info('Set data', 'LAYER')
        }
    }, [layer.data])

    useEffect(() => {
        redraw()
    }, [layer.data, tilesetCanvas, image]) // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <Image
            key={layer.id}
            ref={imageRef}
            listening={isSelected && visible}
            opacity={opacity / 255}
            stroke={theme.palette.mode === 'dark' ? '#90caf9' : '#1976d2'}
            strokeWidth={2 / stage.scaleX()}
            strokeEnabled={selected.tool === TOOLS.OFFSET}
            draggable={isSelected && visible && selected.tool === TOOLS.OFFSET}
            onTouchStart={() => onStartDrawing(false)}
            onMouseDown={e => onStartDrawing(e.evt.button === 2)}
            onTouchMove={onDrawing}
            onMouseMove={onDrawing}
            onTouchEnd={onEndDrawing}
            onMouseUp={onEndDrawing}
            x={layer.offset.x || 0}
            y={layer.offset.y || 0}
            {...{
                height,
                image,
                onDragEnd,
                visible,
                width
            }}
        />
    )
}

KonvaLayer.displayName = 'KonvaLayer'

export default KonvaLayer
