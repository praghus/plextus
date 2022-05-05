import Konva from 'konva'
import { useState, useEffect } from 'react'

import { getImage } from '../common/utils/image'
import { getTilePos } from '../store/editor/utils'
import { Layer, Tileset } from '../store/editor/types'

type SelectedTile = { gid: number; x: number; y: number }

export const useCanvasBuffer = (
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

    const [width, height] = layer.image
        ? [layer.width, layer.height]
        : [layer.width * tilewidth, layer.height * tileheight]

    const getLayerImage = async (src: string) => {
        const image = await getImage(src)
        ctx?.clearRect(0, 0, width, height)
        ctx?.drawImage(image, 0, 0)
        stage?.batchDraw()
        setLayerImage(image)
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

    const renderBufferToImage = (tile?: SelectedTile) => {
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
        }
    }

    useEffect(() => {
        ctx && layer.image && getLayerImage(layer.image)
    }, [ctx, layer.image])

    useEffect(() => {
        const canvasElement = document.createElement('canvas')
        const canvasContext = canvasElement.getContext('2d') as CanvasRenderingContext2D
        const canvasBufferElement = document.createElement('canvas')
        const canvasBufferContext = canvasBufferElement.getContext('2d') as CanvasRenderingContext2D

        canvasElement.width = width
        canvasElement.height = height
        canvasBufferElement.width = layer.image ? width : tilewidth
        canvasBufferElement.height = layer.image ? height : tileheight

        setImage(canvasElement)
        setCtx(canvasContext)
        setBufferImage(canvasBufferElement)
        setBufferCtx(canvasBufferContext)
    }, [width, height, tilewidth, tileheight])

    return { bufferCtx, bufferImage, clearBuffer, ctx, height, image, renderBufferToImage, width }
}
