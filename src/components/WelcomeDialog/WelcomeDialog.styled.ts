import { withStyles } from '@mui/styles'
import { DialogContent, DialogActions } from '@mui/material'

export const StyledDialogContent = withStyles(theme => ({
    root: {
        padding: theme.spacing(2)
    }
}))(DialogContent)

export const StyledDialogActions = withStyles(theme => ({
    root: {
        margin: 0,
        padding: theme.spacing(1)
    }
}))(DialogActions)
