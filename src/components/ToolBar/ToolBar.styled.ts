import styled from '@emotion/styled'
import { Theme } from '@mui/material/styles'
import { ToggleButtonGroup } from '@mui/material'

export const StyledMenuContainer = styled.div`
    position: absolute;
    top: 20px;
    left: 10px;
    z-index: 100;
`

export const StyledColorPicker = styled.div`
    padding: 2px 3px;
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
        margin: '3px',
        width: '36px'
    }
}))
