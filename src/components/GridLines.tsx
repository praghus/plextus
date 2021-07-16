import React, { forwardRef } from 'react'
import { Group, Line } from 'react-konva'
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
    const line = (key: string, points: any[]) => (
        <Line
            dash={dash && grid.width * scale > 8 ? [2 / scale, 2 / scale] : undefined}
            {...{
                key,
                points,
                stroke: getRgbaValue(grid.color),
                strokeWidth: (grid.width * scale > 8 ? 0.5 : 0.2) / scale
            }}
        />
    )

    for (let i = 1; i < width / grid.width; i += 1) {
        lines.push(line(`w${i}`, [Math.round(i * grid.width), 0, Math.round(i * grid.width), height]))
    }

    for (let j = 1; j < height / grid.height; j += 1) {
        lines.push(line(`h${j}`, [0, Math.round(j * grid.height), width, Math.round(j * grid.height)]))
    }

    return (
        grid.visible && (
            <Group {...{ ref, width, height }} listening={false}>
                {lines}
            </Group>
        )
    )
})
GridLines.displayName = 'Grid'
GridLines.defaultProps = {
    dash: true
}

export default GridLines
