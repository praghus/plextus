import React, { useRef, useState, useEffect } from 'react'
import Konva from 'konva'
import { Image } from 'react-konva'
import { TOOLS } from '../common/constants'
import { getTilePos } from '../store/editor/utils'
import {
    actionDraw,
    actionLine,
    getCoordsFromPos,
    getPointerRelativePos,
    fillColor,
    pickColor
} from '../common/utils/konva'
import { isValidArray } from '../common/utils/array'
import { getRgbaValue } from '../common/utils/colors'
import { Canvas, Grid, Layer, Selected, Tileset, Workspace } from '../store/editor/types'

type Props = {
    canvas: Canvas
    grid: Grid
    isMouseDown: boolean
    keyDown: KeyboardEvent | null
    layer: Layer
    onChangeLayerData: (layerId: string, data: (number | null)[]) => void
    onChangeLayerOffset: (layerId: string, x: number, y: number) => void
    onChangePrimaryColor: (color: number[]) => void
    onChangeSelectedTile: (tileId: number) => void
    onChangeTileset: (tileset: any) => void
    onSaveTilesetImage: (blob: Blob) => void
    selected: Selected
    stage: Konva.Stage
    tileset: Tileset
    tilesetCanvas: HTMLCanvasElement
    workspace: Workspace
}

type SelectedTile = { gid: number; x: number; y: number }

