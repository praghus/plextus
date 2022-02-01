import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    FormControl,
    Grid,
    InputAdornment,
    Radio,
    RadioGroup,
    TextField,
    Typography
} from '@mui/material'
import { IMPORT_MODES } from '../common/constants'
import { changeAppImportedImage } from '../store/app/actions'
import { createNewImageLayerFromFile, createNewTileLayerFromFile } from '../store/editor/actions'
import { selectImportedImage } from '../store/app/selectors'
import { selectCanvas, selectTileset } from '../store/editor/selectors'
import { getImage } from '../common/utils/image'
import { LayerImportConfig } from '../store/editor/types'
import ImportPreview from './ImportPreview'

const ImportDialog = (): JSX.Element => {
    const canvas = useSelector(selectCanvas)
    const tileset = useSelector(selectTileset)
    const importedImage = useSelector(selectImportedImage)

    const { t } = useTranslation()

    const dispatch = useDispatch()
    const onClose = () => dispatch(changeAppImportedImage())
    const onCreateNewImageLayerFromFile = (config: LayerImportConfig) => dispatch(createNewImageLayerFromFile(config))
    const onCreateNewTileLayerFromFile = (image: CanvasImageSource, config: LayerImportConfig) =>
        dispatch(createNewTileLayerFromFile(image, config))

    const [image, setImage] = useState<CanvasImageSource>()
    const [config, setConfig] = useState<LayerImportConfig>({
        columns: tileset.columns,
        mode: IMPORT_MODES.NEW_PROJECT,
        name: 'Imported layer',
        offset: { x: 0, y: 0 },
        resolution: { h: canvas?.height ?? 0, w: canvas?.width ?? 0 },
        tileSize: { h: tileset.tileheight, w: tileset.tilewidth }
    })

    const { columns, mode, name, offset, resolution, tileSize } = config

    const setConfigProp = (key: string, value: any): void => {
        setConfig({ ...config, [key]: value })
    }

    const handleClose = (e: any, reason: string): void => {
        if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') {
            onClose()
        }
    }

    const onSave = () => {
        config.mode === IMPORT_MODES.NEW_IMAGE
            ? onCreateNewImageLayerFromFile(config)
            : image && onCreateNewTileLayerFromFile(image, config)
    }

    useEffect(() => {
        async function onLoadImage(src: string) {
            const i = await getImage(src)
            setImage(i)
            setConfig({ ...config, resolution: { h: i.height, w: i.width } })
        }
        importedImage && onLoadImage(importedImage)
    }, [importedImage])

    useEffect(() => {
        if (mode !== IMPORT_MODES.NEW_PROJECT) {
            setConfig({
                ...config,
                columns: tileset.columns,
                tileSize: { h: tileset.tileheight, w: tileset.tilewidth }
            })
            if (mode === IMPORT_MODES.NEW_IMAGE) {
                setConfigProp('offset', { x: 0, y: 0 })
            }
        }
    }, [mode])

    return (
        <Dialog open={!!importedImage} onClose={handleClose}>
            <DialogTitle>{t('i18_import_image')}</DialogTitle>
            <DialogContent>
                {canvas && (
                    <FormControl component="fieldset">
                        <RadioGroup
                            row
                            aria-label="position"
                            name="position"
                            value={mode}
                            onChange={e => setConfigProp('mode', e.target.value as IMPORT_MODES)}
                        >
                            <FormControlLabel
                                value={IMPORT_MODES.NEW_PROJECT}
                                control={<Radio color="primary" />}
                                label={t('i18_as_a_new_project') as string}
                            />
                            <FormControlLabel
                                value={IMPORT_MODES.NEW_LAYER}
                                control={<Radio color="primary" />}
                                label={t('i18_as_a_new_layer') as string}
                            />
                            <FormControlLabel
                                value={IMPORT_MODES.NEW_IMAGE}
                                control={<Radio color="primary" />}
                                label={t('i18_as_an_image') as string}
                            />
                        </RadioGroup>
                    </FormControl>
                )}

                <TextField
                    fullWidth={true}
                    value={name}
                    onChange={e => setConfigProp('name', e.target.value)}
                    id="name"
                    label={t('i18_layer_name')}
                    size="small"
                    variant="standard"
                />

                {image && <ImportPreview {...{ config, image }} />}
                <Grid container spacing={1}>
                    {mode === IMPORT_MODES.NEW_PROJECT && (
                        <>
                            <Grid item xs={2}>
                                <TextField
                                    type="number"
                                    value={tileSize.w}
                                    onChange={event => {
                                        const w = parseInt(event.target.value)
                                        Number.isInteger(w) && w > 0 && setConfigProp('tileSize', { ...tileSize, w })
                                    }}
                                    InputProps={{
                                        inputProps: { min: 1 }
                                    }}
                                    id="width"
                                    label={t('i18_tile_width')}
                                    size="small"
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={2}>
                                <TextField
                                    type="number"
                                    value={tileSize.h}
                                    onChange={event => {
                                        const h = parseInt(event.target.value)
                                        Number.isInteger(h) && h > 0 && setConfigProp('tileSize', { ...tileSize, h })
                                    }}
                                    InputProps={{
                                        inputProps: { min: 1 }
                                    }}
                                    id="height"
                                    label={t('i18_tile_height')}
                                    size="small"
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <TextField
                                    type="number"
                                    value={columns}
                                    onChange={event => {
                                        const c = parseInt(event.target.value)
                                        Number.isInteger(c) && c > 0 && setConfigProp('columns', c)
                                    }}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">{t('i18_columns')}</InputAdornment>
                                        ),
                                        inputProps: { min: 1 }
                                    }}
                                    id="cols"
                                    label={t('i18_tileset_maximum_width')}
                                    size="small"
                                    variant="outlined"
                                />
                            </Grid>
                        </>
                    )}
                    {mode !== IMPORT_MODES.NEW_IMAGE && (
                        <>
                            <Grid item xs={2}>
                                <TextField
                                    type="number"
                                    value={offset.x}
                                    onChange={event =>
                                        setConfigProp('offset', { ...offset, x: parseInt(event.target.value) })
                                    }
                                    id="offsetX"
                                    label={t('i18_offset_x')}
                                    size="small"
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={2}>
                                <TextField
                                    type="number"
                                    value={offset.y}
                                    onChange={event =>
                                        setConfigProp('offset', { ...offset, y: parseInt(event.target.value) })
                                    }
                                    id="offsetY"
                                    label={t('i18_offset_y')}
                                    size="small"
                                    variant="outlined"
                                />
                            </Grid>
                        </>
                    )}
                </Grid>
            </DialogContent>
            <DialogActions>
                {resolution && (
                    <Typography variant="caption" display="block" sx={{ color: '#ccc', padding: '5px 20px' }}>
                        {Math.ceil(resolution.w / tileSize.w) * tileSize.w} x{' '}
                        {Math.ceil(resolution.h / tileSize.h) * tileSize.h} {t('i18_pixels')}
                    </Typography>
                )}
                <div style={{ flex: '1 0 0' }} />
                <Button onClick={onClose} color="primary">
                    {t('i18_cancel')}
                </Button>
                <Button onClick={onSave} variant="contained">
                    {t('i18_save')}
                </Button>
            </DialogActions>
        </Dialog>
    )
}
ImportDialog.displayName = 'ImportDialog'

export default ImportDialog
