import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { withStyles } from '@mui/styles'
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography } from '@mui/material'
import { selectIsLoading, selectIsImportDialogOpen, selectIsNewProjectDialogOpen } from '../store/app/selectors'
import { changeAppIsNewProjectDialogOpen } from '../store/app/actions'
import { loadStateFromFile } from '../store/editor/actions'
import { clear } from '../store/history/actions'
import { selectCanvas } from '../store/editor/selectors'
import ImageUpload from './ImageUpload'
import demoProject from '../assets/projects/demo-project.json'
import { ProjectFile } from 'store/editor/types'

const StyledDialogContent = withStyles(theme => ({
    root: {
        padding: theme.spacing(2)
    }
}))(DialogContent)

const StyledDialogActions = withStyles(theme => ({
    root: {
        margin: 0,
        padding: theme.spacing(1)
    }
}))(DialogActions)

const WelcomeDialog = (): JSX.Element => {
    const canvas = useSelector(selectCanvas)
    const isLoading = useSelector(selectIsLoading)
    const isImportDialogOpen = useSelector(selectIsImportDialogOpen)
    const isNewProjectDialogOpen = useSelector(selectIsNewProjectDialogOpen)
    const isOpen = !canvas && !isLoading && !isImportDialogOpen && !isNewProjectDialogOpen

    const dispatch = useDispatch()
    const onLoadDemoProject = () => {
        dispatch(clear())
        dispatch(loadStateFromFile(demoProject as ProjectFile))
    }
    const onToggleNewProjectDialog = (open: boolean) => dispatch(changeAppIsNewProjectDialogOpen(open))

    return (
        <Dialog open={isOpen}>
            <DialogTitle>
                <Typography>Welcome in Plextus v1.0</Typography>
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
            <StyledDialogActions>
                <Button onClick={() => onLoadDemoProject()}>See demo project</Button>
                <Button component="label">
                    Import image
                    <ImageUpload />
                </Button>
                <Button variant="contained" onClick={() => onToggleNewProjectDialog(true)}>
                    Create new project
                </Button>
            </StyledDialogActions>
        </Dialog>
    )
}
WelcomeDialog.displayName = 'WelcomeDialog'

export default WelcomeDialog
