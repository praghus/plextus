import React, { forwardRef, useMemo } from 'react'
import { Group, Line, Rect } from 'react-konva'
import { getRgbaValue } from '../common/utils/colors'
import Konva from 'konva'

type Props = {
    grid: any
    height: number
    scale: number
    width: number
    dash?: boolean
    x?: number
    y?: number
}

const GridLines = forwardRef<Konva.Group | null, Props>(({ grid, width, height, scale, dash, x, y }: Props, ref) => {
    const mesh = useMemo(() => {
        const lines: any[] = []
        const getStrokeWidth = (i: number) => (grid.pitch && i % grid.pitch === 0 ? 0.5 / scale : 0.2 / scale)
        const line = (key: string, points: any[], strokeWidth: number) => (
            <Line
                dash={dash && grid.width * scale > 8 ? [2 / scale, 1 / scale] : undefined}
                {...{
                    key,
                    points,
                    stroke: getRgbaValue(grid.color),
                    strokeWidth
                }}
            />
        )
        for (let i = 1; i < width / grid.width; i += 1) {
            lines.push(
                line(`w${i}`, [Math.round(i * grid.width), 0, Math.round(i * grid.width), height], getStrokeWidth(i))
            )
        }
        for (let j = 1; j < height / grid.height; j += 1) {
            lines.push(
                line(`h${j}`, [0, Math.round(j * grid.height), width, Math.round(j * grid.height)], getStrokeWidth(j))
            )
        }
        return lines
    }, [grid.pitch, grid.width, grid.color, grid.height, scale, dash, width, height])

    return (
        grid.visible && (
            <Group {...{ ref, width, height }} listening={false} {...{ x, y }}>
                {mesh}
                <Rect stroke={getRgbaValue(grid.color)} strokeWidth={0.5 / scale} {...{ width, height }} />
            </Group>
        )
    )
})
GridLines.displayName = 'Grid'
GridLines.defaultProps = {
    dash: true
}

export default GridLines
