import React, { memo, useRef, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Image } from 'react-konva'
import { TOOLS } from '../common/constants'
import {
    drawLine,
    getImageData,
    getCoordsFromPos,
    getPointerRelativePos,
    getTilePos
    // textRenderer,
} from '../store/editor/utils'
import logger from '../common/utils/logger'

const TOOL_SIZE = 1

let pointerPosition = null
let isDrawing = false
let isEmpty = false
let isPlacing = false
let selectedTile

const tempData = {}

const MapLayer = ({
    canvas,
    grid,
    layer,
    selected,
    stage,
    tileset,
    tilesetCanvas,
    onChangeLayerData,
    onChangePrimaryColor,
    onChangeSelectedTile,
    onSaveTilesetImage,
    workspace
}) => {
    const imageRef = useRef(null)

    const [ctx, setCtx] = useState(null)
    const [data, setData] = useState([])
    const [image, setImage] = useState(null)
    const [pixelTool, setPixelTool] = useState(null)

    const { width, height } = canvas
    const { opacity, visible } = layer
    const { tilewidth, tileheight } = tileset

    const isSelected = selected.layerId === layer.id
    const canvasElement = document.createElement('canvas')
    const canvasContext = canvasElement.getContext('2d')

    const usePixelTool = (x, y) => {
        // obey selected tile bounds
        if (
            x > selectedTile.x * tilewidth &&
            x < selectedTile.x * tilewidth + tilewidth &&
            y > selectedTile.y * tileheight &&
            y < selectedTile.y * tileheight + tileheight
        ) {
            ctx.putImageData(pixelTool, x, y)
        }
    }

    const draw = (gid, i) => {
        const x = (i % layer.width) * grid.width
        const y = Math.ceil((i + 1) / layer.width - 1) * grid.height
        ctx.clearRect(x, y, tilewidth, tileheight)
        if (gid) {
            const { x: posX, y: posY } = getTilePos(gid, tileset)
            ctx.drawImage(tilesetCanvas, posX, posY, tilewidth, tileheight, x, y, tilewidth, tileheight)
            // if (isSelected) {
            //   ctx.fillStyle = 'black'
            //   ctx.fillRect(x, y, `${gid}`.length * 5, 6)
            //   textRenderer(ctx)(`${gid}`, x, y + 1)
            // }
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
        if (ctx && layer.data && tilesetCanvas) {
            ctx.clearRect(0, 0, width, height)
            layer.data.map((gid, i) => draw(gid, i))
            logger.info(`layer ${layer.id} rendered`)
            stage.batchDraw()
        }
    }, [ctx, tilesetCanvas, layer.data])

    const updateLayer = (x, y, gid) => {
        const pos = x + ((layer.width * tilewidth) / grid.width) * y
        if (tempData[layer.id][pos] !== gid) {
            tempData[layer.id][pos] = gid
            draw(gid, pos)
            stage.batchDraw()
        }
    }

    const onMouseDown = e => {
        if (visible && isSelected) {
            const localPos = getPointerRelativePos(workspace, stage.getPointerPosition())
            const { x, y } = getCoordsFromPos(grid, localPos)
            const gid = layer.data[x + ((layer.width * tilewidth) / grid.width) * y]

            selectedTile = { gid, x, y }

            switch (selected.tool) {
                case TOOLS.DELETE:
                case TOOLS.STAMP:
                    if (e.evt.button === 2) {
                        onChangeSelectedTile(gid)
                    } else {
                        isPlacing = true
                        tempData[layer.id] = [...data]
                        updateLayer(x, y, selected.tool === TOOLS.STAMP ? selected.tileId : null)
                    }
                    break
                case TOOLS.PENCIL:
                case TOOLS.ERASER:
                    if (gid) {
                        if (e.evt.button === 2) {
                            const colorData = Object.values(ctx.getImageData(localPos.x, localPos.y, 1, 1).data)
                            onChangePrimaryColor(colorData)
                        } else {
                            isDrawing = true
                            pointerPosition = stage.getPointerPosition()
                            usePixelTool(localPos.x, localPos.y)
                            stage.batchDraw()
                        }
                    } else {
                        isEmpty = true
                        ctx.save()
                        ctx.fillStyle = 'rgba(255,0,0,0.6)'
                        ctx.fillRect(x * tilewidth, y * tileheight, tilewidth, tileheight)
                        ctx.restore()
                        stage.batchDraw()
                    }
                    break

                default:
                    break
            }
            e.evt.preventDefault()
        }
    }

    const onMouseMove = () => {
        const pos = stage.getPointerPosition()
        const localPos = getPointerRelativePos(workspace, pos)
        if (isDrawing) {
            const { x: x1, y: y1 } = getPointerRelativePos(workspace, pointerPosition)
            const { x: x2, y: y2 } = localPos
            drawLine(x1, y1, x2, y2, usePixelTool)
            pointerPosition = pos
            stage.batchDraw()
        } else if (isPlacing) {
            const { x, y } = getCoordsFromPos(grid, localPos)
            updateLayer(x, y, selected.tool === TOOLS.STAMP ? selected.tileId : null)
        }
    }

    const onMouseUp = () => {
        if (isDrawing) {
            const tilesetContext = tilesetCanvas.getContext('2d')
            const { x, y } = getTilePos(selectedTile.gid, tileset)
            const tx = selectedTile.x * tilewidth
            const ty = selectedTile.y * tileheight
            tilesetContext.clearRect(x, y, tilewidth, tileheight)
            tilesetContext.drawImage(image, tx, ty, tilewidth, tileheight, x, y, tilewidth, tileheight)

            isDrawing = false
            layer.data.map((gid, i) => draw(gid, i))
            stage.batchDraw()
            tilesetCanvas.toBlob(onSaveTilesetImage, 'image/png')
        }
        if (isPlacing) {
            isPlacing = false
            setData(tempData[layer.id])
            onChangeLayerData(layer.id, tempData[layer.id])
        }
        if (isEmpty) {
            isEmpty = false
            ctx.clearRect(selectedTile.x * tilewidth, selectedTile.y * tileheight, tilewidth, tileheight)
            stage.batchDraw()
        }
    }

    console.info(`Layer ${layer.name}`, isSelected)

    return (
        visible && (
            <Image
                key={layer.id}
                listening={isSelected}
                ref={imageRef}
                opacity={opacity / 255}
                {...{
                    image,
                    onMouseDown,
                    onMouseMove,
                    onMouseUp,
                    width,
                    height
                }}
            />
        )
    )
}

MapLayer.propTypes = {
    canvas: PropTypes.object.isRequired,
    grid: PropTypes.object.isRequired,
    layer: PropTypes.object.isRequired,
    tileset: PropTypes.object.isRequired,
    tilesetCanvas: PropTypes.object.isRequired
}

// export default MapLayer
export default memo(
    MapLayer,
    (prevProps, nextProps) =>
        // nextProps.selected.layerId !== nextProps.layer.id &&
        // prevProps.selected.color === nextProps.selected.color &&
        // prevProps.selected.tool === nextProps.selected.tool &&
        prevProps.selected === nextProps.selected &&
        prevProps.workspace === nextProps.workspace &&
        prevProps.tilesetCanvas === nextProps.tilesetCanvas &&
        prevProps.layer === nextProps.layer
    // prevProps.layer.opacity === nextProps.layer.opacity &&
    // prevProps.layer.visible === nextProps.layer.visible
)
