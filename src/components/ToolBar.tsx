import React, { useCallback, useState, useEffect } from 'react'
import styled from '@emotion/styled'
import { useTheme, Theme } from '@mui/material/styles'
import { debounce } from 'lodash'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import {
    Divider,
    IconButton,
    ListItemIcon,
    Menu,
    MenuItem,
    Paper,
    ToggleButton,
    ToggleButtonGroup,
    Tooltip
} from '@mui/material'
import { ColorPicker, Color, ColorValue } from 'mui-color'
import {
    BrightnessMedium as BrightnessMediumIcon,
    Colorize as ColorizeIcon,
    Create as CreateIcon,
    Crop as CropIcon,
    CancelPresentation as CancelPresentationIcon,
    DisabledByDefault as DisabledByDefaultIcon,
    FormatColorFill as FormatColorFillIcon,
    Undo as UndoIcon,
    Redo as RedoIcon,
    AddPhotoAlternate as AddPhotoAlternateIcon,
    FileDownload as FileDownloadIcon,
    Save as SaveIcon,
    InsertDriveFile as InsertDriveFileIcon,
    // PhotoSizeSelectSmall as PhotoSizeSelectSmallIcon,
    Menu as MenuIcon,
    PanTool as PanToolIcon,
    ControlCamera as ControlCameraIcon
} from '@mui/icons-material'
import { TOOLS, TOOLS_DESC } from '../common/constants'
import { exportToTmx } from '../common/utils/tmx'
import { rgbaToHex } from '../common/utils/colors'
import { selectHistory } from '../store/history/selectors'
import { selectCanvas, selectLayers, selectTileset, selectSelected } from '../store/editor/selectors'
import { changeAppIsNewProjectDialogOpen } from '../store/app/actions'
import { clearProject, changePrimaryColor, changeTool, saveChanges } from '../store/editor/actions'
import { undo, redo } from '../store/history/actions'
import { EraserIcon, LineIcon, StampIcon, TileReplaceIcon } from './Icons'
import ConfirmationDialog from './ConfirmationDialog'
import ImageUpload from './ImageUpload'

const StyledMenuContainer = styled.div`
    position: absolute;
    top: 20px;
    left: 10px;
    z-index: 100;
`

const StyledColorPicker = styled.div`
    padding: 2px 3px;
`

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }: { theme?: Theme }) => ({
    '& .MuiToggleButtonGroup-grouped': {
        '&.Mui-disabled': {
            border: 0
        },
        '&:first-of-type': {
            borderRadius: (theme && theme.shape.borderRadius) || 0
        },
        '&:not(:first-of-type)': {
            borderRadius: (theme && theme.shape.borderRadius) || 0
        },
        border: 0,
        margin: '3px',
        width: '36px'
    }
}))

const ToolBar = (): JSX.Element => {
    const theme = useTheme()
    const selected = useSelector(selectSelected)
    const canvas = useSelector(selectCanvas)
    const layers = useSelector(selectLayers)
    const tileset = useSelector(selectTileset)
    const history = useSelector(selectHistory)

    const [anchorEl, setAnchorEl] = useState<HTMLAnchorElement | null>(null)
    const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false)
    const [primaryColor, setPrimaryColor] = useState<string>(rgbaToHex(selected.color))

    const { t } = useTranslation()

    const dispatch = useDispatch()
    const handleClose = () => setAnchorEl(null)
    const handleClick = (e: React.MouseEvent) => setAnchorEl(e.currentTarget as HTMLAnchorElement)
    const onChangeTool = (tool: string) => tool && dispatch(changeTool(tool))
    const onSaveChanges = () => dispatch(saveChanges())
    const onShowNewProjectDialog = () => dispatch(changeAppIsNewProjectDialogOpen(true))
    const onUndo = () => dispatch(undo())
    const onRedo = () => dispatch(redo())
    const onCloseProject = () => dispatch(clearProject())

    const onChangePrimaryColor = useCallback(
        debounce(color => dispatch(changePrimaryColor(color)), 500),
        []
    )

    const lightIconColor = theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'

    const renderToolButton = useCallback(
        (value: string, Icon: React.ElementType) => (
            <ToggleButton {...{ value }}>
                <Tooltip title={TOOLS_DESC[value]} placement="right">
                    <div>
                        <Icon
                            fontSize="small"
                            htmlColor={lightIconColor}
                            sx={{
                                filter: 'drop-shadow(1px 1px 1px rgba(0, 0, 0, .7))'
                            }}
                        />
                    </div>
                </Tooltip>
            </ToggleButton>
        ),
        []
    )

    useEffect(() => {
        setPrimaryColor(rgbaToHex(selected.color))
    }, [selected.color])

    return (
        <>
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

            <StyledMenuContainer>
                <Paper
                    elevation={10}
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        flexWrap: 'wrap'
                    }}
                >
                    <IconButton
                        onClick={handleClick}
                        sx={{
                            height: 40,
                            marginLeft: '1px',
                            padding: 0,
                            width: 40
                        }}
                    >
                        <MenuIcon fontSize="small" />
                    </IconButton>
                    <Divider orientation="horizontal" />
                    <StyledToggleButtonGroup
                        exclusive
                        value={selected.tool}
                        size="small"
                        orientation="vertical"
                        onChange={(_, value) => onChangeTool(value as string)}
                    >
                        {renderToolButton(TOOLS.DRAG, PanToolIcon)}
                        {renderToolButton(TOOLS.ERASER, EraserIcon)}
                        {renderToolButton(TOOLS.PENCIL, CreateIcon)}
                        {renderToolButton(TOOLS.LINE, LineIcon)}
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
                    <Divider orientation="horizontal" />
                    <StyledColorPicker>
                        <ColorPicker
                            hideTextfield
                            value={primaryColor}
                            onChange={(color: ColorValue) => {
                                const { rgb } = color as Color
                                setPrimaryColor(rgbaToHex(rgb))
                                onChangePrimaryColor(rgb)
                            }}
                        />
                    </StyledColorPicker>
                </Paper>
            </StyledMenuContainer>
        </>
    )
}
ToolBar.displayName = 'ToolBar'

export default ToolBar
