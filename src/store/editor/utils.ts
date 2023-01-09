import Konva from 'konva'
import { v4 as uuidv4 } from 'uuid'

import request from '../../common/utils/fetch-api'
import { createCanvasElement } from '../../common/utils/image'
import { getCacheItem } from '../../common/utils/storage'
import { canvasToBlob, dataURLToObjectURL, getDataFromObjectURL } from '../../common/utils/data'
import { APP_STORAGE_KEY } from '../app/constants'
import { EDITOR_RESOURCE_NAME } from './constants'
import { DeflatedLayer, EditorState, Layer, Tileset } from './types'
import { RootState } from '../store'

export const getLayerById = (layers: Layer[], id: string) => layers.find(layer => layer.id === id)

export const getTilePos = (gid: number, tileset: Tileset): Konva.Vector2d => {
    const { firstgid, columns, tilewidth, tileheight } = tileset
    const x = ((gid - firstgid) % columns) * tilewidth
    const y = (Math.ceil((gid - firstgid + 1) / columns) - 1) * tileheight
    return { x, y }
}

export const createEmptyTile = async (
    tileset: Tileset,
    tilesetCanvas: HTMLCanvasElement
): Promise<{ blob: Blob; newTileId: number }> => {
    const [canvasElement, ctx] = createCanvasElement()
    const { columns, tilecount, tilewidth, tileheight } = tileset
    const newTileId = tilecount + 1
    const pos = getTilePos(newTileId, tileset)

    canvasElement.width = columns * tilewidth
    canvasElement.height = pos.y + tileheight
    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height)
    ctx.drawImage(tilesetCanvas, 0, 0)

    const blob = await canvasToBlob(canvasElement)
    return { blob, newTileId }
}

export const createTileFromImageData = async (
    tileset: Tileset,
    tilesetCanvas: HTMLCanvasElement,
    data: ImageData
): Promise<{ blob: Blob; newTileId: number }> => {
    const [canvasElement, ctx] = createCanvasElement()
    const { columns, tilecount, tilewidth, tileheight } = tileset
    const newTileId = tilecount + 1
    const pos = getTilePos(newTileId, tileset)
    const { x, y } = getTilePos(newTileId, tileset)

    canvasElement.width = columns * tilewidth
    canvasElement.height = pos.y + tileheight
    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height)
    ctx.drawImage(tilesetCanvas, 0, 0)
    ctx.putImageData(data, x, y)

    const blob = await canvasToBlob(canvasElement)
    return { blob, newTileId }
}

export const createEmptyLayer = (name: string, width: number, height: number): Layer => ({
    data: new Array(width * height).fill(null),
    height,
    id: uuidv4(),
    name,
    offset: { x: 0, y: 0 },
    opacity: 255,
    visible: true,
    width
})

export const createImageLayer = (name: string, image: string, width: number, height: number): Layer => ({
    height,
    id: uuidv4(),
    image,
    name,
    offset: { x: 0, y: 0 },
    opacity: 255,
    visible: true,
    width
})

export const getTilesetDimensions = (tileset: Tileset) => ({
    h: Math.ceil(tileset.tilecount / tileset.columns) * tileset.tileheight,
    w: tileset.columns * tileset.tilewidth
})

export const getStateToSave = async (editorState: EditorState) => ({
    [EDITOR_RESOURCE_NAME]: {
        ...editorState,
        layers: await Promise.all(
            editorState.layers.map(async (layer: DeflatedLayer) =>
                layer.image ? { ...layer, image: await getDataFromObjectURL(layer.image) } : layer
            )
        ),
        selected: {
            ...editorState.selected,
            stamp: null,
            tileId: null
        },
        tileset: {
            ...editorState.tileset,
            image: await getDataFromObjectURL(editorState.tileset.image)
        }
    }
})

export const loadStateFromStore = async () => {
    const stateBlob = await getCacheItem(APP_STORAGE_KEY)
    if (stateBlob) {
        const state = (await request.json(window.URL.createObjectURL(stateBlob))) as RootState
        const editorState = state && state[EDITOR_RESOURCE_NAME]

        return {
            [EDITOR_RESOURCE_NAME]: {
                ...editorState,
                layers: await Promise.all(
                    editorState.layers.map(async (layer: DeflatedLayer) =>
                        layer.image ? { ...layer, image: await dataURLToObjectURL(layer.image) } : layer
                    )
                ),
                tileset: {
                    ...editorState.tileset,
                    image: await dataURLToObjectURL(editorState.tileset.image)
                }
            }
        }
    }
    return {}
}
