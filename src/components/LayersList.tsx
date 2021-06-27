import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { v4 as uuidv4 } from 'uuid'
import { makeStyles } from '@material-ui/core/styles'
import styled from '@emotion/styled'
import {
    List,
    ListItem,
    ListItemIcon,
    ListItemSecondaryAction,
    ListItemText,
    IconButton,
    Typography,
    Slider
} from '@material-ui/core'
import {
    Add as AddIcon,
    Apps as AppsIcon,
    ArrowDownward as ArrowDownwardIcon,
    ArrowUpward as ArrowUpwardIcon,
    DeleteForever as DeleteForeverIcon,
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon
} from '@material-ui/icons'

import { changeItemPosition } from '../common/utils/array'
import { getLayerById } from '../store/editor/utils'
import { Layer } from '../store/editor/types'
import { changeSelectedLayer, changeLayers, changeLayerOpacity, changeLayerVisible } from '../store/editor/actions'
import { selectCanvas, selectSelected, selectLayers, selectTileset } from '../store/editor/selectors'
import ConfirmationDialog from './ConfirmationDialog'

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

    const [opacity, setOpacity] = React.useState(currentLayer ? currentLayer.opacity : 255)
    const [confirmationDialogOpen, setConfirmationDialogOpen] = React.useState(false)

    const { t } = useTranslation()

    const dispatch = useDispatch()
    const onChangeLayers = (layers: Layer[]) => dispatch(changeLayers(layers))
    const onChangeSelectedLayer = (layerId: string) => dispatch(changeSelectedLayer(layerId))
    const onChangeLayerVisible = (layerId: string, value: boolean) => dispatch(changeLayerVisible(layerId, value))
    const onChangeLayerOpacity = (layerId: string, value: number) => dispatch(changeLayerOpacity(layerId, value))
    const onOpenConfirmationDialog = () => setConfirmationDialogOpen(true)
    const onCancelRemoveLayer = () => setConfirmationDialogOpen(false)
    const onOpacityChange = (event: any, value: any) => setOpacity(value)
    const onOpacityChangeCommitted = (event: any, value: any) => onChangeLayerOpacity(currentLayer.id, value)

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

    const onChangeLayerOrder = (dir: number) => {
        const index = layers.indexOf(currentLayer)
        const from = dir > 0 ? index - 1 : index
        const to = dir > 0 ? index : index + 1

        onChangeLayers(changeItemPosition([...layers], from, to))
    }

    const onCreateNewLayer = () => {
        const newLayer = {
            id: uuidv4(),
            opacity: 255,
            visible: true,
            name: 'New Layer',
            width: Math.round(canvas.width / tileset.tilewidth),
            height: Math.round(canvas.height / tileset.tileheight),
            data: []
        }
        onChangeLayers([...layers, newLayer])
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
            <List className={classes.layersList}>
                {reversedList.map(({ id, name, visible }) => (
                    <ListItem
                        key={id}
                        dense
                        button
                        selected={id === selected.layerId}
                        onClick={() => {
                            setOpacity(getLayerById(layers, id).opacity)
                            onChangeSelectedLayer(id)
                        }}
                    >
                        <ListItemIcon>
                            <AppsIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText id={`checkbox-list-label-${id}`} primary={name} />
                        <ListItemSecondaryAction>
                            <IconButton
                                edge="end"
                                aria-label="comments"
                                onClick={() => {
                                    onChangeLayerVisible(id, !visible)
                                }}
                            >
                                {visible ? <VisibilityIcon fontSize="small" /> : <VisibilityOffIcon fontSize="small" />}
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
                    <IconButton size="small" onClick={onCreateNewLayer}>
                        <AddIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                        size="small"
                        disabled={layers.indexOf(currentLayer) === 0}
                        onClick={() => onChangeLayerOrder(1)}
                    >
                        <ArrowDownwardIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                        size="small"
                        disabled={layers.indexOf(currentLayer) === layers.length - 1}
                        onClick={() => onChangeLayerOrder(-1)}
                    >
                        <ArrowUpwardIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={onOpenConfirmationDialog}>
                        <DeleteForeverIcon fontSize="small" />
                    </IconButton>
                </StyledButtonContainer>
            </StyledBottomContainer>
        </>
    )
}

export default LayersList
