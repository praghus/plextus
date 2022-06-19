import { withStyles } from '@mui/styles'
import { DialogContent } from '@mui/material'

export const StyledDialogContent = withStyles(theme => ({
    root: {
        padding: theme.spacing(2)
    }
}))(DialogContent)
