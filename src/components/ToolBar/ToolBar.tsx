import React, { useCallback } from 'react'
import { useTheme } from '@mui/material/styles'
import { useDispatch, useSelector } from 'react-redux'
import { Paper, ToggleButton, Tooltip } from '@mui/material'
import {
    BrightnessMedium as BrightnessMediumIcon,
    Colorize as ColorizeIcon,
    Create as CreateIcon,
    Crop as CropIcon,
    CancelPresentation as CancelPresentationIcon,
    FormatColorFill as FormatColorFillIcon,
    PanTool as PanToolIcon,
    ControlCamera as ControlCameraIcon
} from '@mui/icons-material'

import { TOOLS, TOOLS_DESC } from '../../common/constants'
import { selectSelected } from '../../store/editor/selectors'
import { changeTool } from '../../store/editor/actions'
import { EraserIcon, LineIcon, StampIcon, TileReplaceIcon } from '../Icons'

import { StyledToolBarContainer, StyledToggleButtonGroup } from './ToolBar.styled'

const ToolBar: React.FunctionComponent = () => {
    const theme = useTheme()
    const selected = useSelector(selectSelected)

    const dispatch = useDispatch()
    const onChangeTool = (tool: string) => tool && dispatch(changeTool(tool))

    const iconColor = theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'
    const iconSelectedColor = theme.palette.mode === 'dark' ? '#90caf9' : '#1976d2'

    const renderToolButton = useCallback(
        (value: keyof typeof TOOLS, Icon: React.ElementType) => (
            <Tooltip title={TOOLS_DESC[value]} placement="right">
                <ToggleButton {...{ value }}>
                    <Icon fontSize="small" htmlColor={selected.tool === value ? iconSelectedColor : iconColor} />
                </ToggleButton>
            </Tooltip>
        ),
        [iconColor, selected.tool]
    )

    return (
        <StyledToolBarContainer>
            <Paper elevation={8}>
                <StyledToggleButtonGroup
                    exclusive
                    value={selected.tool}
                    size="small"
                    orientation="vertical"
                    onChange={(_, value) => onChangeTool(value as string)}
                >
                    {renderToolButton(TOOLS.DRAG, PanToolIcon)}
                    {renderToolButton(TOOLS.PENCIL, CreateIcon)}
                    {renderToolButton(TOOLS.LINE, LineIcon)}
                    {renderToolButton(TOOLS.ERASER, EraserIcon)}
                    {renderToolButton(TOOLS.PICKER, ColorizeIcon)}
                    {renderToolButton(TOOLS.FILL, FormatColorFillIcon)}
                    {renderToolButton(TOOLS.BRIGHTNESS, BrightnessMediumIcon)}
                    {renderToolButton(TOOLS.STAMP, StampIcon)}
                    {renderToolButton(TOOLS.REPLACE, TileReplaceIcon)}
                    {renderToolButton(TOOLS.DELETE, CancelPresentationIcon)}
                    {renderToolButton(TOOLS.OFFSET, ControlCameraIcon)}
                    {/* {renderToolButton(TOOLS.SELECT, PhotoSizeSelectSmallIcon)} */}
                    {renderToolButton(TOOLS.CROP, CropIcon)}
                </StyledToggleButtonGroup>
            </Paper>
        </StyledToolBarContainer>
    )
}
ToolBar.displayName = 'ToolBar'

export default ToolBar
