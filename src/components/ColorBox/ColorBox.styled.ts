import styled from '@emotion/styled'

import { IMuiTheme } from '../../common/types'

export const StyledTransparentContainer = styled.div`
    display: inline-flex;
    width: 32px;
    height: 32px;
    margin: 2px;
    cursor: pointer;
    border-radius: 3px;
    box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.6);
    background-image: linear-gradient(
            45deg,
            ${({ theme }: IMuiTheme) => theme?.palette.action.hover} 25%,
            transparent 25%
        ),
        linear-gradient(135deg, ${({ theme }: IMuiTheme) => theme?.palette.action.hover} 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, ${({ theme }: IMuiTheme) => theme?.palette.action.hover} 75%),
        linear-gradient(135deg, transparent 75%, ${({ theme }: IMuiTheme) => theme?.palette.action.hover} 75%);
    background-size: 8px 8px;
    background-position:
        0 0,
        4px 0,
        4px -4px,
        0px 4px;

    &.selected {
        box-shadow: 0 0 0 2px ${({ theme }: IMuiTheme) => (theme?.palette.mode === 'dark' ? '#90caf9' : '#1976d2')};
    }
`

export const StyledColorBox = styled.div`
    display: inline-flex;
    width: 32px;
    height: 32px;
    padding-bottom: 4px;
    border-radius: 3px;
`
