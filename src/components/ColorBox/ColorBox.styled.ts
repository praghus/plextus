import styled from '@emotion/styled'

import { IMuiTheme } from '../../common/types'

export const StyledColorBox = styled.div`
    display: inline-flex;
    width: 36px;
    height: 36px;
    margin: 2px;
    padding-bottom: 4px;
    text-decoration: none;
    font-size: 0;
    user-select: none;
    cursor: pointer;
    border-radius: 3px;
    box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.6);

    &:active {
        border: 1px solid rgba(255, 255, 255, 0.7);
    }

    &.selected {
        width: 40px;
        height: 40px;
        margin: 0;
        box-shadow: none;
        border: 2px solid ${({ theme }: IMuiTheme) => (theme?.palette.mode === 'dark' ? '#90caf9' : '#1976d2')};
    }
`
