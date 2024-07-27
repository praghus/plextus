import Konva from 'konva'
import { forwardRef, ReactElement, useMemo } from 'react'
import { Theme } from '@mui/material/styles'
import { Group, Line } from 'react-konva'
import { getRgbaValue } from '../../common/utils/colors'
import { Grid } from '../../stores/editor/types'

interface Props {
    grid: Grid
    height: number
    scale: number
    width: number
    x?: number
    y?: number
    theme: Theme
}

const GridLines = forwardRef<Konva.Group | null, Props>(({ grid, width, height, scale, x, y, theme }: Props, ref) => {
    const stroke = grid.color ? getRgbaValue(grid.color) : (theme.palette.mode === 'dark' && '#fff') || '#000'

    const mesh = useMemo(() => {
        const lines: ReactElement[] = []
        const getWidth = (i: number) => (grid.pitch && i % grid.pitch === 0 ? 0.6 / scale : 0.2 / scale)

        for (let i = 1; i < width / grid.width; i += 1)
            lines.push(
                <Line
                    key={`i-${i}`}
                    dash={grid.width * scale > 8 ? [2 / scale, 2 / scale] : undefined}
                    points={[Math.round(i * grid.width), 0, Math.round(i * grid.width), height]}
                    strokeWidth={getWidth(i)}
                    {...{ stroke }}
                />
            )

        for (let j = 1; j < height / grid.height; j += 1)
            lines.push(
                <Line
                    key={`j-${j}`}
                    dash={grid.width * scale > 8 ? [2 / scale, 2 / scale] : undefined}
                    points={[0, Math.round(j * grid.height), width, Math.round(j * grid.height)]}
                    strokeWidth={getWidth(j)}
                    {...{ stroke }}
                />
            )

        return lines
    }, [grid, scale, width, height, stroke])

    return grid.visible ? (
        <Group {...{ height, ref, width }} listening={false} {...{ x, y }}>
            {mesh}
            {/* <Rect stroke={getRgbaValue(grid.color)} strokeWidth={0.5 / scale} {...{ height, width }} /> */}
        </Group>
    ) : null
})
GridLines.displayName = 'GridLines'

export default GridLines
