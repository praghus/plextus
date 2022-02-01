import React, { useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import styled from '@emotion/styled'
import {
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemSecondaryAction,
    ListItemText,
    Menu,
    MenuItem,
    Slider,
    TextField,
    Tooltip
} from '@mui/material'
import {
    Add as AddIcon,
    Apps as AppsIcon,
    ArrowDownward as ArrowDownwardIcon,
    ArrowUpward as ArrowUpwardIcon,
    DeleteForever as DeleteForeverIcon,
    Image as ImageIcon,
    ImageSearch as ImageSearchIcon,
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material'
import { createEmptyImage } from '../common/utils/image'
import { changeItemPosition } from '../common/utils/array'
import { createEmptyLayer, createImageLayer, getLayerById } from '../store/editor/utils'
import { Layer } from '../store/editor/types'
import {
    changeSelectedLayer,
    changeLayers,
    changeLayerName,
    changeLayerOpacity,
    changeLayerVisible
} from '../store/editor/actions'
import { selectCanvas, selectSelected, selectLayers, selectTileset } from '../store/editor/selectors'
import ConfirmationDialog from './ConfirmationDialog'
import LayerPropertiesDialog from './LayerPropertiesDialog'
import ImageUpload from './ImageUpload'

const StyledBottomContainer = styled.div`
    display: flex;
    justify-content: flex-end;
`

const StyledButtonContainer = styled.div`
    width: 115px;
    display: flex;
    padding: 4px;
    margin-right: 10px;
`

const StyledSliderContainer = styled.div`
    width: 200px;
    display: flex;
    padding-top: 4px;
    padding-right: 10px;
`

const StyledLayersList = styled(List)`
    ::-webkit-scrollbar {
        width: 0.7em;
        height: 0.7em;
    }
    ::-webkit-scrollbar-corner {
        background-color: #252525;
    }
    ::-webkit-scrollbar-track {
        background-color: #252525;
    }
    ::-webkit-scrollbar-thumb {
        background-color: #666;
        outline: 1px solid #666;
    }
`

const LayersList = (): JSX.Element => {
    const canvas = useSelector(selectCanvas)
    const layers = useSelector(selectLayers)
    const selected = useSelector(selectSelected)
    const tileset = useSelector(selectTileset)
    const reversedList = [...layers].reverse()
    const currentLayer = getLayerById(layers, selected.layerId) || layers[0]

    const [opacity, setOpacity] = useState(currentLayer ? currentLayer.opacity : 255)
    const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false)
    const [propertiesDialogOpen, setPropertiesDialogOpen] = useState(false)
    const [editingLayer, setEditingLayer] = useState<Layer | null>()
    const [anchorEl, setAnchorEl] = useState<HTMLAnchorElement | null>(null)

    const { t } = useTranslation()

    const dispatch = useDispatch()
    const onChangeLayers = (layers: Layer[]) => dispatch(changeLayers(layers))
    const onChangeSelectedLayer = (layerId: string) => dispatch(changeSelectedLayer(layerId))
    const onChangeLayerVisible = (layerId: string, value: boolean) => dispatch(changeLayerVisible(layerId, value))
    const onChangeLayerOpacity = (layerId: string, value: number) => dispatch(changeLayerOpacity(layerId, value))
    const onChangeLayerName = (layerId: string, value: string) => dispatch(changeLayerName(layerId, value))
    const onOpacityChange = (e: any, value: any) => setOpacity(value)
    const onOpacityChangeCommitted = (e: any, value: any) => onChangeLayerOpacity(currentLayer.id, value)
    const handleClick = (e: React.MouseEvent) => setAnchorEl(e.currentTarget as HTMLAnchorElement)
    const handleClose = () => setAnchorEl(null)

    const onRemoveLayer = () => {
        const index = layers.indexOf(currentLayer)
        const newLayers = [...layers]
        newLayers.splice(index, 1)
        onChangeLayers(newLayers)
        setConfirmationDialogOpen(false)
        newLayers.length && onChangeSelectedLayer(newLayers[newLayers.length - 1].id)
    }

    const onRenameLayer = () => {
        if (editingLayer) {
            onChangeLayerName(editingLayer.id, editingLayer.name)
            setEditingLayer(null)
        }
    }

    const onChangeLayerOrder = (dir: number) => {
        const index = layers.indexOf(currentLayer)
        const from = dir > 0 ? index - 1 : index
        const to = dir > 0 ? index : index + 1
        onChangeLayers(changeItemPosition([...layers], from, to))
    }

    const onCreateTileLayer = () => {
        const newLayer = createEmptyLayer(
            t('i18_new_tile_layer'),
            Math.round(canvas.width / tileset.tilewidth),
            Math.round(canvas.height / tileset.tileheight)
        )
        onChangeLayers([...layers, newLayer])
        onChangeSelectedLayer(newLayer.id)
        handleClose()
    }

    const onCreateImageLayer = async () => {
        const blob = await createEmptyImage(canvas.width, canvas.height)
        if (blob) {
            const newLayer = createImageLayer(
                t('i18_new_image_layer'),
                window.URL.createObjectURL(blob),
                canvas.width,
                canvas.height
            )
            onChangeLayers([...layers, newLayer])
            onChangeSelectedLayer(newLayer.id)
        }
        handleClose()
    }

    const onUpdateLayer = (model: Layer | null) => {
        if (model) {
            const changedLayers = layers.map((layer: Layer) => (layer.id === model.id ? model : layer))
            setOpacity(model.opacity)
            onChangeLayers(changedLayers)
        }
        setPropertiesDialogOpen(false)
    }

    const selectedLayer = useMemo(
        () => layers.find(({ id }) => id === selected.layerId) || null,
        [layers, selected.layerId]
    )

    return (
        <>
            <ConfirmationDialog
                title={t('i18_hold_on')}
                message={t('i18_delete_layer_confirmation')}
                open={confirmationDialogOpen}
                onConfirm={onRemoveLayer}
                onClose={() => setConfirmationDialogOpen(false)}
            />
            <LayerPropertiesDialog
                layer={selectedLayer}
                open={propertiesDialogOpen}
                onSave={onUpdateLayer}
                onClose={() => setPropertiesDialogOpen(false)}
            />
            <StyledLayersList
                sx={{
                    backgroundColor: theme => theme.palette.background.paper,
                    height: '100%',
                    marginTop: '10px',
                    maxWidth: 360,
                    overflow: 'auto',
                    position: 'relative',
                    width: '100%'
                }}
            >
                {reversedList.map((layer: Layer) => (
                    <ListItem
                        dense
                        button
                        key={layer.id}
                        selected={layer.id === selected.layerId}
                        onClick={() => {
                            const l = getLayerById(layers, layer.id)
                            if (l) {
                                setOpacity(l.opacity)
                                onChangeSelectedLayer(l.id)
                            }
                        }}
                        onDoubleClick={() => {
                            setEditingLayer(layer)
                        }}
                    >
                        <ListItemIcon>
                            <IconButton
                                edge="start"
                                onClick={() => {
                                    setPropertiesDialogOpen(true)
                                }}
                            >
                                {layer.image ? <ImageIcon fontSize="small" /> : <AppsIcon fontSize="small" />}
                            </IconButton>
                        </ListItemIcon>
                        {layer.id === editingLayer?.id ? (
                            <TextField
                                autoFocus
                                fullWidth={true}
                                size="small"
                                type="text"
                                variant="standard"
                                value={editingLayer.name}
                                onBlur={onRenameLayer}
                                onChange={e => {
                                    setEditingLayer({ ...editingLayer, name: e.target.value })
                                }}
                                onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                        onRenameLayer()
                                    }
                                    if (e.key === 'Escape') {
                                        setEditingLayer(null)
                                    }
                                }}
                            />
                        ) : (
                            <ListItemText id={`checkbox-list-label-${layer.id}`} primary={layer.name} />
                        )}
                        <ListItemSecondaryAction>
                            <IconButton
                                edge="end"
                                onClick={() => {
                                    onChangeLayerVisible(layer.id, !layer.visible)
                                }}
                            >
                                {layer.visible ? (
                                    <VisibilityIcon fontSize="small" />
                                ) : (
                                    <VisibilityOffIcon fontSize="small" />
                                )}
                            </IconButton>
                        </ListItemSecondaryAction>
                    </ListItem>
                ))}
            </StyledLayersList>
            <StyledBottomContainer>
                <StyledSliderContainer>
                    <Slider
                        size="small"
                        min={0}
                        max={255}
                        value={opacity}
                        onChange={onOpacityChange}
                        onChangeCommitted={onOpacityChangeCommitted}
                    />
                </StyledSliderContainer>
                <StyledButtonContainer>
                    <IconButton size="small" onClick={handleClick}>
                        <Tooltip title={t('i18_new_layer') as string} placement="top">
                            <AddIcon fontSize="small" />
                        </Tooltip>
                    </IconButton>
                    <IconButton
                        size="small"
                        disabled={layers.indexOf(currentLayer) === 0}
                        onClick={() => onChangeLayerOrder(1)}
                    >
                        <Tooltip title={t('i18_layer_order_down') as string} placement="top">
                            <ArrowDownwardIcon fontSize="small" />
                        </Tooltip>
                    </IconButton>
                    <IconButton
                        size="small"
                        disabled={layers.indexOf(currentLayer) === layers.length - 1}
                        onClick={() => onChangeLayerOrder(-1)}
                    >
                        <Tooltip title={t('i18_layer_order_up') as string} placement="top">
                            <ArrowUpwardIcon fontSize="small" />
                        </Tooltip>
                    </IconButton>
                    <IconButton size="small" onClick={() => setConfirmationDialogOpen(true)}>
                        <Tooltip title={t('i18_delete_layer') as string} placement="top">
                            <DeleteForeverIcon fontSize="small" />
                        </Tooltip>
                    </IconButton>
                </StyledButtonContainer>
                <Menu
                    anchorEl={anchorEl}
                    keepMounted
                    open={Boolean(anchorEl)}
                    PaperProps={{
                        elevation: 0,
                        sx: {
                            '& .MuiAvatar-root': {
                                height: 32,
                                ml: -0.5,
                                mr: 1,
                                width: 32
                            },
                            '&:before': {
                                bgcolor: 'background.paper',
                                content: '""',
                                display: 'block',
                                height: 10,
                                position: 'absolute',
                                right: 14,
                                top: 0,
                                transform: 'translateY(-50%) rotate(45deg)',
                                width: 10,
                                zIndex: 0
                            },
                            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                            mt: 1.5,
                            overflow: 'visible'
                        }
                    }}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    onClose={handleClose}
                >
                    <MenuItem onClick={onCreateTileLayer}>
                        <ListItemIcon>
                            <AppsIcon fontSize="small" />
                        </ListItemIcon>
                        {t('i18_tile_layer')}
                    </MenuItem>
                    <MenuItem onClick={onCreateImageLayer}>
                        <ListItemIcon>
                            <ImageIcon fontSize="small" />
                        </ListItemIcon>
                        {t('i18_image_layer')}
                    </MenuItem>
                    <ImageUpload>
                        <MenuItem onClick={handleClose}>
                            <ListItemIcon>
                                <ImageSearchIcon fontSize="small" />
                            </ListItemIcon>
                            {t('i18_import_image')}
                        </MenuItem>
                    </ImageUpload>
                </Menu>
            </StyledBottomContainer>
        </>
    )
}
LayersList.displayName = 'LayersList'

export default LayersList
