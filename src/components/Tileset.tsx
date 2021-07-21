import React, { useEffect, useRef, useState } from 'react'
import Konva from 'konva'
import styled from '@emotion/styled'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { Image, Layer, Rect, Stage } from 'react-konva'
import { Add as AddIcon, DeleteForever as DeleteForeverIcon, SaveAlt as SaveAltIcon } from '@material-ui/icons'
import { IconButton, Slider, Tooltip } from '@material-ui/core'
import { getTilesetDimensions, createEmptyTile, getTilePos } from '../store/editor/utils'
import { changeSelectedTile, changeTilesetImage, changeTileset, removeTile } from '../store/editor/actions'
import { selectGrid, selectSelected, selectTileset } from '../store/editor/selectors'
import { getCoordsFromPos, getPointerRelativePos } from '../common/utils/konva'
import { RIGHT_BAR_WIDTH, SCALE_STEP } from '../common/constants'
import { Workspace, Tileset as TilesetType } from '../store/editor/types'
import ConfirmationDialog from './ConfirmationDialog'

const StyledTilesetImageContainer = styled.div`
    overflow: auto;
    margin-bottom: 10px;
    height: calc(45vh);
`

const StyledBottomContainer = styled.div`
    display: flex;
    justify-content: flex-end;
`

const StyledButtonContainer = styled.div`
    width: 72px;
    display: flex;
    padding: 4px;
    margin-right: 10px;
`

const StyledSliderContainer = styled.div`
    width: 240px;
    display: flex;
    padding-top: 4px;
    padding-right: 10px;
`

type Props = {
    tilesetCanvas: HTMLCanvasElement
}

