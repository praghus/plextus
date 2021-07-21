import React, { forwardRef, useCallback } from 'react'
import { Group, Line, Rect } from 'react-konva'
import { getRgbaValue } from '../common/utils/colors'
import Konva from 'konva'

type Props = {
    grid: any
    height: number
    scale: number
    width: number
    dash?: boolean
}

const GridLines = forwardRef<Konva.Group | null, Props>(({ grid, width, height, scale, dash }: Props, ref) => {
    const lines: any[] = []

    const getStrokeWidth = useCallback(
        (i: number) => (grid.pitch && i % grid.pitch === 0 ? 0.6 / scale : 0.3 / scale),
        [grid.pitch, scale]
    )

    const line = (key: string, points: any[], strokeWidth) => (
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

    return (
        grid.visible && (
            <Group {...{ ref, width, height }} listening={false}>
                {lines}
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
