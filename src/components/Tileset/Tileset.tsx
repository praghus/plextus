import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Konva from 'konva'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { Image, Layer, Rect, Stage } from 'react-konva'
import { Add as AddIcon, DeleteForever as DeleteForeverIcon, SaveAlt as SaveAltIcon } from '@mui/icons-material'
import { IconButton, Slider, Tooltip } from '@mui/material'

import { getTilesetDimensions, createEmptyTile, getTilePos } from '../../store/editor/utils'
import { changeSelectedTile, changeTilesetImage, changeTileset, removeTile } from '../../store/editor/actions'
import { selectGrid, selectSelected, selectTileset } from '../../store/editor/selectors'
import { getCoordsFromPos, getPointerRelativePos } from '../../common/utils/konva'
import { downloadImage } from '../../common/utils/image'
import { SCALE_STEP } from '../../common/constants'
import { Workspace, Tileset as TilesetType } from '../../store/editor/types'
import { ConfirmationDialog } from '../ConfirmationDialog'
import {
    StyledTilesetImageContainer,
    StyledBottomContainer,
    StyledButtonContainer,
    StyledSliderContainer
} from './Tileset.styled'

interface Props {
    tilesetCanvas: HTMLCanvasElement
}

const Tileset: React.FunctionComponent<Props> = ({ tilesetCanvas }) => {
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
    const [size, setSize] = useState<Dim>({ h: 500, w: 330 })

    const dispatch = useDispatch()
    const onChangeSelectedTile = (tileId: number) => dispatch(changeSelectedTile(tileId))
    const onChangeTileset = (tileset: TilesetType) => dispatch(changeTileset(tileset))
    const onRemoveTile = (tileId: number, tileset: TilesetType) => dispatch(removeTile(tileId, tileset))
    const onSaveTilesetImage = (blob: Blob) => dispatch(changeTilesetImage(blob))
    const onOpenConfirmationDialog = () => setConfirmationDialogOpen(true)
    const onCancelRemoveLayer = () => setConfirmationDialogOpen(false)

    const handleContainer = useCallback((node: HTMLDivElement) => {
        setContainer(node)
    }, [])

    const handleStage = useCallback((node: Konva.Stage) => {
        setStage(node)
    }, [])

    const onMouseDown = useCallback(() => {
        if (stage && scale) {
            const localPos = getPointerRelativePos(
                {
                    scale: scale.x,
                    x: stage.x(),
                    y: stage.y()
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
            }
        },
        [imageDimensions, container, scale, size, stage]
    )

    const onResize = useCallback(() => {
        if (container) {
            setSize({
                h: container.offsetHeight,
                w: container.offsetWidth
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
        (newScale: number): void => {
            if (container && stage) {
                container.scrollTop = 0
                container.scrollLeft = 0
                repositionStage(0, 0)
                setScale({ x: newScale, y: newScale })
            }
        },
        [container, scale, stage]
    )

    const onAddTile = async () => {
        const { blob, newTileId } = await createEmptyTile(tileset, tilesetCanvas)
        onSaveTilesetImage(blob)
        onChangeTileset({ ...tileset, tilecount: newTileId })
        onChangeSelectedTile(newTileId)
        if (stage) {
            repositionStage(
                ((newTileId - 1) % columns) * tilewidth * scale.x,
                Math.ceil(newTileId / columns - 1) * tileheight * scale.y
            )
        }
    }

    // todo: cunsider useCallback here
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
                    image: window.URL.createObjectURL(blob as Blob),
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
                title={t('i18_hold_on')}
                message={t('i18_delete_tile_confirmation')}
                open={confirmationDialogOpen}
                onConfirm={() => onDeleteTile(selected.tileId)}
                onClose={onCancelRemoveLayer}
            />
            <StyledTilesetImageContainer ref={handleContainer} {...{ onScroll }}>
                <div
                    style={{
                        height: imageDimensions.h * scale.y,
                        width: imageDimensions.w * scale.x
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
                                // shadowBlur={5}
                                strokeWidth={2 / scale.x}
                                stroke="#96cdff"
                                fill="rgba(150,200,255,0.4)"
                            />
                        </Layer>
                    </Stage>
                </div>
            </StyledTilesetImageContainer>

            <StyledBottomContainer>
                <StyledSliderContainer>
                    {scale && (
                        <Slider
                            size="small"
                            step={SCALE_STEP}
                            min={0.5}
                            max={10}
                            value={scale.x}
                            onChange={(_, value) => onScale(value as number)}
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
