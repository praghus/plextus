import styled from '@emotion/styled'
import { IMuiTheme } from '../common/types'

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

export const StyledRightContainer = styled.div`
    position: absolute;
    top: 10px;
    right: 10px;
    width: 310px;
    display: flex;
    flex-direction: column;
    padding: 5px;
    border-radius: 4px;
    background-color: ${({ theme }: IMuiTheme) => (theme?.palette.mode === 'dark' ? '#2b2b2b' : '#fff')};
    border-top: 1px solid ${({ theme }: IMuiTheme) => theme?.palette.divider};
    border-left: 1px solid ${({ theme }: IMuiTheme) => theme?.palette.divider};
    box-shadow: 1px 1px 3px
        ${({ theme }: IMuiTheme) => (theme?.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.3)')};
    color: ${({ theme }: IMuiTheme) => theme?.palette.text.secondary};
    font-size: small;
    transition: right 1s ease;
`

export const StyledThemeSwitchContainer = styled.div`
    position: absolute;
    bottom: 5px;
    left: 3px;
    z-index: 100;
`
