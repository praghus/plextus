/** @jsx jsx */
import React, { useCallback, useEffect, useRef } from 'react'
import Konva from 'konva'
import { debounce } from 'lodash'
import { jsx, css } from '@emotion/react'
import { useDispatch, useSelector } from 'react-redux'
import { Stage, Layer, Rect } from 'react-konva'

import { SCALE_BY, TOOLS, BG_IMAGE } from '../common/constants'
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
    changePosition,
    changePrimaryColor,
    changeScale,
    changeSelectedTile,
    changeTileset,
    changeTilesetImage
} from '../store/editor/actions'
// import { getCoordsFromPos, getPointerRelativePos } from "../../../store/editor/utils";
// import logger from '../common/utils/logger'

import GridLines from './GridLines'
import MapLayer from './MapLayer'
import TilesIds from './TilesIds'
// import KonvaTransformer from "../KonvaTransformer";

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
    setStage: (stage: Konva.Stage) => void
    tilesetCanvas: HTMLCanvasElement
}

const KonvaStage = ({ setStage, tilesetCanvas }: Props): JSX.Element => {
    const stageRef = useRef<Konva.Stage>(null)

    const selected = useSelector(selectSelected)
    const grid = useSelector(selectGrid)
    const canvas = useSelector(selectCanvas)
    const layers = useSelector(selectLayers)
    const tileset = useSelector(selectTileset)
    const workspace = useSelector(selectWorkspace)

    const dispatch = useDispatch()
    const onChangeLayerData = (layerId: string, data: number[]) => dispatch(changeLayerData(layerId, data))
    const onChangePrimaryColor = (color: number[]) => dispatch(changePrimaryColor(color))
    const onChangeSelectedTile = (tileId: number) => dispatch(changeSelectedTile(tileId))
    const onChangeTileset = (tileset: any) => dispatch(changeTileset(tileset))
    const onSaveTilesetImage = (blob: Blob | null) => dispatch(changeTilesetImage(blob))

    const onChangePosition = useCallback(
        debounce((x, y) => dispatch(changePosition(x, y)), 300),
        []
    )
    const onChangeScale = useCallback(
        debounce(scale => dispatch(changeScale(scale)), 300),
        []
    )

    const selectedLayer = layers.find(({ id }) => id === selected.layerId)
    const stage = stageRef.current

    useEffect(() => {
        if (stageRef.current) {
            const { scale, x, y } = workspace
            const stage = stageRef.current
            if (x && y) {
                stage.position({ x, y })
            } else {
                stage.position({
                    x: (workspace.width - canvas.width * scale) / 2,
                    y: (workspace.height - canvas.height * scale) / 2
                })
                onChangePosition(stage.x(), stage.y())
            }
            stage.scale({ x: scale, y: scale })
            stage.batchDraw()
            setStage(stage)
        }
    }, [tileset.lastUpdateTime]) // workspace

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

    const onWheel = e => {
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

    return (
        <div css={styles({ selected })}>
            <Stage
                ref={stageRef}
                width={workspace.width}
                height={workspace.height}
                draggable={selected.tool === TOOLS.DRAG}
                onContextMenu={e => {
                    e.evt.preventDefault()
                }}
                {...{
                    onWheel,
                    onDragEnd
                }}
            >
                <Layer imageSmoothingEnabled={false}>
                    <Rect
                        shadowBlur={10}
                        width={canvas.width}
                        height={canvas.height}
                        fillPatternImage={BG_IMAGE}
                        fillPatternScaleX={1 / workspace.scale}
                        fillPatternScaleY={1 / workspace.scale}
                    />
                    {stage &&
                        layers.map(layer => (
                            <MapLayer
                                key={`layer-${layer.id}`}
                                {...{
                                    canvas,
                                    grid,
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
                        ))}
                    <TilesIds
                        width={canvas.width}
                        height={canvas.height}
                        scale={workspace.scale}
                        {...{ grid, selectedLayer }}
                    />
                    <GridLines width={canvas.width} height={canvas.height} scale={workspace.scale} {...{ grid }} />
                </Layer>
            </Stage>
        </div>
    )
}

export default KonvaStage
// export default React.memo(
//   KonvaStage,
//   (prevProps, nextProps) =>
//     prevProps.grid === nextProps.grid &&
//     prevProps.workspace === nextProps.workspace &&
//     prevProps.selected === nextProps.selected &&
//     prevProps.tilesetCanvas === nextProps.tilesetCanvas,
// );
