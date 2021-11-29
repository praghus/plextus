import React, { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { makeStyles, withStyles } from '@material-ui/core/styles'
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControlLabel,
    FormControl,
    Grid,
    InputAdornment,
    Radio,
    RadioGroup,
    TextField,
    Typography
} from '@material-ui/core'
import { IMPORT_MODES } from '../common/constants'
import { changeAppIsLoading } from '../store/app/actions'
import { createNewLayerFromFile } from '../store/editor/actions'
import { selectCanvas, selectTileset } from '../store/editor/selectors'
import { uploadImage } from '../common/utils/image'
import { LayerImportConfig } from '../store/editor/types'
import ImportPreview from './ImportPreview'

const ImageResolutionInfo = withStyles({ root: { color: '#222' } })(Typography)

const useStyles = makeStyles(theme => ({
    input: {
        marginRight: theme.spacing(1),
        marginTop: theme.spacing(1),
        minWidth: '80px'
    }
}))

type Props = {
    onClose: () => void
}

const ImportDialog = ({ onClose }: Props): JSX.Element => {
    const classes = useStyles()
    const canvas = useSelector(selectCanvas)
    const tileset = useSelector(selectTileset)

    const { t } = useTranslation()

    const dispatch = useDispatch()
    const onChangeAppIsLoading = (value: boolean) => dispatch(changeAppIsLoading(value))
    const onCreateNewLayerFromFile = (config: LayerImportConfig) => dispatch(createNewLayerFromFile(config))

    const [isProcessing, setIsProcessing] = useState(false)
    const [isLoaded, setIsLoaded] = useState(false)
    const [config, setConfig] = useState<LayerImportConfig>({
        columns: tileset.columns,
        mode: IMPORT_MODES.NEW_PROJECT,
        name: '',
        offset: { x: 0, y: 0 },
        resolution: { h: canvas?.height ?? 0, w: canvas?.width ?? 0 },
        tileSize: { h: tileset.tileheight, w: tileset.tilewidth }
    })

    const { columns, mode, name, offset, resolution, tileSize } = config

    useEffect(() => {
        if (mode === IMPORT_MODES.NEW_LAYER) {
            setConfig({
                ...config,
                columns: tileset.columns,
                tileSize: { h: tileset.tileheight, w: tileset.tilewidth }
            })
        }
    }, [mode])

    const setConfigProp = (key: string, value: any): void => {
        setConfig({ ...config, [key]: value })
    }

    const onChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files && e.target.files[0]
        if (file) {
            setIsLoaded(false)
            setIsProcessing(true)

            const { image, width, height } = await uploadImage(file)
            const name = file.name.split('.').slice(0, -1).join('.')

            setConfig({ ...config, image, name, resolution: { h: height, w: width } })
            setIsProcessing(false)
            setIsLoaded(true)
        }
    }, [])

    const onSave = () => {
        onCreateNewLayerFromFile(config)
    }

    const onCancel = () => {
        if (isLoaded) {
            setIsLoaded(false)
            setConfigProp('image', undefined)
        } else {
            onClose()
        }
    }

    const handleClose = (e: any, reason: string): void => {
        if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') {
            onClose()
        }
    }

    return (
        <Dialog open={!isProcessing} onClose={handleClose}>
            <DialogTitle>Import image</DialogTitle>
            <DialogContent>
                {isLoaded ? (
                    <>
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
                                        label={t('as_a_new_project')}
                                    />
                                    <FormControlLabel
                                        value={IMPORT_MODES.NEW_LAYER}
                                        control={<Radio color="primary" />}
                                        label={t('as_a_new_layer')}
                                    />
                                </RadioGroup>
                            </FormControl>
                        )}
                        <Grid container>
                            <TextField
                                fullWidth
                                className={classes.input}
                                value={name}
                                onChange={e => setConfigProp('name', e.target.value)}
                                id="name"
                                label={t('layer_name')}
                                size="small"
                                variant="outlined"
                            />
                        </Grid>
                        <ImportPreview {...{ config }} />
                        <Grid container>
                            {mode === IMPORT_MODES.NEW_PROJECT && (
                                <>
                                    <Grid item xs={2}>
                                        <TextField
                                            type="number"
                                            className={classes.input}
                                            value={tileSize.w}
                                            onChange={event => {
                                                const w = parseInt(event.target.value)
                                                Number.isInteger(w) &&
                                                    w > 0 &&
                                                    setConfigProp('tileSize', { ...tileSize, w })
                                            }}
                                            InputProps={{
                                                inputProps: { min: 1 }
                                            }}
                                            id="width"
                                            label={t('tile_width')}
                                            size="small"
                                            variant="outlined"
                                        />
                                    </Grid>
                                    <Grid item xs={2}>
                                        <TextField
                                            type="number"
                                            className={classes.input}
                                            value={tileSize.h}
                                            onChange={event => {
                                                const h = parseInt(event.target.value)
                                                Number.isInteger(h) &&
                                                    h > 0 &&
                                                    setConfigProp('tileSize', { ...tileSize, h })
                                            }}
                                            InputProps={{
                                                inputProps: { min: 1 }
                                            }}
                                            id="height"
                                            label={t('tile_height')}
                                            size="small"
                                            variant="outlined"
                                        />
                                    </Grid>
                                    <Grid item xs={4}>
                                        <TextField
                                            type="number"
                                            className={classes.input}
                                            value={columns}
                                            onChange={event => {
                                                const c = parseInt(event.target.value)
                                                Number.isInteger(c) && c > 0 && setConfigProp('columns', c)
                                            }}
                                            InputProps={{
                                                endAdornment: <InputAdornment position="end">columns</InputAdornment>,
                                                inputProps: { min: 1 }
                                            }}
                                            id="cols"
                                            label={t('tileset_maximum_width')}
                                            size="small"
                                            variant="outlined"
                                        />
                                    </Grid>
                                </>
                            )}
                            <Grid item xs={2}>
                                <TextField
                                    type="number"
                                    className={classes.input}
                                    value={offset.x}
                                    onChange={event =>
                                        setConfigProp('offset', { ...offset, x: parseInt(event.target.value) })
                                    }
                                    id="offsetX"
                                    label={t('offset_x')}
                                    size="small"
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={2}>
                                <TextField
                                    type="number"
                                    className={classes.input}
                                    value={offset.y}
                                    onChange={event =>
                                        setConfigProp('offset', { ...offset, y: parseInt(event.target.value) })
                                    }
                                    id="offsetY"
                                    label={t('offset_y')}
                                    size="small"
                                    variant="outlined"
                                />
                            </Grid>
                        </Grid>
                    </>
                ) : (
                    <DialogContentText>{t('choose_map_image')}</DialogContentText>
                )}
            </DialogContent>

            <DialogActions>
                {isLoaded && (
                    <ImageResolutionInfo variant="caption" display="block">
                        {Math.ceil(resolution.w / tileSize.w) * tileSize.w} x{' '}
                        {Math.ceil(resolution.h / tileSize.h) * tileSize.h} {t('pixels')}
                    </ImageResolutionInfo>
                )}
                <div style={{ flex: '1 0 0' }} />
                <Button onClick={onCancel} color="primary">
                    {t('cancel')}
                </Button>
                {isLoaded ? (
                    <Button
                        onClick={() => {
                            setIsProcessing(true)
                            onChangeAppIsLoading(true)
                            onSave()
                        }}
                        variant="contained"
                    >
                        {t('save')}
                    </Button>
                ) : (
                    <Button variant="contained" component="label">
                        {t('upload_file')}
                        <input type="file" hidden accept="image/png, image/gif, image/jpeg" {...{ onChange }} />
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    )
}
ImportDialog.displayName = 'ImportDialog'

export default ImportDialog
