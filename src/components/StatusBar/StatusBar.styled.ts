import styled from '@emotion/styled'
import { Button } from '@mui/material'

import { STATUS_BAR_HEIGHT } from '../../common/constants'
import { IMuiTheme } from '../../common/types'

export const StyledStatusBar = styled.div`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    width: 100%;
    padding: 0;
    font-size: 12px;
    height: ${STATUS_BAR_HEIGHT}px;
    color: ${({ theme }: IMuiTheme) => theme?.palette.text.secondary || '#666'};
    background-color: ${({ theme }: IMuiTheme) => theme?.palette.background.default || '#151515'};
`

export const StyledCol = styled.div`
    margin: 0 10px;
    font-size: 12px;
    font-weight: 500;
    svg {
        margin-right: 5px;
    }
`

export const StyledButton = styled(Button)({
    backgroundColor: 'transparent',
    color: '#666',
    fontSize: 12,
    padding: '0 5px',
    textTransform: 'lowercase',
    whiteSpace: 'nowrap'
})
