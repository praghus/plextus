import styled from '@emotion/styled'
import { ToggleButtonGroup } from '@mui/material'

import { commonBoxShadow, commonPaperStyle } from '../../views/App.styled'
import { IMuiTheme } from '../../common/types'

export const StyledToolBarContainer = styled.div`
    position: absolute;
    top: 50%;
    left: 10px;
    z-index: 100;
    width: 46px;
    transform: translate(0, -50%);
    ${commonPaperStyle}
    ${commonBoxShadow}
`

export const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }: IMuiTheme) => ({
    '& .MuiButtonBase-root': {
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
        height: '42px',
        margin: '2px',
        width: '42px'
    }
}))
