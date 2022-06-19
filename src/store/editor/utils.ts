import { v4 as uuidv4 } from 'uuid'
import Konva from 'konva'
import request from '../../common/utils/fetch-api'
import { getCacheItem } from '../../common/utils/storage'
import { canvasToBlob, dataURLToObjectURL, getDataFromObjectURL } from '../../common/utils/data'
import { APP_STORAGE_KEY } from '../app/constants'
import { EDITOR_RESOURCE_NAME } from './constants'
import { DeflatedLayer, Layer, Tileset } from './types'
import { store } from '../store'

type RootState = ReturnType<typeof store.getState>

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
    const { columns, tilecount, tilewidth, tileheight } = tileset
    const newTileId = tilecount + 1
    const pos = getTilePos(newTileId, tileset)
    const canvasElement = document.createElement('canvas')
    const canvasContext = canvasElement.getContext('2d') as CanvasRenderingContext2D

    canvasElement.width = columns * tilewidth
    canvasElement.height = pos.y + tileheight
    canvasContext.clearRect(0, 0, canvasElement.width, canvasElement.height)
    canvasContext.drawImage(tilesetCanvas, 0, 0)

    const blob = await canvasToBlob(canvasElement)
    return { blob, newTileId }
}

export const createTileFromImageData = async (
    tileset: Tileset,
    tilesetCanvas: HTMLCanvasElement,
    data: ImageData
): Promise<{ blob: Blob; newTileId: number }> => {
    const { columns, tilecount, tilewidth, tileheight } = tileset
    const newTileId = tilecount + 1
    const pos = getTilePos(newTileId, tileset)
    const canvasElement = document.createElement('canvas')
    const canvasContext = canvasElement.getContext('2d') as CanvasRenderingContext2D
    const { x, y } = getTilePos(newTileId, tileset)

    canvasElement.width = columns * tilewidth
    canvasElement.height = pos.y + tileheight
    canvasContext.clearRect(0, 0, canvasElement.width, canvasElement.height)
    canvasContext.drawImage(tilesetCanvas, 0, 0)
    canvasContext.putImageData(data, x, y)

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

export const getStateToSave = async (state: RootState) => {
    const editorState = state[EDITOR_RESOURCE_NAME]
    return {
        [EDITOR_RESOURCE_NAME]: {
            ...editorState,
            layers: await Promise.all(
                editorState.layers.map(async (layer: Layer) =>
                    layer.image ? { ...layer, image: await getDataFromObjectURL(layer.image) } : layer
                )
            ),
            tileset: {
                ...state[EDITOR_RESOURCE_NAME].tileset,
                image: await getDataFromObjectURL(editorState.tileset.image)
            }
        }
    }
}

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
