import styled from '@emotion/styled'
import { Theme } from '@mui/material/styles'
import { RgbaColorPicker } from 'react-colorful'

export const StyledColorPicker = styled(RgbaColorPicker)`
    width: auto !important;
    margin: 10px 6px;
`

interface StyledColorsContainerProps {
    theme?: Theme
    scrollVisible?: boolean
}

export const StyledColorsContainer = styled.div`
    max-height: 230px;
    margin-top: 10px;
    margin-left: ${({ scrollVisible }: StyledColorsContainerProps) => (scrollVisible ? '-2px' : '5px')};
    padding-bottom: 2px;
    overflow: auto;

    ::-webkit-scrollbar {
        width: 0.7em;
        height: 0.7em;
    }
    ::-webkit-scrollbar-corner {
        background-color: ${({ theme }: StyledColorsContainerProps) =>
            theme?.palette.mode === 'dark' ? '#111' : '#bbb'};
    }
    ::-webkit-scrollbar-track {
        background-color: ${({ theme }: StyledColorsContainerProps) =>
            theme?.palette.mode === 'dark' ? '#111' : '#bbb'};
    }
    ::-webkit-scrollbar-thumb {
        background-color: ${({ theme }: StyledColorsContainerProps) => theme?.palette.action.disabled};
        outline: 1px solid ${({ theme }: StyledColorsContainerProps) => theme?.palette.action.disabled};
    }
`

export const StyledPalette = styled.div`
    width: 100%;
    line-height: 0;
`

export const StyledButtonContainer = styled.div`
    display: flex;
`

export const StyledWrapper = styled.div`
    padding: 5px;
`
