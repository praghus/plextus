import React, { useRef, useState, useEffect } from 'react'
import Konva from 'konva'
import { Image } from 'react-konva'
import { TOOLS } from '../common/constants'
import { actionDraw, actionLine, getPointerRelativePos, fillColor, pickColor } from '../common/utils/konva'
import { getRgbaValue } from '../common/utils/colors'
import { createTileFromImageData, getTilePos } from '../store/editor/utils'
import { Canvas, Grid, Layer, Selected, Tileset, Workspace } from '../store/editor/types'

const canvasElement: any = document.createElement('canvas')
const canvasContext: CanvasRenderingContext2D = canvasElement.getContext('2d')
const canvasBufferElement: any = document.createElement('canvas')
const canvasBufferContext: CanvasRenderingContext2D = canvasBufferElement.getContext('2d')

type Props = {
    canvas: Canvas
    grid: Grid
    isMouseDown: boolean
    keyDown: KeyboardEvent | null
    layer: Layer
    onChangeLayerImage: (layerId: string, blob: Blob) => void
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

const ImageLayer = ({
    grid,
    isMouseDown,
    layer,
    keyDown,
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
    workspace
}: Props): JSX.Element => {
    const [bufferCtx, setBufferCtx] = useState<CanvasRenderingContext2D | undefined>()
    const [bufferImage, setBufferImage] = useState<HTMLCanvasElement>()
    const [ctx, setCtx] = useState<CanvasRenderingContext2D | undefined>()
    const [image, setImage] = useState<HTMLCanvasElement>()
    const [layerImage, setLayerImage] = useState<HTMLImageElement>()

    const imageRef = useRef<Konva.Image>(null)
    const lastPos = useRef<Konva.Vector2d | null>()
    const lastLinePos = useRef<Konva.Vector2d | null>()
    const hasChanged = useRef<boolean>(false)
    const isSelected = selected.layerId === layer.id

    const { opacity, visible, width, height } = layer
    const { tilewidth, tileheight } = tileset

    useEffect(() => {
        canvasElement.width = width
        canvasElement.height = height
        canvasBufferElement.width = width
        canvasBufferElement.height = height

        setImage(canvasElement)
        setCtx(canvasContext)
        setBufferImage(canvasBufferElement)
        setBufferCtx(canvasBufferContext)
    }, [width, height])

    useEffect(() => {
        if (ctx && layer.image) {
            const img = new window.Image()
            img.src = layer.image
            img.onload = () => {
                ctx.clearRect(0, 0, width, height)
                ctx.drawImage(img, 0, 0)
                setLayerImage(img)
                stage.batchDraw()
            }
        }
    }, [ctx, layer.image])

    const getPos = (): Konva.Vector2d => {
        const { x, y } = getPointerRelativePos(workspace, stage.getPointerPosition() as Konva.Vector2d, layer.offset)
        return {
            x: Math.floor(x),
            y: Math.floor(y)
        }
    }

    const clearBuffer = (): void => {
        if (bufferCtx && layerImage) {
            bufferCtx.clearRect(0, 0, width, height)
            bufferCtx.drawImage(layerImage, 0, 0)
        }
    }

    const renderBufferToImage = (): void => {
        if (ctx && bufferImage) {
            ctx.clearRect(0, 0, width, height)
            ctx.drawImage(bufferImage, 0, 0)
            hasChanged.current = true
        }
    }

    const drawLine = (pos1: Konva.Vector2d, pos2: Konva.Vector2d): void => {
        if (ctx && bufferCtx && bufferImage) {
            actionLine(pos1, pos2, selected, bufferCtx, keyDown)
            ctx.clearRect(0, 0, width, height)
            ctx.drawImage(bufferImage, 0, 0)
            hasChanged.current = true
            stage.batchDraw()
        }
    }

    const cloneTile = (pos: Konva.Vector2d) => {
        if (ctx) {
            const tile = ctx.getImageData(
                Math.ceil(-1 + pos.x / grid.width) * grid.width,
                Math.ceil(-1 + pos.y / grid.height) * grid.height,
                tilewidth,
                tileheight
            )
            createTileFromImageData(tileset, tilesetCanvas, tile, (blob: Blob, newTileId: number) => {
                onChangeTileset({ ...tileset, tilecount: newTileId })
                onChangeSelectedTile(newTileId)
                onSaveTilesetImage(blob)
            })
        }
    }

    const drawTile = (pos: Konva.Vector2d): void => {
        if (ctx && bufferCtx && bufferImage) {
            if (selected.tileId) {
                const { x, y } = getTilePos(selected.tileId, tileset)
                bufferCtx.drawImage(
                    tilesetCanvas,
                    x,
                    y,
                    tilewidth,
                    tileheight,
                    Math.ceil(-1 + pos.x / grid.width) * grid.width,
                    Math.ceil(-1 + pos.y / grid.height) * grid.height,
                    tilewidth,
                    tileheight
                )
                renderBufferToImage()
                hasChanged.current = true
                stage.batchDraw()
            }
        }
    }

    const onMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
        if (ctx && visible && isSelected) {
            lastPos.current = getPos()

            clearBuffer()

            switch (selected.tool) {
                case TOOLS.DELETE:
                case TOOLS.STAMP:
                    e.evt.button === 2 ? cloneTile(lastPos.current) : drawTile(lastPos.current)
                    break
                case TOOLS.BRIGHTNESS:
                case TOOLS.PENCIL:
                case TOOLS.ERASER:
                    if (e.evt.button === 2) {
                        onChangePrimaryColor(pickColor(ctx, lastPos.current.x, lastPos.current.y))
                    } else if (bufferCtx) {
                        actionDraw(lastPos.current, selected, bufferCtx, keyDown)
                        renderBufferToImage()
                    }
                    break
                case TOOLS.PICKER:
                    onChangePrimaryColor(pickColor(ctx, lastPos.current.x, lastPos.current.y))
                    break
                case TOOLS.FILL:
                    if (e.evt.button === 2) {
                        onChangePrimaryColor(pickColor(ctx, lastPos.current.x, lastPos.current.y))
                    } else if (bufferImage && bufferCtx) {
                        fillColor(lastPos.current, selected.color, bufferImage, bufferCtx)
                        renderBufferToImage()
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
        }
        e.evt.preventDefault()
    }

    const onMouseMove = () => {
        const prevPos = lastPos.current as Konva.Vector2d
        const currentPos = getPos()

        if (isMouseDown) {
            switch (selected.tool) {
                case TOOLS.DELETE:
                case TOOLS.STAMP:
                    if (currentPos.x !== prevPos.x || currentPos.y !== prevPos.y) {
                        drawTile(currentPos)
                    }
                    break
                case TOOLS.BRIGHTNESS:
                case TOOLS.ERASER:
                case TOOLS.PENCIL:
                    if (currentPos.x !== prevPos.x || currentPos.y !== prevPos.y) {
                        drawLine(prevPos, currentPos)
                        renderBufferToImage()
                    }
                    break
                case TOOLS.LINE:
                    if (
                        lastLinePos.current &&
                        (lastLinePos.current.x !== prevPos.x || lastLinePos.current.y !== prevPos.y)
                    ) {
                        clearBuffer()
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
        if (hasChanged.current && image) {
            renderBufferToImage()
            image.toBlob(blob => blob && onChangeLayerImage(layer.id, blob), 'image/png')
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
ImageLayer.displayName = 'ImageLayer'

export default ImageLayer
