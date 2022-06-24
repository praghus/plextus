import styled from '@emotion/styled'
import { css } from '@emotion/react'
import { IMuiTheme } from '../common/types'

export const commonBoxShadow = ({ theme }: IMuiTheme) => css`
    box-shadow: 0px 2px 10px ${theme?.palette.mode === 'dark' ? 'rgba(32,32,45,0.5)' : 'rgba(5,0,56,0.08)'};
`

export const commonPaperStyle = ({ theme }: IMuiTheme) => css`
    color: ${theme?.palette.text.primary};
    background-color: ${theme?.palette.mode === 'dark' ? '#222' : '#fff'};
    border-radius: 4px;
`

export const StyledWrapper = styled.div`
    flex-direction: column;
    display: flex;
    margin: 0 auto;
    padding: 0;
    background-color: ${({ theme }: IMuiTheme) => theme?.palette.background.default};
    min-height: 100%;
    min-width: 100%;
`

export const StyledContainer = styled.div`
    height: calc(100vh);
    display: flex;
`

export const StyledMiddleContainer = styled.div`
    display: flex;
    flex-direction: column;
    background-color: ${({ theme }: IMuiTheme) => (theme?.palette.mode === 'dark' ? '#3b3b3b' : '#e0e0e0')};
    width: 100%;
    height: 100%;
`

export const StyledThemeSwitchContainer = styled.div`
    position: absolute;
    bottom: 5px;
    left: 3px;
    z-index: 100;
`