const TileLayer = ({
    canvas,
    grid,
    isMouseDown,
    keyDown,
    layer,
    onChangeLayerData,
    onChangeLayerOffset,
    onChangePrimaryColor,
    onChangeSelectedTile,
    // onChangeTileset,
    onSaveTilesetImage,
    selected,
    stage,
    tileset,
    tilesetCanvas,
    workspace
}: Props): JSX.Element => {
    const [bufferCtx, setBufferCtx] = useState<CanvasRenderingContext2D | undefined>()
    const [bufferImage, setBufferImage] = useState<HTMLCanvasElement>()
    const [ctx, setCtx] = useState<CanvasRenderingContext2D | undefined>()
    const [data, setData] = useState<(number | null)[]>()
    const [image, setImage] = useState<CanvasImageSource>()
    const [selectedTile, setSelectedTile] = useState<SelectedTile>({} as SelectedTile)

    const imageRef = useRef<Konva.Image>(null)
    const lastPos = useRef<Konva.Vector2d | null>()
    const lastLinePos = useRef<Konva.Vector2d | null>()
    const hasChanged = useRef<boolean>(false)
    const tilesetContext = tilesetCanvas.getContext('2d')
    const isSelected = selected.layerId === layer.id

    const { width, height } = canvas
    const { opacity, visible } = layer
    const { tilewidth, tileheight } = tileset

    useEffect(() => {
        const canvasElement: any = document.createElement('canvas')
        const canvasContext: CanvasRenderingContext2D = canvasElement.getContext('2d')
        const canvasBufferElement: any = document.createElement('canvas')
        const canvasBufferContext: CanvasRenderingContext2D = canvasBufferElement.getContext('2d')

        canvasElement.width = width
        canvasElement.height = height
        canvasBufferElement.width = tilewidth
        canvasBufferElement.height = tileheight

        setImage(canvasElement)
        setCtx(canvasContext)
        setBufferImage(canvasBufferElement)
        setBufferCtx(canvasBufferContext)
    }, [width, height, tilewidth, tileheight])

    useEffect(() => {
        setData(layer.data)
    }, [layer.data])

    useEffect(() => {
        redraw()
    }, [ctx, layer, tilesetCanvas])

    const getPos = (): Konva.Vector2d => {
        return getPointerRelativePos(workspace, stage.getPointerPosition() as Konva.Vector2d, layer.offset)
    }

    const getBufferPos = (pointerPos: Konva.Vector2d): Konva.Vector2d => {
        const { x, y } = getCoordsFromPos(grid, pointerPos)
        return {
            x: Math.floor(pointerPos.x - x * tilewidth),
            y: Math.floor(pointerPos.y - y * tileheight)
        }
    }

    const drawTile = (gid: number | null, i: number): void => {
        if (ctx && layer.width) {
            const x = (i % layer.width) * grid.width
            const y = Math.ceil((i + 1) / layer.width - 1) * grid.height
            ctx.clearRect(x, y, tilewidth, tileheight)
            if (gid) {
                const { x: posX, y: posY } = getTilePos(gid, tileset)
                ctx.drawImage(tilesetCanvas, posX, posY, tilewidth, tileheight, x, y, tilewidth, tileheight)
            } else if (isSelected) {
                ctx.fillStyle = 'rgba(0,0,0,0.2)'
                ctx.fillRect(x, y, tilewidth, tileheight)
            }
        }
    }

    const redraw = (): void => {
        if (ctx && layer.data && isValidArray(layer.data)) {
            ctx.clearRect(0, 0, width, height)
            layer.data.map((gid, i) => drawTile(gid, i))
            stage.batchDraw()
        }
    }

    const drawLine = (pos1: Konva.Vector2d, pos2: Konva.Vector2d): void => {
        const { x, y } = getCoordsFromPos(grid, pos2)
        const inBounds = x === selectedTile.x && y === selectedTile.y
        if (ctx && bufferCtx && bufferImage && inBounds) {
            // renderBuffer(selectedTile.gid)
            actionLine(getBufferPos(pos1), getBufferPos(pos2), selected, bufferCtx, keyDown)
            ctx.clearRect(selectedTile.x * tilewidth, selectedTile.y * tileheight, tilewidth, tileheight)
            ctx.drawImage(bufferImage, selectedTile.x * tilewidth, selectedTile.y * tileheight, tilewidth, tileheight)
            hasChanged.current = true
            // update && renderBufferToImage(selectedTile)
            stage.batchDraw()
        }
    }

    const clearBuffer = (gid: number): void => {
        bufferCtx?.clearRect(0, 0, tilewidth, tileheight)
        if (gid) {
            const { x, y } = getTilePos(gid, tileset)
            bufferCtx?.drawImage(tilesetCanvas, x, y, tilewidth, tileheight, 0, 0, tilewidth, tileheight)
        }
    }

    const renderBufferToImage = (tile: SelectedTile): void => {
        const { gid, x, y } = tile
        if (ctx && gid && bufferCtx && bufferImage && tilesetContext) {
            const { x: tx, y: ty } = getTilePos(gid, tileset)
            ctx.clearRect(x * tilewidth, y * tileheight, tilewidth, tileheight)
            ctx.drawImage(bufferImage, x * tilewidth, y * tileheight, tilewidth, tileheight)
            tilesetContext.clearRect(tx, ty, tilewidth, tileheight)
            tilesetContext.drawImage(bufferImage, tx, ty)
            hasChanged.current = true
        }
    }

    const updateLayer = (x: number, y: number, gid: number | null): void => {
        if (layer.width) {
            const pos = x + ((layer.width * tilewidth) / grid.width) * y
            if (data && data[pos] !== gid) {
                const tempData = [...data]
                tempData[pos] = gid
                setData(tempData)
                stage.batchDraw()
                hasChanged.current = true
            }
            drawTile(gid, pos)
        }
    }

    // const createNewEmptyTile = async (x: number, y: number): Promise<number> => {
    //     const newLayerData = [...(layer.data || [])]
    //     return new Promise(resolve => {
    //         createEmptyTile(tileset, tilesetCanvas, (blob: Blob, newTileId: number) => {
    //             if (layer.width) {
    //                 newLayerData[x + ((layer.width * tilewidth) / grid.width) * y] = newTileId
    //                 setData(newLayerData)
    //             }
    //             onChangeTileset({ ...tileset, tilecount: newTileId })
    //             onChangeSelectedTile(newTileId)
    //             onChangeLayerData(layer.id, newLayerData)
    //             onSaveTilesetImage(blob)
    //             resolve(newTileId)
    //         })
    //     })
    // }

    const replaceTile = (gid: number) => {
        if (data && selected.tileId) {
            const tempData = data.map(tile => (tile === gid ? selected.tileId : tile))
            setData(tempData)
            redraw()
            hasChanged.current = true
        }
    }

    const onMouseDown = async (e: Konva.KonvaEventObject<MouseEvent>) => {
        if (ctx && visible && isSelected && layer.data && layer.width) {
            lastPos.current = getPos()
            const { x, y } = getCoordsFromPos(grid, lastPos.current)
            const gid = layer.data[x + ((layer.width * tilewidth) / grid.width) * y]
            // const gid =
            //     !tileId && [TOOLS.PENCIL, TOOLS.FILL, TOOLS.LINE].includes(selected.tool)
            //         ? await createNewEmptyTile(x, y)
            //         : tileId

            clearBuffer(gid)

            switch (selected.tool) {
                case TOOLS.REPLACE:
                    replaceTile(gid)
                    break
                case TOOLS.DELETE:
                case TOOLS.STAMP:
                    e.evt.button === 2
                        ? gid && onChangeSelectedTile(gid)
                        : updateLayer(x, y, selected.tool === TOOLS.STAMP ? selected.tileId : null)
                    break
                case TOOLS.BRIGHTNESS:
                case TOOLS.PENCIL:
                case TOOLS.ERASER:
                    if (e.evt.button === 2) {
                        onChangePrimaryColor(pickColor(ctx, lastPos.current.x, lastPos.current.y))
                    } else if (gid && bufferCtx) {
                        actionDraw(getBufferPos(lastPos.current), selected, bufferCtx, keyDown)
                        renderBufferToImage({ gid, x, y })
                    }
                    break
                case TOOLS.PICKER:
                    onChangePrimaryColor(pickColor(ctx, lastPos.current.x, lastPos.current.y))
                    break
                case TOOLS.FILL:
                    if (e.evt.button === 2) {
                        onChangePrimaryColor(pickColor(ctx, lastPos.current.x, lastPos.current.y))
                    } else if (gid && bufferCtx) {
                        fillColor(getBufferPos(lastPos.current), selected.color, bufferImage, bufferCtx)
                        renderBufferToImage({ gid, x, y })
                    }
                    break
                case TOOLS.LINE:
                    if (e.evt.button === 2) {
                        onChangePrimaryColor(pickColor(ctx, lastPos.current.x, lastPos.current.y))
                    }
                    lastLinePos.current = lastPos.current
                    break
                default:
                    break
            }
            setSelectedTile({ gid, x, y })
        }
    }

    const onMouseMove = () => {
        const prevPos = lastPos.current as Konva.Vector2d
        const currentPos = getPos()
        const { x, y } = getCoordsFromPos(grid, currentPos)

        if (isMouseDown) {
            switch (selected.tool) {
                case TOOLS.DELETE:
                case TOOLS.STAMP:
                    updateLayer(x, y, selected.tool === TOOLS.STAMP ? selected.tileId : null)
                    break
                case TOOLS.BRIGHTNESS:
                case TOOLS.ERASER:
                case TOOLS.PENCIL:
                    if (selectedTile?.gid && (currentPos.x !== prevPos.x || currentPos.y !== prevPos.y)) {
                        drawLine(prevPos, currentPos)
                        renderBufferToImage(selectedTile)
                    }
                    break
                case TOOLS.LINE:
                    if (
                        selectedTile?.gid &&
                        lastLinePos.current &&
                        (lastLinePos.current.x !== prevPos.x || lastLinePos.current.y !== prevPos.y)
                    ) {
                        clearBuffer(selectedTile.gid)
                        drawLine(lastLinePos.current, currentPos)
                    }
                    break
                default:
                    break
            }
        }
        lastPos.current = currentPos
    }

    const onMouseUp = () => {
        if (hasChanged.current) {
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
                    if (image && selectedTile && tilesetContext) {
                        renderBufferToImage(selectedTile)
                        tilesetCanvas.toBlob(blob => blob && onSaveTilesetImage(blob), 'image/png')
                    }
                    break
                case TOOLS.FILL:
                    tilesetCanvas.toBlob(blob => blob && onSaveTilesetImage(blob), 'image/png')
                    break
                default:
                    break
            }
            hasChanged.current = false
        }
    }

    const onDragEnd = () => {
        if (imageRef.current) {
            onChangeLayerOffset(layer.id, Math.round(imageRef.current.x()), Math.round(imageRef.current.y()))
        }
    }

    return (
        <Image
            key={layer.id}
            ref={imageRef}
            listening={isSelected && visible}
            opacity={opacity / 255}
            stroke={getRgbaValue(grid.color)}
            strokeWidth={1 / workspace.scale}
            strokeEnabled={selected.tool === TOOLS.OFFSET}
            draggable={isSelected && visible && selected.tool === TOOLS.OFFSET}
            x={layer.offset.x || 0}
            y={layer.offset.y || 0}
            {...{
                image,
                onDragEnd,
                onMouseDown,
                onMouseMove,
                onMouseUp,
                visible,
                width,
                height
            }}
        />
    )
}

TileLayer.displayName = 'TileLayer'

export default TileLayer
