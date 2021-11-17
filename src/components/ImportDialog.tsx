import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { v4 as uuidv4 } from 'uuid'
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
import { INITIAL_STATE } from '../store/editor/constants'
import { clear } from '../store/history/actions'
import { changeAppIsLoading } from '../store/app/actions'
import {
    changeCanvasSize,
    changeGridSize,
    // changePalette,
    changePosition,
    changeLayers,
    changeSelectedLayer,
    changeTileset,
    changeTilesetImage,
    saveChanges
} from '../store/editor/actions'
import { selectCanvas, selectLayers, selectTileset } from '../store/editor/selectors'
// import { getOrderedPalette } from "../../common/utils/colors";
import { getImageDimensions } from '../common/utils/image'
import ImportPreview from './ImportPreview'

const ImageResolutionInfo = withStyles({ root: { color: '#222' } })(Typography)

const useStyles = makeStyles(theme => ({
    input: {
        marginTop: theme.spacing(1),
        marginRight: theme.spacing(1),
        minWidth: '80px'
    }
}))

type Props = {
    onClose: () => void
}

const ImportDialog = ({ onClose }: Props): JSX.Element => {
    const classes = useStyles()
    const canvas = useSelector(selectCanvas)
    const layers = useSelector(selectLayers)
    // const palette = useSelector(selectPalette);
    const tileset = useSelector(selectTileset)

    const dispatch = useDispatch()

    const onChangeAppIsLoading = (value: boolean) => dispatch(changeAppIsLoading(value))
    // const onChangePalette = (value) => dispatch(changePalette(value));
    const onChangePosition = (x, y) => dispatch(changePosition(x, y))
    const onChangeCanvasSize = (width, height) => dispatch(changeCanvasSize(width, height))
    const onChangeGridSize = (width, height) => dispatch(changeGridSize(width, height))
    const onChangeSelectedLayer = value => dispatch(changeSelectedLayer(value))
    const onChangeTileset = value => dispatch(changeTileset(value))
    const onClearHistory = () => dispatch(clear())
    const onSaveChanges = () => dispatch(saveChanges())
    const onSaveLayers = value => dispatch(changeLayers(value))
    const onSaveTilesetImage = (blob: Blob) => dispatch(changeTilesetImage(blob))

    const [gridSize, setGridSize] = useState({
        w: tileset.tilewidth,
        h: tileset.tileheight
    })
    const [isProcessing, setIsProcessing] = useState(false)
    const [isLoaded, setIsLoaded] = useState(false)
    const [name, setName] = useState<string>('')
    const [offset, setOffset] = useState({ x: 0, y: 0 })
    const [tilesetCols, setTilesetCols] = useState(tileset.columns)
    const [mode, setMode] = useState<string>(IMPORT_MODES.NEW_PROJECT)
    const [previewImage, setPreviewImage] = useState<CanvasImageSource | undefined>()
    const [imageDimensions, setImageDimensions] = useState({ w: 0, h: 0 })

    const layerCanvas: any = document.createElement('canvas')
    const layerContext: CanvasRenderingContext2D = layerCanvas.getContext('2d')
    const layerImage: HTMLImageElement = new window.Image()

    const tilesetCanvas: any = document.createElement('canvas')
    const tilesetContext: CanvasRenderingContext2D = tilesetCanvas.getContext('2d')
    const tilesetImage: HTMLImageElement = new window.Image()

    useEffect(() => {
        if (mode === IMPORT_MODES.NEW_LAYER) {
            setGridSize({ w: tileset.tilewidth, h: tileset.tileheight })
        }
    }, [mode])

    const onSave = () => {
        const { w: layerwidth, h: layerheight } = imageDimensions
        const { w: tilewidth, h: tileheight } = gridSize
        const { image, tilecount } = mode === IMPORT_MODES.NEW_PROJECT ? INITIAL_STATE.tileset : tileset
        const columns = mode === IMPORT_MODES.NEW_PROJECT ? tilesetCols : tileset.columns
        const tw = columns * tilewidth
        const th = Math.ceil(tilecount / columns) * tileheight
        // const tempPalette = IMPORT_MODES.NEW_PROJECT ? [] : [...palette];
        const tempTiles: ImageData[] = []
        const tempTilesHash: string[] = []
        const layer = {
            id: uuidv4(),
            opacity: 255,
            visible: true,
            offset: { x: 0, y: 0 },
            width: (Math.ceil(layerwidth / tilewidth) * tilewidth) / tilewidth,
            height: (Math.ceil(layerheight / tileheight) * tileheight) / tileheight,
            data: [] as number[]
        }
        const w = layer.width * tilewidth
        const h = layer.height * tileheight

        layerCanvas.width = w
        layerCanvas.height = h
        tilesetCanvas.width = tw
        tilesetCanvas.height = th
        tilesetContext.clearRect(0, 0, tw, th)

        if (previewImage) {
            layerContext.clearRect(0, 0, w, h)
            layerContext.drawImage(previewImage, offset.x, offset.y, layerwidth, layerheight)
        }

        const processCurrentTileset = () => {
            for (let y = 0; y < th; y += tileheight) {
                for (let x = 0; x < tw; x += tilewidth) {
                    const data = tilesetContext.getImageData(x, y, tilewidth, tileheight)
                    const key = data.data.toString()
                    if (tempTilesHash.indexOf(key) === -1) {
                        tempTilesHash.push(key)
                        tempTiles.push(data)
                    }
                }
            }
        }

        const processNewTileset = () => {
            for (let y = 0; y < layerCanvas.height; y += tileheight) {
                for (let x = 0; x < layerCanvas.width; x += tilewidth) {
                    const data = layerContext.getImageData(x, y, tilewidth, tileheight)
                    const empty = !data.data.some(channel => channel !== 0)
                    const key = data.data.toString()
                    if (empty) {
                        layer.data.push(0)
                    } else if (tempTilesHash.indexOf(key) === -1) {
                        const number = tempTilesHash.length
                        tilesetCanvas.width = columns * tilewidth
                        tilesetCanvas.height = Math.ceil((number + 1) / columns) * tileheight
                        tempTilesHash.push(key)
                        tempTiles.push(data)
                        layer.data.push(number + 1)
                    } else {
                        layer.data.push(tempTilesHash.indexOf(key) + 1)
                    }
                }
            }
            tempTiles.forEach((tile, i) => {
                const posX = (i % columns) * tilewidth
                const posY = (Math.ceil((i + 1) / columns) - 1) * tileheight
                tilesetContext.putImageData(tile, posX, posY)
            })

            // // Generate new palette from tileset
            // for (let y = 0; y < tilesetCanvas.height; y += 1) {
            //   for (let x = 0; x < tilesetCanvas.width; x += 1) {
            //     const p = Object.values(tilesetContext.getImageData(x, y, 1, 1).data)
            //     p[3] = 255
            //     if (tempPalette.indexOf(p.join()) === -1) {
            //       tempPalette.push(p.join())
            //     }
            //   }
            // }
            // onChangePalette(getOrderedPalette(tempPalette))

            if (mode === IMPORT_MODES.NEW_PROJECT) {
                onChangePosition(0, 0)
                onChangeCanvasSize(w, h)
                onChangeGridSize(tilewidth, tileheight)
                onSaveLayers([{ ...layer, name }])
                onChangeTileset({
                    ...INITIAL_STATE.tileset,
                    columns,
                    tilewidth,
                    tileheight,
                    tilecount: tempTiles.length,
                    lastUpdateTime: performance.now()
                })
            } else {
                onSaveLayers([...layers, { ...layer, name }])
                onChangeTileset({
                    ...tileset,
                    tilecount: tempTiles.length,
                    lastUpdateTime: performance.now()
                })
            }

            tilesetCanvas.toBlob(blob => {
                onSaveTilesetImage(blob)
                onChangeSelectedLayer(layer.id)
                onSaveChanges()
                onClearHistory()
                setIsProcessing(false)
                onChangeAppIsLoading(false)
                onClose()
            }, 'image/png')
        }

        if (mode === IMPORT_MODES.NEW_LAYER && image) {
            tilesetImage.src = image
            tilesetImage.onload = () => {
                tilesetContext.drawImage(tilesetImage, 0, 0, tw, th)
                processCurrentTileset()
                processNewTileset()
            }
        } else {
            processNewTileset()
        }
    }

    const onChange = e => {
        const file = e.target.files[0]
        const layerReader = new FileReader()
        setName(file.name.split('.').slice(0, -1).join('.'))
        setIsLoaded(false)
        setIsProcessing(true)

        layerReader.readAsDataURL(file)
        layerReader.onload = async ev => {
            if (ev.target) {
                const { result } = ev.target
                if (result) {
                    const { w, h } = await getImageDimensions(result)
                    layerCanvas.width = w
                    layerCanvas.height = h
                    layerImage.src = result as string
                    layerImage.onload = () => {
                        setImageDimensions({ w, h })
                        setPreviewImage(layerImage)
                        setIsProcessing(false)
                        setIsLoaded(true)
                    }
                }
            }
        }
    }

    const onCancel = () => {
        if (isLoaded) {
            setIsLoaded(false)
            setPreviewImage(undefined)
        } else {
            onClose()
        }
    }

    return (
        <Dialog open={!isProcessing} disableBackdropClick disableEscapeKeyDown onClose={onClose}>
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
                                    onChange={event => setMode(event.target.value)}
                                >
                                    <FormControlLabel
                                        value={IMPORT_MODES.NEW_PROJECT}
                                        control={<Radio color="primary" />}
                                        label="As a new project"
                                    />
                                    <FormControlLabel
                                        value={IMPORT_MODES.NEW_LAYER}
                                        control={<Radio color="primary" />}
                                        label="As a new layer"
                                    />
                                </RadioGroup>
                            </FormControl>
                        )}
                        <Grid container>
                            <TextField
                                fullWidth
                                className={classes.input}
                                value={name}
                                onChange={event => setName(event.target.value)}
                                id="name"
                                label="Layer name"
                                size="small"
                                variant="outlined"
                            />
                        </Grid>
                        {previewImage && (
                            <ImportPreview
                                {...{
                                    imageDimensions,
                                    gridSize,
                                    offset,
                                    previewImage
                                }}
                            />
                        )}
                        <Grid container>
                            {mode === IMPORT_MODES.NEW_PROJECT && (
                                <>
                                    <Grid item xs={2}>
                                        <TextField
                                            type="number"
                                            className={classes.input}
                                            value={gridSize.w}
                                            onChange={event => {
                                                const w = parseInt(event.target.value)
                                                Number.isInteger(w) && w > 0 && setGridSize({ ...gridSize, w })
                                            }}
                                            InputProps={{
                                                inputProps: { min: 1 }
                                            }}
                                            id="width"
                                            label="Tile width"
                                            size="small"
                                            variant="outlined"
                                        />
                                    </Grid>
                                    <Grid item xs={2}>
                                        <TextField
                                            type="number"
                                            className={classes.input}
                                            value={gridSize.h}
                                            onChange={event => {
                                                const h = parseInt(event.target.value)
                                                Number.isInteger(h) && h > 0 && setGridSize({ ...gridSize, h })
                                            }}
                                            InputProps={{
                                                inputProps: { min: 1 }
                                            }}
                                            id="height"
                                            label="Tile height"
                                            size="small"
                                            variant="outlined"
                                        />
                                    </Grid>
                                    <Grid item xs={4}>
                                        <TextField
                                            type="number"
                                            className={classes.input}
                                            value={tilesetCols}
                                            onChange={event => {
                                                const c = parseInt(event.target.value)
                                                Number.isInteger(c) && c > 0 && setTilesetCols(c)
                                            }}
                                            InputProps={{
                                                inputProps: { min: 1 },
                                                endAdornment: <InputAdornment position="end">columns</InputAdornment>
                                            }}
                                            id="cols"
                                            label="Tileset maximum width"
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
                                    onChange={event => setOffset({ ...offset, x: parseInt(event.target.value) })}
                                    id="offsetX"
                                    label="Offset X"
                                    size="small"
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={2}>
                                <TextField
                                    type="number"
                                    className={classes.input}
                                    value={offset.y}
                                    onChange={event => setOffset({ ...offset, y: parseInt(event.target.value) })}
                                    id="offsetY"
                                    label="Offset Y"
                                    size="small"
                                    variant="outlined"
                                />
                            </Grid>
                        </Grid>
                    </>
                ) : (
                    <DialogContentText>Choose a graphic file containing a tiled map.</DialogContentText>
                )}
            </DialogContent>

            <DialogActions>
                {isLoaded && (
                    <ImageResolutionInfo variant="caption" display="block">
                        {Math.ceil(imageDimensions.w / gridSize.w) * gridSize.w} x{' '}
                        {Math.ceil(imageDimensions.h / gridSize.h) * gridSize.h} pixels
                    </ImageResolutionInfo>
                )}
                <div style={{ flex: '1 0 0' }} />
                <Button onClick={onCancel} color="primary">
                    Cancel
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
                        Save
                    </Button>
                ) : (
                    <Button variant="contained" component="label">
                        Upload File
                        <input type="file" hidden accept="image/png, image/gif, image/jpeg" onChange={onChange} />
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    )
}
ImportDialog.displayName = 'ImportDialog'

export default ImportDialog
