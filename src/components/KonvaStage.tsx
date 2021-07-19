/** @jsx jsx */
import React, { useCallback, useEffect, useRef, useState } from 'react'
import Konva from 'konva'
import { debounce } from 'lodash'
import { jsx, css } from '@emotion/react'
import { useDispatch, useSelector } from 'react-redux'
import { Stage, Layer, Rect } from 'react-konva'
import { SCALE_BY, TOOLS, BG_IMAGE } from '../common/constants'
import { centerStage, getPointerRelativePos } from '../common/utils/konva'

import {
    selectCanvas,
    selectGrid,
    selectLayers,
    selectSelected,
    selectTileset,
    selectWorkspace
} from '../store/editor/selectors'
import {
    changeLayerData,
    changeLayerImage,
    changePosition,
    changePrimaryColor,
    changeScale,
    changeSelectedTile,
    changeTileset,
    changeTilesetImage
} from '../store/editor/actions'
import GridLines from './GridLines'
import TileLayer from './TileLayer'
import StatusBar from './StatusBar'
import KonvaTransformer from './KonvaTransformer'
import Pointer from './Pointer'
import ImageLayer from './ImageLayer'
// import TilesIds from './TilesIds'

const styles = ({ selected }) => css`
    ${(selected.tool === TOOLS.DRAG &&
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
    const [pointerRelPosition, setPointerRelPosition] = useState<Konva.Vector2d>({ x: 0, y: 0 })

    const dispatch = useDispatch()
    const onChangeLayerData = (layerId: string, data: (number | null)[]) => dispatch(changeLayerData(layerId, data))
    const onChangePrimaryColor = (color: number[]) => dispatch(changePrimaryColor(color))
    const onChangeSelectedTile = (tileId: number) => dispatch(changeSelectedTile(tileId))
    const onChangeTileset = (tileset: any) => dispatch(changeTileset(tileset))
    const onChangeLayerImage = (layerId: string, blob: Blob) => dispatch(changeLayerImage(layerId, blob))
    const onSaveTilesetImage = (blob: Blob) => dispatch(changeTilesetImage(blob))
    const onChangeScale = (scale: number) => dispatch(changeScale(scale))

    const onChangePosition = useCallback(
        debounce((x, y) => dispatch(changePosition(x, y)), 300),
        []
    )

    const selectedLayer = layers.find(({ id }) => id === selected.layerId) || null
    const stage = stageRef.current

    // @todo refactor
    useEffect(() => {
        if (stageRef.current) {
            const { scale, x, y } = workspace
            const stage = stageRef.current
            if (x && y) {
                stage.position({ x, y })
                stage.scale({ x: scale, y: scale })
                stage.batchDraw()
            } else {
                centerStage(stageRef.current, canvas, workspace, (x, y, scale) => {
                    onChangePosition(x, y)
                    onChangeScale(scale)
                })
            }
        }
    }, [tileset.lastUpdateTime]) // workspace

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
        stage && onChangePosition(stage.x(), stage.y())
    }

    const onMouseMove = () => {
        if (stage) {
            setPointerRelPosition(getPointerRelativePos(workspace, stage.getPointerPosition() as Konva.Vector2d))
        }
    }

    return (
        <div>
            <div css={styles({ selected })}>
                <Stage
                    ref={stageRef}
                    width={workspace.width}
                    height={workspace.height}
                    draggable={selected.tool === TOOLS.DRAG}
                    onContextMenu={e => e.evt.preventDefault()}
                    onMouseDown={() => setIsMouseDown(true)}
                    onMouseUp={() => setIsMouseDown(false)}
                    onMouseOver={() => setIsMouseOver(true)}
                    onMouseOut={() => setIsMouseOver(false)}
                    {...{
                        onDragEnd,
                        onMouseMove,
                        onWheel
                    }}
                >
                    <Layer imageSmoothingEnabled={false}>
                        <Rect
                            // shadowBlur={10}
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
                                        {...{
                                            canvas,
                                            grid,
                                            isMouseDown,
                                            layer,
                                            onChangeLayerImage,
                                            onChangePrimaryColor,
                                            selected,
                                            stage,
                                            tileset,
                                            tilesetCanvas,
                                            workspace
                                        }}
                                    />
                                ) : (
                                    <TileLayer
                                        key={`layer-${layer.id}`}
                                        {...{
                                            canvas,
                                            grid,
                                            isMouseDown,
                                            layer,
                                            onChangeLayerData,
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
                                )
                            )}
                        {selected.tool === TOOLS.CROP && <KonvaTransformer {...{ canvas, grid }} />}
                        {/* <TilesIds width={canvas.width} height={canvas.height} {...{ grid, selectedLayer }} /> */}
                        <GridLines width={canvas.width} height={canvas.height} scale={workspace.scale} {...{ grid }} />
                        <Pointer
                            scale={workspace.scale}
                            {...{
                                grid,
                                isMouseDown,
                                isMouseOver,
                                pointerRelPosition,
                                selected,
                                tileset
                            }}
                        />
                    </Layer>
                </Stage>
            </div>
            {stage && <StatusBar {...{ pointerRelPosition, selectedLayer, stage }} />}
        </div>
    )
}

export default KonvaStage
