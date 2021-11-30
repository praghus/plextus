import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { withStyles } from '@material-ui/core/styles'
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography } from '@material-ui/core'
import { selectIsImportDialogOpen, selectIsNewProjectDialogOpen } from '../store/app/selectors'
import { changeAppIsImportDialogOpen, changeAppIsNewProjectDialogOpen } from '../store/app/actions'
import { loadStateFromFile } from '../store/editor/actions'
import demoProject from '../demo/demo-project.json'

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
    const isImportDialogOpen = useSelector(selectIsImportDialogOpen)
    const isNewProjectDialogOpen = useSelector(selectIsNewProjectDialogOpen)

    const dispatch = useDispatch()
    const onLoadDemoProject = () => dispatch(loadStateFromFile(demoProject))
    const onToggleImportDialog = (open: boolean) => dispatch(changeAppIsImportDialogOpen(open))
    const onToggleNewProjectDialog = (open: boolean) => dispatch(changeAppIsNewProjectDialogOpen(open))

    return (
        <Dialog open={!isImportDialogOpen && !isNewProjectDialogOpen}>
            <DialogTitle disableTypography>
                <Typography variant="h6">Welcome in Plextus v1.0</Typography>
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
                <Button onClick={() => onToggleImportDialog(true)}>Import image</Button>
                <Button onClick={() => onToggleNewProjectDialog(true)}>Create new project</Button>
            </StyledDialogActions>
        </Dialog>
    )
}
WelcomeDialog.displayName = 'WelcomeDialog'

export default WelcomeDialog
