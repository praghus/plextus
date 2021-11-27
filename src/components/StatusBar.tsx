import React, { useCallback, useEffect, useState } from 'react'
import Konva from 'konva'
import styled from '@emotion/styled'
import { useDispatch, useSelector } from 'react-redux'
import { makeStyles } from '@material-ui/core/styles'
import { Button, Slider, Tooltip } from '@material-ui/core'
import {
    AspectRatio as AspectRatioIcon,
    GridOn as GridOnIcon,
    GridOff as GridOffIcon,
    ZoomIn as ZoomInIcon,
    ZoomOut as ZoomOutIcon
} from '@material-ui/icons'
import { changePosition, changeScale, toggleShowGrid } from '../store/editor/actions'
import { SCALE_MIN, SCALE_MAX, SCALE_BY, SCALE_STEP } from '../common/constants'
import { selectCanvas, selectGrid, selectTileset, selectWorkspace } from '../store/editor/selectors'
import { centerStage, getCoordsFromPos, getPointerRelativePos } from '../common/utils/konva'
import { Layer } from '../store/editor/types'

export const useStyles = makeStyles(() => ({
    button: {
        padding: '0 5px',
        fontSize: 12,
        color: '#666',
        textTransform: 'lowercase',
        backgroundColor: 'transparent',
        whiteSpace: 'nowrap'
    },
    zoomButton: {
        cursor: 'pointer'
    }
}))

const StyledStatusBar = styled.div`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    width: 100%;
    height: 30px;
    padding: 0;
    font-size: 12px;
    line-height: 30px;
    background-color: #151515;
`

const StyledInfoContainer = styled.div`
    display: flex;
    width: 50%;
`

const StyledSliderContainer = styled.div`
    display: flex;
    width: 50%;
    color: #666;
    font-size: 11px;
    svg {
        color: #333;
        margin: 5px;
    }
`

const StyledScaleContainer = styled.div`
    width: 50px;
    margin-left: 15px;
`

const StyledCol = styled.div`
    color: #666;
    margin: 0 10px;
    svg {
        color: #333;
        margin-right: 5px;
    }
`

type Props = {
    pointerPosition: Konva.Vector2d | null
    selectedLayer: Layer | null
    stage: Konva.Stage
}

const StatusBar = ({ pointerPosition, selectedLayer, stage }: Props): JSX.Element => {
    const classes = useStyles()
    const grid = useSelector(selectGrid)
    const canvas = useSelector(selectCanvas)
    const tileset = useSelector(selectTileset)
    const workspace = useSelector(selectWorkspace)

    const { scale } = workspace
    const offset = selectedLayer?.offset || { x: 0, y: 0 }
    const pointerRelPosition = getPointerRelativePos(workspace, pointerPosition as Konva.Vector2d, offset)
    const { x, y } = getCoordsFromPos(grid, pointerRelPosition)

    const gid = selectedLayer
        ? selectedLayer.data &&
          selectedLayer.width &&
          selectedLayer.data[x + ((selectedLayer.width * tileset.tilewidth) / grid.width) * y]
        : null

    const [value, setValue] = useState(scale)

    const dispatch = useDispatch()
    const onChangePosition = (x: number, y: number) => dispatch(changePosition(x, y))
    const onChangeScale = (scale: number) => dispatch(changeScale(scale))
    const onToggleShowGrid = (showGrid: boolean) => dispatch(toggleShowGrid(showGrid))

    const onCenter = useCallback(() => {
        canvas &&
            centerStage(stage, canvas, workspace, (x, y, scale) => {
                onChangePosition(x, y)
                onChangeScale(scale)
            })
    }, [stage, canvas, workspace])

    const onZoom = useCallback(
        (value: any) => {
            const sx = workspace.width / 2
            const sy = workspace.height / 2
            const oldScale = stage.scaleX()
            const newPos = {
                x: sx - ((sx - stage.x()) / oldScale) * value,
                y: sy - ((sy - stage.y()) / oldScale) * value
            }
            stage.scale({ x: value, y: value })
            stage.position(newPos)
            setValue(value)
        },
        [stage, workspace]
    )

    const onZoomCommitted = () => {
        onChangeScale(stage.scaleX())
        onChangePosition(stage.x(), stage.y())
    }

    const onZoomIn = () => {
        if (scale < SCALE_MAX) {
            onZoom(stage.scaleX() * SCALE_BY)
            onZoomCommitted()
        }
    }

    const onZoomOut = () => {
        if (scale > SCALE_MIN) {
            onZoom(stage.scaleX() / SCALE_BY)
            onZoomCommitted()
        }
    }

    useEffect(() => {
        scale && setValue(scale)
    }, [scale])

    return (
        <StyledStatusBar>
            <StyledInfoContainer>
                <StyledCol>
                    <Tooltip title="Toggle grid" placement="top">
                        <Button onClick={() => onToggleShowGrid(!grid.visible)} className={classes.button}>
                            {grid.visible ? <GridOnIcon /> : <GridOffIcon />}[{grid.width} x {grid.height}]:{' '}
                            {grid.visible ? `On` : `Off`}
                        </Button>
                    </Tooltip>
                </StyledCol>
                <StyledCol>
                    <Tooltip title="Center and fit to view size" placement="top">
                        <Button onClick={onCenter} className={classes.button}>
                            <AspectRatioIcon onClick={onCenter} />
                            {canvas &&
                                `${canvas.width} x ${canvas.height} px [${canvas.width / grid.width} x ${
                                    canvas.height / grid.height
                                }]`}
                        </Button>
                    </Tooltip>
                </StyledCol>
                {selectedLayer && selectedLayer.data && (
                    <StyledCol>
                        {x}, {y} [{gid || 'empty'}]
                    </StyledCol>
                )}
            </StyledInfoContainer>
            <StyledSliderContainer>
                <ZoomOutIcon onClick={onZoomOut} className={classes.zoomButton} />
                <Slider
                    {...{ value }}
                    step={SCALE_STEP}
                    min={SCALE_MIN}
                    max={SCALE_MAX}
                    onChange={(e, value) => onZoom(value)}
                    onChangeCommitted={onZoomCommitted}
                />
                <StyledScaleContainer>{Math.round(100 * scale)}%</StyledScaleContainer>
                <ZoomInIcon onClick={onZoomIn} className={classes.zoomButton} />
            </StyledSliderContainer>
        </StyledStatusBar>
    )
}
StatusBar.displayName = 'StatusBar'

export default StatusBar
