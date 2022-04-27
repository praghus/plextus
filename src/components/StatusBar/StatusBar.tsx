import React, { useCallback, useEffect, useState } from 'react'
import Konva from 'konva'
import { useTheme } from '@mui/material/styles'
import { useDispatch, useSelector } from 'react-redux'
import { Slider, Stack, Tooltip } from '@mui/material'
import {
    AspectRatio as AspectRatioIcon,
    GridOn as GridOnIcon,
    GridOff as GridOffIcon,
    ZoomIn as ZoomInIcon,
    ZoomOut as ZoomOutIcon
} from '@mui/icons-material'

import { changePosition, changeScale, toggleShowGrid } from '../../store/editor/actions'
import { SCALE_MIN, SCALE_MAX, SCALE_BY } from '../../common/constants'
import { selectCanvas, selectGrid, selectWorkspace } from '../../store/editor/selectors'
import { centerStage } from '../../common/utils/konva'
import { ThemeSwitch } from '../ThemeSwitch'
import { StyledStatusBar, StyledCol, StyledButton } from './StatusBar.styled'

const marks = [{ value: 0 }, { value: 1.0 }, { value: 5.0 }, { value: 10.0 }, { value: 20.0 }]

interface Props {
    stage: Konva.Stage
}

const StatusBar: React.FunctionComponent<Props> = ({ stage }) => {
    const theme = useTheme()
    const grid = useSelector(selectGrid)
    const canvas = useSelector(selectCanvas)
    const workspace = useSelector(selectWorkspace)

    const { scale } = workspace

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
        (value: number) => {
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

    const iconColor = theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'

    useEffect(() => {
        scale && setValue(scale)
    }, [scale])

    return (
        <StyledStatusBar>
            <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                <ThemeSwitch tiny />
                <StyledCol>
                    <Tooltip title="Toggle grid" placement="top">
                        <StyledButton onClick={() => onToggleShowGrid(!grid.visible)}>
                            {grid.visible ? <GridOnIcon /> : <GridOffIcon />}[{grid.width}x{grid.height}]:{' '}
                            {grid.visible ? `On` : `Off`}
                        </StyledButton>
                    </Tooltip>
                </StyledCol>
                <StyledCol>
                    <Tooltip title="Center and fit to view size" placement="top">
                        <StyledButton onClick={onCenter}>
                            <AspectRatioIcon onClick={onCenter} />
                            {canvas &&
                                `${canvas.width}x${canvas.height}px [${canvas.width / grid.width}x${
                                    canvas.height / grid.height
                                }]`}
                        </StyledButton>
                    </Tooltip>
                </StyledCol>
            </Stack>
            <Stack
                spacing={1}
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ marginLeft: 'auto', paddingRight: 1, width: '50%' }}
            >
                <ZoomOutIcon htmlColor={iconColor} onClick={onZoomOut} />
                <Slider
                    {...{ marks, value }}
                    size="small"
                    step={1}
                    min={SCALE_MIN}
                    max={SCALE_MAX}
                    onChange={(_, value) => onZoom(value as number)}
                    onChangeCommitted={onZoomCommitted}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(scale: number) => `${Math.round(100 * scale)}%`}
                />
                <ZoomInIcon htmlColor={iconColor} onClick={onZoomIn} />
            </Stack>
        </StyledStatusBar>
    )
}
StatusBar.displayName = 'StatusBar'

export default StatusBar
