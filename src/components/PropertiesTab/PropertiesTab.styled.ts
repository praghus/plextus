import styled from '@emotion/styled'
import { Theme } from '@mui/material/styles'
interface StyledColorsContainerProps {
    theme?: Theme
}
export const StyledSettingsContainer = styled.div`
    margin: 10px;
    display: flex;
`

export const StyledPropContainer = styled.div`
    display: flex;
    align-items: center;
    margin: 5px 10px;
`

export const StyledColorLabel = styled.div`
    width: 40%;
    text-align: right;
    color: ${({ theme }: StyledColorsContainerProps) => (theme?.palette.mode === 'dark' ? '#999' : '#bbb')};
`
