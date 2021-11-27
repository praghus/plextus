import zlib from 'zlib'
import JSZip from 'jszip'
import { create } from 'xmlbuilder2'
import { Buffer } from 'buffer'
import { saveAs } from 'file-saver'
import { Canvas, Layer, Tileset } from 'store/editor/types'
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
                layerImages.push({ filename, data: await fetch(image).then(r => r.blob()) })
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
                                source: `./images/${filename}`,
                                width,
                                height
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
                            id: i + 1,
                            name,
                            opacity,
                            width,
                            height,
                            visible: visible ? 1 : 0,
                            ...offsetx,
                            ...offsety
                        },
                        data: {
                            '@': {
                                encoding: 'base64',
                                compression: 'zlib'
                            },
                            '#': await encodeLayer(buffer)
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
                version: 1.7, // move to const
                tiledversion: '1.7.1', // move to const
                orientation: 'orthogonal',
                renderorder: 'right-down',
                type: 'map',
                infinite: false,
                nextlayerid: layers.length,
                width: canvas.width / tileset.tileheight,
                height: canvas.height / tileset.tileheight,
                tileheight,
                tilewidth,
                ...backgroundColor
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
                        source: './images/tileset.png',
                        width: columns * tilewidth,
                        height: (1 + Math.round(tilecount / columns)) * tileheight
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
    imagesFolder.file('tileset.png', tilesetImage)
    layerImages.map(({ filename, data }) => imagesFolder.file(filename, data))

    zip.generateAsync({ type: 'blob' })
        .then(content => saveAs(content, 'exported-tiledmap.zip'))
        .catch(err => logger.error(err))
}
