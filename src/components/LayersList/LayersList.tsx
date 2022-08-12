import React, { useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import {
    IconButton,
    ListItem,
    ListItemIcon,
    ListItemSecondaryAction,
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

import { createImage } from '../../common/utils/image'
import { changeItemPosition } from '../../common/utils/array'
import { createEmptyLayer, createImageLayer, getLayerById } from '../../store/editor/utils'
import { Layer } from '../../store/editor/types'
import {
    changeSelectedLayer,
    changeLayers,
    changeLayerName,
    changeLayerOpacity,
    changeLayerVisible
} from '../../store/editor/actions'
import { selectCanvas, selectSelected, selectLayers, selectTileset } from '../../store/editor/selectors'
import { ConfirmationDialog } from '../ConfirmationDialog'
import { LayerPropertiesDialog } from '../LayerPropertiesDialog'
import { ImageUpload } from '../ImageUpload'
import {
    StyledBottomContainer,
    StyledButtonContainer,
    StyledSliderContainer,
    StyledLayersList,
    StyledListItemText
} from './LayersList.styled'

const LayersList: React.FunctionComponent = () => {
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
        onChangeLayers(changeItemPosition<Layer>([...layers], from, to))
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
        const blob = await createImage(canvas.width, canvas.height)
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

            <StyledLayersList>
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
                        <ListItemIcon sx={{ minWidth: '30px' }}>
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
                            <StyledListItemText id={`checkbox-list-label-${layer.id}`} primary={layer.name} />
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
                        onChange={(e: Event, value: number | number[]) => setOpacity(value as number)}
                        onChangeCommitted={(
                            e: Event | React.SyntheticEvent<Element, Event>,
                            value: number | number[]
                        ) => onChangeLayerOpacity(currentLayer.id, value as number)}
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
                <Menu anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleClose}>
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
