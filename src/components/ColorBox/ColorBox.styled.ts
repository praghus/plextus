import styled from '@emotion/styled'

export const StyledColorBox = styled.div`
    display: inline-flex;
    width: 18px;
    height: 18px;
    margin: 1px;
    text-decoration: none;
    font-size: 0;
    user-select: none;
    cursor: pointer;
    border-radius: 3px;

    &:active {
        border: 1px solid #222;
    }

    &.selected {
        border: 2px solid rgba(255, 255, 255, 0.5);
    }
`
