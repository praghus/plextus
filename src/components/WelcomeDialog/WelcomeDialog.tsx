import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Button, Dialog, DialogActions, DialogTitle, Stack, Typography } from '@mui/material'
import {
    AddBox as AddBoxIcon,
    FileOpen as FileOpenIcon,
    Casino as CasinoIcon,
    ImageSearch as ImageSearchIcon
} from '@mui/icons-material'

import { selectIsLoading, selectIsImportDialogOpen, selectIsNewProjectDialogOpen } from '../../store/app/selectors'
import { changeAppIsNewProjectDialogOpen } from '../../store/app/actions'
import { openProject } from '../../store/editor/actions'
import { selectCanvas } from '../../store/editor/selectors'
import { PlextusLogo } from '../Icons'
import { ImageUpload } from '../ImageUpload'
import { ProjectUpload } from '../ProjectUpload'
import { ThemeSwitch } from '../ThemeSwitch'
import { ProjectFile } from '../../store/editor/types'
import { StyledDialogContent } from './WelcomeDialog.styled'

import pjson from '../../../package.json'
import demoProject from '../../assets/projects/demo-project.json'

const WelcomeDialog: React.FunctionComponent = () => {
    const canvas = useSelector(selectCanvas)
    const isLoading = useSelector(selectIsLoading)
    const isImportDialogOpen = useSelector(selectIsImportDialogOpen)
    const isNewProjectDialogOpen = useSelector(selectIsNewProjectDialogOpen)
    const isOpen = !canvas && !isLoading && !isImportDialogOpen && !isNewProjectDialogOpen

    const dispatch = useDispatch()
    const onToggleNewProjectDialog = (open: boolean) => dispatch(changeAppIsNewProjectDialogOpen(open))
    const onLoadDemoProject = () => dispatch(openProject(demoProject as ProjectFile))

    return (
        <Dialog open={isOpen}>
            <DialogTitle>
                <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                    <div>
                        <PlextusLogo />
                        {` ${pjson.version}`}
                    </div>
                    <ThemeSwitch />
                </Stack>
            </DialogTitle>
            <StyledDialogContent dividers>
                <Typography gutterBottom>
                    <b>Plextus</b> allows you to create and edit tile maps and tile sets, it also allows you to draw
                    directly on tiles and track changes on your map in real time.
                </Typography>
                <Typography gutterBottom>
                    <b>Plextus</b> is fully compatible with Tiled map editor and allows you to export your finished
                    project to .tmx format.
                </Typography>
                <Typography gutterBottom>
                    To get started create an empty project, or import an image file containing a tile map
                </Typography>
            </StyledDialogContent>
            <DialogActions>
                <Button onClick={() => onLoadDemoProject()} startIcon={<CasinoIcon />}>
                    Demo
                </Button>
                <Button component="label" startIcon={<FileOpenIcon />}>
                    Open
                    <ProjectUpload />
                </Button>
                <Button component="label" startIcon={<ImageSearchIcon />}>
                    Import
                    <ImageUpload />
                </Button>

                <Button variant="contained" onClick={() => onToggleNewProjectDialog(true)} startIcon={<AddBoxIcon />}>
                    New project
                </Button>
            </DialogActions>
        </Dialog>
    )
}
WelcomeDialog.displayName = 'WelcomeDialog'

export default WelcomeDialog
