/** @jsx jsx */
import React, { useCallback, useEffect, useRef, useState } from 'react'
import Konva from 'konva'
import { debounce } from 'lodash'
import { jsx, css } from '@emotion/react'
import { useDispatch, useSelector } from 'react-redux'
import { Stage, Layer, Rect } from 'react-konva'
import { undo, redo } from '../store/history/actions'
import { Rectangle } from '../store/editor/types'
import { SCALE_BY, TOOLS, BG_IMAGE } from '../common/constants'
import { centerStage } from '../common/utils/konva'
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

// import TilesIds from './TilesIds'

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
    const stageRef = useRef<Konva.Stage>(null)
    const selected = useSelector(selectSelected)
    const grid = useSelector(selectGrid)
    const canvas = useSelector(selectCanvas)
    const layers = useSelector(selectLayers)
    const tileset = useSelector(selectTileset)
    const workspace = useSelector(selectWorkspace)

    const [isMouseDown, setIsMouseDown] = useState(false)
    const [isMouseOver, setIsMouseOver] = useState(false)
    const [pointerPosition, setPointerPosition] = useState<Konva.Vector2d>({ x: 0, y: 0 })
    const [keyDown, setKeyDown] = useState<KeyboardEvent | null>(null)

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
    const onKeyDown = (e: KeyboardEvent) => setKeyDown(e)
    const onKeyUp = () => setKeyDown(null)

    const onChangePosition = useCallback(
        debounce((x, y) => dispatch(changePosition(x, y)), 300),
        []
    )

    const onChangeScale = useCallback(
        debounce(scale => dispatch(changeScale(scale)), 300),
        []
    )

    const selectedLayer = layers.find(({ id }) => id === selected.layerId) || null
    const stage = stageRef.current

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
        const stage = stageRef.current
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
    }, [canvas])

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

    useEffect(() => {
        if (stageRef.current && selected.tool == TOOLS.CROP) {
            centerStage(stageRef.current, canvas, workspace, (x, y, scale) => {
                onChangePosition(x, y)
                onChangeScale(scale)
            })
        }
    }, [selected.tool])

    const onScale = (newScale: number) => {
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
    }

    const onWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
        const { altKey, deltaX, deltaY } = e.evt
        if (stage) {
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
    }

    const onDragEnd = () => {
        if (stage) {
            onChangePosition(stage.x(), stage.y())
        }
    }

    const onMouseMove = () => {
        if (stage) {
            setPointerPosition(stage.getPointerPosition() as Konva.Vector2d)
        }
    }

    const layerProps = {
        canvas,
        grid,
        isMouseDown,
        keyDown,
        selected,
        tileset,
        tilesetCanvas,
        workspace,
        onChangeLayerOffset,
        onChangePrimaryColor,
        onChangeSelectedTile,
        onChangeTileset,
        onSaveTilesetImage
    }

    return (
        <div>
            <div css={styles({ selected })}>
                <Stage
                    ref={stageRef}
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
                        {stage &&
                            layers.map(layer =>
                                layer.image ? (
                                    <ImageLayer
                                        key={`layer-${layer.id}`}
                                        {...{ ...layerProps, stage, layer, onChangeLayerImage }}
                                    />
                                ) : (
                                    <TileLayer
                                        key={`layer-${layer.id}`}
                                        {...{ ...layerProps, stage, layer, onChangeLayerData }}
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
                        <Pointer
                            scale={workspace.scale}
                            {...{
                                grid,
                                isMouseDown,
                                isMouseOver,
                                pointerPosition,
                                selected,
                                selectedLayer,
                                tileset,
                                workspace
                            }}
                        />
                    </Layer>
                </Stage>
            </div>
            {stage && <StatusBar {...{ pointerPosition, selectedLayer, stage }} />}
        </div>
    )
}

export default KonvaStage
