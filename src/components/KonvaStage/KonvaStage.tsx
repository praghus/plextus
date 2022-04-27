/** @jsx jsx */
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Konva from 'konva'
import { jsx } from '@emotion/react'
import { useTheme } from '@mui/material/styles'
import { debounce } from 'lodash'
import { useDispatch, useSelector } from 'react-redux'
import { Stage, Layer, Rect } from 'react-konva'

import { undo, redo } from '../../store/history/actions'
import { Rectangle, Tileset } from '../../store/editor/types'
import { SCALE_BY, TOOLS } from '../../common/constants'
import { centerStage } from '../../common/utils/konva'
import { getRgbaValue } from '../../common/utils/colors'
import {
    selectCanvas,
    selectGrid,
    selectLayers,
    selectSelected,
    selectTileset,
    selectWorkspace
} from '../../store/editor/selectors'
import {
    adjustWorkspaceSize,
    changeLayerData,
    changeLayerImage,
    changeLayerOffset,
    changePosition,
    changePrimaryColor,
    changeScale,
    changeSelectedArea,
    changeSelectedTile,
    changeTileset,
    changeTilesetImage,
    crop
} from '../../store/editor/actions'
import { CropTool } from '../CropTool'
import { GridLines } from '../GridLines'
import { KonvaLayer } from '../KonvaLayer'
import { Pointer } from '../Pointer'
import { SelectTool } from '../SelectTool'
import { StatusBar } from '../StatusBar'
import { TransparentBackground } from '../TransparentBackground'
import { TileInfoLabel } from '../TileInfoLabel'
import { styles } from './KonvaStage.styled'

interface Props {
    tilesetCanvas: HTMLCanvasElement
}

