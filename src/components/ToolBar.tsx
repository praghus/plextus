import React, { useCallback, useState, useEffect } from 'react'
import styled from '@emotion/styled'
import { debounce } from 'lodash'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { makeStyles, withStyles } from '@material-ui/core/styles'
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab'
import { Divider, IconButton, Menu, MenuItem, Paper, Tooltip } from '@material-ui/core'
import { ColorPicker } from 'material-ui-color'
import {
    BrightnessMedium as BrightnessMediumIcon,
    Colorize as ColorizeIcon,
    Create as CreateIcon,
    Crop as CropIcon,
    CancelPresentation as CancelPresentationIcon,
    FormatColorFill as FormatColorFillIcon,
    PhotoSizeSelectSmall as PhotoSizeSelectSmallIcon,
    Menu as MenuIcon,
    PanTool as PanToolIcon,
    ControlCamera as ControlCameraIcon
} from '@material-ui/icons'
import { TOOLS, TOOLS_DESC } from '../common/constants'
import { exportToTmx } from '../common/utils/tmx'
import { rgbaToHex } from '../common/utils/colors'
import { selectCanvas, selectLayers, selectTileset, selectSelected } from '../store/editor/selectors'
import { changeAppIsNewProjectDialogOpen } from '../store/app/actions'
import { clearProject, changePrimaryColor, changeTool, saveChanges } from '../store/editor/actions'
import { undo, redo } from '../store/history/actions'
import { EraserIcon, LineIcon, StampIcon, TileReplaceIcon } from './Icons'
import ConfirmationDialog from './ConfirmationDialog'
import ImageUpload from './ImageUpload'

export const useStyles = makeStyles(theme => ({
    divider: {
        margin: theme.spacing(1, 0.5),
        width: '40px'
    },
    icon: {
        filter: 'drop-shadow(1px 1px 1px rgba(0, 0, 0, .7))'
    },
    iconButton: {
        height: 40,
        padding: 0,
        width: 40
    },
    paper: {
        marginBottom: 10,
        width: 48
    },
    tooltip: {
        maxWidth: 130
    }
}))

const StyledMenuContainer = styled.div`
    position: absolute;
    top: 20px;
    left: 10px;
    z-index: 100;
`

const StyledColorPicker = styled.div`
    padding-top: 2px;
    padding-left: 6px;
    padding-bottom: 5px;
`

const StyledToggleButtonGroup = withStyles(theme => ({
    grouped: {
        '&:first-child': {
            borderRadius: theme.shape.borderRadius
        },
        '&:not(:first-child)': {
            borderRadius: theme.shape.borderRadius
        },
        border: 'none',
        margin: theme.spacing(0.5)
    }
}))(ToggleButtonGroup)

const ToolBar = (): JSX.Element => {
    const classes = useStyles()
    const selected = useSelector(selectSelected)
    const canvas = useSelector(selectCanvas)
    const layers = useSelector(selectLayers)
    const tileset = useSelector(selectTileset)

    const [anchorEl, setAnchorEl] = useState<HTMLAnchorElement | null>(null)
    const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false)
    const [primaryColor, setPrimaryColor] = useState<any>(rgbaToHex(selected.color))

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

    const renderToolButton = useCallback(
        (value: string, Icon: any) => (
            <ToggleButton {...{ value }}>
                <Tooltip title={TOOLS_DESC[value]} placement="right" classes={{ tooltip: classes.tooltip }}>
                    <div>
                        <Icon fontSize="small" className={classes.icon} />
                    </div>
                </Tooltip>
            </ToggleButton>
        ),
        [classes]
    )

    useEffect(() => {
        setPrimaryColor(rgbaToHex(selected.color))
    }, [selected.color])

    return (
        <>
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
                <Paper elevation={5} className={classes.paper}>
                    <StyledToggleButtonGroup
                        exclusive
                        value={selected.tool}
                        size="small"
                        orientation="vertical"
                        onChange={(event, value) => onChangeTool(value)}
                    >
                        <IconButton aria-haspopup="true" onClick={handleClick} className={classes.iconButton}>
                            <MenuIcon fontSize="small" className={classes.icon} />
                        </IconButton>
                        <Menu anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleClose}>
                            <MenuItem
                                onClick={() => {
                                    handleClose()
                                    onShowNewProjectDialog()
                                }}
                            >
                                {t('i18_new_project')}
                            </MenuItem>
                            <MenuItem
                                onClick={() => {
                                    handleClose()
                                    setConfirmationDialogOpen(true)
                                }}
                            >
                                {t('i18_close_project')}
                            </MenuItem>
                            <Divider orientation="horizontal" />
                            <MenuItem onClick={onUndo}>{t('i18_undo')}</MenuItem>
                            <MenuItem onClick={onRedo}>{t('i18_redo')}</MenuItem>
                            <Divider orientation="horizontal" />
                            <ImageUpload>
                                <MenuItem onClick={handleClose}>{t('i18_import_image')}</MenuItem>
                            </ImageUpload>
                            <MenuItem
                                onClick={() => {
                                    canvas && exportToTmx(canvas, layers, tileset)
                                    handleClose()
                                }}
                            >
                                {t('i18_export_map')}
                            </MenuItem>
                            <Divider orientation="horizontal" />
                            <MenuItem
                                onClick={() => {
                                    handleClose()
                                    onSaveChanges()
                                }}
                            >
                                {t('i18_save')}
                            </MenuItem>
                        </Menu>
                        <Divider orientation="horizontal" className={classes.divider} />
                        {renderToolButton(TOOLS.DRAG, PanToolIcon)}
                        {renderToolButton(TOOLS.ERASER, EraserIcon)}
                        {renderToolButton(TOOLS.PENCIL, CreateIcon)}
                        {renderToolButton(TOOLS.LINE, LineIcon)}
                        {renderToolButton(TOOLS.PICKER, ColorizeIcon)}
                        {renderToolButton(TOOLS.FILL, FormatColorFillIcon)}
                        {renderToolButton(TOOLS.BRIGHTNESS, BrightnessMediumIcon)}
                        <Divider orientation="horizontal" className={classes.divider} />
                        {renderToolButton(TOOLS.STAMP, StampIcon)}
                        {renderToolButton(TOOLS.REPLACE, TileReplaceIcon)}
                        {renderToolButton(TOOLS.DELETE, CancelPresentationIcon)}
                        <Divider orientation="horizontal" className={classes.divider} />
                        {renderToolButton(TOOLS.OFFSET, ControlCameraIcon)}
                        {renderToolButton(TOOLS.SELECT, PhotoSizeSelectSmallIcon)}
                        {renderToolButton(TOOLS.CROP, CropIcon)}
                        <Divider orientation="horizontal" className={classes.divider} />
                    </StyledToggleButtonGroup>
                    <StyledColorPicker>
                        <ColorPicker
                            hideTextfield
                            value={primaryColor}
                            onChange={(color: any) => {
                                setPrimaryColor(color)
                                if (!color.error) {
                                    onChangePrimaryColor(color.rgb)
                                }
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
