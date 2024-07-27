import React, { useState } from 'react'

import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { Divider, Button, ListItemIcon, Menu, MenuItem, IconButton, TextField } from '@mui/material'

import {
    DisabledByDefault as DisabledByDefaultIcon,
    SaveAlt as SaveAltIcon,
    Undo as UndoIcon,
    Redo as RedoIcon,
    AddPhotoAlternate as AddPhotoAlternateIcon,
    ExitToApp as ExitToAppIcon,
    FileOpen as FileOpenIcon,
    Save as SaveIcon,
    InsertDriveFile as InsertDriveFileIcon
} from '@mui/icons-material'

import { exportToTmx } from '../../common/utils/tmx'
import { useNewProjectDialogToggle } from '../../hooks/useDialogToggle'
import { selectHistory } from '../../stores/history/selectors'
import { selectCanvas, selectLayers, selectProjectName, selectTileset } from '../../stores/editor/selectors'
import { changeProjectName, clearProject, saveChanges, saveChangesToFile } from '../../stores/editor/actions'
import { undo, redo } from '../../stores/history/actions'
import { PlextusLogo } from '../Icons'
import { ConfirmationDialog } from '../ConfirmationDialog'
import { ImageUpload } from '../ImageUpload'
import { ProjectUpload } from '../ProjectUpload'
import { StyledMenuContainer, StyledPaper, StyledProjectName } from './MainMenu.styled'

const MainMenu = () => {
    const canvas = useSelector(selectCanvas)
    const layers = useSelector(selectLayers)
    const projectName = useSelector(selectProjectName)
    const tileset = useSelector(selectTileset)
    const history = useSelector(selectHistory)

    const [anchorEl, setAnchorEl] = useState<HTMLAnchorElement | null>(null)
    const [editingName, setEditingName] = useState<string | null>(null)
    const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false)

    const [, setNewProjectDialogOpen] = useNewProjectDialogToggle()

    const { t } = useTranslation()

    const dispatch = useDispatch()
    const handleClose = () => setAnchorEl(null)
    const handleClick = (e: React.MouseEvent) => setAnchorEl(e.currentTarget as HTMLAnchorElement)
    const onSaveChanges = () => dispatch(saveChanges())
    const onSaveChangesToFile = () => dispatch(saveChangesToFile())
    const onChangeProjectName = (name: string) => dispatch(changeProjectName(name))
    const onUndo = () => dispatch(undo())
    const onRedo = () => dispatch(redo())
    const onCloseProject = () => dispatch(clearProject())
    const onRenameProject = () => {
        if (editingName) {
            onChangeProjectName(editingName)
            setEditingName(null)
        }
    }

    return (
        <StyledMenuContainer>
            <ConfirmationDialog
                title={t('i18_hold_on')}
                message={t('i18_close_project_message')}
                open={confirmationDialogOpen}
                onConfirm={() => {
                    setConfirmationDialogOpen(false)
                    onCloseProject()
                }}
                onClose={() => setConfirmationDialogOpen(false)}
            />

            <Menu anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleClose}>
                <MenuItem
                    onClick={() => {
                        handleClose()
                        setNewProjectDialogOpen(true)
                    }}
                >
                    <ListItemIcon>
                        <InsertDriveFileIcon fontSize="small" />
                    </ListItemIcon>
                    {t('i18_new_project')}
                </MenuItem>
                <ProjectUpload>
                    <MenuItem onClick={handleClose}>
                        <ListItemIcon>
                            <FileOpenIcon fontSize="small" />
                        </ListItemIcon>
                        {t('i18_open_project')}
                    </MenuItem>
                </ProjectUpload>
                <MenuItem
                    onClick={() => {
                        handleClose()
                        setConfirmationDialogOpen(true)
                    }}
                >
                    <ListItemIcon>
                        <DisabledByDefaultIcon fontSize="small" />
                    </ListItemIcon>
                    {t('i18_close_project')}
                </MenuItem>
                <Divider orientation="horizontal" />
                <ImageUpload>
                    <MenuItem onClick={handleClose}>
                        <ListItemIcon>
                            <AddPhotoAlternateIcon fontSize="small" />
                        </ListItemIcon>
                        {t('i18_import_image')}
                    </MenuItem>
                </ImageUpload>
                <MenuItem
                    onClick={() => {
                        canvas && exportToTmx(canvas, layers, tileset)
                        handleClose()
                    }}
                >
                    <ListItemIcon>
                        <ExitToAppIcon fontSize="small" />
                    </ListItemIcon>
                    {t('i18_export_map')}
                </MenuItem>
                <Divider orientation="horizontal" />
                <MenuItem
                    onClick={() => {
                        handleClose()
                        onSaveChangesToFile()
                    }}
                >
                    <ListItemIcon>
                        <SaveAltIcon fontSize="small" />
                    </ListItemIcon>
                    {t('i18_save_to_file')}
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        handleClose()
                        onSaveChanges()
                    }}
                >
                    <ListItemIcon>
                        <SaveIcon fontSize="small" />
                    </ListItemIcon>
                    {t('i18_save')}
                </MenuItem>
            </Menu>

            <StyledPaper>
                <Button onClick={handleClick} sx={{ height: '38px', marginRight: '5px', padding: '4px 15px 0' }}>
                    <PlextusLogo height={37} />
                </Button>
                <Divider orientation="vertical" flexItem />
                <StyledProjectName
                    {...{ editingName }}
                    onClick={() => {
                        setEditingName(projectName)
                    }}
                >
                    {typeof editingName === 'string' ? (
                        <TextField
                            autoFocus
                            fullWidth={true}
                            size="small"
                            type="text"
                            variant="standard"
                            value={editingName}
                            onBlur={onRenameProject}
                            onChange={e => {
                                setEditingName(e.target.value)
                            }}
                            onKeyDown={e => {
                                if (e.key === 'Enter') {
                                    onRenameProject()
                                }
                                if (e.key === 'Escape') {
                                    setEditingName(null)
                                }
                            }}
                        />
                    ) : (
                        projectName
                    )}
                </StyledProjectName>
                <Divider orientation="vertical" flexItem sx={{ marginRight: '5px' }} />
                <IconButton
                    onClick={() => {
                        handleClose()
                        onSaveChangesToFile()
                    }}
                >
                    <SaveAltIcon />
                </IconButton>
            </StyledPaper>
            {history.undo.length || history.redo.length ? (
                <StyledPaper>
                    <IconButton onClick={onUndo} disabled={history.undo.length === 0}>
                        <UndoIcon fontSize="small" />
                    </IconButton>
                    <IconButton onClick={onRedo} disabled={history.redo.length === 0}>
                        <RedoIcon fontSize="small" />
                    </IconButton>
                </StyledPaper>
            ) : null}
        </StyledMenuContainer>
    )
}
MainMenu.displayName = 'MainMenu'

export default MainMenu
