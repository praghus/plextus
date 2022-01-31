import React, { useCallback, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { makeStyles, withStyles } from '@material-ui/core/styles'
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
import { changeAppIsNewProjectDialogOpen } from '../store/app/actions'
import { createNewProject } from '../store/editor/actions'
import { selectIsNewProjectDialogOpen } from '../store/app/selectors'
import { selectTileset } from '../store/editor/selectors'
import { ProjectConfig } from '../store/editor/types'

const ImageResolutionInfo = withStyles({ root: { color: '#222' } })(Typography)

const useStyles = makeStyles(theme => ({
    input: {
        marginRight: theme.spacing(1),
        marginTop: theme.spacing(2)
    },
    inputNarrow: {
        marginRight: theme.spacing(1),
        marginTop: theme.spacing(2),
        width: '126px'
    },
    root: {
        '& > *': {
            padding: theme.spacing(1)
        }
    }
}))

const NewProjectDialog = (): JSX.Element => {
    const classes = useStyles()
    const tileset = useSelector(selectTileset)
    const isOpen = useSelector(selectIsNewProjectDialogOpen)

    const { t } = useTranslation()

    const [config, setConfig] = useState<ProjectConfig>({
        columns: tileset.columns,
        h: 160 / tileset.tileheight,
        tileheight: tileset.tileheight,
        tilewidth: tileset.tilewidth,
        w: 160 / tileset.tilewidth
    })

    const dispatch = useDispatch()
    const onCreateNewProject = (config: ProjectConfig) => dispatch(createNewProject(config))
    const onClose = () => dispatch(changeAppIsNewProjectDialogOpen(false))

    const onSave = useCallback(() => {
        onCreateNewProject(config)
        onClose()
    }, [])

    const handleClose = useCallback((e: any, reason: string): void => {
        if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') {
            onClose()
        }
    }, [])

    return (
        <Dialog open={isOpen} onClose={handleClose} aria-labelledby="form-dialog-title">
            <DialogTitle id="form-dialog-title">{t('i18_new_project')}</DialogTitle>
            <DialogContent>
                <form className={classes.root} noValidate autoComplete="off">
                    <Grid container>
                        <Grid item xs={7}>
                            <Typography variant="subtitle1" gutterBottom>
                                {t('i18_tileset')}
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
                                        endAdornment: <InputAdornment position="end">columns</InputAdornment>,
                                        inputProps: { min: 1 }
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
                                {t('i18_map')}
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
                                    endAdornment: <InputAdornment position="end">tiles</InputAdornment>,
                                    inputProps: { min: 1 }
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
                                    endAdornment: <InputAdornment position="end">tiles</InputAdornment>,
                                    inputProps: { min: 1 }
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
                    {t('i18_cancel')}
                </Button>
                <Button onClick={onSave} variant="contained">
                    {t('i18_create')}
                </Button>
            </DialogActions>
        </Dialog>
    )
}
NewProjectDialog.displayName = 'NewProjectDialog'

export default NewProjectDialog
