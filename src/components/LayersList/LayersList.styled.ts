import styled from '@emotion/styled'
import { List } from '@mui/material'

import { IMuiTheme } from '../../common/types'

export const StyledBottomContainer = styled.div`
    display: flex;
    justify-content: flex-end;
`

export const StyledButtonContainer = styled.div`
    width: 115px;
    display: flex;
    padding-top: 4px;
    margin-right: 6px;
`

export const StyledSliderContainer = styled.div`
    width: 200px;
    display: flex;
    padding-top: 6px;
    padding-right: 10px;
`

export const StyledLayersList = styled(List)`
    background-color: ${({ theme }: IMuiTheme) => theme?.palette.background.default};
    overflow: auto;
    position: relative;
    width: '100%';

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