const KonvaStage: React.FunctionComponent<Props> = ({ tilesetCanvas }) => {
    const selected = useSelector(selectSelected)
    const grid = useSelector(selectGrid)
    const canvas = useSelector(selectCanvas)
    const layers = useSelector(selectLayers)
    const tileset = useSelector(selectTileset)
    const workspace = useSelector(selectWorkspace)

    const backgroundColor = canvas.background && getRgbaValue(canvas.background)
    const selectedLayer = layers.find(({ id }) => id === selected.layerId) || null

    const [stage, setStage] = useState<Konva.Stage>()
    const [isMouseDown, setIsMouseDown] = useState<boolean>(false)
    const [isMouseOver, setIsMouseOver] = useState<boolean>(false)
    const [pointerPosition, setPointerPosition] = useState<Konva.Vector2d>({ x: 0, y: 0 })
    const [keyDown, setKeyDown] = useState<KeyboardEvent | null>(null)

    const isPointerVisible = useMemo(
        () =>
            isMouseOver &&
            !isMouseDown &&
            ![TOOLS.DRAG, TOOLS.CROP, TOOLS.SELECT, TOOLS.OFFSET].includes(selected.tool),
        [isMouseDown, isMouseOver, selected.tool]
    )

    const theme = useTheme()
    const dispatch = useDispatch()

    const onAdjustWorkspaceSize = () => dispatch(adjustWorkspaceSize())
    const onChangeSelectedArea = (rect: Rectangle) => dispatch(changeSelectedArea(rect))
    const onChangeLayerData = (layerId: string, data: (number | null)[]) => dispatch(changeLayerData(layerId, data))
    const onChangeLayerImage = (layerId: string, blob: Blob) => dispatch(changeLayerImage(layerId, blob))
    const onChangePrimaryColor = (color: number[]) => dispatch(changePrimaryColor(color))
    const onChangeSelectedTile = (tileId: number) => dispatch(changeSelectedTile(tileId))
    const onChangeTileset = (tileset: Tileset) => dispatch(changeTileset(tileset))
    const onChangeLayerOffset = (layerId: string, x: number, y: number) => dispatch(changeLayerOffset(layerId, x, y))
    const onSaveTilesetImage = (blob: Blob) => dispatch(changeTilesetImage(blob))
    const onUndo = () => dispatch(undo())
    const onRedo = () => dispatch(redo())
    const onCrop = () => dispatch(crop())
    const onKeyUp = () => setKeyDown(null)
    const onKeyDown = (keyDown: KeyboardEvent) => setKeyDown(keyDown)
    const onDragEnd = () => stage && onChangePosition(stage.x(), stage.y())
    const onMouseMove = () => stage && setPointerPosition(stage.getPointerPosition() as Konva.Vector2d)

    const onChangePosition = useCallback(
        debounce((x, y) => dispatch(changePosition(x, y)), 300),
        []
    )

    const onChangeScale = useCallback(
        debounce(scale => dispatch(changeScale(scale)), 300),
        []
    )

    const handleStage = useCallback((node: Konva.Stage) => {
        setStage(node)
    }, [])

    const onScale = useCallback(
        (newScale: number) => {
            if (stage) {
                const pointer = stage.getPointerPosition()
                if (pointer) {
                    const { x, y } = pointer
                    const oldScale = stage.scaleX()
                    const newPos = {
                        x: x - ((x - stage.x()) / oldScale) * newScale,
                        y: y - ((y - stage.y()) / oldScale) * newScale
                    }
                    onChangeScale(newScale)
                    onChangePosition(newPos.x, newPos.y)
                    stage.scale({ x: newScale, y: newScale })
                    stage.position(newPos)
                    stage.batchDraw()
                }
            }
        },
        [stage]
    )

    const onWheel = useCallback(
        (e: Konva.KonvaEventObject<WheelEvent>) => {
            if (stage) {
                const { altKey, deltaX, deltaY } = e.evt
                if (altKey) {
                    const newScale = deltaY > 0 ? stage.scaleX() / SCALE_BY : stage.scaleX() * SCALE_BY
                    onScale(newScale)
                } else {
                    const newPos = {
                        x: stage.x() - deltaX,
                        y: stage.y() - deltaY
                    }
                    stage.position(newPos)
                    onChangePosition(newPos.x, newPos.y)
                }
                stage.batchDraw()
            }
            e.evt.preventDefault()
        },
        [stage]
    )

    useEffect(() => {
        window.addEventListener('keydown', onKeyDown)
        window.addEventListener('keyup', onKeyUp)
        return () => {
            window.removeEventListener('keydown', onKeyDown)
            window.removeEventListener('keyup', onKeyUp)
        }
    }, [])

    useEffect(() => {
        const { scale, x, y } = workspace
        if (stage) {
            if (x && y) {
                stage.position({ x, y })
                stage.scale({ x: scale, y: scale })
                stage.batchDraw()
            } else {
                centerStage(stage, canvas, workspace, (x, y, scale) => {
                    onChangePosition(x, y)
                    onChangeScale(scale)
                })
            }
        }
        onAdjustWorkspaceSize()
    }, [stage, canvas])

    useEffect(() => {
        if (stage && selected.tool == TOOLS.CROP) {
            centerStage(stage, canvas, workspace, (x, y, scale) => {
                onChangePosition(x, y)
                onChangeScale(scale)
            })
        }
    }, [stage, selected.tool])

    useEffect(() => {
        if (keyDown) {
            if (keyDown.code === 'KeyZ' && (keyDown.ctrlKey || keyDown.metaKey)) {
                keyDown.shiftKey ? onRedo() : onUndo()
            }
            if (keyDown.code === 'Enter' && selected.tool === TOOLS.CROP) {
                onCrop()
            }
        }
    }, [keyDown])

    return (
        <div>
            <div css={styles({ selected })}>
                <Stage
                    ref={handleStage}
                    width={workspace.width}
                    height={workspace.height}
                    draggable={selected.tool === TOOLS.DRAG || selected.tool === TOOLS.CROP}
                    onContextMenu={e => e.evt.preventDefault()}
                    onMouseDown={() => setIsMouseDown(true)}
                    onMouseUp={() => setIsMouseDown(false)}
                    onMouseOver={() => setIsMouseOver(true)}
                    onMouseOut={() => setIsMouseOver(false)}
                    {...{ onDragEnd, onMouseMove, onWheel }}
                >
                    <Layer imageSmoothingEnabled={false}>
                        <TransparentBackground
                            {...{ theme }}
                            width={canvas.width}
                            height={canvas.height}
                            scale={1 / workspace.scale}
                        />
                        {backgroundColor && <Rect width={canvas.width} height={canvas.height} fill={backgroundColor} />}
                        {stage &&
                            layers.map(layer => (
                                <KonvaLayer
                                    key={`layer-${layer.id}`}
                                    {...{
                                        grid,
                                        isMouseDown,
                                        keyDown,
                                        layer,
                                        onChangeLayerData,
                                        onChangeLayerImage,
                                        onChangeLayerOffset,
                                        onChangePrimaryColor,
                                        onChangeSelectedTile,
                                        onChangeTileset,
                                        onSaveTilesetImage,
                                        selected,
                                        stage,
                                        tileset,
                                        tilesetCanvas,
                                        workspace
                                    }}
                                />
                            ))}
                        {selected.tool === TOOLS.CROP && <CropTool {...{ canvas, grid, onChangeSelectedArea }} />}
                        {selected.tool === TOOLS.SELECT && (
                            <SelectTool {...{ canvas, grid, isMouseDown, pointerPosition, workspace }} />
                        )}
                        <GridLines
                            x={selected.tool !== TOOLS.OFFSET ? selectedLayer?.offset.x : 0}
                            y={selected.tool !== TOOLS.OFFSET ? selectedLayer?.offset.y : 0}
                            width={
                                selectedLayer
                                    ? selectedLayer.width * (selectedLayer.image ? 1 : tileset.tilewidth)
                                    : canvas.width
                            }
                            height={
                                selectedLayer
                                    ? selectedLayer.height * (selectedLayer.image ? 1 : tileset.tileheight)
                                    : canvas.height
                            }
                            scale={workspace.scale}
                            {...{ grid }}
                        />
                        {isPointerVisible && (
                            <Pointer
                                {...{
                                    grid,
                                    pointerPosition,
                                    selected,
                                    selectedLayer,
                                    tileset,
                                    workspace
                                }}
                            />
                        )}
                    </Layer>
                </Stage>
                <TileInfoLabel {...{ pointerPosition, selectedLayer }} />
            </div>
            {stage && <StatusBar {...{ stage }} />}
        </div>
    )
}
KonvaStage.displayName = 'KonvaStage'

export default KonvaStage
