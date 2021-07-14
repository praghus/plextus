import React, { memo, useRef, useState, useEffect } from 'react'
import Konva from 'konva'
import { Image } from 'react-konva'
import { TOOLS } from '../common/constants'
import {
    addNewTile,
    drawLine,
    getImageData,
    getCoordsFromPos,
    getPointerRelativePos,
    getTilePos
} from '../store/editor/utils'
import { Canvas, Grid, Layer, Selected, Tileset, Workspace } from '../store/editor/types'
import logger from '../common/utils/logger'

const TOOL_SIZE = 2
const tempData = {}

type SelectedTile = { gid: number; x: number; y: number }

type Props = {
    canvas: Canvas
    grid: Grid
    layer: Layer
    onChangeLayerData: (layerId: string, data: number[]) => void
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

const MapLayer = ({
    canvas,
    grid,
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
    const [ctx, setCtx] = useState<CanvasRenderingContext2D | undefined>()
    const [data, setData] = useState<number[]>([])
    const [image, setImage] = useState<CanvasImageSource>()
    const [isDrawing, setIsDrawing] = useState(false)
    const [isPlacing, setIsPlacing] = useState(false)
    const [pixelTool, setPixelTool] = useState<ImageData>()
    const [selectedTile, setSelectedTile] = useState<SelectedTile>()

    const imageRef = useRef<Konva.Image>(null)
    const [pointerRelPosition, setPointerRelPosition] = useState<Konva.Vector2d | null>({ x: 0, y: 0 })

    const { width, height } = canvas
    const { opacity, visible } = layer
    const { tilewidth, tileheight } = tileset

    const isSelected = selected.layerId === layer.id
    const canvasElement: any = document.createElement('canvas')
    const canvasContext: CanvasRenderingContext2D = canvasElement.getContext('2d')

    const usePixelTool = (x: number, y: number): void => {
        // obey selected tile bounds
        const tilesetContext = tilesetCanvas.getContext('2d')
        if (
            ctx &&
            pixelTool &&
            selectedTile &&
            tilesetContext &&
            x > selectedTile.x * tilewidth &&
            x < selectedTile.x * tilewidth + tilewidth &&
            y > selectedTile.y * tileheight &&
            y < selectedTile.y * tileheight + tileheight
        ) {
            const { x: tx, y: ty } = getTilePos(selectedTile.gid, tileset)
            ctx.putImageData(pixelTool, x, y)
            tilesetContext.putImageData(
                pixelTool,
                tx + (x - selectedTile.x * tilewidth),
                ty + (y - selectedTile.y * tileheight)
            )
        }
    }

    const draw = (gid: number | null, i: number): void => {
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

    const redraw = (): void => {
        if (ctx && layer.data) {
            ctx.clearRect(0, 0, width, height)
            layer.data.map((gid, i) => draw(gid, i))
            stage.batchDraw()
        }
    }

    useEffect(() => {
        canvasElement.width = width
        canvasElement.height = height

        setImage(canvasElement)
        setCtx(canvasContext)
    }, [])

    useEffect(() => {
        if (ctx) {
            setPixelTool(getImageData(ctx, TOOL_SIZE, selected.tool === TOOLS.ERASER ? [] : selected.color))
        }
    }, [ctx, selected])

    useEffect(() => {
        setData(layer.data)
        tempData[layer.id] = layer.data
        logger.info(`layer ${layer.id} updated`)
        redraw()
    }, [ctx, tilesetCanvas, layer.data, isSelected])

    const updateLayer = (x: number, y: number, gid: number | null): void => {
        const pos = x + ((layer.width * tilewidth) / grid.width) * y
        if (tempData[layer.id][pos] !== gid) {
            tempData[layer.id][pos] = gid
            draw(gid, pos)
            stage.batchDraw()
        }
    }

    const onMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
        const localPos = getPointerRelativePos(workspace, stage.getPointerPosition() as Konva.Vector2d)

        if (ctx && visible && isSelected) {
            const { x, y } = getCoordsFromPos(grid, localPos)
            const gid = layer.data[x + ((layer.width * tilewidth) / grid.width) * y]

            if (!gid && selected.tool === TOOLS.PENCIL) {
                addNewTile(tileset, tilesetCanvas, (blob: Blob, newTileId: number) => {
                    const newLayerData = [...layer.data]
                    newLayerData[x + ((layer.width * tilewidth) / grid.width) * y] = newTileId
                    setData(newLayerData)
                    onSaveTilesetImage(blob)
                    onChangeTileset({ ...tileset, tilecount: newTileId })
                    onChangeSelectedTile(newTileId)
                    onChangeLayerData(layer.id, newLayerData)
                })
            }

            setSelectedTile({ gid, x, y })

            switch (selected.tool) {
                case TOOLS.DELETE:
                case TOOLS.STAMP:
                    if (e.evt.button === 2) {
                        onChangeSelectedTile(gid)
                    } else {
                        setIsPlacing(true)
                        tempData[layer.id] = [...data]
                        updateLayer(x, y, selected.tool === TOOLS.STAMP ? selected.tileId : null)
                    }
                    break
                case TOOLS.PENCIL:
                case TOOLS.ERASER:
                    if (gid) {
                        onChangeSelectedTile(gid)
                        if (e.evt.button === 2) {
                            const colorData = Object.values(ctx.getImageData(localPos.x, localPos.y, 1, 1).data)
                            onChangePrimaryColor(colorData)
                        } else {
                            usePixelTool(localPos.x, localPos.y)
                            setIsDrawing(true)
                            stage.batchDraw()
                        }
                    }
                    break

                default:
                    break
            }
            setPointerRelPosition(localPos)
            e.evt.preventDefault()
        }
    }

    const onMouseMove = () => {
        const localPos = getPointerRelativePos(workspace, stage.getPointerPosition() as Konva.Vector2d)

        if (isDrawing) {
            const { x: x1, y: y1 } = pointerRelPosition as Konva.Vector2d
            const { x: x2, y: y2 } = localPos
            drawLine(x1, y1, x2, y2, usePixelTool)
            stage.batchDraw()
        } else if (isPlacing) {
            const { x, y } = getCoordsFromPos(grid, localPos)
            updateLayer(x, y, selected.tool === TOOLS.STAMP ? selected.tileId : null)
        }

        setPointerRelPosition(localPos)
    }

    const onMouseUp = () => {
        if (isDrawing) {
            redraw()
            setIsDrawing(false)
            tilesetCanvas.toBlob(onSaveTilesetImage, 'image/png')
        }
        if (isPlacing) {
            setIsPlacing(false)
            setData(tempData[layer.id])
            onChangeLayerData(layer.id, tempData[layer.id])
        }
    }

    return (
        <>
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
            {/* <Pointer {...{ grid, selected, stage, tileset, pointerRelPosition }} /> */}
        </>
    )
}

MapLayer.displayName = 'MapLayer'

// export default MapLayer
export default memo(
    MapLayer,
    (prevProps, nextProps) =>
        // nextProps.selected.layerId !== nextProps.layer.id &&
        // prevProps.selected.color === nextProps.selected.color &&
        // prevProps.selected.tool === nextProps.selected.tool &&
        prevProps.selected === nextProps.selected &&
        prevProps.workspace === nextProps.workspace &&
        // prevProps.tileset === nextProps.tileset &&
        prevProps.tilesetCanvas === nextProps.tilesetCanvas &&
        prevProps.layer === nextProps.layer
    // prevProps.layer.opacity === nextProps.layer.opacity &&
    // prevProps.layer.visible === nextProps.layer.visible
)
