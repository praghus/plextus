import {
    BrightnessMedium as BrightnessMediumIcon,
    Colorize as ColorizeIcon,
    Create as CreateIcon,
    Crop as CropIcon,
    CancelPresentation as CancelPresentationIcon,
    FormatColorFill as FormatColorFillIcon,
    PanTool as PanToolIcon,
    PhotoSizeSelectSmall as PhotoSizeSelectSmallIcon,
    ControlCamera as ControlCameraIcon,
    FormatPaint as FormatPaintIcon
} from '@mui/icons-material'

import { EraserIcon, LineIcon, StampIcon, TileReplaceIcon } from '../components/Icons'

export enum TOOLS {
    BRIGHTNESS = 'BRIGHTNESS',
    COLOR_FILL = 'COLOR_FILL',
    CROP = 'CROP',
    DRAG = 'DRAG',
    DELETE = 'DELETE',
    ERASER = 'ERASER',
    LINE = 'LINE',
    OFFSET = 'OFFSET',
    PENCIL = 'PENCIL',
    PICKER = 'PICKER',
    REPLACE = 'REPLACE',
    SELECT = 'SELECT',
    STAMP = 'STAMP',
    TILE_FILL = 'TILE_FILL'
}

export const TOOL_DESC = {
    [TOOLS.BRIGHTNESS]: 'Lighten [Click], Darken [Alt+Click]',
    [TOOLS.COLOR_FILL]: 'Color Fill',
    [TOOLS.TILE_FILL]: 'Tile Fill',
    [TOOLS.CROP]: 'Crop',
    [TOOLS.DRAG]: 'View',
    [TOOLS.DELETE]: 'Tile Remove',
    [TOOLS.ERASER]: 'Eraser',
    [TOOLS.LINE]: 'Pixel Line',
    [TOOLS.OFFSET]: 'Offset',
    [TOOLS.PENCIL]: 'Pixel',
    [TOOLS.PICKER]: 'Color Picker',
    [TOOLS.REPLACE]: 'Tile Replace',
    [TOOLS.SELECT]: 'Select',
    [TOOLS.STAMP]: 'Tile Stamp [Click], Tile Clone [Alt+Click]'
}

export const TOOL_ICONS: Record<keyof typeof TOOLS, React.ElementType> = {
    [TOOLS.DRAG]: PanToolIcon,
    [TOOLS.PENCIL]: CreateIcon,
    [TOOLS.LINE]: LineIcon,
    [TOOLS.ERASER]: EraserIcon,
    [TOOLS.PICKER]: ColorizeIcon,
    [TOOLS.COLOR_FILL]: FormatColorFillIcon,
    [TOOLS.BRIGHTNESS]: BrightnessMediumIcon,
    [TOOLS.STAMP]: StampIcon,
    [TOOLS.SELECT]: PhotoSizeSelectSmallIcon,
    [TOOLS.REPLACE]: TileReplaceIcon,
    [TOOLS.DELETE]: CancelPresentationIcon,
    [TOOLS.OFFSET]: ControlCameraIcon,
    [TOOLS.CROP]: CropIcon,
    [TOOLS.TILE_FILL]: FormatPaintIcon
}

export const AVAILABLE_TOOLS = [
    TOOLS.DRAG,
    TOOLS.PENCIL,
    TOOLS.LINE,
    TOOLS.ERASER,
    TOOLS.PICKER,
    TOOLS.COLOR_FILL,
    TOOLS.BRIGHTNESS,
    TOOLS.STAMP,
    TOOLS.SELECT,
    TOOLS.DELETE,
    TOOLS.REPLACE,
    TOOLS.TILE_FILL,
    TOOLS.OFFSET,
    TOOLS.CROP
]
