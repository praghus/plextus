import Konva from 'konva'
import { useCallback, useState, useEffect } from 'react'

import { getImage } from '../common/utils/image'
import { getCoordsFromPos } from '../common/utils/konva'
import { SelectedTile } from '../common/types'
import { getTilePos } from '../store/editor/utils'
import { Grid, Layer, Selected, Tileset } from '../store/editor/types'

export const useCanvasBuffer = (
    grid: Grid,
    layer: Layer,
    stage: Konva.Stage,
    tileset: Tileset,
    tilesetCanvas: HTMLCanvasElement
) => {
    const [ctx, setCtx] = useState<CanvasRenderingContext2D | undefined>()
    const [image, setImage] = useState<HTMLCanvasElement>()
    const [bufferCtx, setBufferCtx] = useState<CanvasRenderingContext2D | undefined>()
    const [bufferImage, setBufferImage] = useState<HTMLCanvasElement>()
    const [layerImage, setLayerImage] = useState<HTMLImageElement>()

    const { tilewidth, tileheight } = tileset

    const [width, height, bufferWidth, bufferHeight] = layer.image
        ? [layer.width, layer.height, layer.width, layer.height]
        : [layer.width * tilewidth, layer.height * tileheight, tilewidth, tileheight]

    const getLayerImage = useCallback(
        async (src: string) => {
            const image = await getImage(src)
            ctx?.clearRect(0, 0, width, height)
            ctx?.drawImage(image, 0, 0)
            stage?.batchDraw()
            setLayerImage(image)
        },
        [ctx, height, stage, width]
    )

    const renderTile = useCallback(
        (gid: number | null, i: number) => {
            if (ctx && layer.width) {
                const x = (i % layer.width) * grid.width
                const y = Math.ceil((i + 1) / layer.width - 1) * grid.height
                const [w, h] = [tileset.tilewidth, tileset.tileheight]
                ctx.clearRect(x, y, w, h)
                if (gid) {
                    const posX = ((gid - tileset.firstgid) % tileset.columns) * w
                    const posY = (Math.ceil((gid - tileset.firstgid + 1) / tileset.columns) - 1) * h
                    ctx.drawImage(tilesetCanvas, posX, posY, w, h, x, y, w, h)
                }
            }
        },
        [
            ctx,
            grid.height,
            grid.width,
            layer.width,
            tileset.firstgid,
            tileset.columns,
            tileset.tilewidth,
            tileset.tileheight,
            tilesetCanvas
        ]
    )

    const renderFromBuffer = (tile?: SelectedTile) => {
        if (ctx && bufferImage) {
            const tilesetContext = tilesetCanvas.getContext('2d')
            if (tile && bufferCtx && tilesetContext) {
                ctx.clearRect(tile.x * tilewidth, tile.y * tileheight, tilewidth, tileheight)
                ctx.drawImage(bufferImage, tile.x * tilewidth, tile.y * tileheight, tilewidth, tileheight)
                if (tile.gid) {
                    const { x: tx, y: ty } = getTilePos(tile.gid, tileset)
                    tilesetContext.clearRect(tx, ty, tilewidth, tileheight)
                    tilesetContext.drawImage(bufferImage, tx, ty)
                }
            } else if (layer.image) {
                ctx.clearRect(0, 0, width, height)
                ctx.drawImage(bufferImage, 0, 0)
            }
            stage?.batchDraw()
        }
    }

    const renderTileToBuffer = async (selected: Selected, pos: Konva.Vector2d) => {
        if (bufferCtx && selected.tileId) {
            if (selected.tileId === -1 && selected.stamp?.image) {
                const stampImage = await getImage(selected.stamp.image)
                bufferCtx.drawImage(
                    stampImage,
                    Math.ceil(-1 + pos.x / grid.width) * grid.width,
                    Math.ceil(-1 + pos.y / grid.height) * grid.height
                )
            } else {
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
            }
            renderFromBuffer()
        }
    }

    const clearBuffer = (tile?: SelectedTile) => {
        if (bufferImage && bufferCtx) {
            bufferCtx.clearRect(0, 0, bufferImage.width, bufferImage.height)
            if (tile && tile.gid) {
                const { x, y } = getTilePos(tile.gid, tileset)
                bufferCtx.drawImage(tilesetCanvas, x, y, tilewidth, tileheight, 0, 0, tilewidth, tileheight)
            } else if (layerImage) {
                bufferCtx.drawImage(layerImage, 0, 0)
            }
        }
    }

    const getBufferPos = (pointerPos: Konva.Vector2d, tile?: SelectedTile): Konva.Vector2d => {
        const { x, y } = tile || getCoordsFromPos(grid, pointerPos)
        return {
            x: Math.floor(pointerPos.x - x * tilewidth),
            y: Math.floor(pointerPos.y - y * tileheight)
        }
    }

    useEffect(() => {
        ctx && layer.image && getLayerImage(layer.image)
    }, [ctx, getLayerImage, layer.image])

    useEffect(() => {
        const canvasElement = document.createElement('canvas')
        const canvasContext = canvasElement.getContext('2d') as CanvasRenderingContext2D
        const canvasBufferElement = document.createElement('canvas')
        const canvasBufferContext = canvasBufferElement.getContext('2d') as CanvasRenderingContext2D

        canvasElement.width = width
        canvasElement.height = height
        canvasBufferElement.width = bufferWidth
        canvasBufferElement.height = bufferHeight

        setImage(canvasElement)
        setCtx(canvasContext)
        setBufferImage(canvasBufferElement)
        setBufferCtx(canvasBufferContext)
    }, [width, height, tilewidth, tileheight, bufferWidth, bufferHeight])

    return {
        bufferCtx,
        bufferImage,
        clearBuffer,
        ctx,
        getBufferPos,
        height,
        image,
        renderFromBuffer,
        renderTile,
        renderTileToBuffer,
        width
    }
}
