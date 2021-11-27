import React, { useCallback, useEffect, useMemo, useState } from 'react'
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
import { downloadImage } from '../common/utils/image'
import { SCALE_STEP } from '../common/constants'
import { Workspace, Tileset as TilesetType } from '../store/editor/types'
import ConfirmationDialog from './ConfirmationDialog'

const StyledTilesetImageContainer = styled.div`
    overflow: auto;
    margin-bottom: 10px;
    height: calc(45vh);
    background: #151515;
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
    const grid = useSelector(selectGrid)
    const tileset = useSelector(selectTileset)
    const selected = useSelector(selectSelected)
    const imageDimensions = useMemo<Dim>(() => getTilesetDimensions(tileset), [tileset])
    const tilesetContext = tilesetCanvas.getContext('2d')

    const { t } = useTranslation()

    const { columns, tilecount, tilewidth, tileheight } = tileset

    const [container, setContainer] = useState<HTMLDivElement>()
    const [stage, setStage] = useState<Konva.Stage>()
    const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false)
    const [scale, setScale] = useState<Vec2>({ x: 1, y: 1 })
    const [position, setPosition] = useState<Vec2>({ x: 0, y: 0 })
    const [size, setSize] = useState<Dim>({ w: 330, h: 500 })

    const dispatch = useDispatch()
    const onChangeSelectedTile = (tileId: number) => dispatch(changeSelectedTile(tileId))
    const onChangeTileset = (tileset: any) => dispatch(changeTileset(tileset))
    const onRemoveTile = (tileId: number, tileset: TilesetType) => dispatch(removeTile(tileId, tileset))
    const onSaveTilesetImage = (blob: Blob) => dispatch(changeTilesetImage(blob))
    const onOpenConfirmationDialog = () => setConfirmationDialogOpen(true)
    const onCancelRemoveLayer = () => setConfirmationDialogOpen(false)

    const handleContainer = useCallback(node => {
        setContainer(node)
    }, [])

    const handleStage = useCallback(node => {
        setStage(node)
    }, [])

    const onMouseDown = useCallback(() => {
        if (stage && scale) {
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
    }, [grid, stage, scale, columns, tilecount])

    const repositionStage = useCallback(
        (left: number, top: number): void => {
            if (stage && scale && container) {
                const boundsX = imageDimensions.w * scale.x - size.w
                const boundsY = imageDimensions.h * scale.y - size.h
                const dx = left <= boundsX ? left : boundsX
                const dy = top <= boundsY ? top : boundsY

                stage.container().style.transform = `translate(${dx}px, ${dy}px)`
                stage.x(-dx)
                stage.y(-dy)
                stage.batchDraw()

                container.scrollLeft = left
                container.scrollTop = top
                console.info(container.offsetWidth)
            }
        },
        [imageDimensions, container, scale, size, stage]
    )

    const onResize = useCallback(() => {
        if (container) {
            setSize({
                w: container.offsetWidth,
                h: container.offsetHeight
            })
        }
    }, [container])

    const onScroll = useCallback(
        (e: React.UIEvent<HTMLElement>): void => {
            const element = e.currentTarget as HTMLInputElement
            element && repositionStage(element.scrollLeft, element.scrollTop)
            e.preventDefault()
        },
        [repositionStage]
    )

    const onScale = useCallback(
        (newScale: any): void => {
            if (container && stage) {
                container.scrollTop = 0
                container.scrollLeft = 0
                repositionStage(0, 0)
                setScale({ x: newScale, y: newScale })
            }
        },
        [container, scale, stage]
    )

    const onAddTile = () => {
        createEmptyTile(tileset, tilesetCanvas, (blob: Blob, newTileId: number) => {
            onSaveTilesetImage(blob)
            onChangeTileset({ ...tileset, tilecount: newTileId })
            onChangeSelectedTile(newTileId)
            if (stage) {
                repositionStage(
                    ((newTileId - 1) % columns) * tilewidth * scale.x,
                    Math.ceil(newTileId / columns - 1) * tileheight * scale.y
                )
            }
        })
    }

    const onDeleteTile = (tileId: number) => {
        if (tilesetContext) {
            const newTileCount = tilecount > 1 ? tilecount - 1 : 1
            const newWidth = columns * tilewidth
            const newHeight = Math.ceil(newTileCount / columns) * tileheight
            if (tilecount > 1) {
                for (let gid = tileId; gid <= tilecount; gid += 1) {
                    const { x, y } = getTilePos(gid, tileset)
                    const { x: newX, y: newY } = getTilePos(gid - 1, tileset)
                    const tile = tilesetContext.getImageData(x, y, tilewidth, tileheight)

                    tilesetContext.clearRect(x, y, tilewidth, tileheight)
                    if (gid > tileId) {
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
                onRemoveTile(tileId, {
                    ...tileset,
                    image: window.URL.createObjectURL(blob),
                    tilecount: newTileCount
                })
                if (tileId > newTileCount) {
                    onChangeSelectedTile(tileId - 1)
                }
            })
            stage?.batchDraw()
        }
        setConfirmationDialogOpen(false)
    }

    useEffect(() => {
        onResize()
        window.addEventListener('resize', onResize)
        return () => {
            window.removeEventListener('resize', onResize)
        }
    }, [onResize])

    useEffect(() => {
        const x = ((selected.tileId - 1) % columns) * tilewidth
        const y = Math.ceil(selected.tileId / columns - 1) * tileheight
        setPosition({ x, y })
    }, [selected.tileId, columns, tilewidth, tileheight])

    useEffect(() => {
        const newScale = (size.w - 10) / imageDimensions.w
        setScale({ x: newScale, y: newScale })
    }, [imageDimensions.w])

    return (
        <>
            <ConfirmationDialog
                title={t('hold_on')}
                message={t('delete_tile_confirmation')}
                open={confirmationDialogOpen}
                onConfirm={() => onDeleteTile(selected.tileId)}
                onClose={onCancelRemoveLayer}
            />
            <StyledTilesetImageContainer ref={handleContainer} {...{ onScroll }}>
                <div
                    style={{
                        width: imageDimensions.w * scale.x,
                        height: imageDimensions.h * scale.y
                    }}
                >
                    <Stage ref={handleStage} width={size.w} height={size.h} {...{ scale }}>
                        <Layer imageSmoothingEnabled={false}>
                            {tilesetCanvas && <Image image={tilesetCanvas} {...{ onMouseDown }} />}
                            <Rect
                                x={position.x}
                                y={position.y}
                                width={tileset.tilewidth}
                                height={tileset.tileheight}
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
                    {scale && (
                        <Slider
                            step={SCALE_STEP}
                            min={0.5}
                            max={10}
                            value={scale.x}
                            onChange={(event, value) => onScale(value)}
                        />
                    )}
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
                        <IconButton size="small" onClick={() => downloadImage(tilesetCanvas)}>
                            <SaveAltIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </StyledButtonContainer>
            </StyledBottomContainer>
        </>
    )
}

Tileset.displayName = 'Tileset'

export default Tileset
