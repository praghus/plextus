import styled from '@emotion/styled'
import { Theme } from '@mui/material/styles'
import { ToggleButtonGroup } from '@mui/material'

export const StyledToolBarContainer = styled.div`
    position: absolute;
    top: 50%;
    left: 10px;
    z-index: 100;
    width: 46px;
    transform: translate(0, -50%);
`

export const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }: { theme?: Theme }) => ({
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
        height: '40px',
        margin: '3px',
        width: '40px'
    }
}))
