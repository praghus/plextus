import React, { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { debounce } from 'lodash'
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    FormControl,
    Grid,
    InputAdornment,
    LinearProgress,
    Radio,
    RadioGroup,
    Switch,
    TextField,
    Typography
} from '@mui/material'
import { IMPORT_MODES } from '../../common/constants'
import { changeAppImportedImage } from '../../store/app/actions'
import { createNewImageLayerFromFile, createNewTileLayerFromFile } from '../../store/editor/actions'
import { selectImportedImage } from '../../store/app/selectors'
import { selectCanvas, selectTileset } from '../../store/editor/selectors'
import { getImage } from '../../common/utils/image'
import { LayerImportConfig } from '../../store/editor/types'
import { ImportPreview } from '../ImportPreview'

const ImportDialog: React.FunctionComponent = () => {
    const canvas = useSelector(selectCanvas)
    const tileset = useSelector(selectTileset)
    const importedImage = useSelector(selectImportedImage)

    const { t } = useTranslation()

    const dispatch = useDispatch()
    const onClose = () => dispatch(changeAppImportedImage())
    const onCreateNewImageLayerFromFile = useCallback(
        debounce((config: LayerImportConfig) => dispatch(createNewImageLayerFromFile(config)), 300),
        []
    )
    const onCreateNewTileLayerFromFile = useCallback(
        debounce(
            (image: CanvasImageSource, config: LayerImportConfig) =>
                dispatch(createNewTileLayerFromFile(image, config)),
            300
        ),
        []
    )

    const [isProcessing, setIsProcessing] = useState(false)
    const [image, setImage] = useState<CanvasImageSource>()
    const [config, setConfig] = useState<LayerImportConfig>({
        colorsCount: 256,
        columns: tileset.columns,
        mode: IMPORT_MODES.NEW_PROJECT,
        name: 'Imported layer',
        offset: { x: 0, y: 0 },
        reducedColors: false,
        resolution: { h: canvas?.height ?? 0, w: canvas?.width ?? 0 },
        tileSize: { h: tileset.tileheight, w: tileset.tilewidth }
    })

    const { columns, colorsCount, mode, name, offset, reducedColors, resolution, tileSize } = config

    const setConfigProp = (
        key: string,
        value: boolean | number | string | { x?: number; y?: number; w?: number; h?: number }
    ): void => {
        setConfig({ ...config, [key]: value })
    }

    const handleClose = (e: React.SyntheticEvent<Element, Event>, reason: string): void => {
        if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') {
            onClose()
        }
    }

    const onSave = () => {
        setIsProcessing(true)
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
        if (importedImage) {
            setIsProcessing(false)
            onLoadImage(importedImage)
        }
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
            {isProcessing ? (
                <Box sx={{ width: '100%' }} p={2}>
                    <LinearProgress />
                </Box>
            ) : (
                <DialogContent>
                    <Box component="form" noValidate autoComplete="off">
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
                                            onChange={e => {
                                                const w = parseInt(e.target.value)
                                                Number.isInteger(w) &&
                                                    w > 0 &&
                                                    setConfigProp('tileSize', { ...tileSize, w })
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
                                            onChange={e => {
                                                const h = parseInt(e.target.value)
                                                Number.isInteger(h) &&
                                                    h > 0 &&
                                                    setConfigProp('tileSize', { ...tileSize, h })
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
                                            onChange={e => {
                                                const c = parseInt(e.target.value)
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
                                            onChange={e =>
                                                setConfigProp('offset', { ...offset, x: parseInt(e.target.value) })
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
                                            onChange={e =>
                                                setConfigProp('offset', { ...offset, y: parseInt(e.target.value) })
                                            }
                                            id="offsetY"
                                            label={t('i18_offset_y')}
                                            size="small"
                                            variant="outlined"
                                        />
                                    </Grid>
                                </>
                            )}
                            {mode === IMPORT_MODES.NEW_PROJECT && (
                                <>
                                    <Grid item xs={8} mt={2}>
                                        <FormControlLabel
                                            label={t('i18_use_reduced_palette') as string}
                                            control={
                                                <Switch
                                                    checked={reducedColors}
                                                    name="reduced"
                                                    onChange={e => setConfigProp('reducedColors', e.target.checked)}
                                                />
                                            }
                                            sx={{ marginLeft: '10px', marginRight: 'auto' }}
                                        />
                                    </Grid>
                                    <Grid item xs={4} mt={2}>
                                        <TextField
                                            type="number"
                                            disabled={!config.reducedColors}
                                            value={colorsCount}
                                            onChange={e => {
                                                const c = parseInt(e.target.value)
                                                Number.isInteger(c) && c > 1 && setConfigProp('colorsCount', c)
                                            }}
                                            InputProps={{
                                                inputProps: { min: 2 }
                                            }}
                                            id="width"
                                            label={t('i18_colors')}
                                            size="small"
                                            variant="outlined"
                                        />
                                    </Grid>
                                </>
                            )}
                        </Grid>
                    </Box>
                </DialogContent>
            )}
            <DialogActions>
                {resolution && (
                    <Typography variant="caption" display="block" sx={{ color: '#ccc', padding: '5px 20px' }}>
                        {Math.ceil(resolution.w / tileSize.w) * tileSize.w} x{' '}
                        {Math.ceil(resolution.h / tileSize.h) * tileSize.h} {t('i18_pixels')}
                    </Typography>
                )}
                <div style={{ flex: '1 0 0' }} />
                <Button onClick={onClose} color="primary" disabled={isProcessing}>
                    {t('i18_cancel')}
                </Button>
                <Button onClick={onSave} variant="contained" disabled={isProcessing}>
                    {t('i18_save')}
                </Button>
            </DialogActions>
        </Dialog>
    )
}
ImportDialog.displayName = 'ImportDialog'

export default ImportDialog
