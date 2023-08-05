import { useMemo } from 'react'
import Konva from 'konva'
import { useDispatch } from 'react-redux'

import { Rectangle, Tileset } from '../store/editor/types'

import {
    adjustWorkspaceSize,
    crop,
    changePosition,
    changeScale,
    changeLayerData,
    changeLayerImage,
    changeLayerOffset,
    changePrimaryColor,
    changeSelectedArea,
    changeSelectedTile,
    changeTileset,
    changeTilesetImage,
    copySelectedArea,
    paste
} from '../store/editor/actions'

export const useEditorActions = () => {
    const dispatch = useDispatch()
    const actions = useMemo(
        () => ({
            onAdjustWorkspaceSize: () => dispatch(adjustWorkspaceSize()),
            onChangeLayerData: (layerId: string, data: (number | null)[]) => dispatch(changeLayerData(layerId, data)),
            onChangeLayerImage: (layerId: string, blob: Blob) => dispatch(changeLayerImage(layerId, blob)),
            onChangeLayerOffset: (layerId: string, x: number, y: number) => dispatch(changeLayerOffset(layerId, x, y)),
            onChangePosition: (pos: Konva.Vector2d) => dispatch(changePosition(pos.x, pos.y)),
            onChangePrimaryColor: (color: number[]) => dispatch(changePrimaryColor(color)),
            onChangeScale: (scale: Konva.Vector2d) => dispatch(changeScale(scale.x)),
            onChangeSelectedArea: (rect: Rectangle | null) => dispatch(changeSelectedArea(rect)),
            onChangeSelectedTile: (tileId: number) => dispatch(changeSelectedTile(tileId)),
            onChangeTileset: (tileset: Tileset) => dispatch(changeTileset(tileset)),
            onCopySelectedArea: (image: HTMLCanvasElement) => dispatch(copySelectedArea(image)),
            onCrop: () => dispatch(crop()),
            onPaste: () => dispatch(paste()),
            onSaveTilesetImage: (blob: Blob) => dispatch(changeTilesetImage(blob))
        }),
        [dispatch]
    )
    return actions
}
export type EditorActions = ReturnType<typeof useEditorActions>
