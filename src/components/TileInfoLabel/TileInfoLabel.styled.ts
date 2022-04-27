import styled from '@emotion/styled'

import { RIGHT_BAR_WIDTH, STATUS_BAR_HEIGHT } from '../../common/constants'
import { IMuiTheme } from '../../common/types'

export const StyledLabel = styled.div`
    position: absolute;
    right: ${RIGHT_BAR_WIDTH + 10}px;
    bottom: ${STATUS_BAR_HEIGHT + 10}px;
    padding: 4px 8px;
    border-radius: 6px;
    font-size: 12px;
    opacity: 0.9;
    color: ${({ theme }: IMuiTheme) => theme?.palette.text.secondary};
    background-color: ${({ theme }: IMuiTheme) => theme?.palette.background.default};
`
