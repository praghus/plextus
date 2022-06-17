import styled from '@emotion/styled'

import { IMuiTheme } from '../../common/types'

export const StyledLabel = styled.div`
    position: absolute;
    right: 10px;
    bottom: 10px;
    z-index: 100;
    padding: 10px 15px;
    border-radius: 6px;
    font-size: 12px;
    backdrop-filter: blur(5px);
    color: ${({ theme }: IMuiTheme) => theme?.palette.text.secondary};
    background-color: ${({ theme }: IMuiTheme) =>
        theme?.palette.mode === 'dark' ? 'rgba(34,34,34,0.85)' : 'rgba(255,255,255,0.85)'};
`
