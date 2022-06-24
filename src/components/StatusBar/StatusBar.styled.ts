import styled from '@emotion/styled'
import { Button } from '@mui/material'

import { commonBoxShadow } from '../../views/App.styled'
import { IMuiTheme } from '../../common/types'

export const StyledStatusBar = styled.div`
    display: flex;
    position: absolute;
    left: 50%;
    transform: translate(-50%, 0);
    bottom: 10px;
    border-radius: 4px;
    z-index: 100;
    flex-direction: row;
    flex-wrap: wrap;
    padding: 0;
    font-size: 12px;
    height: 40px;
    backdrop-filter: blur(5px);
    color: ${({ theme }: IMuiTheme) => theme?.palette.text.secondary};
    background-color: ${({ theme }: IMuiTheme) =>
        theme?.palette.mode === 'dark' ? 'rgba(24,24,24,0.85)' : 'rgba(255,255,255,0.85)'};
    ${commonBoxShadow}
`

export const StyledCol = styled.div`
    margin: 0 10px;
    font-size: 12px;
    font-weight: 500;
    svg {
        margin-right: 5px;
    }
`

export const StyledButton = styled(Button)(({ theme }: IMuiTheme) => ({
    backgroundColor: 'transparent',
    color: theme?.palette.mode === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.6)',
    fontSize: 12,
    padding: '0 5px',
    textTransform: 'lowercase',
    whiteSpace: 'nowrap'
}))
