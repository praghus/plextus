import React, { useRef, useState, useEffect } from 'react'
import Konva from 'konva'
import { Image } from 'react-konva'
import { TOOLS } from '../common/constants'
import { createEmptyTile, getTilePos } from '../store/editor/utils'
import {
    actionDraw,
    actionLine,
    getCoordsFromPos,
    getPointerRelativePos,
    fillColor,
    pickColor
} from '../common/utils/konva'
import { Canvas, Grid, Layer, Selected, Tileset, Workspace } from '../store/editor/types'
import { isValidArray } from '../common/utils/array'

type Props = {
    canvas: Canvas
    grid: Grid
    isMouseDown: boolean
    layer: Layer
    onChangeLayerData: (layerId: string, data: (number | null)[]) => void
    onChangePrimaryColor: (color: number[]) => void
    onChangeSelectedTile: (tileId: number) => void
    onChangeTileset: (tileset: any) => void
    onSaveTilesetImage: (blob: Blob | null) => void
    selected: Selected
    stage: Konva.Stage
    tileset: Tileset
    tilesetCanvas: HTMLCanvasElement
    workspace: Workspace
}

type SelectedTile = { gid: number; x: number; y: number }

const MapLayer = ({
    canvas,
    grid,
    isMouseDown,
    layer,
    onChangeLayerData,
    onChangePrimaryColor,
    onChangeSelectedTile,
    onChangeTileset,
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
    const [data, setData] = useState<(number | null)[]>(layer.data)
    const [image, setImage] = useState<CanvasImageSource>()
    const [selectedTile, setSelectedTile] = useState<SelectedTile>({} as SelectedTile)

    const imageRef = useRef<Konva.Image>(null)
    const lastPos = useRef<Konva.Vector2d | null>()
    const lastLinePos = useRef<Konva.Vector2d | null>()
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
    }, [])

    useEffect(() => {
        setData(layer.data)
    }, [layer.data])

    useEffect(() => {
        redraw()
    }, [ctx, layer, tilesetCanvas])

    const getBufferPos = (pointerPos: Konva.Vector2d): Konva.Vector2d => {
        const { x, y } = getCoordsFromPos(grid, pointerPos)
        return {
            x: Math.floor(pointerPos.x - x * tilewidth),
            y: Math.floor(pointerPos.y - y * tileheight)
        }
    }

    const drawTile = (gid: number | null, i: number): void => {
        if (ctx) {
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

    const drawLine = (pos1: Konva.Vector2d, pos2: Konva.Vector2d, update = true): void => {
        const { x, y } = getCoordsFromPos(grid, pos2)
        const inBounds = x === selectedTile.x && y === selectedTile.y
        if (ctx && bufferCtx && bufferImage && inBounds) {
            renderBuffer(selectedTile.gid)
            actionLine(
                getBufferPos(pos1),
                getBufferPos(pos2),
                selected.color,
                bufferCtx,
                selected.tool === TOOLS.ERASER
            )
            ctx.clearRect(selectedTile.x * tilewidth, selectedTile.y * tileheight, tilewidth, tileheight)
            ctx.drawImage(bufferImage, selectedTile.x * tilewidth, selectedTile.y * tileheight, tilewidth, tileheight)
            update && renderBufferToImage(selectedTile)
        }
    }

    const redraw = (): void => {
        if (ctx && isValidArray(layer.data)) {
            ctx.clearRect(0, 0, width, height)
            layer.data.map((gid, i) => drawTile(gid, i))
            stage.batchDraw()
        }
    }

    const renderBuffer = (gid: number): void => {
        if (bufferCtx) {
            bufferCtx.clearRect(0, 0, tilewidth, tileheight)
            if (gid) {
                const { x: posX, y: posY } = getTilePos(gid, tileset)
                bufferCtx.drawImage(tilesetCanvas, posX, posY, tilewidth, tileheight, 0, 0, tilewidth, tileheight)
            }
        }
    }

    const renderBufferToImage = (tile: SelectedTile): void => {
        const { gid, x, y } = tile
        const { x: tx, y: ty } = getTilePos(gid, tileset)
        if (ctx && bufferImage && tilesetContext) {
            ctx.clearRect(x * tilewidth, y * tileheight, tilewidth, tileheight)
            ctx.drawImage(bufferImage, x * tilewidth, y * tileheight, tilewidth, tileheight)
            tilesetContext.clearRect(tx, ty, tilewidth, tileheight)
            tilesetContext.drawImage(bufferImage, tx, ty)
        }
    }

    const updateLayer = (x: number, y: number, gid: number | null): void => {
        const pos = x + ((layer.width * tilewidth) / grid.width) * y
        if (data[pos] !== gid) {
            const tempData = [...data]
            tempData[pos] = gid
            setData(tempData)
        }
        drawTile(gid, pos)
    }

    const createNewEmptyTile = async (x: number, y: number): Promise<number> => {
        const newLayerData = [...layer.data]
        return new Promise(resolve => {
            createEmptyTile(tileset, tilesetCanvas, (blob: Blob, newTileId: number) => {
                newLayerData[x + ((layer.width * tilewidth) / grid.width) * y] = newTileId
                setData(newLayerData)
                onChangeTileset({ ...tileset, tilecount: newTileId })
                onChangeSelectedTile(newTileId)
                onChangeLayerData(layer.id, newLayerData)
                onSaveTilesetImage(blob)
                resolve(newTileId)
            })
        })
    }

    const onMouseDown = async (e: Konva.KonvaEventObject<MouseEvent>) => {
        if (ctx && visible && isSelected) {
            lastPos.current = getPointerRelativePos(workspace, stage.getPointerPosition() as Konva.Vector2d)
            const { x, y } = getCoordsFromPos(grid, lastPos.current)
            const tileId = layer.data[x + ((layer.width * tilewidth) / grid.width) * y]
            const gid =
                !tileId && [TOOLS.PENCIL, TOOLS.FILL, TOOLS.LINE].includes(selected.tool)
                    ? await createNewEmptyTile(x, y)
                    : tileId

            renderBuffer(gid)

            switch (selected.tool) {
                case TOOLS.DELETE:
                case TOOLS.STAMP:
                    e.evt.button === 2
                        ? onChangeSelectedTile(gid)
                        : updateLayer(x, y, selected.tool === TOOLS.STAMP ? selected.tileId : null)
                    break
                case TOOLS.PENCIL:
                case TOOLS.ERASER:
                    if (gid) {
                        onChangeSelectedTile(gid)
                        if (e.evt.button === 2) {
                            onChangePrimaryColor(pickColor(ctx, lastPos.current.x, lastPos.current.y))
                        } else if (bufferCtx) {
                            actionDraw(
                                getBufferPos(lastPos.current),
                                selected.color,
                                bufferCtx,
                                selected.tool === TOOLS.ERASER
                            )
                            renderBufferToImage({ gid, x, y })
                        }
                    }
                    break
                case TOOLS.PICKER:
                    onChangePrimaryColor(pickColor(ctx, lastPos.current.x, lastPos.current.y))
                    break
                case TOOLS.FILL:
                    if (e.evt.button === 2) {
                        onChangePrimaryColor(pickColor(ctx, lastPos.current.x, lastPos.current.y))
                    } else {
                        fillColor(getBufferPos(lastPos.current), selected.color, bufferImage, bufferCtx)
                        renderBufferToImage({ gid, x, y })
                    }
                    break
                case TOOLS.LINE:
                    if (e.evt.button === 2) {
                        onChangePrimaryColor(pickColor(ctx, lastPos.current.x, lastPos.current.y))
                    } else {
                        lastLinePos.current = lastPos.current
                    }
                    break
                default:
                    break
            }
            setSelectedTile({ gid, x, y })
        }
    }

    const onMouseMove = () => {
        const prevPos = lastPos.current as Konva.Vector2d
        const currentPos = getPointerRelativePos(workspace, stage.getPointerPosition() as Konva.Vector2d)
        const { x, y } = getCoordsFromPos(grid, currentPos)

        if (isMouseDown) {
            switch (selected.tool) {
                case TOOLS.DELETE:
                case TOOLS.STAMP:
                    updateLayer(x, y, selected.tool === TOOLS.STAMP ? selected.tileId : null)
                    break
                case TOOLS.ERASER:
                case TOOLS.PENCIL:
                    if (selectedTile && (currentPos.x !== prevPos.x || currentPos.y !== prevPos.y)) {
                        drawLine(prevPos, currentPos, true)
                    }
                    break
                case TOOLS.LINE:
                    if (
                        lastLinePos.current &&
                        (lastLinePos.current.x !== prevPos.x || lastLinePos.current.y !== prevPos.y)
                    ) {
                        drawLine(lastLinePos.current, currentPos, false)
                    }
                    break
                default:
                    break
            }
        }
        lastPos.current = currentPos
    }

    const onMouseUp = () => {
        switch (selected.tool) {
            case TOOLS.DELETE:
            case TOOLS.STAMP:
                onChangeLayerData(layer.id, data)
                tilesetCanvas.toBlob(onSaveTilesetImage, 'image/png')
                break
            case TOOLS.ERASER:
            case TOOLS.LINE:
            case TOOLS.PENCIL:
                if (bufferImage && selectedTile && tilesetContext) {
                    const { x: tx, y: ty } = getTilePos(selectedTile.gid, tileset)
                    tilesetContext.drawImage(bufferImage, tx, ty)
                    tilesetCanvas.toBlob(onSaveTilesetImage, 'image/png')
                }
                break
            default:
                tilesetCanvas.toBlob(onSaveTilesetImage, 'image/png')
                break
        }
    }

    return (
        <Image
            key={layer.id}
            ref={imageRef}
            listening={isSelected && visible}
            opacity={opacity / 255}
            {...{
                image,
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

MapLayer.displayName = 'MapLayer'

export default MapLayer
// export default React.memo(
//     MapLayer,
//     (prevProps, nextProps) =>
//         prevProps.selected === nextProps.selected &&
//         prevProps.workspace === nextProps.workspace &&
//         prevProps.tilesetCanvas === nextProps.tilesetCanvas &&
//         prevProps.layer === nextProps.layer
// )
