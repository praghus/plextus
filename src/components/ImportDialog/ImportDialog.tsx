import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
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
import { getImage, reduceColors } from '../../common/utils/image'
import { LayerImportConfig } from '../../store/editor/types'
import { ImportPreview } from '../ImportPreview'
import { dataURLToBlob } from '../../common/utils/data'

const ImportDialog: React.FunctionComponent = () => {
    const canvas = useSelector(selectCanvas)
    const tileset = useSelector(selectTileset)
    const importedImage = useSelector(selectImportedImage)

    const { t } = useTranslation()

    const dispatch = useDispatch()
    const onClose = () => dispatch(changeAppImportedImage())
    const [isProcessing, setIsProcessing] = useState(false)
    const [image, setImage] = useState<CanvasImageSource>()
    const [imageUrl, setImageUrl] = useState<string>()
    const [columns, setColumns] = useState(tileset?.columns || 10)
    const [colorsCount, setColorsCount] = useState(255)
    const [mode, setMode] = useState(IMPORT_MODES.NEW_PROJECT)
    const [name, setName] = useState('')
    const [offset, setOffset] = useState<Vec2>({ x: 0, y: 0 })
    const [reducedColors, setReducedColors] = useState(false)
    const [resolution, setResolution] = useState<Dim>({ h: canvas?.height ?? 0, w: canvas?.width ?? 0 })
    const [tileSize, setTileSize] = useState<Dim>({ h: tileset.tileheight, w: tileset.tilewidth })

    const config: LayerImportConfig = {
        colorsCount,
        columns,
        image,
        imageUrl,
        mode,
        name,
        offset,
        reducedColors,
        resolution,
        tileSize
    }

    const onSave = () => {
        setIsProcessing(true)
        dispatch(
            mode === IMPORT_MODES.NEW_IMAGE ? createNewImageLayerFromFile(config) : createNewTileLayerFromFile(config)
        )
    }

    const handleClose = (e: React.SyntheticEvent<Element, Event>, reason: string): void => {
        if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') {
            onClose()
        }
    }

    useEffect(() => {
        async function onLoadImage(src: string) {
            const i = await getImage(src)
            setImage(i)
            setName(importedImage?.filename || '')
            setResolution({ h: i.height, w: i.width })
        }
        if (importedImage) {
            setIsProcessing(false)
            onLoadImage(importedImage.image)
        }
    }, [importedImage])

    useEffect(() => {
        async function reduceImageColors(img: string) {
            const i = await dataURLToBlob(img)
            const blob = await reduceColors(i, colorsCount)
            const url = window.URL.createObjectURL(blob)
            const reducedImage = await getImage(url)
            setImage(reducedImage)
            setImageUrl(url)
        }
        if (importedImage?.image) {
            reduceImageColors(importedImage.image)
        }
    }, [colorsCount, importedImage])

    useEffect(() => {
        if (mode !== IMPORT_MODES.NEW_PROJECT) {
            setColumns(tileset.columns)
            setTileSize({ h: tileset.tileheight, w: tileset.tilewidth })
            if (mode === IMPORT_MODES.NEW_IMAGE) {
                setOffset({ x: 0, y: 0 })
            }
        }
    }, [mode, tileset.columns, tileset.tileheight, tileset.tilewidth])

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
                                    onChange={e => setMode(e.target.value as IMPORT_MODES)}
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
                            onChange={e => setName(e.target.value)}
                            id="name"
                            label={t(mode === IMPORT_MODES.NEW_PROJECT ? 'i18_project_name' : 'i18_layer_name')}
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
                                                Number.isInteger(w) && w > 0 && setTileSize({ ...tileSize, w })
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
                                                Number.isInteger(h) && h > 0 && setTileSize({ ...tileSize, h })
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
                                                Number.isInteger(c) && c > 0 && setColumns(c)
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
                                            onChange={e => setOffset({ ...offset, x: parseInt(e.target.value) })}
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
                                            onChange={e => setOffset({ ...offset, y: parseInt(e.target.value) })}
                                            id="offsetY"
                                            label={t('i18_offset_y')}
                                            size="small"
                                            variant="outlined"
                                        />
                                    </Grid>
                                </>
                            )}
                        </Grid>
                        <Grid container spacing={1}>
                            <Grid item xs={8} mt={2}>
                                <FormControlLabel
                                    label={t('i18_use_reduced_palette') as string}
                                    control={
                                        <Switch
                                            checked={reducedColors}
                                            name="reduced"
                                            onChange={e => setReducedColors(e.target.checked)}
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
                                        Number.isInteger(c) && setColorsCount(c)
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
