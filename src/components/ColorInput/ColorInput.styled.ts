import styled from '@emotion/styled'

export const StyledColorValue = styled.div`
    cursor: ${({ editingColor }: { editingColor: null | string }) =>
        typeof editingColor === 'string' ? 'default' : 'pointer'};
`
