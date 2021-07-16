import React, { useState } from 'react'
import styled from '@emotion/styled'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { makeStyles, withStyles } from '@material-ui/core/styles'
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab'
import { Divider, IconButton, Menu, MenuItem, Paper } from '@material-ui/core'
import { actions as undoActions } from 'redux-undo-redo'
import {
    Colorize as ColorizeIcon,
    Create as CreateIcon,
    Crop as CropIcon,
    DeleteForever as DeleteForeverIcon,
    FormatColorFill as FormatColorFillIcon,
    Menu as MenuIcon,
    PanTool as PanToolIcon
} from '@material-ui/icons'
import { TOOLS } from '../common/constants'
import { exportToTmx } from '../common/utils/tmx'
import { hexToRgba, rgbToHex } from '../common/utils/colors'
import { selectIsImportDialogOpen, selectIsNewProjectDialogOpen } from '../store/app/selectors'
import { selectCanvas, selectLayers, selectTileset, selectSelected } from '../store/editor/selectors'
import { changeAppIsImportDialogOpen, changeAppIsNewProjectDialogOpen } from '../store/app/actions'
import { clearProject, changePrimaryColor, changeTool, saveChanges } from '../store/editor/actions'
import { EraserIcon, LineIcon, StampIcon } from './Icons'
import ImportDialog from './ImportDialog'
import NewProjectDialog from './NewProjectDialog'
import ConfirmationDialog from './ConfirmationDialog'

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

const ToolBar = (): JSX.Element => {
    const classes = useStyles()
    const [anchorEl, setAnchorEl] = useState(null)

    const { t } = useTranslation()

    const selected = useSelector(selectSelected)
    const canvas = useSelector(selectCanvas)
    const layers = useSelector(selectLayers)
    const tileset = useSelector(selectTileset)
    const isImportDialogOpen = useSelector(selectIsImportDialogOpen)
    const isNewProjectDialogOpen = useSelector(selectIsNewProjectDialogOpen)

    const [confirmationDialogOpen, setConfirmationDialogOpen] = React.useState(false)
    const [r, g, b]: number[] = selected.color || [0, 0, 0]

    const dispatch = useDispatch()
    const handleClose = () => setAnchorEl(null)
    const handleClick = event => setAnchorEl(event.currentTarget)
    const onChangePrimaryColor = ({ target }) => dispatch(changePrimaryColor(hexToRgba(target.value)))
    const onChangeTool = (tool: string) => tool && dispatch(changeTool(tool))
    const onSaveChanges = () => dispatch(saveChanges())
    const onToggleImportDialog = (open: boolean) => dispatch(changeAppIsImportDialogOpen(open))
    const onToggleNewProjectDialog = (open: boolean) => dispatch(changeAppIsNewProjectDialogOpen(open))
    const onUndo = () => dispatch(undoActions.undo())
    const onRedo = () => dispatch(undoActions.redo())
    const onCloseProject = () => dispatch(clearProject())

    return (
        <StyledContainer>
            {isNewProjectDialogOpen && <NewProjectDialog onClose={() => onToggleNewProjectDialog(false)} />}
            {isImportDialogOpen && <ImportDialog onClose={() => onToggleImportDialog(false)} />}
            <ConfirmationDialog
                title={t('hold_on')}
                message={t('close_project_message')}
                open={confirmationDialogOpen}
                onConfirm={() => {
                    setConfirmationDialogOpen(false)
                    onCloseProject()
                }}
                onClose={() => setConfirmationDialogOpen(false)}
            />
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
                        <MenuItem
                            onClick={() => {
                                handleClose()
                                onToggleNewProjectDialog(true)
                            }}
                        >
                            {t('new_project')}
                        </MenuItem>
                        <MenuItem
                            onClick={() => {
                                handleClose()
                                setConfirmationDialogOpen(true)
                            }}
                        >
                            {t('close_project')}
                        </MenuItem>
                        <Divider orientation="horizontal" />
                        <MenuItem onClick={onUndo}>{t('undo')}</MenuItem>
                        <MenuItem onClick={onRedo}>{t('redo')}</MenuItem>
                        <Divider orientation="horizontal" />
                        <MenuItem
                            onClick={() => {
                                handleClose()
                                onToggleImportDialog(true)
                            }}
                        >
                            {t('import_image')}
                        </MenuItem>
                        <MenuItem
                            onClick={() => {
                                canvas && exportToTmx(canvas, layers, tileset)
                                handleClose()
                            }}
                        >
                            {t('export_map')}
                        </MenuItem>
                        <Divider orientation="horizontal" />
                        <MenuItem
                            onClick={() => {
                                handleClose()
                                onSaveChanges()
                            }}
                        >
                            {t('save')}
                        </MenuItem>
                    </Menu>
                    <Divider orientation="horizontal" className={classes.divider} />
                    <ToggleButton value={TOOLS.DRAG}>
                        <PanToolIcon className={classes.icon} />
                    </ToggleButton>
                    <ToggleButton value={TOOLS.PENCIL}>
                        <CreateIcon className={classes.icon} />
                    </ToggleButton>
                    <ToggleButton value={TOOLS.LINE}>
                        <LineIcon className={classes.icon} />
                    </ToggleButton>
                    <ToggleButton value={TOOLS.ERASER}>
                        <EraserIcon className={classes.icon} />
                    </ToggleButton>
                    <ToggleButton value={TOOLS.FILL}>
                        <FormatColorFillIcon className={classes.icon} />
                    </ToggleButton>
                    <ToggleButton value={TOOLS.PICKER}>
                        <ColorizeIcon className={classes.icon} />
                    </ToggleButton>
                    <ToggleButton value={TOOLS.STAMP}>
                        <StampIcon className={classes.icon} />
                    </ToggleButton>
                    <ToggleButton value={TOOLS.DELETE}>
                        <DeleteForeverIcon className={classes.icon} />
                    </ToggleButton>
                    <ToggleButton value={TOOLS.CROP}>
                        <CropIcon className={classes.icon} />
                    </ToggleButton>
                    <Divider orientation="horizontal" className={classes.divider} />
                    <IconButton>
                        <input type="color" value={rgbToHex(r, g, b)} onChange={onChangePrimaryColor} />
                    </IconButton>
                </StyledToggleButtonGroup>
            </Paper>
        </StyledContainer>
    )
}

export default ToolBar