const Tileset = ({ tilesetCanvas }: Props): JSX.Element => {
    const containerRef = useRef<HTMLDivElement>(null)
    const stageRef = useRef<Konva.Stage>(null)

    const { t } = useTranslation()

    const grid = useSelector(selectGrid)
    const tileset = useSelector(selectTileset)
    const selected = useSelector(selectSelected)
    const imageDimensions = getTilesetDimensions(tileset)
    const tilesetContext = tilesetCanvas.getContext('2d')

    const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false)
    const [scale, setScale] = useState({ x: 2, y: 2 })
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const [size, setSize] = useState({
        width: RIGHT_BAR_WIDTH - 20,
        height: 500
    })

    const { columns, tilecount, tilewidth, tileheight } = tileset

    const dispatch = useDispatch()
    const onChangeSelectedTile = (tileId: number) => dispatch(changeSelectedTile(tileId))
    const onChangeTileset = (tileset: any) => dispatch(changeTileset(tileset))
    const onRemoveTile = (tileId: number, tileset: TilesetType) => dispatch(removeTile(tileId, tileset))
    const onSaveTilesetImage = (blob: Blob) => dispatch(changeTilesetImage(blob))
    const onOpenConfirmationDialog = () => setConfirmationDialogOpen(true)
    const onCancelRemoveLayer = () => setConfirmationDialogOpen(false)

    const onMouseDown = () => {
        const stage = stageRef.current
        if (stage) {
            const localPos = getPointerRelativePos(
                {
                    x: stage.x(),
                    y: stage.y(),
                    scale: scale.x
                } as Workspace,
                stage.getPointerPosition() as Konva.Vector2d
            )
            const { x, y } = getCoordsFromPos(grid, localPos)
            const tileId = x + y * columns + 1
            if (tileId <= tilecount) {
                onChangeSelectedTile(tileId)
            }
        }
    }

    const repositionStage = (left: number, top: number): void => {
        const stage = stageRef.current
        if (stage) {
            const boundsX = imageDimensions.w * scale.x - size.width
            const boundsY = imageDimensions.h * scale.y - size.height
            const dx = left < boundsX ? left : boundsX
            const dy = top < boundsY ? top : boundsY

            stage.container().style.transform = `translate(${dx}px, ${dy}px)`
            stage.x(-dx)
            stage.y(-dy)
            stage.batchDraw()
        }
    }

    const onResize = () => {
        const container = containerRef.current
        if (container) {
            setSize({
                width: container.offsetWidth,
                height: container.offsetHeight
            })
        }
    }

    const onScroll = (e: React.UIEvent<HTMLElement>): void => {
        const element = e.currentTarget as HTMLInputElement
        if (element) {
            repositionStage(element.scrollLeft, element.scrollTop)
        }
    }

    const onScale = (newScale: any): void => {
        const stage = stageRef.current
        const container = containerRef.current
        if (stage && container) {
            stage.scale(scale)
            container.scrollTop = 0
            container.scrollLeft = 0
            repositionStage(0, 0)
            setScale({ x: newScale, y: newScale })
        }
    }

    const onAddTile = () => {
        createEmptyTile(tileset, tilesetCanvas, (blob: Blob, newTileId: number) => {
            onSaveTilesetImage(blob)
            onChangeTileset({ ...tileset, tilecount: newTileId })
            onChangeSelectedTile(newTileId)
        })
    }

    const onDeleteTile = () => {
        if (tilesetContext) {
            const newTileCount = tilecount > 1 ? tilecount - 1 : 1
            const newWidth = columns * tilewidth
            const newHeight = Math.ceil(newTileCount / columns) * tileheight
            if (tilecount > 1) {
                for (let gid = selected.tileId; gid <= tilecount; gid += 1) {
                    const { x, y } = getTilePos(gid, tileset)
                    const { x: newX, y: newY } = getTilePos(gid - 1, tileset)
                    const tile = tilesetContext.getImageData(x, y, tilewidth, tileheight)

                    tilesetContext.clearRect(x, y, tilewidth, tileheight)
                    if (gid > selected.tileId) {
                        tilesetContext.putImageData(tile, newX, newY)
                    }
                }
                const newTilesetData = tilesetContext.getImageData(0, 0, newWidth, newHeight)
                tilesetCanvas.width = newWidth
                tilesetCanvas.height = newHeight
                tilesetContext.clearRect(0, 0, newWidth, newHeight)
                tilesetContext.putImageData(newTilesetData, 0, 0)
            } else {
                tilesetContext.clearRect(0, 0, tilewidth, tileheight)
            }
            tilesetCanvas.toBlob(blob => {
                onRemoveTile(selected.tileId, {
                    ...tileset,
                    image: window.URL.createObjectURL(blob),
                    tilecount: newTileCount
                })
                if (selected.tileId > newTileCount) {
                    onChangeSelectedTile(selected.tileId - 1)
                }
            })
            stageRef.current?.batchDraw()
        }
        setConfirmationDialogOpen(false)
    }

    const onDownloadTilesetImage = () => {
        const downloadLink = document.createElement('a')
        const dataURL = tilesetCanvas.toDataURL('image/png')
        const url = dataURL.replace(/^data:image\/png/, 'data:application/octet-stream')
        downloadLink.setAttribute('download', 'tileset.png')
        downloadLink.setAttribute('href', url)
        downloadLink.click()
    }

    useEffect(() => {
        onResize()
        window.addEventListener('resize', onResize)
        return () => {
            window.removeEventListener('resize', onResize)
        }
    }, [tileset])

    useEffect(() => {
        const x = ((selected.tileId - 1) % columns) * tilewidth
        const y = Math.ceil(selected.tileId / columns - 1) * tileheight
        setPosition({ x, y })
    }, [selected.tileId])

    return (
        <>
            <ConfirmationDialog
                title={t('hold_on')}
                message={t('delete_tile_confirmation')}
                open={confirmationDialogOpen}
                onConfirm={onDeleteTile}
                onClose={onCancelRemoveLayer}
            />
            <StyledTilesetImageContainer ref={containerRef} {...{ onScroll }}>
                <div
                    style={{
                        width: imageDimensions.w * scale.x,
                        height: imageDimensions.h * scale.y
                    }}
                >
                    <Stage ref={stageRef} width={size.width} height={size.height} {...{ scale }}>
                        <Layer imageSmoothingEnabled={false}>
                            {tilesetCanvas && <Image image={tilesetCanvas} {...{ onMouseDown }} />}
                            <Rect
                                x={position.x}
                                y={position.y}
                                width={tilewidth}
                                height={tileheight}
                                shadowBlur={5}
                                strokeWidth={1 / scale.x}
                                stroke="#96cdff"
                                fill="rgba(150,200,255,0.3)"
                            />
                        </Layer>
                    </Stage>
                </div>
            </StyledTilesetImageContainer>

            <StyledBottomContainer>
                <StyledSliderContainer>
                    <Slider
                        step={SCALE_STEP}
                        min={0.5}
                        max={10}
                        value={scale.x}
                        onChange={(event, value) => onScale(value)}
                    />
                </StyledSliderContainer>
                <StyledButtonContainer>
                    <Tooltip title="Add new tile" placement="bottom-end">
                        <IconButton size="small" onClick={onAddTile}>
                            <AddIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete selected tile" placement="bottom-end">
                        <IconButton size="small" onClick={onOpenConfirmationDialog}>
                            <DeleteForeverIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Download tileset" placement="bottom-end">
                        <IconButton size="small" onClick={onDownloadTilesetImage}>
                            <SaveAltIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </StyledButtonContainer>
            </StyledBottomContainer>
        </>
    )
}

export default Tileset
