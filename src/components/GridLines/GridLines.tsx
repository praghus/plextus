import React, { forwardRef, ReactElement, useMemo } from 'react'
import Konva from 'konva'
import { Theme } from '@mui/material/styles'
import { Group, Line } from 'react-konva'
import { getRgbaValue } from '../../common/utils/colors'
import { Grid } from '../../store/editor/types'

interface Props {
    grid: Grid
    height: number
    scale: number
    width: number
    dash?: boolean
    x?: number
    y?: number
    theme: Theme
}

const GridLines = forwardRef<Konva.Group | null, Props>(
    ({ grid, width, height, scale, dash, x, y, theme }: Props, ref) => {
        const stroke = grid.color ? getRgbaValue(grid.color) : (theme.palette.mode === 'dark' && '#fff') || '#000'
        const mesh = useMemo(() => {
            const lines: ReactElement[] = []
            const getWidth = (i: number) => (grid.pitch && i % grid.pitch === 0 ? 0.6 / scale : 0.2 / scale)
            const line = (key: string, points: number[], strokeWidth: number): ReactElement => (
                <Line
                    dash={dash && grid.width * scale > 8 ? [2 / scale, 2 / scale] : undefined}
                    {...{ key, points, stroke, strokeWidth }}
                />
            )
            for (let i = 1; i < width / grid.width; i += 1) {
                lines.push(
                    line(`w${i}`, [Math.round(i * grid.width), 0, Math.round(i * grid.width), height], getWidth(i))
                )
            }
            for (let j = 1; j < height / grid.height; j += 1) {
                lines.push(
                    line(`h${j}`, [0, Math.round(j * grid.height), width, Math.round(j * grid.height)], getWidth(j))
                )
            }
            return lines
        }, [grid, scale, dash, width, height, stroke])

        return grid.visible ? (
            <Group {...{ height, ref, width }} listening={false} {...{ x, y }}>
                {mesh}
                {/* <Rect stroke={getRgbaValue(grid.color)} strokeWidth={0.5 / scale} {...{ height, width }} /> */}
            </Group>
        ) : null
    }
)

GridLines.defaultProps = {
    dash: true
}

export default GridLines
