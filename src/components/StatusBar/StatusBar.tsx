import React, { useCallback, useEffect, useState } from 'react'
import Konva from 'konva'
import { useTheme } from '@mui/material/styles'
import { useDispatch, useSelector } from 'react-redux'
import { Stack, Tooltip } from '@mui/material'
import {
    Add as AddIcon,
    AspectRatio as AspectRatioIcon,
    GridOn as GridOnIcon,
    GridOff as GridOffIcon,
    Remove as RemoveIcon
} from '@mui/icons-material'

import { changePosition, changeScale, toggleShowGrid } from '../../store/editor/actions'
import { selectCanvas, selectGrid, selectWorkspace } from '../../store/editor/selectors'
import { StyledStatusBar, StyledCol, StyledButton } from './StatusBar.styled'

const marks = [0.1, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 25, 30, 50]

interface Props {
    stage: Konva.Stage
    onCenter: () => void
}

const StatusBar: React.FunctionComponent<Props> = ({ stage, onCenter }) => {
    const theme = useTheme()
    const grid = useSelector(selectGrid)
    const canvas = useSelector(selectCanvas)
    const workspace = useSelector(selectWorkspace)

    const { scale } = workspace

    const [zoom, setZoom] = useState(scale)

    const dispatch = useDispatch()
    const onToggleShowGrid = (showGrid: boolean) => dispatch(toggleShowGrid(showGrid))
    const onChangePosition = (pos: Konva.Vector2d) => dispatch(changePosition(pos.x, pos.y))
    const onChangeScale = (scale: Konva.Vector2d) => dispatch(changeScale(scale.x))

    const onZoom = useCallback(
        (zoom: number) => {
            const sx = workspace.width / 2
            const sy = workspace.height / 2
            const oldScale = stage.scaleX()
            const newPos = {
                x: sx - ((sx - stage.x()) / oldScale) * zoom,
                y: sy - ((sy - stage.y()) / oldScale) * zoom
            }
            stage.scale({ x: zoom, y: zoom })
            stage.position(newPos)
            setZoom(zoom)
        },
        [stage, workspace]
    )

    const onZoomCommitted = () => {
        onChangeScale(stage.scale())
        onChangePosition(stage.position())
    }

    const onZoomIn = () => {
        const z = marks.find(s => s > scale) || marks.at(-1) || 1
        onZoom(z)
        onZoomCommitted()
    }

    const onZoomOut = () => {
        const z = marks.reduce((acc, c) => (c < scale ? c : acc))
        onZoom(z)
        onZoomCommitted()
    }

    const iconColor = theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'

    useEffect(() => {
        scale && setZoom(scale)
    }, [scale])

    return (
        <StyledStatusBar>
            <Stack
                spacing={1}
                direction="row"
                justifyContent="center"
                alignItems="center"
                sx={{ paddingLeft: 1, paddingRight: 1, width: '100%' }}
            >
                {!isNaN(zoom) && (
                    <>
                        <RemoveIcon htmlColor={iconColor} onClick={onZoomOut} sx={{ cursor: 'pointer' }} />
                        <div>{`${Math.round(zoom * 100)}%`}</div>
                        <AddIcon htmlColor={iconColor} onClick={onZoomIn} sx={{ cursor: 'pointer' }} />
                    </>
                )}

                <StyledCol>
                    <Tooltip title="Center and fit to view size" placement="top">
                        <StyledButton onClick={onCenter}>
                            <AspectRatioIcon />
                            {canvas &&
                                `${canvas.width}x${canvas.height}px [${canvas.width / grid.width}x${
                                    canvas.height / grid.height
                                }]`}
                        </StyledButton>
                    </Tooltip>
                </StyledCol>
                <StyledCol>
                    <Tooltip title="Toggle grid" placement="top">
                        <StyledButton onClick={() => onToggleShowGrid(!grid.visible)}>
                            {grid.visible ? <GridOnIcon /> : <GridOffIcon />}[{grid.width}x{grid.height}]:{' '}
                            {grid.visible ? `On` : `Off`}
                        </StyledButton>
                    </Tooltip>
                </StyledCol>
            </Stack>
        </StyledStatusBar>
    )
}
StatusBar.displayName = 'StatusBar'

export default StatusBar
