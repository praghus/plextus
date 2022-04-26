import styled from '@emotion/styled'
import { Stage } from 'react-konva'

import { IMPORT_PREVIEW_WIDTH } from '../../common/constants'

export const StyledPreviewContainer = styled.div`
    width: ${IMPORT_PREVIEW_WIDTH}px;
    overflow: auto;
    margin-top: 15px;
`

export const StyledStage = styled(Stage)`
    background: #222;
    cursor: move;
`
