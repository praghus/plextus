import React, { useEffect, useState } from 'react'
import Konva from 'konva'
import styled from '@emotion/styled'
import { useDispatch, useSelector } from 'react-redux'
import { Slider } from '@material-ui/core'
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
import { centerStage } from '../common/utils/konva'
import { getCoordsFromPos } from '../store/editor/utils'
import { Layer } from '../store/editor/types'

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
    pointerRelPosition: Konva.Vector2d | null
    selectedLayer: Layer | null
    stage: Konva.Stage
}

const StatusBar = ({ pointerRelPosition, selectedLayer, stage }: Props): JSX.Element => {
    const grid = useSelector(selectGrid)
    const canvas = useSelector(selectCanvas)
    const tileset = useSelector(selectTileset)
    const workspace = useSelector(selectWorkspace)

    const { scale } = workspace
    const { x, y } = getCoordsFromPos(grid, pointerRelPosition as Konva.Vector2d)
    const gid = selectedLayer
        ? selectedLayer.data[x + ((selectedLayer.width * tileset.tilewidth) / grid.width) * y]
        : null

    const [value, setValue] = useState(scale)

    const dispatch = useDispatch()
    const onChangePosition = (x: number, y: number) => dispatch(changePosition(x, y))
    const onChangeScale = (scale: number) => dispatch(changeScale(scale))
    const onToggleShowGrid = (showGrid: boolean) => dispatch(toggleShowGrid(showGrid))

    const onChange = (event: any, value: any) => {
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
    }

    const onChangeCommitted = () => {
        onChangeScale(stage.scaleX())
        onChangePosition(stage.x(), stage.y())
    }

    const onZoomIn = () => {
        if (scale < SCALE_MAX) {
            onChange(null, stage.scaleX() * SCALE_BY)
            onChangeCommitted()
        }
    }

    const onZoomOut = () => {
        if (scale > SCALE_MIN) {
            onChange(null, stage.scaleX() / SCALE_BY)
            onChangeCommitted()
        }
    }

    const onCenter = () => {
        canvas &&
            centerStage(stage, canvas, workspace, (x, y, scale) => {
                onChangePosition(x, y)
                onChangeScale(scale)
            })
    }

    useEffect(() => {
        scale && setValue(scale)
    }, [scale])

    return (
        <StyledStatusBar>
            <StyledInfoContainer>
                <StyledCol onClick={() => onToggleShowGrid(!grid.visible)}>
                    {grid.visible ? <GridOnIcon /> : <GridOffIcon />}
                    Grid [{grid.width} x {grid.height}]: {grid.visible ? `On` : `Off`}
                </StyledCol>
                <StyledCol>
                    <AspectRatioIcon onClick={onCenter} />
                    {canvas &&
                        `${canvas.width} x ${canvas.height} px [${canvas.width / grid.width} x ${
                            canvas.height / grid.height
                        }]`}
                </StyledCol>
                <StyledCol>
                    {x}, {y} [{gid || 'empty'}]
                </StyledCol>
            </StyledInfoContainer>
            <StyledSliderContainer>
                <ZoomOutIcon onClick={onZoomOut} />
                <Slider step={SCALE_STEP} min={SCALE_MIN} max={SCALE_MAX} {...{ value, onChange, onChangeCommitted }} />
                <StyledScaleContainer>{Math.round(100 * scale)}%</StyledScaleContainer>
                <ZoomInIcon onClick={onZoomIn} />
            </StyledSliderContainer>
        </StyledStatusBar>
    )
}

export default StatusBar
