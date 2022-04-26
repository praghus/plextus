import styled from '@emotion/styled'
import { RgbaColorPicker } from 'react-colorful'

export const StyledColorPicker = styled(RgbaColorPicker)`
    width: auto !important;
    margin: 15px 10px;
`

export const StyledColorsContainer = styled.div`
    max-height: 120px;
    margin: 4px;
    overflow: auto;
`

export const StyledPalette = styled.div`
    margin-bottom: 10px;
    line-height: 0;
`

export const StyledBottomContainer = styled.div`
    display: flex;
    justify-content: flex-end;
`

export const StyledButtonContainer = styled.div`
    display: flex;
    padding: 4px;
`
