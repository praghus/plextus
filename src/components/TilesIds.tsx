import React, { forwardRef } from 'react'
import Konva from 'konva'
import { Group, Rect, Text } from 'react-konva'
import { getRgbaValue } from '../common/utils/colors'
import { BG_IMAGE_DARK } from '../common/constants'

type Props = {
    grid: any
    height: number
    width: number
    scale: number
    selectedLayer: any
}

const TilesIds = forwardRef<Konva.Group | null, Props>(({ grid, width, height, scale, selectedLayer }: Props, ref) => {
    return (
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
                    // ) : (
                    //     <Rect
                    //         {...{ x: x - 1, y: y - 1 }}
                    //         width={grid.width}
                    //         height={grid.height}
                    //         fillPatternImage={BG_IMAGE_DARK}
                    //         fillPatternScaleX={1 / scale}
                    //         fillPatternScaleY={1 / scale}
                    //     />
                    // )
                })}
        </Group>
    )
})
TilesIds.displayName = 'TilesIds'

export default TilesIds
