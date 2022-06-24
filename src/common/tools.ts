import {
    BrightnessMedium as BrightnessMediumIcon,
    Colorize as ColorizeIcon,
    Create as CreateIcon,
    Crop as CropIcon,
    CancelPresentation as CancelPresentationIcon,
    FormatColorFill as FormatColorFillIcon,
    PanTool as PanToolIcon,
    PhotoSizeSelectSmall as PhotoSizeSelectSmallIcon,
    ControlCamera as ControlCameraIcon
} from '@mui/icons-material'

import { EraserIcon, LineIcon, StampIcon, TileReplaceIcon } from '../components/Icons'

export enum TOOLS {
    BRIGHTNESS = 'BRIGHTNESS',
    CROP = 'CROP',
    DRAG = 'DRAG',
    DELETE = 'DELETE',
    ERASER = 'ERASER',
    FILL = 'FILL',
    LINE = 'LINE',
    OFFSET = 'OFFSET',
    PENCIL = 'PENCIL',
    PICKER = 'PICKER',
    REPLACE = 'REPLACE',
    SELECT = 'SELECT',
    STAMP = 'STAMP'
}

export const TOOL_DESC = {
    [TOOLS.BRIGHTNESS]: 'Lighten [Click], Darken [Alt+Click]',
    [TOOLS.CROP]: 'Crop',
    [TOOLS.DRAG]: 'View',
    [TOOLS.DELETE]: 'Tile Remove',
    [TOOLS.ERASER]: 'Eraser',
    [TOOLS.FILL]: 'Bucket Fill',
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
    [TOOLS.FILL]: FormatColorFillIcon,
    [TOOLS.BRIGHTNESS]: BrightnessMediumIcon,
    [TOOLS.STAMP]: StampIcon,
    [TOOLS.SELECT]: PhotoSizeSelectSmallIcon,
    [TOOLS.REPLACE]: TileReplaceIcon,
    [TOOLS.DELETE]: CancelPresentationIcon,
    [TOOLS.OFFSET]: ControlCameraIcon,
    [TOOLS.CROP]: CropIcon
}

export const AVAILABLE_TOOLS = [
    TOOLS.DRAG,
    TOOLS.PENCIL,
    TOOLS.LINE,
    TOOLS.ERASER,
    TOOLS.PICKER,
    TOOLS.FILL,
    TOOLS.BRIGHTNESS,
    TOOLS.STAMP,
    TOOLS.SELECT,
    TOOLS.DELETE,
    TOOLS.REPLACE,
    TOOLS.OFFSET,
    TOOLS.CROP
]
