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
    if (!grid.visible || grid.width * scale < 8) {
        return null
    }
    const lines: any[] = []
    const line = (key: string, points: any[]) => (
        <Line
            dash={dash ? [2 / scale, 2 / scale] : undefined}
            {...{
                key,
                points,
                stroke: getRgbaValue(grid.color),
                strokeWidth: 0.5 / scale
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
        <Group {...{ ref, width, height }} listening={false}>
            {lines}
        </Group>
    )
})
GridLines.displayName = 'Grid'
GridLines.defaultProps = {
    dash: true
}

export default GridLines
