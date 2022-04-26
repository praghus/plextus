import { css } from '@emotion/react'

import { Selected } from '../../store/editor/types'
import { TOOLS } from '../../common/constants'

export const styles = ({ selected }: { selected: Selected }) => css`
    ${((selected.tool === TOOLS.DRAG || selected.tool === TOOLS.CROP) &&
        `
          cursor: move;
          cursor: grab;
          cursor: -moz-grab;
          cursor: -webkit-grab;

          :active {
            cursor: grabbing;
            cursor: -moz-grabbing;
            cursor: -webkit-grabbing;
          }`) ||
    ((selected.tool === TOOLS.PENCIL || selected.tool === TOOLS.ERASER) && `cursor: crosshair;`) ||
    (selected.tool === TOOLS.OFFSET && `cursor: move;`) ||
    `cursor: auto;`}
`
