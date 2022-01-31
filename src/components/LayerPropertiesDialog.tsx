import React, { useState, useEffect } from 'react'
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    Grid,
    Switch,
    TextField
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { useTranslation } from 'react-i18next'
import { Layer } from '../store/editor/types'

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
    label: {
        paddingLeft: theme.spacing(1),
        paddingTop: theme.spacing(2)
    },
    root: {
        '& > *': {
            padding: theme.spacing(1)
        }
    }
}))

type Props = {
    layer: Layer | null
    open: boolean
    onSave: (model: Layer | null) => void
    onClose: (e: React.MouseEvent<HTMLElement>) => void
}

const LayerPropertiesDialog = ({ layer, onSave, onClose, open }: Props): JSX.Element => {
    const { t } = useTranslation()
    const classes = useStyles()
    const [model, setModel] = useState<Layer | null>(null)

    useEffect(() => {
        if (layer) setModel(layer)
    }, [layer])

    return (
        <Dialog {...{ onClose, open }}>
            <DialogTitle>{t('i18_layer_properties')}</DialogTitle>
            <DialogContent>
                {model && (
                    <form className={classes.root} noValidate autoComplete="off">
                        <Grid container>
                            <Grid item xs={12}>
                                <TextField
                                    className={classes.input}
                                    fullWidth
                                    value={model.name}
                                    id="name"
                                    label={t('i18_name')}
                                    size="small"
                                    variant="outlined"
                                    onChange={event => {
                                        const name = event.target.value
                                        setModel({ ...model, name })
                                    }}
                                />
                                <TextField
                                    className={classes.inputNarrow}
                                    type="number"
                                    value={model.offset.x}
                                    id="offsetX"
                                    label={t('i18_offset_x')}
                                    size="small"
                                    variant="outlined"
                                    onChange={event => {
                                        const x = parseInt(event.target.value)
                                        Number.isInteger(x) && setModel({ ...model, offset: { ...model.offset, x } })
                                    }}
                                />
                                <TextField
                                    className={classes.inputNarrow}
                                    type="number"
                                    value={model.offset.y}
                                    id="offsetY"
                                    label={t('i18_offset_y')}
                                    size="small"
                                    variant="outlined"
                                    onChange={event => {
                                        const y = parseInt(event.target.value)
                                        Number.isInteger(y) && setModel({ ...model, offset: { ...model.offset, y } })
                                    }}
                                />
                                <TextField
                                    className={classes.inputNarrow}
                                    type="number"
                                    value={model.opacity}
                                    id="alpha"
                                    label={t('i18_alpha')}
                                    size="small"
                                    variant="outlined"
                                    InputProps={{ inputProps: { max: 255, min: 0 } }}
                                    onChange={event => {
                                        const opacity = parseInt(event.target.value)
                                        Number.isInteger(opacity) &&
                                            opacity >= 0 &&
                                            opacity <= 255 &&
                                            setModel({ ...model, opacity })
                                    }}
                                />
                                <FormControlLabel
                                    className={classes.label}
                                    label={t('i18_visible')}
                                    control={
                                        <Switch
                                            checked={model.visible}
                                            name="visible"
                                            onChange={event => {
                                                const visible = event.target.checked
                                                setModel({ ...model, visible })
                                            }}
                                        />
                                    }
                                />
                            </Grid>
                        </Grid>
                    </form>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    {t('i18_cancel')}
                </Button>
                <Button onClick={() => onSave(model)} variant="contained" autoFocus>
                    {t('i18_save')}
                </Button>
            </DialogActions>
        </Dialog>
    )
}
LayerPropertiesDialog.displayName = 'LayerPropertiesDialog'

export default LayerPropertiesDialog
