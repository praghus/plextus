import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { makeStyles, withStyles } from '@material-ui/core/styles'
import { TOOLS } from '../common/constants'
import { INITIAL_STATE } from '../store/editor/constants'
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    InputAdornment,
    TextField,
    Typography
} from '@material-ui/core'
import {
    changeCanvasSize,
    changeGridSize,
    changePosition,
    changeLayers,
    changeScale,
    changeSelectedLayer,
    changeSelectedTile,
    changeTileset,
    changeTool,
    saveChanges
} from '../store/editor/actions'
import { createEmptyLayer } from '../store/editor/utils'
import { Layer, Tileset } from '../store/editor/types'
import { selectTileset, selectWorkspace } from '../store/editor/selectors'

const ImageResolutionInfo = withStyles({ root: { color: '#222' } })(Typography)

const useStyles = makeStyles(theme => ({
    root: {
        '& > *': {
            padding: theme.spacing(1)
        }
    },
    input: {
        marginTop: theme.spacing(2),
        marginRight: theme.spacing(1)
    },
    inputNarrow: {
        marginTop: theme.spacing(2),
        marginRight: theme.spacing(1),
        width: '126px'
    }
}))

type Props = {
    onClose: () => void
}

const NewProjectDialog = ({ onClose }: Props): JSX.Element => {
    const tileset = useSelector(selectTileset)
    const workspace = useSelector(selectWorkspace)
    const classes = useStyles()
    const dispatch = useDispatch()

    const { t } = useTranslation()

    const onChangePosition = (x: number, y: number) => dispatch(changePosition(x, y))
    const onChangeCanvasSize = (width: number, height: number) => dispatch(changeCanvasSize(width, height))
    const onChangeGridSize = (width: number, height: number) => dispatch(changeGridSize(width, height))
    const onChangeScale = (scale: number) => dispatch(changeScale(scale))
    const onChangeSelectedLayer = (value: string) => dispatch(changeSelectedLayer(value))
    const onChangeSelectedTile = (tileId: number) => dispatch(changeSelectedTile(tileId))
    const onChangeTileset = (tileset: Tileset) => dispatch(changeTileset(tileset))
    const onSaveChanges = () => dispatch(saveChanges())
    const onSaveLayers = (layers: Layer[]) => dispatch(changeLayers(layers))
    const onChangeTool = tool => tool && dispatch(changeTool(tool))

    const [config, setConfig] = useState({
        w: 160 / tileset.tilewidth,
        h: 160 / tileset.tileheight,
        columns: tileset.columns,
        tilewidth: tileset.tilewidth,
        tileheight: tileset.tileheight
    })

    const onSave = () => {
        const { w, h, columns, tilewidth, tileheight } = config
        const width = w * tilewidth
        const height = h * tileheight
        const newScale = height >= width ? workspace.height / height : workspace.width / width
        const layer = createEmptyLayer('Layer 1', w, h)

        onChangeScale(newScale)
        onChangePosition((workspace.width - width * newScale) / 2, (workspace.height - height * newScale) / 2)
        onChangeCanvasSize(width, height)
        onChangeGridSize(tilewidth, tileheight)
        onSaveLayers([layer])
        onChangeSelectedLayer(layer.id)
        onChangeTileset({
            ...INITIAL_STATE.tileset,
            columns,
            tilewidth,
            tileheight,
            tilecount: 1,
            lastUpdateTime: performance.now()
        })
        onChangeSelectedTile(1)
        onChangeTool(TOOLS.DRAG)
        onSaveChanges()
        onClose()
    }

    return (
        <Dialog open disableBackdropClick disableEscapeKeyDown onClose={onClose} aria-labelledby="form-dialog-title">
            <DialogTitle id="form-dialog-title">{t('new_project')}</DialogTitle>
            <DialogContent>
                <form className={classes.root} noValidate autoComplete="off">
                    <Grid container>
                        <Grid item xs={7}>
                            <Typography variant="subtitle1" gutterBottom>
                                Tileset
                            </Typography>
                            <Grid item xs={12}>
                                <TextField
                                    className={classes.inputNarrow}
                                    type="number"
                                    value={config.tilewidth}
                                    InputProps={{ inputProps: { min: 1 } }}
                                    onChange={event => {
                                        const tilewidth = parseInt(event.target.value)
                                        Number.isInteger(tilewidth) &&
                                            tilewidth > 0 &&
                                            setConfig({ ...config, tilewidth })
                                    }}
                                    id="tileWidth"
                                    label="Tile width (px)"
                                    size="small"
                                    variant="outlined"
                                />
                                <TextField
                                    className={classes.inputNarrow}
                                    type="number"
                                    value={config.tileheight}
                                    InputProps={{ inputProps: { min: 1 } }}
                                    onChange={event => {
                                        const tileheight = parseInt(event.target.value)
                                        Number.isInteger(tileheight) &&
                                            tileheight > 0 &&
                                            setConfig({ ...config, tileheight })
                                    }}
                                    id="tileHeight"
                                    label="Tile height (px)"
                                    size="small"
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    className={classes.input}
                                    type="number"
                                    value={config.columns}
                                    onChange={event => {
                                        const columns = parseInt(event.target.value)
                                        Number.isInteger(columns) && columns > 0 && setConfig({ ...config, columns })
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
                        </Grid>
                        <Grid item xs={5}>
                            <Typography variant="subtitle1" gutterBottom>
                                Map
                            </Typography>
                            <TextField
                                className={classes.input}
                                type="number"
                                value={config.w}
                                onChange={event => {
                                    const w = parseInt(event.target.value)
                                    Number.isInteger(w) && w > 0 && setConfig({ ...config, w })
                                }}
                                InputProps={{
                                    inputProps: { min: 1 },
                                    endAdornment: <InputAdornment position="end">tiles</InputAdornment>
                                }}
                                id="width"
                                label="Map width"
                                size="small"
                                variant="outlined"
                            />
                            <TextField
                                className={classes.input}
                                type="number"
                                value={config.h}
                                onChange={event => {
                                    const h = parseInt(event.target.value)
                                    Number.isInteger(h) && h > 0 && setConfig({ ...config, h })
                                }}
                                InputProps={{
                                    inputProps: { min: 1 },
                                    endAdornment: <InputAdornment position="end">tiles</InputAdornment>
                                }}
                                id="height"
                                label="Map height"
                                size="small"
                                variant="outlined"
                            />
                        </Grid>
                    </Grid>
                </form>
            </DialogContent>

            <DialogActions>
                <ImageResolutionInfo variant="caption" display="block">
                    {config.w * config.tilewidth} x {config.h * config.tileheight} pixels
                </ImageResolutionInfo>

                <div style={{ flex: '1 0 0' }} />
                <Button onClick={onClose} color="primary">
                    Cancel
                </Button>
                <Button onClick={onSave} variant="contained">
                    Create
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default NewProjectDialog
