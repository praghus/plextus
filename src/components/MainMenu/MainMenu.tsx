import React, { useState } from 'react'

import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { Divider, Button, ListItemIcon, Menu, MenuItem, IconButton, Stack, TextField } from '@mui/material'

import {
    DisabledByDefault as DisabledByDefaultIcon,
    Undo as UndoIcon,
    Redo as RedoIcon,
    AddPhotoAlternate as AddPhotoAlternateIcon,
    FileDownload as FileDownloadIcon,
    Save as SaveIcon,
    InsertDriveFile as InsertDriveFileIcon
} from '@mui/icons-material'

import { exportToTmx } from '../../common/utils/tmx'
import { selectHistory } from '../../store/history/selectors'
import { selectCanvas, selectLayers, selectProjectName, selectTileset } from '../../store/editor/selectors'
import { changeAppIsNewProjectDialogOpen } from '../../store/app/actions'
import { changeProjectName, clearProject, saveChanges } from '../../store/editor/actions'
import { undo, redo } from '../../store/history/actions'
import { PlextusLogo } from '../Icons'
import { ConfirmationDialog } from '../ConfirmationDialog'
import { ImageUpload } from '../ImageUpload'
import { StyledMenuContainer, StyledProjectName } from './MainMenu.styled'

const MainMenu: React.FunctionComponent = () => {
    const canvas = useSelector(selectCanvas)
    const layers = useSelector(selectLayers)
    const projectName = useSelector(selectProjectName)
    const tileset = useSelector(selectTileset)
    const history = useSelector(selectHistory)

    const [anchorEl, setAnchorEl] = useState<HTMLAnchorElement | null>(null)
    const [editingName, setEditingName] = useState(projectName)
    const [isEditing, setIsEditing] = useState(false)
    const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false)

    const { t } = useTranslation()

    const dispatch = useDispatch()
    const handleClose = () => setAnchorEl(null)
    const handleClick = (e: React.MouseEvent) => setAnchorEl(e.currentTarget as HTMLAnchorElement)
    const onSaveChanges = () => dispatch(saveChanges())
    const onShowNewProjectDialog = () => dispatch(changeAppIsNewProjectDialogOpen(true))
    const onChangeProjectName = (name: string) => dispatch(changeProjectName(name))
    const onUndo = () => dispatch(undo())
    const onRedo = () => dispatch(redo())
    const onCloseProject = () => dispatch(clearProject())

    const onRenameProject = () => {
        if (editingName) {
            onChangeProjectName(editingName)
            setIsEditing(false)
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
                        onShowNewProjectDialog()
                    }}
                >
                    <ListItemIcon>
                        <InsertDriveFileIcon fontSize="small" />
                    </ListItemIcon>
                    {t('i18_new_project')}
                </MenuItem>
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
                        <FileDownloadIcon fontSize="small" />
                    </ListItemIcon>
                    {t('i18_export_map')}
                </MenuItem>
                <Divider orientation="horizontal" />
                <MenuItem onClick={onUndo} disabled={history.undo.length === 0}>
                    <ListItemIcon>
                        <UndoIcon fontSize="small" />
                    </ListItemIcon>
                    {t('i18_undo')}
                </MenuItem>
                <MenuItem onClick={onRedo} disabled={history.redo.length === 0}>
                    <ListItemIcon>
                        <RedoIcon fontSize="small" />
                    </ListItemIcon>
                    {t('i18_redo')}
                </MenuItem>
                <Divider orientation="horizontal" />
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

            <Stack direction="row" justifyContent="center" alignItems="center" sx={{ height: '46px' }}>
                <Button
                    onClick={handleClick}
                    sx={{
                        height: '35px',
                        margin: '3px 5px'
                    }}
                >
                    <PlextusLogo height={35} />
                </Button>
                <Divider orientation="vertical" flexItem />
                <StyledProjectName
                    onClick={() => {
                        setIsEditing(true)
                    }}
                >
                    {isEditing ? (
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
                                    setIsEditing(false)
                                }
                            }}
                        />
                    ) : (
                        projectName
                    )}
                </StyledProjectName>
                <Divider orientation="vertical" flexItem />
                <IconButton onClick={onUndo} disabled={history.undo.length === 0}>
                    <UndoIcon fontSize="small" />
                </IconButton>
                <IconButton onClick={onRedo} disabled={history.redo.length === 0}>
                    <RedoIcon fontSize="small" />
                </IconButton>
            </Stack>
        </StyledMenuContainer>
    )
}
MainMenu.displayName = 'MainMenu'

export default MainMenu