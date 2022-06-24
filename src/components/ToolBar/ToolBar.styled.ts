import styled from '@emotion/styled'
import { ToggleButtonGroup } from '@mui/material'

import { commonBoxShadow, commonPaperStyle } from '../../views/App.styled'
import { IMuiTheme } from '../../common/types'

export const StyledToolBarContainer = styled.div`
    position: absolute;
    top: 50%;
    left: 10px;
    z-index: 100;
    width: 48px;
    transform: translate(0, -50%);
    ${commonPaperStyle}
    ${commonBoxShadow}
`

export const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }: IMuiTheme) => ({
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
        height: '44px',
        margin: '2px',
        width: '44px'
    }
}))
