import { useDispatch, useSelector } from 'react-redux'
import { Button, Dialog, DialogActions, DialogTitle, Stack, Typography } from '@mui/material'
import {
    AddBox as AddBoxIcon,
    FileOpen as FileOpenIcon,
    Casino as CasinoIcon,
    ImageSearch as ImageSearchIcon
} from '@mui/icons-material'

import { selectIsLoading, selectIsImportDialogOpen } from '../../stores/app/selectors'
import { openProject } from '../../stores/editor/actions'
import { selectCanvas } from '../../stores/editor/selectors'
import { PlextusLogo } from '../Icons'
import { ImageUpload } from '../ImageUpload'
import { ProjectUpload } from '../ProjectUpload'
import { ThemeSwitch } from '../ThemeSwitch'
import { ProjectFile } from '../../stores/editor/types'
import { StyledDialogContent, StyledLogoWrapper } from './WelcomeDialog.styled'
import { useNewProjectDialogToggle } from '../../hooks/useDialogToggle'

import pjson from '../../../package.json'
import demoProject from '../../assets/projects/demo-project.json'

const WelcomeDialog = () => {
    const canvas = useSelector(selectCanvas)
    const isLoading = useSelector(selectIsLoading)
    const isImportDialogOpen = useSelector(selectIsImportDialogOpen)

    const [isNewProjectDialogOpen, setNewProjectDialogOpen] = useNewProjectDialogToggle()

    const dispatch = useDispatch()
    const onLoadDemoProject = () => dispatch(openProject(demoProject as ProjectFile))

    const isOpen = !canvas && !isLoading && !isImportDialogOpen && !isNewProjectDialogOpen

    return isOpen ? (
        <Dialog open={isOpen}>
            <DialogTitle>
                <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                    <StyledLogoWrapper>
                        <PlextusLogo />
                        <div style={{ marginLeft: '10px' }}>{`${pjson.version}`}</div>
                    </StyledLogoWrapper>
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
                <Button variant="contained" onClick={() => setNewProjectDialogOpen(true)} startIcon={<AddBoxIcon />}>
                    New project
                </Button>
            </DialogActions>
        </Dialog>
    ) : null
}
WelcomeDialog.displayName = 'WelcomeDialog'

export default WelcomeDialog
