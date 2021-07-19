import React, { useRef, useState, useEffect } from 'react'
import Konva from 'konva'
import { Image } from 'react-konva'
import { TOOLS } from '../common/constants'
// import { getTilePos } from '../store/editor/utils'
import {
    actionDraw,
    actionLine,
    // getCoordsFromPos,
    getPointerRelativePos,
    fillColor,
    pickColor
} from '../common/utils/konva'
import { Canvas, Grid, Layer, Selected, Tileset, Workspace } from '../store/editor/types'

type Props = {
    canvas: Canvas
    grid: Grid
    isMouseDown: boolean
    layer: Layer
    onChangeLayerImage: (layerId: string, blob: Blob) => void
    onChangePrimaryColor: (color: number[]) => void
    selected: Selected
    stage: Konva.Stage
    tileset: Tileset
    tilesetCanvas: HTMLCanvasElement
    workspace: Workspace
}

const ImageLayer = ({
    canvas,
    // grid,
    isMouseDown,
    layer,
    onChangeLayerImage,
    onChangePrimaryColor,
    selected,
    stage,
    // tileset,
    // tilesetCanvas,
    workspace
}: Props): JSX.Element => {
    const [bufferCtx, setBufferCtx] = useState<CanvasRenderingContext2D | undefined>()
    const [bufferImage, setBufferImage] = useState<HTMLCanvasElement>()
    const [ctx, setCtx] = useState<CanvasRenderingContext2D | undefined>()
    const [image, setImage] = useState<HTMLCanvasElement>()

    const [img, setImg] = useState<HTMLImageElement>()

    const imageRef = useRef<Konva.Image>(null)
    const lastPos = useRef<Konva.Vector2d | null>()
    const lastLinePos = useRef<Konva.Vector2d | null>()
    const hasChanged = useRef<boolean>(false)
    // const tilesetContext = tilesetCanvas.getContext('2d')
    const isSelected = selected.layerId === layer.id

    const { width, height } = canvas
    const { opacity, visible } = layer

    useEffect(() => {
        const canvasElement: any = document.createElement('canvas')
        const canvasContext: CanvasRenderingContext2D = canvasElement.getContext('2d')
        const canvasBufferElement: any = document.createElement('canvas')
        const canvasBufferContext: CanvasRenderingContext2D = canvasBufferElement.getContext('2d')

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
                setImg(img)
                stage.batchDraw()
            }
        }
    }, [ctx, layer.image])

    const getPos = (): Konva.Vector2d => {
        const { x, y } = getPointerRelativePos(workspace, stage.getPointerPosition() as Konva.Vector2d)
        return {
            x: Math.floor(x),
            y: Math.floor(y)
        }
    }

    // const drawTile = (gid: number | null, i: number): void => {
    //     // if (ctx) {
    //     //     const x = (i % layer.width) * grid.width
    //     //     const y = Math.ceil((i + 1) / layer.width - 1) * grid.height
    //     //     ctx.clearRect(x, y, tilewidth, tileheight)
    //     //     if (gid) {
    //     //         const { x: posX, y: posY } = getTilePos(gid, tileset)
    //     //         ctx.drawImage(tilesetCanvas, posX, posY, tilewidth, tileheight, x, y, tilewidth, tileheight)
    //     //     } else if (isSelected) {
    //     //         ctx.fillStyle = 'rgba(0,0,0,0.2)'
    //     //         ctx.fillRect(x, y, tilewidth, tileheight)
    //     //     }
    //     // }
    // }

    const clearBuffer = (): void => {
        if (bufferCtx && img) {
            bufferCtx.clearRect(0, 0, width, height)
            bufferCtx.drawImage(img, 0, 0) //, 0, 0, tilewidth, tileheight
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
            actionLine(pos1, pos2, selected.color, bufferCtx, selected.tool === TOOLS.ERASER)
            ctx.clearRect(0, 0, width, height)
            ctx.drawImage(bufferImage, 0, 0)
            hasChanged.current = true
            stage.batchDraw()
        }
    }

    const onMouseDown = async (e: Konva.KonvaEventObject<MouseEvent>) => {
        if (ctx && visible && isSelected) {
            lastPos.current = getPos()

            clearBuffer()

            switch (selected.tool) {
                case TOOLS.DELETE:
                case TOOLS.STAMP:
                    // e.evt.button === 2
                    //     ? gid && onChangeSelectedTile(gid)
                    //     : updateLayer(x, y, selected.tool === TOOLS.STAMP ? selected.tileId : null)
                    break
                case TOOLS.PENCIL:
                case TOOLS.ERASER:
                    if (e.evt.button === 2) {
                        onChangePrimaryColor(pickColor(ctx, lastPos.current.x, lastPos.current.y))
                    } else if (bufferCtx) {
                        actionDraw(lastPos.current, selected.color, ctx, selected.tool === TOOLS.ERASER)
                        renderBufferToImage()
                    }

                    break
                case TOOLS.PICKER:
                    onChangePrimaryColor(pickColor(ctx, lastPos.current.x, lastPos.current.y))
                    break
                case TOOLS.FILL:
                    if (e.evt.button === 2) {
                        onChangePrimaryColor(pickColor(ctx, lastPos.current.x, lastPos.current.y))
                    } else {
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
    }

    const onMouseMove = () => {
        const prevPos = lastPos.current as Konva.Vector2d
        const currentPos = getPos()
        // const { x, y } = getCoordsFromPos(grid, currentPos)

        if (isMouseDown) {
            switch (selected.tool) {
                case TOOLS.DELETE:
                case TOOLS.STAMP:
                    //updateLayer(x, y, selected.tool === TOOLS.STAMP ? selected.tileId : null)
                    break
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
            // renderBufferToImage()
            image.toBlob(blob => blob && onChangeLayerImage(layer.id, blob), 'image/png')
            hasChanged.current = false
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

ImageLayer.displayName = 'ImageLayer'

export default ImageLayer
