import styled from '@emotion/styled'

import { IMuiTheme } from '../../common/types'

export const StyledTilesetImageContainer = styled.div`
    overflow: auto;
    height: calc(45vh);
    background-image: linear-gradient(
            45deg,
            ${({ theme }: IMuiTheme) => theme?.palette.action.hover} 25%,
            transparent 25%
        ),
        linear-gradient(135deg, ${({ theme }: IMuiTheme) => theme?.palette.action.hover} 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, ${({ theme }: IMuiTheme) => theme?.palette.action.hover} 75%),
        linear-gradient(135deg, transparent 75%, ${({ theme }: IMuiTheme) => theme?.palette.action.hover} 75%);
    background-size: 8px 8px;
    background-position: 0 0, 4px 0, 4px -4px, 0px 4px;
    background-color: ${({ theme }: IMuiTheme) => theme?.palette.background.default};

    ::-webkit-scrollbar {
        width: 0.7em;
        height: 0.7em;
    }
    ::-webkit-scrollbar-corner {
        background-color: ${({ theme }: IMuiTheme) => (theme?.palette.mode === 'dark' ? '#111' : '#bbb')};
    }
    ::-webkit-scrollbar-track {
        background-color: ${({ theme }: IMuiTheme) => (theme?.palette.mode === 'dark' ? '#111' : '#bbb')};
    }
    ::-webkit-scrollbar-thumb {
        background-color: ${({ theme }: IMuiTheme) => theme?.palette.action.disabled};
        outline: 1px solid ${({ theme }: IMuiTheme) => theme?.palette.action.disabled};
    }
`

export const StyledBottomContainer = styled.div`
    display: flex;
    justify-content: flex-end;
`

export const StyledButtonContainer = styled.div`
    width: 85px;
    display: flex;
    padding: 4px;
    margin-right: 10px;
`

export const StyledSliderContainer = styled.div`
    width: 230px;
    display: flex;
    padding-top: 6px;
    padding-right: 10px;
`
