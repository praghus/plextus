import zlib from 'zlib'
import JSZip from 'jszip'
import { create } from 'xmlbuilder2'
import { Buffer } from 'buffer'
import { saveAs } from 'file-saver'
import { Canvas, Layer, Tileset } from 'store/editor/types'
import logger from './logger'

const zip = new JSZip()

const encodeLayer = async (data: Buffer) =>
    new Promise((resolve, reject) =>
        zlib.deflate(data, (err, buf) => (!err ? resolve(buf.toString('base64')) : reject(err)))
    )

export const exportToTmx = async (canvas: Canvas, layers: Layer[], tileset: Tileset) => {
    const { columns, tilewidth, tileheight, tilecount } = tileset

    const mapLayers = await Promise.all(
        layers.map(async ({ data, name, visible, opacity, width, height }, i) => {
            const layerData = new Uint32Array(data)
            const buffer = Buffer.from(layerData.buffer)
            return {
                '@': {
                    id: i + 1,
                    name,
                    visible,
                    opacity,
                    width,
                    height
                },
                data: {
                    '@': {
                        encoding: 'base64',
                        compression: 'zlib'
                    },
                    '#': await encodeLayer(buffer)
                }
            }
        })
    )

    const map = {
        map: {
            '@': {
                version: 1.7,
                tiledversion: '1.7.1',
                orientation: 'orthogonal',
                renderorder: 'right-down',
                type: 'map',
                infinite: false,
                nextlayerid: layers.length,
                width: canvas.width / tileset.tileheight,
                height: canvas.height / tileset.tileheight,
                tileheight,
                tilewidth
            },
            tileset: {
                '@': {
                    firstgid: 1,
                    name: 'Tileset',
                    tilewidth,
                    tileheight,
                    tilecount,
                    columns
                },
                image: {
                    '@': {
                        source: './tileset/tileset.png',
                        width: columns * tilewidth,
                        height: (1 + Math.round(tilecount / columns)) * tileheight
                    }
                }
            },
            layer: mapLayers
        }
    }

    const doc = create(map)
    const xml = doc.end({ prettyPrint: true })
    const tiledmapTmx = new Blob([xml], { type: 'application/xml' })
    const tilesetImage = await fetch(tileset.image).then(r => r.blob())
    const tilesetFolder = zip.folder('tileset') as JSZip

    zip.file('ReadMe.txt', 'Exported from Plextus!\n--\nDownload Tiled from https://www.mapeditor.org/\n')
    zip.file('tiledmap.tmx', tiledmapTmx)
    tilesetFolder.file('tileset.png', tilesetImage)

    zip.generateAsync({ type: 'blob' })
        .then(content => saveAs(content, 'exported-tiledmap.zip'))
        .catch(err => logger.error(err))
}
