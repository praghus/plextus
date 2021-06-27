import React, { useState } from 'react'
import Konva from 'konva'
import styled from '@emotion/styled'
import { useDispatch, useSelector } from 'react-redux'
import AppsIcon from '@material-ui/icons/Apps'
import AspectRatioIcon from '@material-ui/icons/AspectRatio'
import Slider from '@material-ui/core/Slider'
import ZoomInIcon from '@material-ui/icons/ZoomIn'
import ZoomOutIcon from '@material-ui/icons/ZoomOut'
import { changePosition, changeScale } from '../store/editor/actions'
import { SCALE_MIN, SCALE_MAX, SCALE_BY, SCALE_STEP } from '../common/constants'
import { selectCanvas, selectGrid, selectWorkspace } from '../store/editor/selectors'

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
    stage: Konva.Stage
}

const StatusBar = ({ stage }: Props): JSX.Element => {
    const grid = useSelector(selectGrid)
    const canvas = useSelector(selectCanvas)
    const workspace = useSelector(selectWorkspace)
    const { scale } = workspace

    const [value, setValue] = useState(scale)

    const dispatch = useDispatch()
    const onChangePosition = (x: number, y: number) => dispatch(changePosition(x, y))
    const onChangeScale = (scale: number) => dispatch(changeScale(scale))

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
        const dimension = workspace.height > workspace.width ? 'height' : 'width'
        const newScale = workspace[dimension] / canvas[dimension]

        stage.scale({ x: newScale, y: newScale })
        stage.position({
            x: (workspace.width - canvas.width * newScale) / 2,
            y: (workspace.height - canvas.height * newScale) / 2
        })

        onChangeScale(newScale)
        onChangePosition(stage.x(), stage.y())
    }

    return (
        <StyledStatusBar className="status-bar">
            <StyledInfoContainer>
                <StyledCol>
                    <AspectRatioIcon onClick={onCenter} />
                    {canvas.width}x{canvas.height}
                </StyledCol>
                <StyledCol>
                    <AppsIcon />
                    {grid.width}x{grid.height}
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
