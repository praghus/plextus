import styled from '@emotion/styled'

import { IMuiTheme } from '../../common/types'

export const StyledMenuContainer = styled.div`
    position: absolute;
    top: 10px;
    left: 10px;
    z-index: 100;
    height: 46px;
    border-radius: 4px;
    color: ${({ theme }: IMuiTheme) => theme?.palette.text.primary};
    background-color: ${({ theme }: IMuiTheme) => (theme?.palette.mode === 'dark' ? '#2b2b2b' : '#fff')};
`

export const StyledProjectName = styled.div`
    max-width: 250px;
    padding: 5px 12px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`
