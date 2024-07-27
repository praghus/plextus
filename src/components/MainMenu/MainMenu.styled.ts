import styled from '@emotion/styled'

import { commonBoxShadow, commonPaperStyle } from '../../views/App.styled'

export const StyledMenuContainer = styled.div`
    display: flex;
    flex-direction: row;
    position: absolute;
    top: 10px;
    left: 10px;
    z-index: 100;
`

export const StyledPaper = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding: 5px;
    height: 40px;
    margin-right: 10px;
    ${commonPaperStyle}
    ${commonBoxShadow}
`

export const StyledProjectName = styled.div`
    max-width: 200px;
    padding: 5px 12px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    cursor: ${({ editingName }: { editingName: null | string }) =>
        typeof editingName === 'string' ? 'default' : 'pointer'};
`
