/** @jsx jsx */
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Konva from 'konva'
import { debounce } from 'lodash'
import { jsx } from '@emotion/react'
import { useTheme } from '@mui/material/styles'
import { useDispatch, useSelector, ReactReduxContext, Provider } from 'react-redux'
import { Stage, Layer, Rect } from 'react-konva'

import { IS_MOBILE } from '../../common/constants'
import { undo, redo } from '../../store/history/actions'
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
import { useZoomEvents } from '../../hooks/useZoomEvents'
import { useEditorActions } from '../../hooks/useEditorActions'
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

    const [stage, setStage] = useState<Konva.Stage>()
    const [isMouseDown, setIsMouseDown] = useState<boolean>(false)
    const [isMouseOver, setIsMouseOver] = useState<boolean>(false)
    const [pointerPosition, setPointerPosition] = useState<Konva.Vector2d>({ x: 0, y: 0 })
    const [keyDown, setKeyDown] = useState<KeyboardEvent | null>(null)

    const backgroundColor = canvas.background && getRgbaValue(canvas.background)
    const draggable = !IS_MOBILE && (selected.tool === TOOLS.DRAG || selected.tool === TOOLS.CROP)
    const isPointerVisible = useMemo(
        () =>
            isMouseOver &&
            !isMouseDown &&
            ![TOOLS.DRAG, TOOLS.CROP, TOOLS.SELECT, TOOLS.OFFSET].includes(selected.tool),
        [isMouseDown, isMouseOver, selected.tool]
    )

    const dispatch = useDispatch()
    const theme = useTheme()

    const { onCrop, onAdjustWorkspaceSize, onChangePosition, onChangeScale } = useEditorActions()

    const onChangeScaleDebounced = useMemo(() => debounce(onChangeScale, 300), [onChangeScale])
    const onChangePositionDebounced = useMemo(() => debounce(onChangePosition, 300), [onChangePosition])

    const { onTouchEnd, onTouchMove, onWheel } = useZoomEvents(stage, onChangePositionDebounced, onChangeScaleDebounced)

    const onKeyUp = () => setKeyDown(null)
    const onKeyDown = (keyDown: KeyboardEvent) => setKeyDown(keyDown)
    const onDragEnd = () => stage && onChangePositionDebounced(stage.position())
    const onMouseMove = () => stage && setPointerPosition(stage.getPointerPosition() as Konva.Vector2d)

    const onCenter = useCallback(
        () =>
            stage &&
            centerStage(stage, canvas, (pos, scale) => {
                onChangePositionDebounced(pos)
                onChangeScaleDebounced(scale)
            }),
        [canvas, onChangePositionDebounced, onChangeScaleDebounced, stage]
    )

    const handleStage = useCallback((node: Konva.Stage) => {
        setStage(node)
    }, [])

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
        onAdjustWorkspaceSize()
    }, [workspace.width, workspace.height, onCenter, onAdjustWorkspaceSize])

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
                onCrop()
            }
        }
    }, [dispatch, onCrop, keyDown, selected.tool])

    return (
        <div>
            <div css={styles({ selected })}>
                <ReactReduxContext.Consumer>
                    {({ store }) => (
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
                            <Provider {...{ store }}>
                                <Layer imageSmoothingEnabled={false}>
                                    <TransparentBackground
                                        {...{ theme }}
                                        width={canvas.width}
                                        height={canvas.height}
                                        scale={1 / workspace.scale}
                                    />
                                    {backgroundColor && (
                                        <Rect width={canvas.width} height={canvas.height} fill={backgroundColor} />
                                    )}
                                    {stage &&
                                        layers.map(layer => (
                                            <KonvaLayer
                                                key={`layer-${layer.id}`}
                                                {...{
                                                    grid,
                                                    isMouseDown,
                                                    keyDown,
                                                    layer,
                                                    selected,
                                                    stage,
                                                    theme,
                                                    tileset,
                                                    tilesetCanvas,
                                                    workspace
                                                }}
                                            />
                                        ))}
                                    {selected.tool === TOOLS.CROP && <CropTool {...{ canvas, grid }} />}
                                    {selected.tool === TOOLS.SELECT && (
                                        <SelectTool
                                            {...{
                                                canvas,
                                                grid,
                                                isMouseDown,
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
                                                    ? selectedLayer.width *
                                                      (selectedLayer.image ? 1 : tileset.tilewidth)
                                                    : canvas.width
                                            }
                                            height={
                                                selectedLayer
                                                    ? selectedLayer.height *
                                                      (selectedLayer.image ? 1 : tileset.tileheight)
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
                            </Provider>
                        </Stage>
                    )}
                </ReactReduxContext.Consumer>
                <TileInfoLabel {...{ pointerPosition, selectedLayer }} />
            </div>
            {stage && <StatusBar {...{ onCenter, stage }} />}
        </div>
    )
}
KonvaStage.displayName = 'KonvaStage'

export default KonvaStage
