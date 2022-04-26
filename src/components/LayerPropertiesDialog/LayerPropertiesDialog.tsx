import React, { useState, useEffect } from 'react'
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    Switch,
    TextField
} from '@mui/material'
import { useTranslation } from 'react-i18next'

import { Layer } from '../../store/editor/types'

interface Props {
    layer: Layer | null
    open: boolean
    onSave: (model: Layer | null) => void
    onClose: (e: React.MouseEvent<HTMLElement>) => void
}

const LayerPropertiesDialog: React.FunctionComponent<Props> = ({ layer, onSave, onClose, open }) => {
    const { t } = useTranslation()
    const [model, setModel] = useState<Layer | null>(null)

    useEffect(() => {
        if (layer) setModel(layer)
    }, [layer])

    return (
        <Dialog {...{ onClose, open }}>
            <DialogTitle>{t('i18_layer_properties')}</DialogTitle>
            <DialogContent>
                {model && (
                    <Box
                        component="form"
                        sx={{
                            '& > :not(style)': { m: 1, width: '400px' }
                        }}
                        noValidate
                        autoComplete="off"
                    >
                        <TextField
                            value={model.name}
                            id="name"
                            label={t('i18_name') as string}
                            size="small"
                            variant="standard"
                            onChange={e => {
                                const name = e.target.value
                                setModel({ ...model, name })
                            }}
                        />
                        <Box>
                            <TextField
                                type="number"
                                value={model.offset.x}
                                id="offsetX"
                                label={t('i18_offset_x') as string}
                                size="small"
                                variant="outlined"
                                onChange={e => {
                                    const x = parseInt(e.target.value)
                                    Number.isInteger(x) && setModel({ ...model, offset: { ...model.offset, x } })
                                }}
                                sx={{ maxWidth: '120px' }}
                            />
                            <TextField
                                type="number"
                                value={model.offset.y}
                                id="offsetY"
                                label={t('i18_offset_y') as string}
                                size="small"
                                variant="outlined"
                                onChange={e => {
                                    const y = parseInt(e.target.value)
                                    Number.isInteger(y) && setModel({ ...model, offset: { ...model.offset, y } })
                                }}
                                sx={{ marginLeft: '15px', maxWidth: '120px' }}
                            />
                            <TextField
                                type="number"
                                value={model.opacity}
                                id="alpha"
                                label={t('i18_alpha') as string}
                                size="small"
                                variant="outlined"
                                InputProps={{ inputProps: { max: 255, min: 0 } }}
                                onChange={e => {
                                    const opacity = parseInt(e.target.value)
                                    Number.isInteger(opacity) &&
                                        opacity >= 0 &&
                                        opacity <= 255 &&
                                        setModel({ ...model, opacity })
                                }}
                                sx={{ marginLeft: '15px', width: '120px' }}
                            />
                        </Box>
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                {model && (
                    <FormControlLabel
                        label={t('i18_visible') as string}
                        control={
                            <Switch
                                checked={model.visible}
                                name="visible"
                                onChange={e => {
                                    const visible = e.target.checked
                                    setModel({ ...model, visible })
                                }}
                            />
                        }
                        sx={{ marginLeft: '10px', marginRight: 'auto' }}
                    />
                )}
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
