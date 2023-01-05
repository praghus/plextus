import styled from '@emotion/styled'

import { commonBoxShadow, commonPaperStyle } from '../../views/App.styled'
import { IMuiTheme } from '../../common/types'

export const StyledTabContainer = styled.div`
    position: absolute;
    top: 10px;
    right: 10px;
    width: 300px;
    display: flex;
    flex-direction: column;
    font-size: small;
    z-index: 100;
    border-top: 1px solid ${({ theme }: IMuiTheme) => theme?.palette.divider};
    border-left: 1px solid ${({ theme }: IMuiTheme) => theme?.palette.divider};
    transition: right 1s ease;
    ${commonPaperStyle}
    ${commonBoxShadow}
`
