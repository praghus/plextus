import { v4 as uuidv4 } from 'uuid'
import Konva from 'konva'
import { Layer, Tileset } from './types'

const noop = Function.prototype

export const getLayerById = (layers: Layer[], id: string) => layers.find(layer => layer.id === id)

export const getTilePos = (gid: number, tileset: Tileset): Konva.Vector2d => {
    const { firstgid, columns, tilewidth, tileheight } = tileset
    const x = ((gid - firstgid) % columns) * tilewidth
    const y = (Math.ceil((gid - firstgid + 1) / columns) - 1) * tileheight
    return { x, y }
}

export const createEmptyTile = (tileset: Tileset, tilesetCanvas: HTMLCanvasElement, onSave = noop): void => {
    const { columns, tilecount, tilewidth, tileheight } = tileset
    const newTileId = tilecount + 1
    const pos = getTilePos(newTileId, tileset)
    const canvasElement: any = document.createElement('canvas')
    const canvasContext: CanvasRenderingContext2D = canvasElement.getContext('2d')

    canvasElement.width = columns * tilewidth
    canvasElement.height = pos.y + tileheight
    canvasContext.clearRect(0, 0, canvasElement.width, canvasElement.height)
    canvasContext.drawImage(tilesetCanvas, 0, 0)
    canvasElement.toBlob((blob: Blob) => {
        blob && onSave(blob, newTileId)
    }, 'image/png')
}

export const createEmptyLayer = (name: string, width: number, height: number): Layer => ({
    id: uuidv4(),
    data: new Array(width * height).fill(null),
    height,
    opacity: 255,
    name,
    visible: true,
    width
})

export const getTilesetDimensions = (tileset: Tileset) => ({
    w: tileset.columns * tileset.tilewidth,
    h: Math.ceil(tileset.tilecount / tileset.columns) * tileset.tileheight
})
