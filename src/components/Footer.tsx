import React from 'react'
import styled from '@emotion/styled'

const StyledFooter = styled.div`
    display: flex;
    justify-content: left;
    padding: 6px 10px;
    border-top: 1px solid #222;
    background-color: #333;
    color: #ccc;
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

const Footer = (): JSX.Element => (
    <StyledFooter>
        Made with <StyledHeartEmoji />
        by
        <StyledLink href="https://github.com/praghus/plextus" target="_blank" rel="noopener noreferrer">
            Piotr Praga
        </StyledLink>
        . This project is licensed under the{' '}
        <StyledLink
            href="https://github.com/praghus/plextus/blob/main/LICENSE"
            target="_blank"
            rel="noopener noreferrer"
        >
            MIT license
        </StyledLink>
        .
    </StyledFooter>
)
Footer.displayName = 'Footer'

export default Footer
