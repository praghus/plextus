import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useTheme } from '@mui/material/styles'
import { useDispatch, useSelector } from 'react-redux'
import { IconButton, ListItemIcon, Menu, MenuItem, PopoverOrigin, ToggleButton, Tooltip } from '@mui/material'
import { MoreHoriz as MoreHorizIcon } from '@mui/icons-material'

import { TOOLS, TOOL_DESC, TOOL_ICONS, AVAILABLE_TOOLS } from '../../common/tools'
import { selectSelected, selectSelectedLayer, selectWorkspace } from '../../store/editor/selectors'
import { changeTool } from '../../store/editor/actions'

import { StyledToolBarContainer, StyledToggleButtonGroup } from './ToolBar.styled'

const ToolBar: React.FunctionComponent = () => {
    const theme = useTheme()
    const darkMode = theme.palette.mode === 'dark'

    const selected = useSelector(selectSelected)
    const workspace = useSelector(selectWorkspace)
    const selectedLayer = useSelector(selectSelectedLayer)

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
    const [lastSelectedTool, setLastSelectedTool] = useState<keyof typeof TOOLS>(AVAILABLE_TOOLS[0])

    const dispatch = useDispatch()
    const onChangeTool = useCallback((tool: string) => tool && dispatch(changeTool(tool)), [dispatch])

    const open = Boolean(anchorEl)

    const colors = useMemo(
        () => ({
            default: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
            disabled: darkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
            selected: darkMode ? '#90caf9' : '#1976d2'
        }),
        [darkMode]
    )

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

    const isDisabled = useCallback(
        (value: keyof typeof TOOLS) =>
            !selectedLayer ||
            (!selectedLayer.data && (value === TOOLS.TILE_FILL || value === TOOLS.REPLACE || value === TOOLS.DELETE)),
        [selectedLayer]
    )

    const renderToolButton = useCallback(
        (value: keyof typeof TOOLS) => {
            const Icon = TOOL_ICONS[value]
            const disabled = isDisabled(value)
            return (
                <Tooltip title={TOOL_DESC[value]} placement="right" key={`tool-button-${value.toLowerCase()}`}>
                    <ToggleButton {...{ disabled, value }}>
                        <Icon
                            sx={{ fontSize: 22 }}
                            htmlColor={
                                disabled
                                    ? colors.disabled
                                    : (selected.tool === value && colors.selected) || colors.default
                            }
                        />
                    </ToggleButton>
                </Tooltip>
            )
        },
        [isDisabled, colors, selected.tool]
    )

    const renterMoreToolMenuItem = useCallback(
        (value: keyof typeof TOOLS) => {
            const Icon = TOOL_ICONS[value]
            return (
                <MenuItem
                    disabled={isDisabled(value)}
                    onClick={() => changeSelectedTool(value)}
                    key={`tool-item-${value.toLowerCase()}`}
                >
                    <ListItemIcon>
                        <Icon
                            sx={{ fontSize: 22 }}
                            htmlColor={selected.tool === value ? colors.selected : colors.default}
                        />
                    </ListItemIcon>
                    {TOOL_DESC[value]}
                </MenuItem>
            )
        },
        [isDisabled, selected.tool, colors, changeSelectedTool]
    )

    const ToolsMenu = useMemo(() => {
        const main = [...AVAILABLE_TOOLS]
        const max = Math.max(Math.round((workspace.height * 0.5) / 50) - 2, 2)
        const more = main.splice(max)
        setLastSelectedTool(more[0])
        return { main, more }
    }, [workspace.height])

    useEffect(() => {
        if (isDisabled(selected.tool)) {
            onChangeTool(TOOLS.DRAG)
        }
    }, [isDisabled, onChangeTool, selected.tool])

    return (
        <StyledToolBarContainer>
            <StyledToggleButtonGroup
                exclusive
                value={selected.tool}
                orientation="vertical"
                onChange={(_, value) => onChangeTool(value as string)}
            >
                {ToolsMenu.main.map(renderToolButton)}
                {ToolsMenu.more.includes(selected.tool)
                    ? renderToolButton(selected.tool)
                    : renderToolButton(lastSelectedTool)}
            </StyledToggleButtonGroup>
            <IconButton onClick={handleClick} sx={{ margin: '5px' }}>
                <MoreHorizIcon fontSize="small" htmlColor={colors.default} />
            </IconButton>
            <Menu
                open={open}
                onClose={handleClose}
                anchorEl={anchorEl}
                anchorOrigin={menuOrigin}
                transformOrigin={menuOrigin}
            >
                {ToolsMenu.more.map(renterMoreToolMenuItem)}
            </Menu>
        </StyledToolBarContainer>
    )
}
ToolBar.displayName = 'ToolBar'

export default ToolBar
