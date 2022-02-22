import zlib from 'zlib'
import JSZip from 'jszip'
import { create } from 'xmlbuilder2'
import { Buffer } from 'buffer'
import { saveAs } from 'file-saver'
import { Canvas, Layer, Tileset } from '../../store/editor/types'
import { TILESET_FILENAME } from '../constants'
import { componentToHex } from './colors'
import logger from './logger'

const zip = new JSZip()

const formatColor = (c: number[]): string =>
    `#${c[3] >= 0 ? componentToHex(c[3]) : ''}${componentToHex(c[0])}${componentToHex(c[1])}${componentToHex(c[2])}`

const encodeLayer = async (data: Buffer) =>
    new Promise((resolve, reject) =>
        zlib.deflate(data, (err, buf) => (!err ? resolve(buf.toString('base64')) : reject(err)))
    )

export const exportToTmx = async (canvas: Canvas, layers: Layer[], tileset: Tileset) => {
    const { columns, tilewidth, tileheight, tilecount } = tileset
    const layerImages: any = []

    const mapLayers = await Promise.all(
        layers.map(async ({ data, image, name, visible, offset, opacity, width, height }, i) => {
            const offsetx = offset.x !== 0 ? { offsetx: offset.x } : {}
            const offsety = offset.y !== 0 ? { offsety: offset.y } : {}
            if (image) {
                const filename = `layer-${i + 1}.png`
                layerImages.push({ data: await fetch(image).then(r => r.blob()), filename })
                return {
                    imagelayer: {
                        '@': {
                            id: i + 1,
                            name,
                            opacity,
                            visible: visible ? 1 : 0,
                            ...offsetx,
                            ...offsety
                        },
                        image: {
                            '@': {
                                height,
                                source: `./images/${filename}`,
                                width
                            }
                        }
                    }
                }
            } else {
                const layerData = new Uint32Array(data || [])
                const buffer = Buffer.from(layerData.buffer)
                return {
                    layer: {
                        '@': {
                            height,
                            id: i + 1,
                            name,
                            opacity,
                            visible: visible ? 1 : 0,
                            width,
                            ...offsetx,
                            ...offsety
                        },
                        data: {
                            '#': await encodeLayer(buffer),
                            '@': {
                                compression: 'zlib',
                                encoding: 'base64'
                            }
                        }
                    }
                }
            }
        })
    )
    const backgroundColor = canvas.background ? { backgroundcolor: formatColor(canvas.background) } : {}

    const doc = create({
        map: {
            '@': {
                height: canvas.height / tileset.tileheight,
                infinite: false,
                nextlayerid: layers.length,
                orientation: 'orthogonal',
                renderorder: 'right-down',
                tiledversion: '1.7.1',
                tileheight,
                tilewidth,
                type: 'map',
                version: 1.7,
                width: canvas.width / tileset.tileheight,
                ...backgroundColor
            },
            tileset: {
                '@': {
                    columns,
                    firstgid: 1,
                    name: 'Tileset',
                    tilecount,
                    tileheight,
                    tilewidth
                },
                image: {
                    '@': {
                        height: (1 + Math.round(tilecount / columns)) * tileheight,
                        source: `./images/${TILESET_FILENAME}`,
                        width: columns * tilewidth
                    }
                }
            }
        }
    })

    mapLayers.forEach(l => doc.root().ele(l).up())

    const xml = doc.end({ prettyPrint: true })
    const tiledmapTmx = new Blob([xml], { type: 'application/xml' })
    const tilesetImage = await fetch(tileset.image).then(r => r.blob())
    const imagesFolder = zip.folder('images') as JSZip

    zip.file('ReadMe.txt', 'Exported from Plextus!\n--\nDownload Tiled from https://www.mapeditor.org/\n')
    zip.file('tiledmap.tmx', tiledmapTmx)
    imagesFolder.file(TILESET_FILENAME, tilesetImage)
    layerImages.map(({ filename, data }) => imagesFolder.file(filename, data))

    zip.generateAsync({ type: 'blob' })
        .then(content => saveAs(content, 'exported-tiledmap.zip'))
        .catch(err => logger.error(err))
}
