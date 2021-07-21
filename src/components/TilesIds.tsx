import React, { forwardRef } from 'react'
import Konva from 'konva'
import { Group, Text } from 'react-konva'
import { getRgbaValue } from '../common/utils/colors'

type Props = {
    grid: any
    height: number
    width: number
    selectedLayer: any
}

const TilesIds = forwardRef<Konva.Group | null, Props>(
    ({ grid, width, height, selectedLayer }: Props, ref) =>
        grid.visible && (
            <Group {...{ ref, width, height }} listening={false}>
                {selectedLayer &&
                    selectedLayer.data &&
                    selectedLayer.data.map((gid, i) => {
                        const x = 1 + (i % selectedLayer.width) * grid.width
                        const y = 1 + Math.ceil((i + 1) / selectedLayer.width - 1) * grid.height
                        return gid ? (
                            <Text
                                {...{ x, y }}
                                fill={getRgbaValue(grid.color)}
                                fontSize={2.5}
                                text={gid}
                                key={`${x}-${y}`}
                            />
                        ) : null
                    })}
            </Group>
        )
)
TilesIds.displayName = 'TilesIds'

export default TilesIds
