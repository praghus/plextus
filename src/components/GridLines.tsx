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
                strokeWidth: 0.8 / scale
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
            {/* {selectedLayer && selectedLayer.data && selectedLayer.data.map((gid, i) => {
        const x = 1 + (i % selectedLayer.width) * grid.width
        const y = 1 + Math.ceil(((i + 1) / selectedLayer.width) - 1) * grid.height
        return gid ?
          <Text {...{ x, y }} fill={getRgbaValue(grid.color)} fontSize={4.5} text={gid} key={`${x}-${y}`} /> :
          null
      })} */}
        </Group>
    )
})
GridLines.displayName = 'Grid'
GridLines.defaultProps = {
    dash: true
}

export default GridLines
