import styled from '@emotion/styled'

import { IMuiTheme } from '../../common/types'

export const StyledTilesetImageContainer = styled.div`
    overflow: auto;
    margin-bottom: 10px;
    height: calc(45vh);
    background-color: ${({ theme }: IMuiTheme) => theme?.palette.action.disabledBackground};

    ::-webkit-scrollbar {
        width: 0.7em;
        height: 0.7em;
    }
    ::-webkit-scrollbar-corner {
        background-color: ${({ theme }: IMuiTheme) => theme?.palette.action.disabledBackground};
    }
    ::-webkit-scrollbar-track {
        background-color: ${({ theme }: IMuiTheme) => theme?.palette.action.disabledBackground};
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
    padding-top: 4px;
    padding-right: 10px;
`
