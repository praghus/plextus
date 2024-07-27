import { useCallback, useEffect, useMemo, useState } from 'react'
import Konva from 'konva'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { Image, Layer, Rect, Stage } from 'react-konva'
import { AddBox as AddBoxIcon, DeleteForever as DeleteForeverIcon, SaveAlt as SaveAltIcon } from '@mui/icons-material'
import { Card, IconButton, Slider, Tooltip } from '@mui/material'

import { getTilesetDimensions, createEmptyTile, getTilePos } from '../../stores/editor/utils'
import { changeSelectedTile, changeTilesetImage, changeTileset, removeTile } from '../../stores/editor/actions'
import { selectGrid, selectSelected, selectTileset } from '../../stores/editor/selectors'
import { getCoordsFromPos, getPointerRelativePos } from '../../common/utils/konva'
import { downloadImage, get2DContext } from '../../common/utils/image'
import { useZoomEvents } from '../../hooks/useZoomEvents'
import { Workspace, Tileset as TilesetType, Dim } from '../../stores/editor/types'
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

const Tileset = ({ tilesetCanvas }: Props) => {
    const grid = useSelector(selectGrid)
    const tileset = useSelector(selectTileset)
    const selected = useSelector(selectSelected)
    const imageDimensions = useMemo<Dim>(() => getTilesetDimensions(tileset), [tileset])
    const tilesetContext = get2DContext(tilesetCanvas)

    const { t } = useTranslation()

    const { columns, tilecount, tilewidth, tileheight } = tileset

    const [stage, setStage] = useState<Konva.Stage>()
    const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false)
    const [scale, setScale] = useState<Konva.Vector2d>({ x: 1, y: 1 })
    const [position, setPosition] = useState<Konva.Vector2d>({ x: 0, y: 0 })
    const [tilePosition, setTilePosition] = useState<Konva.Vector2d>({
        x: 0,
        y: 0
    })
    const [size, setSize] = useState<Dim>({ h: 320, w: 299 })

    const dispatch = useDispatch()
    const onChangeSelectedTile = useCallback((tileId: number) => dispatch(changeSelectedTile(tileId)), [dispatch])
    const onChangeTileset = (tileset: TilesetType) => dispatch(changeTileset(tileset))
    const onRemoveTile = (tileId: number, tileset: TilesetType) => dispatch(removeTile(tileId, tileset))
    const onSaveTilesetImage = (blob: Blob) => dispatch(changeTilesetImage(blob))
    const onOpenConfirmationDialog = () => setConfirmationDialogOpen(true)
    const onCancelRemoveLayer = () => setConfirmationDialogOpen(false)

    const handleContainer = useCallback((node: HTMLDivElement) => {
        if (node) {
            setSize({
                h: node.offsetHeight,
                w: node.offsetWidth
            })
        }
    }, [])

    const handleStage = useCallback((node: Konva.Stage) => {
        setStage(node)
    }, [])

    const dragBoundFunc = useCallback(
        (pos: Konva.Vector2d) => {
            return {
                x:
                    size.w > tilesetCanvas.width * scale.x
                        ? 0
                        : Math.max(size.w - tilesetCanvas.width * scale.x, Math.min(pos.x, 0)),
                y:
                    size.h > tilesetCanvas.height * scale.y
                        ? 0
                        : Math.max(size.h - tilesetCanvas.height * scale.y, Math.min(pos.y, 0))
            }
        },
        [size, scale, tilesetCanvas.width, tilesetCanvas.height]
    )

    const onSelectTile = useCallback(() => {
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
    }, [stage, scale, grid, columns, tilecount, onChangeSelectedTile])

    const onAddTile = async () => {
        const { blob, newTileId } = await createEmptyTile(tileset, tilesetCanvas)
        onSaveTilesetImage(blob)
        onChangeTileset({ ...tileset, tilecount: newTileId })
        onChangeSelectedTile(newTileId)
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
                    image: window.URL.createObjectURL(blob as Blob),
                    tilecount: newTileCount
                })
                if (tileId > newTileCount) {
                    onChangeSelectedTile(tileId - 1)
                }
            })
        }
        setConfirmationDialogOpen(false)
    }

    const { onScale, onTouchEnd, onDragEnd, onTouchMove, onWheel } = useZoomEvents(
        stage,
        setPosition,
        setScale,
        dragBoundFunc
    )

    useEffect(() => {
        const x = ((selected.tileId - 1) % columns) * tilewidth
        const y = Math.ceil(selected.tileId / columns - 1) * tileheight
        setTilePosition({ x, y })
    }, [selected.tileId, columns, tilewidth, tileheight])

    useEffect(() => {
        const newScale = size.w / imageDimensions.w
        setScale({ x: newScale, y: newScale })
    }, [imageDimensions.w, size.w])

    return (
        <>
            <ConfirmationDialog
                title={t('i18_hold_on')}
                message={t('i18_delete_tile_confirmation')}
                open={confirmationDialogOpen}
                onConfirm={() => onDeleteTile(selected.tileId)}
                onClose={onCancelRemoveLayer}
            />
            <Card sx={{ borderRadius: 0 }}>
                <StyledTilesetImageContainer ref={handleContainer}>
                    <Stage
                        ref={handleStage}
                        x={position.x}
                        y={position.y}
                        width={size.w}
                        height={size.h}
                        draggable
                        onClick={onSelectTile}
                        onTouchStart={onSelectTile}
                        {...{
                            dragBoundFunc,
                            onDragEnd,
                            onTouchEnd,
                            onTouchMove,
                            onWheel,
                            scale
                        }}
                    >
                        <Layer imageSmoothingEnabled={false}>
                            {tilesetCanvas && <Image image={tilesetCanvas} />}
                            <Rect
                                x={tilePosition.x}
                                y={tilePosition.y}
                                width={tileset.tilewidth}
                                height={tileset.tileheight}
                                strokeWidth={2 / scale.x}
                                stroke="#96cdff"
                                fill="rgba(150,200,255,0.4)"
                            />
                        </Layer>
                    </Stage>
                </StyledTilesetImageContainer>
            </Card>
            <StyledBottomContainer>
                <StyledSliderContainer>
                    {scale && (
                        <Slider
                            size="small"
                            step={0.1}
                            min={0.5}
                            max={10.0}
                            value={scale.x}
                            onChange={(_, value) => onScale(value as number)}
                        />
                    )}
                </StyledSliderContainer>
                <StyledButtonContainer>
                    <Tooltip title="Add new tile" placement="bottom-end">
                        <IconButton size="small" onClick={onAddTile}>
                            <AddBoxIcon fontSize="small" />
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
