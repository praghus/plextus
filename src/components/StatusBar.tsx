import React, { useCallback, useEffect, useState } from 'react'
import Konva from 'konva'
import styled from '@emotion/styled'
import { useDispatch, useSelector } from 'react-redux'
import { useTheme } from '@mui/material/styles'
import { Button, Slider, Stack, Tooltip } from '@mui/material'
import {
    AspectRatio as AspectRatioIcon,
    GridOn as GridOnIcon,
    GridOff as GridOffIcon,
    ZoomIn as ZoomInIcon,
    ZoomOut as ZoomOutIcon
} from '@mui/icons-material'
import { changePosition, changeScale, toggleShowGrid } from '../store/editor/actions'
import { SCALE_MIN, SCALE_MAX, SCALE_BY } from '../common/constants'
import { selectCanvas, selectGrid, selectTileset, selectWorkspace } from '../store/editor/selectors'
import { centerStage, getCoordsFromPos, getPointerRelativePos } from '../common/utils/konva'
import { Layer } from '../store/editor/types'

const StyledStatusBar = styled.div`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    width: 100%;
    padding: 0;
    font-size: 12px;
    line-height: 32px;
    background-color: #151515;
`

const StyledCol = styled.div`
    color: #666;
    margin: 0 10px;
    font-size: 12px;
    font-weight: 500;
    svg {
        color: #333;
        margin-right: 5px;
    }
`

const marks = [
    { label: '0%', value: 0 },
    { label: '100%', value: 1.0 },
    { label: '500%', value: 5.0 },
    { label: '1000%', value: 10.0 },
    { label: '2000%', value: 20.0 }
]

const StyledButton = styled(Button)({
    backgroundColor: 'transparent',
    color: '#666',
    fontSize: 12,
    padding: '0 5px',
    textTransform: 'lowercase',
    whiteSpace: 'nowrap'
})

type Props = {
    pointerPosition: Konva.Vector2d | null
    selectedLayer: Layer | null
    stage: Konva.Stage
}

const StatusBar = ({ pointerPosition, selectedLayer, stage }: Props): JSX.Element => {
    const theme = useTheme()
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

    const lightIconColor = theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'

    useEffect(() => {
        scale && setValue(scale)
    }, [scale])

    return (
        <StyledStatusBar>
            <Stack spacing={2} direction="row" sx={{ mb: 1, px: 1 }} alignItems="center">
                <StyledCol>
                    <Tooltip title="Toggle grid" placement="top">
                        <StyledButton onClick={() => onToggleShowGrid(!grid.visible)}>
                            {grid.visible ? <GridOnIcon /> : <GridOffIcon />}[{grid.width} x {grid.height}]:{' '}
                            {grid.visible ? `On` : `Off`}
                        </StyledButton>
                    </Tooltip>
                </StyledCol>
                <StyledCol>
                    <Tooltip title="Center and fit to view size" placement="top">
                        <StyledButton onClick={onCenter}>
                            <AspectRatioIcon onClick={onCenter} />
                            {canvas &&
                                `${canvas.width} x ${canvas.height} px [${canvas.width / grid.width} x ${
                                    canvas.height / grid.height
                                }]`}
                        </StyledButton>
                    </Tooltip>
                </StyledCol>
                {selectedLayer && selectedLayer.data && (
                    <StyledCol>
                        {x}, {y} [{gid || 'empty'}]
                    </StyledCol>
                )}
            </Stack>
            <Stack
                spacing={1}
                direction="row"
                sx={{ marginLeft: 'auto', mb: 1, px: 1, width: '50%' }}
                alignItems="center"
            >
                <ZoomOutIcon htmlColor={lightIconColor} onClick={onZoomOut} />
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
                    sx={{
                        paddingTop: '16px'
                    }}
                />
                <ZoomInIcon htmlColor={lightIconColor} onClick={onZoomIn} />
            </Stack>
        </StyledStatusBar>
    )
}
StatusBar.displayName = 'StatusBar'

export default StatusBar
