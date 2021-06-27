import React from 'react'
import styled from '@emotion/styled'
import { useSelector } from 'react-redux'

import { selectWorkspace } from '../store/editor/selectors'

const StyledFooter = styled.div`
    display: flex;
    justify-content: space-between;
    padding: 6px 10px;
    border-top: 1px solid #222;
    background-color: #333;
    color: #ccc;
    font-size: 12px;
`

const StyledCoords = styled.div`
    display: flex;
    flex-direction: column;
    flex-basis: 100%;
    flex: 1;
    color: #999;
    font-size: 12px;
`

const StyledHeartEmoji = styled.div`
    margin: 0 5px;
    :after {
        content: '❤️';
    }
`

const StyledLink = styled.a`
    color: #41addd;
    padding-left: 5px;
    :hover {
        color: #6cc0e5;
    }
`

const Footer = (): JSX.Element => {
    const workspace = useSelector(selectWorkspace)
    return (
        <StyledFooter>
            <StyledCoords className="coords">
                x: {workspace.x.toFixed(1)}, y: {workspace.y.toFixed(1)}
            </StyledCoords>
            Made with <StyledHeartEmoji />
            by{' '}
            <StyledLink href="https://github.com/praghus" target="_blank" rel="noopener noreferrer">
                Piotr Praga
            </StyledLink>
            . This project is licensed under the MIT license.
        </StyledFooter>
    )
}

export default Footer
