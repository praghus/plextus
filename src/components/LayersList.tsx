import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { makeStyles } from '@material-ui/core/styles'
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
    Tooltip,
    Typography
} from '@material-ui/core'
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
} from '@material-ui/icons'
import { createEmptyImage, uploadImage } from '../common/utils/image'
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

const useStyles = makeStyles(theme => ({
    layersList: {
        width: '100%',
        position: 'relative',
        overflow: 'auto',
        maxWidth: 360,
        height: '100%',
        backgroundColor: theme.palette.background.paper
    }
}))

const StyledBottomContainer = styled.div`
    display: flex;
    justify-content: flex-end;
`

const StyledButtonContainer = styled.div`
    width: 100px;
    display: flex;
    padding: 4px;
    margin-right: 10px;
`

const StyledSliderContainer = styled.div`
    width: 212px;
    display: flex;
    padding-top: 4px;
    padding-right: 10px;
`

const LayersList = (): JSX.Element => {
    const classes = useStyles()
    const canvas = useSelector(selectCanvas)
    const layers = useSelector(selectLayers)
    const selected = useSelector(selectSelected)
    const tileset = useSelector(selectTileset)
    const reversedList = [...layers].reverse()
    const currentLayer = getLayerById(layers, selected.layerId) || layers[0]

    const [opacity, setOpacity] = useState(currentLayer ? currentLayer.opacity : 255)
    const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false)
    const [propertiesDialogOpen, setPropertiesDialogOpen] = useState(false)

    const { t } = useTranslation()

    const dispatch = useDispatch()
    const onChangeLayers = (layers: Layer[]) => dispatch(changeLayers(layers))
    const onChangeSelectedLayer = (layerId: string) => dispatch(changeSelectedLayer(layerId))
    const onChangeLayerVisible = (layerId: string, value: boolean) => dispatch(changeLayerVisible(layerId, value))
    const onChangeLayerOpacity = (layerId: string, value: number) => dispatch(changeLayerOpacity(layerId, value))
    const onChangeLayerName = (layerId: string, value: string) => dispatch(changeLayerName(layerId, value))
    const onOpacityChange = (event: any, value: any) => setOpacity(value)
    const onOpacityChangeCommitted = (event: any, value: any) => onChangeLayerOpacity(currentLayer.id, value)
    const onOpenConfirmationDialog = () => setConfirmationDialogOpen(true)
    const onCancelRemoveLayer = () => setConfirmationDialogOpen(false)

    const [editingLayer, setEditingLayer] = useState<Layer | null>()
    const [anchorEl, setAnchorEl] = useState(null)
    const selectedLayer = layers.find(({ id }) => id === selected.layerId) || null

    const handleClick = event => {
        setAnchorEl(event.currentTarget)
    }

    const handleClose = () => {
        setAnchorEl(null)
    }

    const onConfirmRemoveLayer = () => {
        const index = layers.indexOf(currentLayer)
        const newLayers = [...layers]
        newLayers.splice(index, 1)

        onChangeLayers(newLayers)
        setConfirmationDialogOpen(false)
        if (newLayers.length) {
            onChangeSelectedLayer(newLayers[newLayers.length - 1].id)
        }
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
            'New tile Layer',
            Math.round(canvas.width / tileset.tilewidth),
            Math.round(canvas.height / tileset.tileheight)
        )
        onChangeLayers([...layers, newLayer])
        onChangeSelectedLayer(newLayer.id)
        handleClose()
    }

    const onCreateImageLayer = async () => {
        const imageBlob = await createEmptyImage(canvas.width, canvas.height)
        if (imageBlob) {
            const newLayer = createImageLayer('New image Layer', imageBlob, canvas.width, canvas.height)
            onChangeLayers([...layers, newLayer])
            onChangeSelectedLayer(newLayer.id)
        }
        handleClose()
    }

    const onImageUpload = async e => {
        const file = e.target.files[0]
        const { blob, width, height } = await uploadImage(file)
        if (blob) {
            onChangeLayers([
                ...layers,
                createImageLayer(file.name.split('.').slice(0, -1).join('.'), blob, width, height)
            ])
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

    return (
        <>
            <Typography gutterBottom>{t('layers')}</Typography>
            <ConfirmationDialog
                title={t('hold_on')}
                message={t('delete_layer_confirmation')}
                open={confirmationDialogOpen}
                onConfirm={onConfirmRemoveLayer}
                onClose={onCancelRemoveLayer}
            />

            <LayerPropertiesDialog
                layer={selectedLayer}
                open={propertiesDialogOpen}
                onSave={onUpdateLayer}
                onClose={() => setPropertiesDialogOpen(false)}
            />

            <List className={classes.layersList}>
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
                                fullWidth
                                size="small"
                                type="text"
                                variant="outlined"
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
            </List>
            <StyledBottomContainer>
                <StyledSliderContainer>
                    <Slider
                        min={0}
                        max={255}
                        value={opacity}
                        onChange={onOpacityChange}
                        onChangeCommitted={onOpacityChangeCommitted}
                    />
                </StyledSliderContainer>
                <StyledButtonContainer>
                    <IconButton size="small" onClick={handleClick}>
                        <Tooltip title="New Layer" placement="top">
                            <AddIcon fontSize="small" />
                        </Tooltip>
                    </IconButton>

                    <IconButton
                        size="small"
                        disabled={layers.indexOf(currentLayer) === 0}
                        onClick={() => onChangeLayerOrder(1)}
                    >
                        <Tooltip title="Layer Order Down" placement="top">
                            <ArrowDownwardIcon fontSize="small" />
                        </Tooltip>
                    </IconButton>

                    <IconButton
                        size="small"
                        disabled={layers.indexOf(currentLayer) === layers.length - 1}
                        onClick={() => onChangeLayerOrder(-1)}
                    >
                        <Tooltip title="Layer Order Up" placement="top">
                            <ArrowUpwardIcon fontSize="small" />
                        </Tooltip>
                    </IconButton>
                    <IconButton size="small" onClick={onOpenConfirmationDialog}>
                        <Tooltip title="Delete Layer" placement="top">
                            <DeleteForeverIcon fontSize="small" />
                        </Tooltip>
                    </IconButton>
                </StyledButtonContainer>
                <Menu id="simple-menu" anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleClose}>
                    <MenuItem onClick={onCreateTileLayer}>
                        Tile layer
                        <ListItemSecondaryAction>
                            <AppsIcon fontSize="small" />
                        </ListItemSecondaryAction>
                    </MenuItem>
                    <MenuItem onClick={onCreateImageLayer}>
                        Image layer (empty)
                        <ListItemSecondaryAction>
                            <ImageIcon fontSize="small" />
                        </ListItemSecondaryAction>
                    </MenuItem>
                    <input
                        type="file"
                        hidden
                        id="upload-input"
                        accept="image/png, image/gif, image/jpeg"
                        onChange={onImageUpload}
                    />
                    <label htmlFor="upload-input">
                        <MenuItem>
                            Image layer (import)
                            <ListItemSecondaryAction>
                                <ImageSearchIcon fontSize="small" />
                            </ListItemSecondaryAction>
                        </MenuItem>
                    </label>
                </Menu>
            </StyledBottomContainer>
        </>
    )
}

export default LayersList
