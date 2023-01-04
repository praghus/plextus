/** @jsx jsx */
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Konva from 'konva'
import { jsx } from '@emotion/react'
import { useTheme } from '@mui/material/styles'
import { debounce } from 'lodash'
import { useDispatch, useSelector } from 'react-redux'
import { Stage, Layer, Rect } from 'react-konva'

import { IS_MOBILE } from '../../common/constants'
import { undo, redo } from '../../store/history/actions'
import { Rectangle, Tileset } from '../../store/editor/types'
import { TOOLS } from '../../common/tools'
import { centerStage } from '../../common/utils/konva'
import { getRgbaValue } from '../../common/utils/colors'
import {
    selectCanvas,
    selectGrid,
    selectLayers,
    selectSelected,
    selectSelectedLayer,
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
    copySelectedArea,
    crop,
    paste
} from '../../store/editor/actions'
import { useZoomEvents } from '../../hooks/useZoomEvents'
import { CropTool } from '../CropTool'
import { GridLines } from '../GridLines'
import { KonvaLayer } from '../KonvaLayer'
import { Pointer } from '../Pointer'
import { SelectTool } from '../SelectTool'
import { StatusBar } from '../StatusBar'
import { TransparentBackground } from '../TransparentBackground'
import { TileInfoLabel } from '../TileInfoLabel'
import { styles } from './KonvaStage.styled'

Konva.pixelRatio = 1

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
    const selectedLayer = useSelector(selectSelectedLayer)

    const backgroundColor = canvas.background && getRgbaValue(canvas.background)

    const [stage, setStage] = useState<Konva.Stage>()
    const [isMouseDown, setIsMouseDown] = useState<boolean>(false)
    const [isMouseOver, setIsMouseOver] = useState<boolean>(false)
    const [pointerPosition, setPointerPosition] = useState<Konva.Vector2d>({ x: 0, y: 0 })
    const [keyDown, setKeyDown] = useState<KeyboardEvent | null>(null)

    const draggable = !IS_MOBILE && (selected.tool === TOOLS.DRAG || selected.tool === TOOLS.CROP)
    const isPointerVisible = useMemo(
        () =>
            isMouseOver &&
            !isMouseDown &&
            ![TOOLS.DRAG, TOOLS.CROP, TOOLS.SELECT, TOOLS.OFFSET].includes(selected.tool),
        [isMouseDown, isMouseOver, selected.tool]
    )

    const theme = useTheme()
    const dispatch = useDispatch()

    const onCopySelectedArea = (image: HTMLCanvasElement) => dispatch(copySelectedArea(image))
    const onChangeSelectedArea = (rect: Rectangle | null) => dispatch(changeSelectedArea(rect))
    const onChangeLayerData = (layerId: string, data: (number | null)[]) => dispatch(changeLayerData(layerId, data))
    const onChangeLayerImage = (layerId: string, blob: Blob) => dispatch(changeLayerImage(layerId, blob))
    const onChangePrimaryColor = (color: number[]) => dispatch(changePrimaryColor(color))
    const onChangeSelectedTile = (tileId: number) => dispatch(changeSelectedTile(tileId))
    const onChangeTileset = (tileset: Tileset) => dispatch(changeTileset(tileset))
    const onChangeLayerOffset = (layerId: string, x: number, y: number) => dispatch(changeLayerOffset(layerId, x, y))
    const onSaveTilesetImage = (blob: Blob) => dispatch(changeTilesetImage(blob))
    const onPaste = () => dispatch(paste())
    const onKeyUp = () => setKeyDown(null)
    const onKeyDown = (keyDown: KeyboardEvent) => setKeyDown(keyDown)
    const onDragEnd = () => stage && onChangePosition(stage.position())
    const onMouseMove = () => stage && setPointerPosition(stage.getPointerPosition() as Konva.Vector2d)

    const onChangePosition = useMemo(
        () => debounce((pos: Konva.Vector2d) => dispatch(changePosition(pos.x, pos.y)), 300),
        [dispatch]
    )

    const onChangeScale = useMemo(
        () => debounce((scale: Konva.Vector2d) => dispatch(changeScale(scale.x)), 300),
        [dispatch]
    )

    const onCenter = useCallback(
        () =>
            stage &&
            centerStage(stage, canvas, (pos, scale) => {
                onChangePosition(pos)
                onChangeScale(scale)
            }),
        [canvas, onChangePosition, onChangeScale, stage]
    )

    const handleStage = useCallback((node: Konva.Stage) => {
        setStage(node)
    }, [])

    const { onTouchEnd, onTouchMove, onWheel } = useZoomEvents(stage, onChangePosition, onChangeScale)

    useEffect(() => {
        window.addEventListener('keydown', onKeyDown)
        window.addEventListener('keyup', onKeyUp)
        return () => {
            window.removeEventListener('keydown', onKeyDown)
            window.removeEventListener('keyup', onKeyUp)
        }
    }, [])

    useEffect(() => {
        onCenter()
        dispatch(adjustWorkspaceSize())
    }, [workspace.width, workspace.height, onCenter, dispatch])

    useEffect(() => {
        if (selected.tool === TOOLS.CROP) {
            onCenter()
        }
    }, [selected.tool, onCenter])

    useEffect(() => {
        if (keyDown) {
            if (keyDown.code === 'KeyZ' && (keyDown.ctrlKey || keyDown.metaKey)) {
                dispatch(keyDown.shiftKey ? redo() : undo())
            }
            if (keyDown.code === 'Enter' && selected.tool === TOOLS.CROP) {
                dispatch(crop())
            }
        }
    }, [dispatch, keyDown, selected.tool])

    return (
        <div>
            <div css={styles({ selected })}>
                <Stage
                    ref={handleStage}
                    width={workspace.width}
                    height={workspace.height}
                    onContextMenu={e => e.evt.preventDefault()}
                    onTouchStart={() => setIsMouseDown(true)}
                    onMouseDown={() => setIsMouseDown(true)}
                    onMouseUp={() => setIsMouseDown(false)}
                    onMouseOver={() => setIsMouseOver(true)}
                    onMouseOut={() => setIsMouseOver(false)}
                    onTouchEnd={() => {
                        onTouchEnd()
                        setIsMouseDown(false)
                    }}
                    {...{ draggable, onDragEnd, onMouseMove, onTouchMove, onWheel }}
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
                                        onCopySelectedArea,
                                        onPaste,
                                        onSaveTilesetImage,
                                        selected,
                                        stage,
                                        theme,
                                        tileset,
                                        tilesetCanvas,
                                        workspace
                                    }}
                                />
                            ))}
                        {selected.tool === TOOLS.CROP && <CropTool {...{ canvas, grid, onChangeSelectedArea }} />}
                        {selected.tool === TOOLS.SELECT && (
                            <SelectTool
                                {...{
                                    canvas,
                                    grid,
                                    isMouseDown,
                                    onChangeSelectedArea,
                                    pointerPosition,
                                    selectedLayer,
                                    workspace
                                }}
                            />
                        )}
                        {stage && (
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
                                scale={stage.scaleX()}
                                {...{ grid, theme }}
                            />
                        )}
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
            {stage && <StatusBar {...{ onCenter, stage }} />}
        </div>
    )
}
KonvaStage.displayName = 'KonvaStage'

export default KonvaStage
