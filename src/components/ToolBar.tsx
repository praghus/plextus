import React, { useState } from 'react'
import PropTypes from 'prop-types'
import styled from '@emotion/styled'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { makeStyles, withStyles } from '@material-ui/core/styles'
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab'
import { Divider, IconButton, Menu, MenuItem, Paper } from '@material-ui/core'
import {
    Create as CreateIcon,
    DeleteForever as DeleteForeverIcon,
    GridOn as GridOnIcon,
    GridOff as GridOffIcon,
    Menu as MenuIcon,
    PanTool as PanToolIcon
} from '@material-ui/icons'

import { TOOLS } from '../common/constants'
import { hexToRgba, rgbToHex } from '../common/utils/colors'
import { selectGrid, selectSelected } from '../store/editor/selectors'
import { changePrimaryColor, changeTool, saveChanges, toggleShowGrid } from '../store/editor/actions'
import { EraserIcon, StampIcon } from './Icons'

export const useStyles = makeStyles(theme => ({
    iconButton: {
        width: 40,
        height: 40,
        padding: 0
    },
    paper: {
        width: '48px',
        marginBottom: '10px'
    },
    divider: {
        width: '40px',
        margin: theme.spacing(1, 0.5)
    },
    icon: {
        filter: 'drop-shadow(1px 1px 1px rgba(0, 0, 0, .7))'
    }
}))

const StyledContainer = styled.div`
    position: absolute;
    top: 20px;
    left: 10px;
    z-index: 100;
`

const StyledToggleButtonGroup = withStyles(theme => ({
    grouped: {
        margin: theme.spacing(0.5),
        border: 'none',
        '&:not(:first-child)': {
            borderRadius: theme.shape.borderRadius
        },
        '&:first-child': {
            borderRadius: theme.shape.borderRadius
        }
    }
}))(ToggleButtonGroup)

type Props = {
    onImportDialogOpen: () => void
}

const ToolBar = ({ onImportDialogOpen }: Props): JSX.Element => {
    const classes = useStyles()
    const [anchorEl, setAnchorEl] = useState(null)

    const selected = useSelector(selectSelected)
    const grid = useSelector(selectGrid)

    const dispatch = useDispatch()
    const handleClose = () => setAnchorEl(null)
    const onChangePrimaryColor = ({ target }) => dispatch(changePrimaryColor(hexToRgba(target.value)))
    const onChangeTool = tool => tool && dispatch(changeTool(tool))
    const onSaveChanges = () => dispatch(saveChanges())
    const onToggleShowGrid = showGrid => dispatch(toggleShowGrid(showGrid))
    const handleClick = event => setAnchorEl(event.currentTarget)
    const [r, g, b]: number[] = selected.color || [0, 0, 0]

    return (
        <StyledContainer>
            <Paper elevation={5} className={classes.paper}>
                <StyledToggleButtonGroup
                    exclusive
                    value={selected.tool}
                    size="small"
                    orientation="vertical"
                    onChange={(event, value) => onChangeTool(value)}
                >
                    <IconButton aria-haspopup="true" onClick={handleClick} className={classes.iconButton}>
                        <MenuIcon className={classes.icon} />
                    </IconButton>
                    <Menu anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleClose}>
                        <MenuItem onClick={handleClose}>New project</MenuItem>
                        <MenuItem onClick={handleClose}>Undo</MenuItem>
                        <MenuItem onClick={handleClose}>Redo</MenuItem>
                        <Divider orientation="horizontal" />
                        <MenuItem
                            onClick={() => {
                                handleClose()
                                onImportDialogOpen()
                            }}
                        >
                            Import image
                        </MenuItem>
                        <MenuItem onClick={handleClose} component={Link} to={'/export'}>
                            Export map
                        </MenuItem>
                        <Divider orientation="horizontal" />
                        <MenuItem
                            onClick={() => {
                                onSaveChanges()
                                handleClose()
                            }}
                        >
                            Save
                        </MenuItem>
                    </Menu>

                    <Divider orientation="horizontal" className={classes.divider} />
                    <ToggleButton value={TOOLS.PENCIL}>
                        <CreateIcon className={classes.icon} />
                    </ToggleButton>
                    <ToggleButton value={TOOLS.ERASER}>
                        <EraserIcon className={classes.icon} />
                    </ToggleButton>
                    {/* <ToggleButton value={TOOLS.COLOR_PICKER}>
            <ColorizeIcon />
          </ToggleButton> */}
                    <ToggleButton value={TOOLS.STAMP}>
                        <StampIcon className={classes.icon} />
                    </ToggleButton>
                    <ToggleButton value={TOOLS.DELETE}>
                        <DeleteForeverIcon className={classes.icon} />
                    </ToggleButton>
                    {/* <ToggleButton value={TOOLS.SELECT}>
            <SelectAllIcon className={classes.icon} />
          </ToggleButton> */}
                    <ToggleButton value={TOOLS.DRAG}>
                        <PanToolIcon className={classes.icon} />
                    </ToggleButton>

                    <Divider orientation="horizontal" className={classes.divider} />

                    <IconButton onClick={() => onToggleShowGrid(!grid.visible)} className={classes.iconButton}>
                        {grid.visible ? (
                            <GridOnIcon className={classes.icon} />
                        ) : (
                            <GridOffIcon className={classes.icon} />
                        )}
                    </IconButton>
                    <IconButton>
                        <input type="color" value={rgbToHex(r, g, b)} onChange={onChangePrimaryColor} />
                    </IconButton>
                </StyledToggleButtonGroup>
            </Paper>
        </StyledContainer>
    )
}

ToolBar.propTypes = {
    onImportDialogOpen: PropTypes.func.isRequired
}

export default ToolBar
