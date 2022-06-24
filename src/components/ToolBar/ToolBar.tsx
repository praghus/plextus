import React, { useCallback, useState } from 'react'
import { useTheme } from '@mui/material/styles'
import { useDispatch, useSelector } from 'react-redux'
import { IconButton, ListItemIcon, Menu, MenuItem, PopoverOrigin, ToggleButton, Tooltip } from '@mui/material'
import { MoreHoriz as MoreHorizIcon } from '@mui/icons-material'

import { TOOLS, TOOL_DESC, TOOL_ICONS, AVAILABLE_TOOLS } from '../../common/tools'
import { selectSelected } from '../../store/editor/selectors'
import { changeTool } from '../../store/editor/actions'

import { StyledToolBarContainer, StyledToggleButtonGroup } from './ToolBar.styled'

const MAX_TOOLS = 8
const MAIN_TOOLS = [...AVAILABLE_TOOLS]
const MORE_TOOLS = MAIN_TOOLS.splice(MAX_TOOLS)

const ToolBar: React.FunctionComponent = () => {
    const theme = useTheme()
    const selected = useSelector(selectSelected)

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
    const [lastSelectedTool, setLastSelectedTool] = useState<keyof typeof TOOLS>(MORE_TOOLS[0])

    const dispatch = useDispatch()
    const onChangeTool = useCallback((tool: string) => tool && dispatch(changeTool(tool)), [dispatch])

    const open = Boolean(anchorEl)
    const iconColor = theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'
    const iconSelectedColor = theme.palette.mode === 'dark' ? '#90caf9' : '#1976d2'
    const menuOrigin: PopoverOrigin = { horizontal: 'right', vertical: 'bottom' }

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget)
    }

    const handleClose = () => {
        setAnchorEl(null)
    }

    const changeSelectedTool = useCallback(
        (tool: keyof typeof TOOLS) => {
            setLastSelectedTool(tool)
            onChangeTool(tool)
            handleClose()
        },
        [onChangeTool]
    )

    const renderToolButton = useCallback(
        (value: keyof typeof TOOLS) => {
            const Icon = TOOL_ICONS[value]
            return (
                <Tooltip title={TOOL_DESC[value]} placement="right" key={`tool-button-${value.toLowerCase()}`}>
                    <ToggleButton {...{ value }}>
                        <Icon
                            sx={{ fontSize: 22 }}
                            htmlColor={selected.tool === value ? iconSelectedColor : iconColor}
                        />
                    </ToggleButton>
                </Tooltip>
            )
        },
        [iconColor, iconSelectedColor, selected.tool]
    )

    const renterMoreToolMenuItem = useCallback(
        (value: keyof typeof TOOLS) => {
            const Icon = TOOL_ICONS[value]
            return (
                <MenuItem onClick={() => changeSelectedTool(value)} key={`tool-item-${value.toLowerCase()}`}>
                    <ListItemIcon>
                        <Icon
                            sx={{ fontSize: 22 }}
                            htmlColor={selected.tool === value ? iconSelectedColor : iconColor}
                        />
                    </ListItemIcon>
                    {TOOL_DESC[value]}
                </MenuItem>
            )
        },
        [selected.tool, iconSelectedColor, iconColor, changeSelectedTool]
    )

    return (
        <StyledToolBarContainer>
            <StyledToggleButtonGroup
                exclusive
                value={selected.tool}
                orientation="vertical"
                onChange={(_, value) => onChangeTool(value as string)}
            >
                {MAIN_TOOLS.map(renderToolButton)}
                {MORE_TOOLS.includes(selected.tool)
                    ? renderToolButton(selected.tool)
                    : renderToolButton(lastSelectedTool)}
            </StyledToggleButtonGroup>
            <IconButton onClick={handleClick} sx={{ margin: '5px' }}>
                <MoreHorizIcon fontSize="small" htmlColor={iconColor} />
            </IconButton>
            <Menu
                open={open}
                onClose={handleClose}
                anchorEl={anchorEl}
                anchorOrigin={menuOrigin}
                transformOrigin={menuOrigin}
            >
                {MORE_TOOLS.map(renterMoreToolMenuItem)}
            </Menu>
        </StyledToolBarContainer>
    )
}
ToolBar.displayName = 'ToolBar'

export default ToolBar
