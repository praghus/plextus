/** @jsx jsx */
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Konva from 'konva'
import { debounce } from 'lodash'
import { jsx, css } from '@emotion/react'
import { useDispatch, useSelector } from 'react-redux'
import { Stage, Layer, Rect } from 'react-konva'
import { undo, redo } from '../store/history/actions'
import { Rectangle } from '../store/editor/types'
import { SCALE_BY, TOOLS, BG_IMAGE } from '../common/constants'
import { centerStage } from '../common/utils/konva'
import { getRgbaValue } from '../common/utils/colors'
import {
    selectCanvas,
    selectGrid,
    selectLayers,
    selectSelected,
    selectTileset,
    selectWorkspace
} from '../store/editor/selectors'
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
} from '../store/editor/actions'
import CropTool from './CropTool'
import GridLines from './GridLines'
import TileLayer from './TileLayer'
import StatusBar from './StatusBar'
import Pointer from './Pointer'
import ImageLayer from './ImageLayer'

const styles = ({ selected }) => css`
    ${((selected.tool === TOOLS.DRAG || selected.tool === TOOLS.CROP) &&
        `
    cursor: move;
    cursor: grab;
    cursor: -moz-grab;
    cursor: -webkit-grab;

    :active {
      cursor: grabbing;
      cursor: -moz-grabbing;
      cursor: -webkit-grabbing;
    }
  `) ||
    ((selected.tool === TOOLS.PENCIL || selected.tool === TOOLS.ERASER) && `cursor: crosshair;`) ||
    (selected.tool === TOOLS.OFFSET && `cursor: move;`) ||
    `cursor: auto;`}
`

type Props = {
    tilesetCanvas: HTMLCanvasElement
}

const KonvaStage = ({ tilesetCanvas }: Props): JSX.Element | null => {
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
        () => !isMouseDown && isMouseOver && ![TOOLS.DRAG, TOOLS.CROP, TOOLS.OFFSET].includes(selected.tool),
        [isMouseDown, isMouseOver, selected.tool]
    )

    const dispatch = useDispatch()

    const onUndo = () => dispatch(undo())
    const onRedo = () => dispatch(redo())
    const onCrop = () => dispatch(crop())
    const onAdjustWorkspaceSize = () => dispatch(adjustWorkspaceSize())
    const onChangeSelectedArea = (rect: Rectangle) => dispatch(changeSelectedArea(rect))
    const onChangeLayerData = (layerId: string, data: (number | null)[]) => dispatch(changeLayerData(layerId, data))
    const onChangeLayerImage = (layerId: string, blob: Blob) => dispatch(changeLayerImage(layerId, blob))
    const onChangePrimaryColor = (color: number[]) => dispatch(changePrimaryColor(color))
    const onChangeSelectedTile = (tileId: number) => dispatch(changeSelectedTile(tileId))
    const onChangeTileset = (tileset: any) => dispatch(changeTileset(tileset))
    const onChangeLayerOffset = (layerId: string, x: number, y: number) => dispatch(changeLayerOffset(layerId, x, y))
    const onSaveTilesetImage = (blob: Blob) => dispatch(changeTilesetImage(blob))

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

    const handleStage = useCallback(node => {
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

    const layerProps = {
        canvas,
        grid,
        isMouseDown,
        keyDown,
        onChangeLayerOffset,
        onChangePrimaryColor,
        onChangeSelectedTile,
        onChangeTileset,
        onSaveTilesetImage,
        selected,
        tileset,
        tilesetCanvas,
        workspace
    }

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
                        <Rect
                            width={canvas.width}
                            height={canvas.height}
                            fillPatternImage={BG_IMAGE}
                            fillPatternScaleX={1 / workspace.scale}
                            fillPatternScaleY={1 / workspace.scale}
                        />
                        {backgroundColor && <Rect width={canvas.width} height={canvas.height} fill={backgroundColor} />}
                        {stage &&
                            layers.map(layer =>
                                layer.image ? (
                                    <ImageLayer
                                        key={`layer-${layer.id}`}
                                        {...{ ...layerProps, layer, onChangeLayerImage, stage }}
                                    />
                                ) : (
                                    <TileLayer
                                        key={`layer-${layer.id}`}
                                        {...{ ...layerProps, layer, onChangeLayerData, stage }}
                                    />
                                )
                            )}
                        {selected.tool === TOOLS.CROP && <CropTool {...{ canvas, grid, onChangeSelectedArea }} />}
                        <GridLines
                            x={selected.tool !== TOOLS.OFFSET ? selectedLayer?.offset.x : 0}
                            y={selected.tool !== TOOLS.OFFSET ? selectedLayer?.offset.y : 0}
                            width={(selectedLayer?.image && selectedLayer?.width) || canvas.width}
                            height={(selectedLayer?.image && selectedLayer?.height) || canvas.height}
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
            </div>
            {stage && <StatusBar {...{ pointerPosition, selectedLayer, stage }} />}
        </div>
    )
}
KonvaStage.displayName = 'KonvaStage'

export default KonvaStage
