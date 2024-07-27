import styled from '@emotion/styled'
import { withStyles } from '@mui/styles'
import { DialogContent } from '@mui/material'

export const StyledDialogContent = withStyles(theme => ({
    root: {
        padding: theme.spacing(2)
    }
}))(DialogContent)

export const StyledLogoWrapper = styled.div`
    width: 100%;
    display: flex;
    align-items: center;
`
