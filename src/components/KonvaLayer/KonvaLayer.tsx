import React, { useCallback, useRef, useState, useEffect } from 'react'
import Konva from 'konva'
import { Image } from 'react-konva'
import { toast } from 'react-toastify'
import { Theme } from '@mui/material/styles'
import { isEqual } from 'lodash'

import logger from '../../common/utils/logger'
import { TOOLS } from '../../common/tools'
import { SelectedTile } from '../../common/types'
import { createTileFromImageData } from '../../store/editor/utils'
import {
    actionDraw,
    actionLine,
    getCoordsFromPos,
    getPointerRelativePos,
    fillColor,
    pickColor,
    fillTile
} from '../../common/utils/konva'
import { isArray } from '../../common/utils/array'
import { useCanvasBuffer } from '../../hooks/useCanvasBuffer'
import { EditorActions } from '../../hooks/useEditorActions'
import { usePrevious } from '../../hooks/usePrevious'
import { Grid, Layer, Selected, Tileset, Workspace } from '../../store/editor/types'

interface Props {
    editorActions: EditorActions
    grid: Grid
    isMouseDown: boolean
    keyDown: KeyboardEvent | null
    layer: Layer
    selected: Selected
    stage: Konva.Stage
    tileset: Tileset
    tilesetCanvas: HTMLCanvasElement
    theme: Theme
    workspace: Workspace
}

const KonvaLayer: React.FunctionComponent<Props> = ({
    editorActions: {
        onCopySelectedArea,
        onChangeLayerData,
        onChangeLayerImage,
        onChangeLayerOffset,
        onChangePrimaryColor,
        onChangeSelectedTile,
        onChangeTileset,
        onSaveTilesetImage,
        onPaste
    },
    grid,
    isMouseDown,
    keyDown,
    layer,
    selected,
    stage,
    tileset,
    tilesetCanvas,
    theme,
    workspace
}) => {
    const { opacity, visible } = layer
    const { tilewidth, tileheight } = tileset

    const [data, setData] = useState<(number | null)[]>()
    const [selectedTile, setSelectedTile] = useState<SelectedTile>()

    const imageRef = useRef<Konva.Image>(null)
    const lastPos = useRef<Konva.Vector2d>()
    const lastLinePos = useRef<Konva.Vector2d>()
    const tempData = useRef<(number | null)[]>([])
    const isSelected = selected.layerId === layer.id

    const {
        ctx,
        image,
        width,
        height,
        bufferCtx,
        bufferImage,
        clearBuffer,
        getBufferPos,
        renderTile,
        renderFromBuffer,
        renderTileToBuffer
    } = useCanvasBuffer(grid, layer, stage, tileset, tilesetCanvas)

    const prevData = usePrevious(layer.data)

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

    const updateLayer = (x: number, y: number, gid: number | null) => {
        if (layer.width) {
            const pos = x + ((layer.width * tilewidth) / grid.width) * y
            if (gid !== -1) {
                if (data && data[pos] !== gid) {
                    tempData.current[pos] = gid
                }
                renderTile(gid, pos)
            } else if (selected.stamp?.data) {
                const { width, data } = selected.stamp
                data.forEach((g, i) => {
                    const x1 = x + (i % (width / grid.width))
                    const y1 = y + Math.ceil((i + 1) / (width / grid.width) - 1)
                    if (g !== null) tempData.current[x1 + ((layer.width * tilewidth) / grid.width) * y1] = g
                })
            }
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
            onChangeLayerData(
                layer.id,
                data.map(tile => (tile === gid ? selected.tileId : tile))
            )
        }
    }

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
                        renderTileToBuffer(selected, currentPos)
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
                case TOOLS.COLOR_FILL:
                    if (secondBtnPressed) {
                        onChangePrimaryColor(pickColor(ctx, currentPos))
                    } else if (bufferCtx && bufferImage) {
                        fillColor(pos, selected.color, bufferImage, bufferCtx)
                        renderFromBuffer(selectedTile)
                    }
                    break
                case TOOLS.TILE_FILL:
                    if (selected.tileId) {
                        fillTile(selected.tileId, currentPos, layer, grid, tileset, newData =>
                            onChangeLayerData(layer.id, newData)
                        )
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
                    if (selected.tileId > -1 && (nextPos.x !== prevPos.x || nextPos.y !== prevPos.y)) {
                        if (layer.data) {
                            const { x, y } = getCoordsFromPos(grid, nextPos)
                            updateLayer(x, y, selected.tool === TOOLS.STAMP ? selected.tileId : null)
                        } else if (selected.tool === TOOLS.STAMP) {
                            renderTileToBuffer(selected, nextPos)
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
                    data && !isEqual(data, tempData.current) && onChangeLayerData(layer.id, tempData.current)
                    break
                case TOOLS.BRIGHTNESS:
                case TOOLS.ERASER:
                case TOOLS.LINE:
                case TOOLS.PENCIL:
                case TOOLS.COLOR_FILL:
                    // create a new tile when it was drawn on empty slot
                    if (selectedTile && !selectedTile.gid && bufferCtx) {
                        const gid = tileset.tilecount + 1
                        createTile(bufferCtx.getImageData(0, 0, tilewidth, tileheight))
                        updateLayer(selectedTile.x, selectedTile.y, gid)
                        renderFromBuffer({ ...selectedTile, gid })
                        onChangeLayerData(layer.id, tempData.current)
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

    const redraw = useCallback(() => {
        if (isArray(data)) {
            data.forEach(renderTile)
            stage.batchDraw()
            logger.info('Redraw', 'LAYER')
        }
    }, [data, renderTile, stage])

    useEffect(() => {
        redraw()
    }, [redraw])

    useEffect(() => {
        if (!isEqual(layer.data, prevData) && isArray(layer.data)) {
            setData(layer.data)
            tempData.current = [...layer.data]
            logger.info('Data has changed!', 'LAYER')
        }
    }, [layer.data, prevData])

    useEffect(() => {
        if (keyDown && isSelected && image) {
            if (keyDown.code === 'KeyC' && (keyDown.ctrlKey || keyDown.metaKey) && selected.tool === TOOLS.SELECT) {
                onCopySelectedArea(image)
            }
            if (keyDown.code === 'KeyV' && (keyDown.ctrlKey || keyDown.metaKey) && selected.tileId !== -1) {
                onPaste()
            }
        }
    }, [image, isSelected, keyDown, onCopySelectedArea, onPaste, selected.tool, selected.tileId])

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
